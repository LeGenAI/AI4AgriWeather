/**
 * Sources 도메인 타입 정의
 */

import { Database, Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// 데이터베이스 스키마 기반 타입
export type Source = Tables<'sources'>;
export type SourceInsert = TablesInsert<'sources'>;
export type SourceUpdate = TablesUpdate<'sources'>;

// Source Type Enum
export type SourceType = Database['public']['Enums']['source_type'];

// 처리 상태 타입
export type ProcessingStatus = 
  | 'pending'     // 대기중
  | 'processing'  // 처리중
  | 'completed'   // 완료
  | 'failed'      // 실패
  | 'cancelled';  // 취소됨

// 파일 업로드 진행률 타입
export interface FileUploadProgress {
  sourceId: string;
  fileName: string;
  progress: number;        // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  uploadStartTime: Date;
  estimatedTimeRemaining?: number; // seconds
}

// 소스 생성 입력 타입
export interface SourceCreateInput {
  notebookId: string;
  title: string;
  type: SourceType;
  content?: string;
  url?: string;
  file?: File;
  processingStatus?: ProcessingStatus;
  metadata?: Record<string, any>;
  displayName?: string;
}

// 소스 업데이트 입력 타입
export interface SourceUpdateInput {
  title?: string;
  content?: string;
  url?: string;
  filePath?: string;
  fileSize?: number;
  processingStatus?: ProcessingStatus;
  metadata?: Record<string, any>;
  displayName?: string;
  summary?: string;
}

// 진행률과 함께 사용되는 소스 타입
export interface SourceWithProgress extends Source {
  uploadProgress?: FileUploadProgress;
  isUploading?: boolean;
  isProcessing?: boolean;
  canRetry?: boolean;
}

// 파일 업로드 옵션
export interface FileUploadOptions {
  notebookId: string;
  file: File;
  title?: string;
  metadata?: Record<string, any>;
  onProgress?: (progress: FileUploadProgress) => void;
  onStatusChange?: (status: ProcessingStatus) => void;
  signal?: AbortSignal; // 업로드 취소용
}

// 다중 파일 업로드 결과
export interface MultipleFileUploadResult {
  successful: Source[];
  failed: Array<{
    fileName: string;
    error: string;
  }>;
  total: number;
}

// 소스 필터링 옵션
export interface SourceFilterOptions {
  type?: SourceType | SourceType[];
  processingStatus?: ProcessingStatus | ProcessingStatus[];
  hasContent?: boolean;
  hasFile?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  searchQuery?: string; // 제목이나 내용에서 검색
}

// 소스 정렬 옵션
export interface SourceSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'file_size';
  ascending?: boolean;
}

// 소스 쿼리 옵션 (필터링 + 정렬)
export interface SourceQueryOptions {
  filter?: SourceFilterOptions;
  sort?: SourceSortOptions;
  limit?: number;
  offset?: number;
}

// 문서 처리 상태 체크 결과
export interface DocumentProcessingStatus {
  sourceId: string;
  status: ProcessingStatus;
  progress?: number;
  message?: string;
  error?: string;
  estimatedTimeRemaining?: number;
  lastUpdated: Date;
}

// 파일 검증 결과
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

// API 응답 타입들
export interface SourcesApiResponse {
  data: Source[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface SourceApiResponse {
  data: Source;
}

// 에러 타입
export interface SourceError {
  code: string;
  message: string;
  details?: any;
  sourceId?: string;
}

// 업로드 취소 핸들러
export interface UploadCancellation {
  sourceId: string;
  cancel: () => void;
  isCancelled: boolean;
}

// 소스 통계 타입 (대시보드용)
export interface SourceStats {
  total: number;
  byType: Record<SourceType, number>;
  byStatus: Record<ProcessingStatus, number>;
  totalFileSize: number;
  averageFileSize: number;
  recentlyAdded: number; // 최근 7일
  processingQueue: number; // 처리 대기중인 파일 수
}

// 실시간 구독 이벤트 타입
export interface SourceRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Source;
  old?: Source;
  notebookId: string;
}