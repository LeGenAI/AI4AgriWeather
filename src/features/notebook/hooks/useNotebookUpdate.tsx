/**
 * 노트북 업데이트 훅 - 새로운 API 서비스 기반
 * notebooks API 서비스를 사용하여 안전한 노트북 업데이트 수행
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/authentication/hooks';
import { useToast } from '@/shared/hooks/use-toast';
import { updateNotebook } from '../services';
import type { Notebook, NotebookUpdateInput } from '../services/types';

export const useNotebookUpdate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const updateNotebookMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: NotebookUpdateInput;
    }): Promise<Notebook> => {
      console.log('Updating notebook:', id, updates);
      
      try {
        const updatedNotebook = await updateNotebook(id, updates);
        console.log('Notebook updated successfully:', updatedNotebook);
        return updatedNotebook;
      } catch (error) {
        console.error('Error updating notebook:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Update mutation success, invalidating queries');
      
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['notebook', data.id] });
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      
      // 특정 경우에만 성공 토스트 표시 (제목 변경 시)
      toast({
        title: "Notebook updated",
        description: "The notebook has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      
      let errorMessage = "Failed to update the notebook. Please try again.";
      
      // 에러 타입에 따른 구체적인 메시지 제공
      if (error?.code === 'PGRST116') {
        errorMessage = "Notebook not found or you don't have permission to update it.";
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('auth') || error?.message?.includes('JWT')) {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (error?.message?.includes('validation')) {
        errorMessage = "Invalid data provided. Please check your input and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // 에러 토스트
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    updateNotebook: updateNotebookMutation.mutate,
    updateNotebookAsync: updateNotebookMutation.mutateAsync,
    isUpdating: updateNotebookMutation.isPending,
    error: updateNotebookMutation.error,
  };
};