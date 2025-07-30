/**
 * 노트북 생성 훅 - 새로운 API 서비스 기반
 * notebooks generation API 서비스를 사용하여 콘텐츠 생성 관리
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/authentication/hooks';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  generateNotebookContent,
  generateAudioOverview,
  refreshAudioUrl,
  autoRefreshIfExpired,
  generationUtils
} from '../services';
import type { 
  NotebookContentGenerationRequest,
  AudioOverviewGenerationRequest,
  AudioUrlRefreshRequest,
  NotebookApiResponse 
} from '../services/types';

/**
 * 노트북 콘텐츠 생성 훅
 */
export const useNotebookGeneration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const generateContentMutation = useMutation({
    mutationFn: async (request: NotebookContentGenerationRequest): Promise<NotebookApiResponse> => {
      console.log('Starting notebook content generation for:', request.notebookId, 
                  'with source type:', request.sourceType);
      
      try {
        const response = await generateNotebookContent(request);
        console.log('Notebook content generation response:', response);
        return response;
      } catch (error) {
        console.error('Error generating notebook content:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Notebook generation successful:', data);
      
      // 관련 쿼리들 무효화하여 UI 새로고침
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notebook'] });
      
      toast({
        title: "Content Generated",
        description: "Notebook title and description have been generated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Notebook generation failed:', error);
      
      let errorMessage = "Failed to generate notebook content. Please try again.";
      
      // 에러 타입에 따른 구체적인 메시지 제공
      if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('auth') || error?.message?.includes('JWT')) {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (error?.message?.includes('timeout')) {
        errorMessage = "Generation request timed out. Please try again.";
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        errorMessage = "You've reached your generation limit. Please try again later.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    generateNotebookContent: generateContentMutation.mutate,
    generateNotebookContentAsync: generateContentMutation.mutateAsync,
    isGenerating: generateContentMutation.isPending,
    error: generateContentMutation.error,
  };
};

/**
 * 오디오 개요 생성 훅
 */
export const useAudioOverviewGeneration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const generateAudioMutation = useMutation({
    mutationFn: async (request: AudioOverviewGenerationRequest): Promise<NotebookApiResponse> => {
      console.log('Starting audio overview generation for notebook:', request.notebookId);
      
      try {
        const response = await generateAudioOverview(request);
        console.log('Audio overview generation response:', response);
        return response;
      } catch (error) {
        console.error('Error generating audio overview:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Audio generation successful:', data);
      
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notebook', variables.notebookId] });
      
      toast({
        title: "Audio Generated",
        description: "Audio overview has been generated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Audio generation failed:', error);
      
      let errorMessage = "Failed to generate audio overview. Please try again.";
      
      if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('timeout')) {
        errorMessage = "Audio generation timed out. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Audio Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    generateAudioOverview: generateAudioMutation.mutate,
    generateAudioOverviewAsync: generateAudioMutation.mutateAsync,
    isGeneratingAudio: generateAudioMutation.isPending,
    error: generateAudioMutation.error,
  };
};

/**
 * 오디오 URL 새로고침 훅
 */
export const useAudioUrlRefresh = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshUrlMutation = useMutation({
    mutationFn: async (request: AudioUrlRefreshRequest): Promise<NotebookApiResponse> => {
      console.log('Refreshing audio URL for notebook:', request.notebookId, 
                  'silent:', request.silent);
      
      try {
        const response = await refreshAudioUrl(request);
        console.log('Audio URL refresh response:', response);
        return response;
      } catch (error) {
        console.error('Error refreshing audio URL:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Audio URL refresh successful:', data);
      
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notebook', variables.notebookId] });
      
      if (!variables.silent) {
        toast({
          title: "Audio URL Refreshed",
          description: "Audio URL has been refreshed successfully.",
        });
      }
    },
    onError: (error: any, variables) => {
      console.error('Audio URL refresh failed:', error);
      
      if (!variables.silent) {
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh audio URL. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  return {
    refreshAudioUrl: refreshUrlMutation.mutate,
    refreshAudioUrlAsync: refreshUrlMutation.mutateAsync,
    isRefreshing: refreshUrlMutation.isPending,
    error: refreshUrlMutation.error,
  };
};

/**
 * 자동 오디오 URL 갱신 훅 (만료 확인 포함)
 */
export const useAutoAudioRefresh = () => {
  const { refreshAudioUrlAsync } = useAudioUrlRefresh();

  const autoRefresh = async (notebookId: string, expiresAt: string | null): Promise<NotebookApiResponse | null> => {
    try {
      return await autoRefreshIfExpired(notebookId, expiresAt);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      return null;
    }
  };

  return {
    autoRefresh,
    ...generationUtils, // 유틸리티 함수들 노출
  };
};