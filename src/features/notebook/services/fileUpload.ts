/**
 * 파일 업로드 서비스
 * 소스 파일 업로드와 다중 파일 처리를 담당
 */

import { 
  uploadFile, 
  validateFile, 
  generateUniqueFilePath, 
  sanitizeFileName,
  FileUploadOptions as CoreFileUploadOptions 
} from '@/shared/services/core/storage';
import { createSource, updateSource } from './sourcesApi';
import {
  Source,
  SourceType,
  FileUploadOptions,
  FileUploadProgress,
  MultipleFileUploadResult,
  FileValidationResult,
  UploadCancellation,
  ProcessingStatus,
} from './types';

// 파일 타입별 설정
const FILE_TYPE_CONFIGS = {
  pdf: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
  audio: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'audio/mpeg',
      'audio/mp3', 
      'audio/wav',
      'audio/x-wav',
      'audio/mp4',
      'audio/m4a',
      'audio/ogg',
      'audio/webm'
    ],
    extensions: ['.mp3', '.wav', '.m4a', '.mp4', '.ogg', '.webm'],
  },
} as const;

// 활성 업로드 추적을 위한 맵
const activeUploads = new Map<string, AbortController>();

/**
 * 파일 검증
 */
export const validateSourceFile = (
  file: File, 
  sourceType: SourceType
): FileValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
  };

  // 파일 크기가 0인지 확인
  if (file.size === 0) {
    errors.push('파일이 비어있습니다.');
  }

  // 파일명 길이 확인
  if (file.name.length > 255) {
    errors.push('파일명이 너무 깁니다. (최대 255자)');
  }

  // 타입별 검증
  if (sourceType === 'pdf' || sourceType === 'audio') {
    const config = FILE_TYPE_CONFIGS[sourceType];
    
    try {
      validateFile(file, {
        maxSize: config.maxSize,
        allowedTypes: config.allowedTypes,
      });
    } catch (error: any) {
      errors.push(error.message);
    }
    
    // 확장자 추가 검증
    if (!config.extensions.includes(fileInfo.extension)) {
      errors.push(`지원되지 않는 파일 형식입니다. 지원 형식: ${config.extensions.join(', ')}`);
    }
  }

  // 용량이 큰 파일에 대한 경고
  if (file.size > 20 * 1024 * 1024) { // 20MB 이상
    warnings.push('파일 크기가 큽니다. 업로드와 처리에 시간이 오래 걸릴 수 있습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo,
  };
};

/**
 * 파일 업로드와 소스 생성
 */
export const uploadSourceFile = async (options: FileUploadOptions): Promise<Source> => {
  const {
    notebookId,
    file,
    title,
    metadata = {},
    onProgress,
    onStatusChange,
    signal,
  } = options;

  // 파일 타입 결정
  const sourceType: SourceType = getSourceTypeFromFile(file);
  
  // 파일 검증
  const validation = validateSourceFile(file, sourceType);
  if (!validation.isValid) {
    throw new Error(`파일 검증 실패: ${validation.errors.join(', ')}`);
  }

  // AbortController 설정
  const abortController = signal ? signal : new AbortController();
  const sourceId = generateTempSourceId();
  
  if (!signal) {
    activeUploads.set(sourceId, abortController);
  }

  try {
    // 1. 먼저 소스 생성 (파일 경로 없이)
    const source = await createSource({
      notebookId,
      title: title || file.name,
      type: sourceType,
      processingStatus: 'pending',
      metadata: {
        ...metadata,
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadStartTime: new Date().toISOString(),
      },
    });

    const actualSourceId = source.id;

    // 활성 업로드 맵 업데이트
    if (!signal) {
      activeUploads.delete(sourceId);
      activeUploads.set(actualSourceId, abortController);
    }

    // 진행률 초기화
    const initialProgress: FileUploadProgress = {
      sourceId: actualSourceId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      uploadStartTime: new Date(),
    };

    onProgress?.(initialProgress);
    onStatusChange?.('processing');

    // 2. 파일 업로드
    const filePath = generateUniqueFilePath(notebookId, file.name);
    
    // 업로드 진행률 시뮬레이션 (실제 구현에서는 XHR의 progress 이벤트 사용)
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (abortController.signal.aborted) {
        clearInterval(progressInterval);
        return;
      }
      
      progress += Math.random() * 15;
      if (progress > 85) progress = 85; // 85%까지만 시뮬레이션
      
      onProgress?.({
        ...initialProgress,
        progress: Math.min(progress, 85),
      });
    }, 100);

    const uploadResult = await uploadFile({
      bucket: 'sources',
      path: filePath,
      file: file,
      upsert: false,
    });

    clearInterval(progressInterval);

    // 업로드 취소 확인
    if (abortController.signal.aborted) {
      throw new Error('업로드가 취소되었습니다.');
    }

    // 진행률 100% 업데이트
    onProgress?.({
      ...initialProgress,
      progress: 100,
      status: 'completed',
    });

    // 3. 소스에 파일 정보 업데이트
    const updatedSource = await updateSource(actualSourceId, {
      filePath: uploadResult.path,
      fileSize: file.size,
      processingStatus: 'completed',
    });

    onStatusChange?.('completed');

    // 활성 업로드에서 제거
    if (!signal) {
      activeUploads.delete(actualSourceId);
    }

    return updatedSource;

  } catch (error: any) {
    // 에러 시 진행률 업데이트
    onProgress?.({
      sourceId: sourceId,
      fileName: file.name,
      progress: 0,
      status: 'failed',
      error: error.message,
      uploadStartTime: new Date(),
    });

    onStatusChange?.('failed');

    // 활성 업로드에서 제거
    if (!signal) {
      activeUploads.delete(sourceId);
    }

    throw error;
  }
};

