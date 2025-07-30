/**
 * Notebooks 생성 관련 API 서비스
 * 노트북 콘텐츠 생성 및 오디오 관련 Edge Functions 호출
 */

import { safeApiCall, handleApiError, supabase } from '@/shared/services/core/apiClient';
import {
  NotebookContentGenerationRequest,
  AudioOverviewGenerationRequest,
  AudioUrlRefreshRequest,
  NotebookApiResponse
} from './types';

/**
 * 노트북 콘텐츠 생성 (Edge Function 호출)
 */
export const generateNotebookContent = async (
  request: NotebookContentGenerationRequest
): Promise<NotebookApiResponse> => {
  try {
    console.log('Starting notebook content generation for:', request.notebookId, 
                'with source type:', request.sourceType);
    
    const response = await safeApiCall(async () =>
      supabase.functions.invoke('generate-notebook-content', {
        body: {
          notebookId: request.notebookId,
          filePath: request.filePath,
          sourceType: request.sourceType
        }
      })
    );

    console.log('Notebook content generation response:', response);
    return response;
  } catch (error) {
    console.error('Error generating notebook content:', error);
    handleApiError(error);
  }
};

/**
 * 오디오 개요 생성 (Edge Function 호출)
 */
export const generateAudioOverview = async (
  request: AudioOverviewGenerationRequest
): Promise<NotebookApiResponse> => {
  try {
    console.log('Starting audio overview generation for notebook:', request.notebookId);
    
    const response = await safeApiCall(async () =>
      supabase.functions.invoke('generate-audio-overview', {
        body: { notebookId: request.notebookId }
      })
    );

    console.log('Audio overview generation response:', response);
    return response;
  } catch (error) {
    console.error('Error generating audio overview:', error);
    handleApiError(error);
  }
};

/**
 * 오디오 URL 갱신 (Edge Function 호출)
 */
export const refreshAudioUrl = async (
  request: AudioUrlRefreshRequest
): Promise<NotebookApiResponse> => {
  try {
    console.log('Refreshing audio URL for notebook:', request.notebookId, 
                'silent:', request.silent);
    
    const response = await safeApiCall(async () =>
      supabase.functions.invoke('refresh-audio-url', {
        body: { notebookId: request.notebookId }
      })
    );

    console.log('Audio URL refresh response:', response);
    return response;
  } catch (error) {
    console.error('Error refreshing audio URL:', error);
    handleApiError(error);
  }
};

/**
 * 오디오 URL 만료 확인
 */
export const checkAudioExpiry = (expiresAt: string | null): boolean => {
  if (!expiresAt) return true;
  return new Date(expiresAt) <= new Date();
};

/**
 * 만료된 오디오 URL 자동 갱신
 */
export const autoRefreshIfExpired = async (
  notebookId: string, 
  expiresAt: string | null
): Promise<NotebookApiResponse | null> => {
  try {
    if (checkAudioExpiry(expiresAt)) {
      console.log('Audio URL expired, auto-refreshing for notebook:', notebookId);
      
      const response = await refreshAudioUrl({ 
        notebookId, 
        silent: true 
      });
      
      console.log('Auto-refresh completed successfully');
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Auto-refresh failed for notebook:', notebookId, error);
    // 자동 갱신 실패는 에러를 throw하지 않음 (사용자 경험을 위해)
    return null;
  }
};

/**
 * 생성 관련 유틸리티 함수들
 */
export const generationUtils = {
  /**
   * 생성 상태가 완료되었는지 확인
   */
  isGenerationComplete: (status: string | null): boolean => {
    return status === 'completed';
  },

  /**
   * 생성 상태가 실패했는지 확인
   */
  isGenerationFailed: (status: string | null): boolean => {
    return status === 'failed';
  },

  /**
   * 생성이 진행 중인지 확인
   */
  isGenerationInProgress: (status: string | null): boolean => {
    return status === 'generating' || status === 'processing' || status === 'pending';
  },

  /**
   * 오디오가 재생 가능한 상태인지 확인
   */
  isAudioPlayable: (audioUrl: string | null, expiresAt: string | null): boolean => {
    return audioUrl !== null && !checkAudioExpiry(expiresAt);
  }
};