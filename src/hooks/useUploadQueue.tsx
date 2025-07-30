import { useContext, createContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// 큐 아이템 타입 정의
export interface QueueItem {
  id: string;
  file: File;
  notebookId: string;
  sourceId?: string;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  error?: string;
  priority: number; // 낮은 숫자가 높은 우선순위
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// 큐 상태 타입
export interface UploadQueueState {
  items: QueueItem[];
  concurrentLimit: number;
  isPaused: boolean;
  activeUploads: number;
}

// Context 타입 정의
interface UploadQueueContextType {
  // 상태
  queueState: UploadQueueState;
  
  // 액션
  addToQueue: (files: File[], notebookId: string, priority?: number, sourceIds?: string[]) => string[];
  removeFromQueue: (itemId: string) => void;
  clearQueue: () => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  retryItem: (itemId: string) => void;
  updatePriority: (itemId: string, priority: number) => void;
  setConcurrentLimit: (limit: number) => void;
  
  // 헬퍼
  getQueueStats: () => {
    total: number;
    waiting: number;
    uploading: number;
    processing: number;
    completed: number;
    failed: number;
    paused: number;
  };
  
  // UI 상태 (모니터 표시 관리)
  showMonitor: boolean;
  setShowMonitor: (show: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
}

// Context 생성
const UploadQueueContext = createContext<UploadQueueContextType | undefined>(undefined);

// localStorage 키
const STORAGE_KEY = 'ai4agriweather_upload_queue';

// Provider 컴포넌트
export const UploadQueueProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const processingRef = useRef(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 초기 상태 로드
  const loadInitialState = (): UploadQueueState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // File 객체는 localStorage에서 복원할 수 없으므로 필터링
        return {
          ...parsed,
          items: [],
          activeUploads: 0,
          isPaused: false
        };
      }
    } catch (error) {
      console.error('Failed to load queue state:', error);
    }
    
    return {
      items: [],
      concurrentLimit: 2,
      isPaused: false,
      activeUploads: 0
    };
  };

  const [queueState, setQueueState] = useState<UploadQueueState>(loadInitialState);
  const [showMonitor, setShowMonitor] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // 상태 저장 (File 객체 제외)
  const saveState = useCallback((state: UploadQueueState) => {
    try {
      const toStore = {
        concurrentLimit: state.concurrentLimit,
        isPaused: state.isPaused,
        // 메타데이터만 저장 (File 객체 제외)
        items: state.items.map(item => ({
          id: item.id,
          notebookId: item.notebookId,
          sourceId: item.sourceId,
          status: item.status,
          progress: item.progress,
          error: item.error,
          priority: item.priority,
          fileName: item.file.name,
          fileSize: item.file.size,
          fileType: item.file.type
        }))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save queue state:', error);
    }
  }, []);

  // 상태가 변경될 때마다 저장
  useEffect(() => {
    saveState(queueState);
  }, [queueState, saveState]);

  // 파일 업로드 함수
  const uploadFile = async (item: QueueItem, signal: AbortSignal): Promise<string> => {
    // 진행률 업데이트 함수
    const updateProgress = (progress: number) => {
      setQueueState(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id ? { ...i, progress } : i
        )
      }));
    };

    try {
      // 파일 확장자 추출
      const fileExtension = item.file.name.split('.').pop() || 'bin';
      const filePath = `${item.notebookId}/${item.sourceId || item.id}.${fileExtension}`;

      // XMLHttpRequest를 사용하여 진행률 추적
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // abort signal 처리
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload cancelled'));
        });

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            updateProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(filePath);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        // Supabase Storage URL 구성 - async 함수 내에서 실행
        (async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              reject(new Error('No authentication session'));
              return;
            }

            const url = `${supabase.storageUrl}/object/sources/${filePath}`;
            xhr.open('POST', url);
            xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
            xhr.setRequestHeader('x-upsert', 'false');

            // FormData로 파일 전송
            const formData = new FormData();
            formData.append('file', item.file);
            xhr.send(formData);
          } catch (error) {
            reject(error);
          }
        })();
      });
    } catch (error) {
      throw error;
    }
  };

  // 큐 처리 함수
  const processQueue = useCallback(async () => {
    if (processingRef.current || queueState.isPaused) return;
    
    const waitingItems = queueState.items
      .filter(item => item.status === 'waiting')
      .sort((a, b) => a.priority - b.priority);
    
    const uploadingCount = queueState.items.filter(
      item => item.status === 'uploading' || item.status === 'processing'
    ).length;
    
    const availableSlots = queueState.concurrentLimit - uploadingCount;
    
    if (availableSlots <= 0 || waitingItems.length === 0) return;
    
    processingRef.current = true;
    
    // 가능한 슬롯만큼 아이템 처리
    const itemsToProcess = waitingItems.slice(0, availableSlots);
    
    for (const item of itemsToProcess) {
      // AbortController 생성
      const abortController = new AbortController();
      abortControllersRef.current.set(item.id, abortController);
      
      // 상태를 uploading으로 변경
      setQueueState(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id 
            ? { ...i, status: 'uploading', startedAt: new Date() } 
            : i
        ),
        activeUploads: prev.activeUploads + 1
      }));
      
      // 비동기로 업로드 처리
      (async () => {
        try {
          // 파일 업로드
          const filePath = await uploadFile(item, abortController.signal);
          
          // 업로드 성공 후 processing 상태로 변경
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i => 
              i.id === item.id 
                ? { ...i, status: 'processing', progress: 100 } 
                : i
            )
          }));
          
          // 문서 처리 (소스 ID가 있는 경우에만)
          if (item.sourceId) {
            // 소스 상태 업데이트
            const { error: updateError } = await supabase
              .from('sources')
              .update({
                file_path: filePath,
                processing_status: 'processing'
              })
              .eq('id', item.sourceId);

            if (updateError) {
              console.error('Failed to update source:', updateError);
            }

            // 문서 처리를 위한 Edge Function 호출
            const fileType = item.file.type.includes('pdf') ? 'pdf' : 
                           item.file.type.includes('audio') ? 'audio' : 'text';
            
            try {
              const { error: processError } = await supabase.functions.invoke('process-document', {
                body: {
                  sourceId: item.sourceId,
                  filePath,
                  sourceType: fileType
                }
              });

              if (processError) throw processError;

              // 노트북 컨텐츠 생성
              const { error: generateError } = await supabase.functions.invoke('generate-notebook-content', {
                body: {
                  notebookId: item.notebookId,
                  filePath,
                  sourceType: fileType
                }
              });

              if (generateError) {
                console.error('Notebook generation error:', generateError);
              }

              // 농업 문서 자동 분류 실행
              try {
                console.log('Starting agriculture classification for:', item.file.name);
                const { data: classifyData, error: classifyError } = await supabase.functions.invoke('classify-document', {
                  body: {
                    sourceId: item.sourceId,
                    title: item.file.name,
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

              // 완료 상태로 변경
              setQueueState(prev => ({
                ...prev,
                items: prev.items.map(i => 
                  i.id === item.id 
                    ? { ...i, status: 'completed', completedAt: new Date() } 
                    : i
                ),
                activeUploads: Math.max(0, prev.activeUploads - 1)
              }));

              // 소스 상태를 완료로 업데이트
              await supabase
                .from('sources')
                .update({ processing_status: 'completed' })
                .eq('id', item.sourceId);
              
              toast({
                title: "처리 완료",
                description: `${item.file.name} 파일이 성공적으로 처리되었습니다.`
              });
            } catch (processError: any) {
              // 처리 실패 시 소스 상태 업데이트
              await supabase
                .from('sources')
                .update({ 
                  processing_status: 'failed',
                  metadata: { error: processError.message }
                })
                .eq('id', item.sourceId);
              
              throw new Error(`문서 처리 실패: ${processError.message}`);
            }
          } else {
            // 소스 ID가 없는 경우 업로드만 완료
            setQueueState(prev => ({
              ...prev,
              items: prev.items.map(i => 
                i.id === item.id 
                  ? { ...i, status: 'completed', completedAt: new Date() } 
                  : i
              ),
              activeUploads: Math.max(0, prev.activeUploads - 1)
            }));
            
            toast({
              title: "업로드 완료",
              description: `${item.file.name} 파일이 업로드되었습니다.`
            });
          }
        } catch (error: any) {
          const isCancelled = error.message === 'Upload cancelled';
          
          // 실패 또는 취소 처리
          setQueueState(prev => ({
            ...prev,
            items: prev.items.map(i => 
              i.id === item.id 
                ? { 
                    ...i, 
                    status: isCancelled ? 'paused' : 'failed',
                    error: error.message,
                    retryCount: i.retryCount + (isCancelled ? 0 : 1)
                  } 
                : i
            ),
            activeUploads: Math.max(0, prev.activeUploads - 1)
          }));
          
          if (!isCancelled) {
            toast({
              title: "업로드 실패",
              description: `${item.file.name}: ${error.message}`,
              variant: "destructive"
            });
            
            // 재시도 가능한 경우 자동 재시도
            if (item.retryCount < item.maxRetries - 1) {
              setTimeout(() => {
                retryItem(item.id);
              }, Math.pow(2, item.retryCount) * 1000); // 지수 백오프
            }
          }
        } finally {
          abortControllersRef.current.delete(item.id);
        }
      })();
    }
    
    processingRef.current = false;
  }, [queueState, toast]);

  // 큐 상태가 변경될 때마다 처리
  useEffect(() => {
    processQueue();
  }, [queueState.items, queueState.isPaused, queueState.concurrentLimit, processQueue]);

  // 큐에 파일 추가 (소스 ID와 함께)
  const addToQueue = useCallback((
    files: File[], 
    notebookId: string, 
    priority: number = 5,
    sourceIds?: string[]
  ): string[] => {
    const newItems: QueueItem[] = files.map((file, index) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      notebookId,
      sourceId: sourceIds?.[index],
      status: 'waiting',
      progress: 0,
      priority,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date()
    }));
    
    setQueueState(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
    
    toast({
      title: "큐에 추가됨",
      description: `${files.length}개의 파일이 업로드 대기열에 추가되었습니다.`
    });
    
    return newItems.map(item => item.id);
  }, [toast]);

  // 큐에서 아이템 제거
  const removeFromQueue = useCallback((itemId: string) => {
    // 진행 중인 업로드 취소
    const abortController = abortControllersRef.current.get(itemId);
    if (abortController) {
      abortController.abort();
    }
    
    setQueueState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      activeUploads: prev.items.find(i => i.id === itemId)?.status === 'uploading' 
        ? Math.max(0, prev.activeUploads - 1) 
        : prev.activeUploads
    }));
  }, []);

  // 큐 전체 삭제
  const clearQueue = useCallback(() => {
    // 모든 진행 중인 업로드 취소
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
    
    setQueueState(prev => ({
      ...prev,
      items: [],
      activeUploads: 0
    }));
    
    toast({
      title: "큐 비우기",
      description: "모든 업로드가 취소되었습니다."
    });
  }, [toast]);

  // 큐 일시정지
  const pauseQueue = useCallback(() => {
    // 진행 중인 업로드 취소
    abortControllersRef.current.forEach(controller => controller.abort());
    
    setQueueState(prev => ({
      ...prev,
      isPaused: true,
      items: prev.items.map(item => 
        item.status === 'uploading' 
          ? { ...item, status: 'paused', progress: 0 }
          : item
      )
    }));
    
    toast({
      title: "업로드 일시정지",
      description: "모든 업로드가 일시정지되었습니다."
    });
  }, [toast]);

  // 큐 재개
  const resumeQueue = useCallback(() => {
    setQueueState(prev => ({
      ...prev,
      isPaused: false,
      items: prev.items.map(item => 
        item.status === 'paused' 
          ? { ...item, status: 'waiting' }
          : item
      )
    }));
    
    toast({
      title: "업로드 재개",
      description: "업로드가 재개되었습니다."
    });
  }, [toast]);

  // 아이템 재시도
  const retryItem = useCallback((itemId: string) => {
    setQueueState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'waiting', error: undefined }
          : item
      )
    }));
  }, []);

  // 우선순위 변경
  const updatePriority = useCallback((itemId: string, priority: number) => {
    setQueueState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, priority }
          : item
      )
    }));
  }, []);

  // 동시 업로드 제한 설정
  const setConcurrentLimit = useCallback((limit: number) => {
    setQueueState(prev => ({
      ...prev,
      concurrentLimit: Math.max(1, Math.min(10, limit))
    }));
  }, []);

  // 큐 통계 가져오기
  const getQueueStats = useCallback(() => {
    const stats = {
      total: queueState.items.length,
      waiting: 0,
      uploading: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      paused: 0
    };
    
    queueState.items.forEach(item => {
      stats[item.status]++;
    });
    
    return stats;
  }, [queueState.items]);

  // 큐에 아이템이 추가되면 모니터 표시
  useEffect(() => {
    if (queueState.items.length > 0 && !showMonitor) {
      setShowMonitor(true);
      setIsMinimized(true);
    }
  }, [queueState.items.length, showMonitor]);

  const value: UploadQueueContextType = {
    queueState,
    addToQueue,
    removeFromQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    retryItem,
    updatePriority,
    setConcurrentLimit,
    getQueueStats,
    showMonitor,
    setShowMonitor,
    isMinimized,
    setIsMinimized
  };

  return (
    <UploadQueueContext.Provider value={value}>
      {children}
    </UploadQueueContext.Provider>
  );
};

// Hook
export const useUploadQueue = () => {
  const context = useContext(UploadQueueContext);
  if (context === undefined) {
    throw new Error('useUploadQueue must be used within an UploadQueueProvider');
  }
  return context;
};

// 큐 아이템 업로드 mutation
export const useQueueUpload = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      notebookId,
      sourceId,
      onProgress
    }: {
      file: File;
      notebookId: string;
      sourceId: string;
      onProgress?: (progress: number) => void;
    }) => {
      const fileExtension = file.name.split('.').pop() || 'bin';
      const filePath = `${notebookId}/${sourceId}.${fileExtension}`;
      
      // 실제 업로드 로직
      const { data, error } = await supabase.storage
        .from('sources')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { filePath, sourceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
    onError: (error: Error) => {
      console.error('Queue upload error:', error);
    }
  });
};