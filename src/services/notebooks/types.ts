/**
 * Notebook 도메인 타입 정의
 */

import { Database } from '@/integrations/supabase/types';

// Supabase 타입에서 Notebook 타입 추출
export type Notebook = Database['public']['Tables']['notebooks']['Row'];
export type NotebookInsert = Database['public']['Tables']['notebooks']['Insert'];
export type NotebookUpdate = Database['public']['Tables']['notebooks']['Update'];

/**
 * 노트북 생성 입력 타입
 */
export interface NotebookCreateInput {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

/**
 * 노트북 업데이트 입력 타입
 */
export interface NotebookUpdateInput {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  generation_status?: NotebookGenerationStatus;
  audio_overview_generation_status?: AudioGenerationStatus;
  audio_overview_url?: string;
  audio_url_expires_at?: string;
  example_questions?: string[];
}

/**
 * 소스 개수를 포함한 노트북 타입
 */
export interface NotebookWithSources extends Notebook {
  sources: Array<{ count: number }>;
}

/**
 * 노트북 생성 상태
 */
export type NotebookGenerationStatus = 
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed';

/**
 * 오디오 생성 상태
 */
export type AudioGenerationStatus = 
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed';

/**
 * 노트북 콘텐츠 생성 요청 타입
 */
export interface NotebookContentGenerationRequest {
  notebookId: string;
  filePath?: string;
  sourceType: string;
}

/**
 * 오디오 개요 생성 요청 타입
 */
export interface AudioOverviewGenerationRequest {
  notebookId: string;
}

/**
 * 오디오 URL 갱신 요청 타입
 */
export interface AudioUrlRefreshRequest {
  notebookId: string;
  silent?: boolean;
}

/**
 * API 응답 타입
 */
export interface NotebookApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 노트북 목록 조회 옵션
 */
export interface GetNotebooksOptions {
  includeSourceCount?: boolean;
  orderBy?: 'updated_at' | 'created_at' | 'title';
  ascending?: boolean;
}