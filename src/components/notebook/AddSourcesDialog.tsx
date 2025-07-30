import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Link, Copy, ListOrdered } from 'lucide-react';
import MultipleWebsiteUrlsDialog from './MultipleWebsiteUrlsDialog';
import CopiedTextDialog from './CopiedTextDialog';
import { useSources } from '@/hooks/useSources';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { Badge } from '@/components/ui/badge';
import { classifyDocument } from '@/utils/agricultureClassifier';

interface AddSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId?: string;
}

const AddSourcesDialog = ({
  open,
  onOpenChange,
  notebookId
}: AddSourcesDialogProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCopiedTextDialog, setShowCopiedTextDialog] = useState(false);
  const [showMultipleWebsiteDialog, setShowMultipleWebsiteDialog] = useState(false);
  const [isLocallyProcessing, setIsLocallyProcessing] = useState(false);
  const [useQueueSystem, setUseQueueSystem] = useState(false);

  const {
    addSourceAsync,
    updateSource,
    isAdding
  } = useSources(notebookId);

  const {
    uploadFile,
    isUploading
  } = useFileUpload();

  const {
    processDocumentAsync,
    isProcessing
  } = useDocumentProcessing();

  const {
    generateNotebookContentAsync,
    isGenerating
  } = useNotebookGeneration();

  const {
    toast
  } = useToast();

  const {
    addToQueue,
    getQueueStats
  } = useUploadQueue();

  const queueStats = getQueueStats();

  // Reset local processing state when dialog opens
  useEffect(() => {
    if (open) {
      setIsLocallyProcessing(false);
    }
  }, [open]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  }, []);

  // 재시도 함수
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Retry attempt ${i + 1}/${maxRetries} failed:`, error);
        
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  const processFileAsync = async (file: File, sourceId: string, notebookId: string) => {
    try {
      console.log('Starting file processing for:', file.name, 'source:', sourceId);
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';

      // Update status to uploading
      updateSource({
        sourceId,
        updates: {
          processing_status: 'uploading'
        }
      });

      // Upload the file with retry
      let filePath: string | null = null;
      try {
        filePath = await retryWithBackoff(
          () => uploadFile(file, notebookId, sourceId),
          3,
          1000
        );
      } catch (uploadError: any) {
        // 구체적인 업로드 에러 처리
        const errorMessage = uploadError?.message || '알 수 없는 오류';
        
        if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          throw new Error(`네트워크 오류: 인터넷 연결을 확인하고 다시 시도해주세요`);
        } else if (errorMessage.includes('timeout')) {
          throw new Error(`업로드 시간 초과: 파일이 너무 크거나 네트워크가 느립니다`);
        } else if (errorMessage.includes('storage')) {
          throw new Error(`저장소 오류: 서버 저장 공간이 부족합니다`);
        } else {
          throw new Error(`파일 업로드 실패: ${errorMessage}`);
        }
      }
      
      if (!filePath) {
        throw new Error('파일 업로드 실패 - 파일 경로가 반환되지 않았습니다');
      }
      console.log('File uploaded successfully:', filePath);

      // Update with file path and set to processing
      updateSource({
        sourceId,
        updates: {
          file_path: filePath,
          processing_status: 'processing'
        }
      });

      // Start document processing with retry
      try {
        await retryWithBackoff(
          () => processDocumentAsync({
            sourceId,
            filePath,
            sourceType: fileType
          }),
          2,
          2000
        );

        // Generate notebook content
        await generateNotebookContentAsync({
          notebookId,
          filePath,
          sourceType: fileType
        });
        
        console.log('Document processing completed for:', sourceId);
        
        // 농업 문서 자동 분류 실행
        try {
          console.log('Starting agriculture classification for:', file.name);
          const { data: classifyData, error: classifyError } = await supabase.functions.invoke('classify-document', {
            body: {
              sourceId,
              title: file.name,
              filePath
            }
          });
          
          if (classifyError) {
            console.error('Classification error:', classifyError);
          } else if (classifyData?.classification) {
            console.log('Document classified:', classifyData.classification);
          }
        } catch (classificationError) {
          console.error('Failed to classify document:', classificationError);
        }
        
        // Update status to completed after successful processing
        updateSource({
          sourceId,
          updates: {
            processing_status: 'completed'
          }
        });

        // 성공 토스트
        toast({
          title: "처리 완료",
          description: `${file.name} 파일이 성공적으로 처리되었습니다`
        });
      } catch (processingError: any) {
        console.error('Document processing failed:', processingError);

        // 처리 오류지만 파일은 업로드된 경우
        updateSource({
          sourceId,
          updates: {
            processing_status: 'completed'
          }
        });

        toast({
          title: "처리 경고",
          description: `${file.name} 파일이 업로드되었지만 일부 처리가 실패했습니다`,
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('File processing failed for:', file.name, error);

      // Update status to failed
      updateSource({
        sourceId,
        updates: {
          processing_status: 'failed',
          metadata: {
            error: error.message || '알 수 없는 오류'
          }
        }
      });

      // 실패 토스트
      toast({
        title: "파일 처리 실패",
        description: `${file.name}: ${error.message || '알 수 없는 오류가 발생했습니다'}`,
        variant: "destructive"
      });
    }
  };

  // 지원되는 파일 형식과 크기 제한
  const SUPPORTED_FILE_TYPES = {
    'application/pdf': { ext: '.pdf', type: 'pdf' },
    'text/plain': { ext: '.txt', type: 'text' },
    'text/markdown': { ext: '.md', type: 'text' },
    'application/msword': { ext: '.doc', type: 'text' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', type: 'text' },
    'audio/mpeg': { ext: '.mp3', type: 'audio' },
    'audio/wav': { ext: '.wav', type: 'audio' },
    'audio/x-m4a': { ext: '.m4a', type: 'audio' },
    'audio/mp4': { ext: '.m4a', type: 'audio' }
  };
  
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // 파일 유효성 검사
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 파일 형식 확인
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = Object.values(SUPPORTED_FILE_TYPES).some(type => type.ext === fileExtension) ||
                        Object.keys(SUPPORTED_FILE_TYPES).includes(file.type);
    
    if (!isValidType) {
      return {
        valid: false,
        error: `지원되지 않는 파일 형식입니다. 지원 형식: .pdf, .txt, .doc, .docx, .md, .mp3, .wav, .m4a`
      };
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. (${sizeInMB}MB / 최대 50MB)`
      };
    }

    return { valid: true };
  };

  const handleFileUpload = async (files: File[]) => {
    if (!notebookId) {
      toast({
        title: "오류",
        description: "노트북이 선택되지 않았습니다",
        variant: "destructive"
      });
      return;
    }

    // 파일 유효성 검사
    const validationResults = files.map(file => ({
      file,
      validation: validateFile(file)
    }));

    const invalidFiles = validationResults.filter(result => !result.validation.valid);
    const validFiles = validationResults.filter(result => result.validation.valid).map(result => result.file);

    // 유효하지 않은 파일이 있으면 에러 메시지 표시
    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(result => 
        `• ${result.file.name}: ${result.validation.error}`
      ).join('\n');
      
      toast({
        title: "파일 업로드 오류",
        description: errorMessages,
        variant: "destructive"
      });

      // 유효한 파일이 없으면 종료
      if (validFiles.length === 0) {
        return;
      }
    }

    // 큐 시스템 사용 여부에 따라 처리
    if (useQueueSystem) {
      try {
        // 먼저 소스 레코드들을 생성
        const sourcePromises = validFiles.map(async (file) => {
          const fileType = file.type.includes('pdf') ? 'pdf' : 
                          file.type.includes('audio') ? 'audio' : 'text';
          
          // 파일명으로 초기 분류 (내용은 아직 없으므로)
          const preliminaryClassification = classifyDocument(file.name, '');
          
          const sourceData = {
            notebookId,
            title: file.name,
            type: fileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
            file_size: file.size,
            processing_status: 'pending',
            metadata: {
              fileName: file.name,
              fileType: file.type,
              useQueue: true,
              preliminary_classification: preliminaryClassification,
              classified_at: new Date().toISOString()
            }
          };
          
          return await addSourceAsync(sourceData);
        });
        
        const createdSources = await Promise.all(sourcePromises);
        const sourceIds = createdSources.map(source => source.id);
        
        // 큐 시스템으로 파일 추가 (소스 ID와 함께)
        const priority = 5; // 기본 우선순위
        addToQueue(validFiles, notebookId, priority, sourceIds);
        
        // 다이얼로그 닫기
        onOpenChange(false);
        
        toast({
          title: "큐에 추가됨",
          description: `${validFiles.length}개의 파일이 업로드 큐에 추가되었습니다.`
        });
      } catch (error) {
        console.error('Error creating sources for queue:', error);
        toast({
          title: "오류",
          description: "파일 추가 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
      
      return;
    }

    // 기존 로직 유지
    console.log('Processing multiple files with delay strategy:', validFiles.length);
    setIsLocallyProcessing(true);

    try {
      // Step 1: Create the first source immediately (this will trigger generation if it's the first source)
      const firstFile = validFiles[0];
      const firstFileType = firstFile.type.includes('pdf') ? 'pdf' : firstFile.type.includes('audio') ? 'audio' : 'text';
      const firstSourceData = {
        notebookId,
        title: firstFile.name,
        type: firstFileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
        file_size: firstFile.size,
        processing_status: 'pending',
        metadata: {
          fileName: firstFile.name,
          fileType: firstFile.type
        }
      };
      
      console.log('Creating first source for:', firstFile.name);
      const firstSource = await addSourceAsync(firstSourceData);
      
      let remainingSources = [];
      
      // Step 2: If there are more files, add a delay before creating the rest
      if (validFiles.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create remaining sources
        remainingSources = await Promise.all(validFiles.slice(1).map(async (file, index) => {
          const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('audio') ? 'audio' : 'text';
          const sourceData = {
            notebookId,
            title: file.name,
            type: fileType as 'pdf' | 'text' | 'website' | 'youtube' | 'audio',
            file_size: file.size,
            processing_status: 'pending',
            metadata: {
              fileName: file.name,
              fileType: file.type
            }
          };
          console.log('Creating source for:', file.name);
          return await addSourceAsync(sourceData);
        }));
        
        console.log('Remaining sources created:', remainingSources.length);
      }

      // Combine all created sources and filter out any undefined values
      const allCreatedSources = [firstSource, ...remainingSources].filter(Boolean);

      console.log('All sources created successfully:', allCreatedSources.length);
      console.log('Created sources:', allCreatedSources);

      // Validate that we have sources for all files
      if (allCreatedSources.length !== validFiles.length) {
        console.error('Source creation mismatch:', {
          filesCount: validFiles.length,
          sourcesCount: allCreatedSources.length
        });
        
        // Still close dialog but show warning
        setIsLocallyProcessing(false);
        onOpenChange(false);
        
        toast({
          title: "일부 파일 추가 실패",
          description: `${validFiles.length}개 중 ${allCreatedSources.length}개만 추가되었습니다.`,
          variant: "destructive"
        });
        return;
      }

      // Step 3: Close dialog immediately
      setIsLocallyProcessing(false);
      onOpenChange(false);

      // Step 4: Show success toast
      toast({
        title: "파일 추가됨",
        description: `${validFiles.length}개의 파일이 추가되어 처리 중입니다`
      });

      // Step 5: Process files in parallel (background) - with safety check
      const processingPromises = validFiles.map((file, index) => {
        const source = allCreatedSources[index];
        if (!source || !source.id) {
          console.error('Invalid source for file:', file.name, 'at index:', index);
          return Promise.reject(new Error(`No source ID for file: ${file.name}`));
        }
        return processFileAsync(file, source.id, notebookId);
      });

      // Don't await - let processing happen in background
      Promise.allSettled(processingPromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log('File processing completed:', {
          successful,
          failed
        });

        if (failed > 0) {
          toast({
            title: "일부 파일 처리 실패",
            description: `${failed}개의 파일 처리 중 문제가 발생했습니다. 소스 목록에서 자세한 내용을 확인하세요.`,
            variant: "destructive"
          });
        }
      });
    } catch (error: any) {
      console.error('Error creating sources:', error);
      setIsLocallyProcessing(false);
      
      // 구체적인 에러 메시지 제공
      let errorMessage = "파일 추가 실패. ";
      if (error.message?.includes('network')) {
        errorMessage += "네트워크 연결을 확인하고 다시 시도해주세요.";
      } else if (error.message?.includes('permission')) {
        errorMessage += "파일 접근 권한이 없습니다.";
      } else if (error.message?.includes('quota')) {
        errorMessage += "저장 공간이 부족합니다.";
      } else {
        errorMessage += "다시 시도해주세요.";
      }
      
      toast({
        title: "파일 추가 오류",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleTextSubmit = async (title: string, content: string) => {
    if (!notebookId) return;
    setIsLocallyProcessing(true);
    let createdSource: any = null;

    try {
      // 텍스트 내용을 먼저 분류
      const classification = classifyDocument(title, content);
      
      // Create source record first to get the ID
      createdSource = await addSourceAsync({
        notebookId,
        title,
        type: 'text',
        content,
        processing_status: 'processing',
        metadata: {
          characterCount: content.length,
          webhookProcessed: true,
          classification,
          classified_at: new Date().toISOString(),
          auto_classified: true
        }
      });

      // Send to webhook endpoint with source ID
      const { data, error } = await supabase.functions.invoke('process-additional-sources', {
        body: {
          type: 'copied-text',
          notebookId,
          title,
          content,
          sourceIds: [createdSource.id], // Pass the source ID
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error processing text source:', error);
        throw error;
      }

      console.log('Text processing initiated successfully');
      console.log('Text classified as:', classification);
      
      toast({
        title: "Success",
        description: "Text has been added and sent for processing"
      });
    } catch (error) {
      console.error('Error adding text source:', error);
      
      // Update source status to failed if processing fails
      if (createdSource?.id) {
        updateSource({
          sourceId: createdSource.id,
          updates: {
            processing_status: 'failed'
          }
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to add text source",
        variant: "destructive"
      });
    } finally {
      setIsLocallyProcessing(false);
    }

    onOpenChange(false);
  };

  const handleMultipleWebsiteSubmit = async (urls: string[]) => {
    if (!notebookId) return;
    setIsLocallyProcessing(true);

    try {
      console.log('Creating sources for multiple websites with delay strategy:', urls.length);
      
      // Create the first source immediately (this will trigger generation if it's the first source)
      const firstSource = await addSourceAsync({
        notebookId,
        title: `Website 1: ${urls[0]}`,
        type: 'website',
        url: urls[0],
        processing_status: 'processing',
        metadata: {
          originalUrl: urls[0],
          webhookProcessed: true
        }
      });
      
      console.log('First source created:', firstSource.id);
      
      let remainingSources = [];
      
      // If there are more URLs, add a delay before creating the rest
      if (urls.length > 1) {
        console.log('Adding 150ms delay before creating remaining sources...');
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Create remaining sources
        remainingSources = await Promise.all(urls.slice(1).map(async (url, index) => {
          return await addSourceAsync({
            notebookId,
            title: `Website ${index + 2}: ${url}`,
            type: 'website',
            url,
            processing_status: 'processing',
            metadata: {
              originalUrl: url,
              webhookProcessed: true
            }
          });
        }));
        
        console.log('Remaining sources created:', remainingSources.length);
      }

      // Combine all created sources
      const allCreatedSources = [firstSource, ...remainingSources];

      // Send to webhook endpoint with all source IDs
      const { data, error } = await supabase.functions.invoke('process-additional-sources', {
        body: {
          type: 'multiple-websites',
          notebookId,
          urls,
          sourceIds: allCreatedSources.map(source => source.id), // Pass array of source IDs
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Error processing websites:', error);
        throw error;
      }

      console.log('Website processing initiated successfully for', urls.length, 'URLs');
      
      toast({
        title: "Success",
        description: `${urls.length} website${urls.length > 1 ? 's' : ''} added and sent for processing`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding multiple websites:', error);
      
      // Update all source statuses to failed if processing fails
      if (allCreatedSources?.length > 0) {
        allCreatedSources.forEach(source => {
          updateSource({
            sourceId: source.id,
            updates: {
              processing_status: 'failed'
            }
          });
        });
      }
      
      toast({
        title: "Error",
        description: "Failed to add websites",
        variant: "destructive"
      });
    } finally {
      setIsLocallyProcessing(false);
    }
  };

  // Use local processing state instead of global processing states
  const isProcessingFiles = isLocallyProcessing;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#FFFFFF">
                    <path d="M480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Zm24-80h252q45-32 69.5-79T700-580q0-92-64-156t-156-64q-92 0-156 64t-64 156q0 54 24.5 101t69.5 79Zm126 0Z" />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-medium">InsightsLM</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Add sources</h2>
              <p className="text-gray-600 text-sm mb-1">Sources let InsightsLM base its responses on the information that matters most to you.</p>
              <p className="text-gray-500 text-xs">
                (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
              </p>
              
              {/* 큐 시스템 토글 및 상태 */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={useQueueSystem ? "default" : "outline"}
                    onClick={() => setUseQueueSystem(!useQueueSystem)}
                  >
                    <ListOrdered className="h-4 w-4 mr-1" />
                    큐 시스템 {useQueueSystem ? "사용 중" : "사용"}
                  </Button>
                  {useQueueSystem && queueStats.total > 0 && (
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline">
                        대기 중 {queueStats.waiting}
                      </Badge>
                      <Badge variant="secondary">
                        처리 중 {queueStats.uploading + queueStats.processing}
                      </Badge>
                      <Badge variant="default">
                        완료 {queueStats.completed}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${isProcessingFiles ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
                  <Upload className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    {isProcessingFiles ? 'Processing files...' : 'Upload sources'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {isProcessingFiles ? (
                      'Please wait while we process your files'
                    ) : (
                      <>
                        Drag & drop or{' '}
                        <button 
                          className="text-blue-600 hover:underline" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={isProcessingFiles}
                        >
                          choose file
                        </button>{' '}
                        to upload
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  지원 파일: PDF (.pdf), 텍스트 (.txt), Word (.doc, .docx), Markdown (.md), 오디오 (.mp3, .wav, .m4a) - 최대 50MB
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx,.md,.mp3,.wav,.m4a,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
                  onChange={handleFileSelect}
                  disabled={isProcessingFiles}
                />
              </div>
            </div>

            {/* Integration Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowMultipleWebsiteDialog(true)}
                disabled={isProcessingFiles}
              >
                <Link className="h-6 w-6 text-green-600" />
                <span className="font-medium">Link - Website</span>
                <span className="text-sm text-gray-500">Multiple URLs at once</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => setShowCopiedTextDialog(true)}
                disabled={isProcessingFiles}
              >
                <Copy className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Paste Text - Copied Text</span>
                <span className="text-sm text-gray-500">Add copied content</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <CopiedTextDialog 
        open={showCopiedTextDialog} 
        onOpenChange={setShowCopiedTextDialog} 
        onSubmit={handleTextSubmit} 
      />

      <MultipleWebsiteUrlsDialog 
        open={showMultipleWebsiteDialog} 
        onOpenChange={setShowMultipleWebsiteDialog} 
        onSubmit={handleMultipleWebsiteSubmit} 
      />
    </>
  );
};

export default AddSourcesDialog;
