import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/authentication';

export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  source_type: 'user' | 'ai_response';
  extracted_text?: string;
  created_at: string;
  updated_at: string;
}

export const useNotes = (notebookId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: async () => {
      if (!notebookId) return [];
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!notebookId && !!user,
  });

  const createNoteMutation = useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      source_type = 'user',
      extracted_text 
    }: { 
      title: string; 
      content: string; 
      source_type?: 'user' | 'ai_response';
      extracted_text?: string;
    }) => {
      if (!notebookId) throw new Error('Notebook ID is required');
      
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          notebook_id: notebookId,
          title,
          content,
          source_type,
          extracted_text,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
    },
  });

  return {
    notes,
    isLoading,
    createNote: createNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    updateNote: updateNoteMutation.mutate,
    isUpdating: updateNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutate,
    isDeleting: deleteNoteMutation.isPending,
  };
};
