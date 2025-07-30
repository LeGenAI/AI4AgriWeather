/**
 * Notebooks 서비스 모듈 인덱스
 * notebooks 도메인의 모든 API 서비스를 중앙에서 export
 */

// API 서비스 함수들
export {
  getNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  updateNotebookStatus
} from './notebooksApi';

// 생성 관련 서비스 함수들
export {
  generateNotebookContent,
  generateAudioOverview,
  refreshAudioUrl,
  checkAudioExpiry,
  autoRefreshIfExpired,
  generationUtils
} from './notebooksGeneration';

// 타입 정의들
export type {
  Notebook,
  NotebookInsert,
  NotebookUpdate,
  NotebookCreateInput,
  NotebookUpdateInput,
  NotebookWithSources,
  NotebookGenerationStatus,
  AudioGenerationStatus,
  NotebookContentGenerationRequest,
  AudioOverviewGenerationRequest,
  AudioUrlRefreshRequest,
  NotebookApiResponse,
  GetNotebooksOptions
} from './types';