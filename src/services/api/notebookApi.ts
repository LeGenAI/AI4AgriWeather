/**
 * Notebook API 서비스
 * 노트북 관련 CRUD 작업을 위한 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import type { Database } from '@/integrations/supabase/types';

type Notebook = Database['public']['Tables']['notebooks']['Row'];
type NotebookInsert = Database['public']['Tables']['notebooks']['Insert'];
type NotebookUpdate = Database['public']['Tables']['notebooks']['Update'];

/**
 * 사용자의 노트북 목록 조회
 */
export const getNotebooks = async (userId: string): Promise<Notebook[]> => {
  try {
    const notebooks = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    );

    return notebooks || [];
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    handleApiError(error);
  }
};

/**
 * 특정 노트북 조회
 */
export const getNotebook = async (id: string, userId: string): Promise<Notebook> => {
  try {
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
    );

    return notebook;
  } catch (error) {
    console.error('Error fetching notebook:', error);
    handleApiError(error);
  }
};

/**
 * 노트북 생성
 */
export const createNotebook = async (
  userId: string,
  data: Omit<NotebookInsert, 'user_id'>
): Promise<Notebook> => {
  try {
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .insert({
          ...data,
          user_id: userId,
        })
        .select()
        .single()
    );

    return notebook;
  } catch (error) {
    console.error('Error creating notebook:', error);
    handleApiError(error);
  }
};

/**
 * 노트북 업데이트
 */
export const updateNotebook = async (
  id: string,
  userId: string,
  updates: NotebookUpdate
): Promise<Notebook> => {
  try {
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    );

    return notebook;
  } catch (error) {
    console.error('Error updating notebook:', error);
    handleApiError(error);
  }
};

/**
 * 노트북 삭제
 */
export const deleteNotebook = async (id: string, userId: string): Promise<void> => {
  try {
    await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    );
  } catch (error) {
    console.error('Error deleting notebook:', error);
    handleApiError(error);
  }
};