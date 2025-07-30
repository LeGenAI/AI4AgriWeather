/**
 * 노트북 관리 훅 - 새로운 API 서비스 기반
 * notebooks API 서비스와 실시간 구독 서비스를 사용하여
 * 노트북의 생명주기를 관리
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/features/authentication';
import { 
  getNotebooks, 
  getNotebook, 
  createNotebook 
} from '@/services/notebooks';
import { subscribeToUserNotebooks, RealtimeManager } from '@/services/core/realtime';
import type { 
  Notebook,
  NotebookWithSources,
  NotebookCreateInput,
  GetNotebooksOptions 
} from '@/services/notebooks/types';

/**
 * 메인 노트북 관리 훅
 */
export const useNotebooks = (options: GetNotebooksOptions = {}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notebooks = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['notebooks', user?.id, options],
    queryFn: async (): Promise<NotebookWithSources[]> => {
      if (!user?.id) {
        console.log('No user found, returning empty notebooks array');
        return [];
      }
      
      return await getNotebooks(user.id, options);
    },
    enabled: isAuthenticated && !authLoading && !!user?.id,
    retry: (failureCount, error: any) => {
      // 인증 관련 에러는 재시도하지 않음
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // 실시간 구독 설정
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    console.log('Setting up real-time subscription for notebooks');

    let realtimeManager: RealtimeManager;

    try {
      realtimeManager = subscribeToUserNotebooks(user.id, {
        onInsert: (notebook) => {
          console.log('Real-time notebook insert:', notebook);
          queryClient.invalidateQueries({ queryKey: ['notebooks', user.id] });
        },
        onUpdate: (notebook) => {
          console.log('Real-time notebook update:', notebook);
          queryClient.invalidateQueries({ queryKey: ['notebooks', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notebook', notebook.id] });
        },
        onDelete: (payload) => {
          console.log('Real-time notebook delete:', payload);
          queryClient.invalidateQueries({ queryKey: ['notebooks', user.id] });
        },
      });
    } catch (error) {
      console.error('Failed to set up real-time subscription:', error);
    }

    return () => {
      console.log('Cleaning up real-time subscription');
      realtimeManager?.unsubscribe();
    };
  }, [user?.id, isAuthenticated, queryClient]);

  const createNotebookMutation = useMutation({
    mutationFn: async (notebookData: NotebookCreateInput): Promise<Notebook> => {
      console.log('Creating notebook with data:', notebookData);
      console.log('Current user:', user?.id);
      
      if (!user?.id) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return await createNotebook(user.id, notebookData);
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  return {
    notebooks,
    isLoading: authLoading || isLoading,
    error: error?.message || null,
    isError,
    createNotebook: createNotebookMutation.mutate,
    createNotebookAsync: createNotebookMutation.mutateAsync,
    isCreating: createNotebookMutation.isPending,
  };
};

/**
 * 노트북 생성 전용 훅
 */
export const useCreateNotebook = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notebookData: NotebookCreateInput): Promise<Notebook> => {
      console.log('Creating notebook with data:', notebookData);
      console.log('Current user:', user?.id);
      
      if (!user?.id) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      return await createNotebook(user.id, notebookData);
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

/**
 * 개별 노트북 조회 훅
 */
export const useNotebook = (notebookId: string) => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['notebook', notebookId],
    queryFn: async (): Promise<Notebook> => {
      if (!user?.id || !notebookId) {
        throw new Error('User not authenticated or notebook ID missing');
      }

      console.log('🔍 Fetching notebook:', notebookId, 'for user:', user.id);
      
      const notebook = await getNotebook(notebookId, user.id);
      
      console.log('✅ Notebook fetched successfully:', notebook);
      return notebook;
    },
    enabled: isAuthenticated && !!notebookId && !!user?.id,
  });
};