/**
 * 다중 파일 업로드
 */
export const handleMultipleFiles = async (
  notebookId: string,
  files: File[],
  options: {
    onProgress?: (sourceId: string, progress: FileUploadProgress) => void;
    onFileComplete?: (source: Source) => void;
    onFileError?: (fileName: string, error: string) => void;
  } = {}
): Promise<MultipleFileUploadResult> => {
  const { onProgress, onFileComplete, onFileError } = options;
  
  const result: MultipleFileUploadResult = {
    successful: [],
    failed: [],
    total: files.length,
  };

  // 병렬 처리 제한 (동시에 3개 파일만 업로드)
  const concurrency = 3;
  const chunks = [];
  
  for (let i = 0; i < files.length; i += concurrency) {
    chunks.push(files.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (file) => {
      try {
        const source = await uploadSourceFile({
          notebookId,
          file,
          onProgress: (progress) => onProgress?.(progress.sourceId, progress),
          onStatusChange: () => {}, // 개별 파일 상태는 onProgress로 처리
        });
        
        result.successful.push(source);
        onFileComplete?.(source);
      } catch (error: any) {
        const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
        result.failed.push({
          fileName: file.name,
          error: errorMessage,
        });
        onFileError?.(file.name, errorMessage);
      }
    });

    // 청크 내의 모든 파일 업로드 완료 대기
    await Promise.allSettled(promises);
  }

  return result;
};

/**
 * 업로드 진행률 추적
 */
export const getUploadProgress = (sourceId: string): FileUploadProgress | null => {
  // 실제 구현에서는 상태 관리나 캐시에서 조회
  // 현재는 단순한 예시
  return null;
};

/**
 * 업로드 취소
 */
export const cancelUpload = (sourceId: string): boolean => {
  const controller = activeUploads.get(sourceId);
  if (controller) {
    controller.abort();
    activeUploads.delete(sourceId);
    return true;
  }
  return false;
};

/**
 * 모든 활성 업로드 취소
 */
export const cancelAllUploads = (): void => {
  activeUploads.forEach((controller) => {
    controller.abort();
  });
  activeUploads.clear();
};

/**
 * 활성 업로드 목록 조회
 */
export const getActiveUploads = (): string[] => {
  return Array.from(activeUploads.keys());
};

/**
 * 업로드 취소 핸들러 생성
 */
export const createUploadCancellation = (sourceId: string): UploadCancellation => {
  let isCancelled = false;
  
  return {
    sourceId,
    cancel: () => {
      if (!isCancelled) {
        cancelUpload(sourceId);
        isCancelled = true;
      }
    },
    isCancelled: () => isCancelled,
  };
};

// 헬퍼 함수들

/**
 * 파일로부터 소스 타입 결정
 */
const getSourceTypeFromFile = (file: File): SourceType => {
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (extension === '.pdf') {
    return 'pdf';
  }
  
  if (FILE_TYPE_CONFIGS.audio.extensions.includes(extension)) {
    return 'audio';
  }
  
  // 기본값은 텍스트로 처리
  return 'text';
};

/**
 * 임시 소스 ID 생성 (실제 소스 생성 전 추적용)
 */
const generateTempSourceId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  
  return `${size} ${sizes[i]}`;
};

/**
 * 파일 타입별 아이콘 반환
 */
export const getFileTypeIcon = (sourceType: SourceType): string => {
  const icons: Record<SourceType, string> = {
    pdf: '📄',
    text: '📝',
    website: '🌐',
    youtube: '▶️',
    audio: '🎵',
  };
  
  return icons[sourceType] || '📄';
};

/**
 * 업로드 예상 시간 계산
 */
export const estimateUploadTime = (fileSize: number, uploadSpeed?: number): number => {
  // 기본 업로드 속도: 1MB/s (사용자 환경에 따라 조정)
  const avgUploadSpeed = uploadSpeed || 1024 * 1024; // bytes per second
  
  return Math.ceil(fileSize / avgUploadSpeed);
};