/**
 * 노트북 삭제 훅 - 새로운 API 서비스 기반
 * notebooks API 서비스를 사용하여 안전한 노트북 삭제 수행
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/authentication';
import { useToast } from '@/hooks/use-toast';
import { deleteNotebook } from '@/services/notebooks';
import type { Notebook } from '@/services/notebooks/types';

export const useNotebookDelete = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteNotebookMutation = useMutation({
    mutationFn: async (notebookId: string): Promise<Notebook> => {
      console.log('Starting notebook deletion process for:', notebookId);
      
      try {
        const deletedNotebook = await deleteNotebook(notebookId);
        console.log('Notebook deleted successfully:', deletedNotebook.title);
        return deletedNotebook;
      } catch (error) {
        console.error('Error in deletion process:', error);
        throw error;
      }
    },
    onSuccess: (deletedNotebook, notebookId) => {
      console.log('Delete mutation success, invalidating queries');
      
      // 관련된 모든 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['notebooks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['sources', notebookId] });
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] });
      
      // 성공 토스트
      toast({
        title: "Notebook deleted",
        description: `"${deletedNotebook?.title || 'Notebook'}" and all its sources have been successfully deleted.`,
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      
      let errorMessage = "Failed to delete the notebook. Please try again.";
      
      // 에러 타입에 따른 구체적인 메시지 제공
      if (error?.code === 'PGRST116') {
        errorMessage = "Notebook not found or you don't have permission to delete it.";
      } else if (error?.message?.includes('foreign key')) {
        errorMessage = "Cannot delete notebook due to data dependencies. Please contact support.";
      } else if (error?.message?.includes('network') || error?.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error?.message?.includes('auth') || error?.message?.includes('JWT')) {
        errorMessage = "Authentication error. Please sign in again.";
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
    deleteNotebook: deleteNotebookMutation.mutate,
    deleteNotebookAsync: deleteNotebookMutation.mutateAsync,
    isDeleting: deleteNotebookMutation.isPending,
    error: deleteNotebookMutation.error,
  };
};