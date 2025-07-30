/**
 * Notebooks API 서비스
 * 노트북 CRUD 작업을 위한 공통 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import {
  Notebook,
  NotebookWithSources,
  NotebookCreateInput,
  NotebookUpdateInput,
  NotebookGenerationStatus,
  GetNotebooksOptions
} from './types';

/**
 * 사용자별 노트북 목록 조회
 */
export const getNotebooks = async (
  userId: string, 
  options: GetNotebooksOptions = {}
): Promise<NotebookWithSources[]> => {
  const {
    includeSourceCount = true,
    orderBy = 'updated_at',
    ascending = false
  } = options;

  try {
    console.log('Fetching notebooks for user:', userId);
    
    // 노트북 목록 조회
    const notebooksData = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', userId)
        .order(orderBy, { ascending })
    );

    if (!includeSourceCount) {
      return notebooksData.map(notebook => ({
        ...notebook,
        sources: [{ count: 0 }]
      }));
    }

    // 각 노트북의 소스 개수를 조회
    const notebooksWithCounts = await Promise.all(
      (notebooksData || []).map(async (notebook) => {
        try {
          const result = await safeApiCall(async () =>
            supabase
              .from('sources')
              .select('*', { count: 'exact', head: true })
              .eq('notebook_id', notebook.id)
          );

          const count = result?.count || 0;
          return { ...notebook, sources: [{ count }] };
        } catch (error) {
          console.error('Error fetching source count for notebook:', notebook.id, error);
          return { ...notebook, sources: [{ count: 0 }] };
        }
      })
    );

    console.log('Fetched notebooks:', notebooksWithCounts?.length || 0);
    return notebooksWithCounts || [];
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    handleApiError(error);
  }
};

/**
 * 개별 노트북 조회
 */
export const getNotebook = async (id: string, userId: string): Promise<Notebook> => {
  try {
    console.log('Fetching notebook:', id, 'for user:', userId);
    
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
    );

    console.log('Notebook fetched successfully:', notebook);
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
  data: NotebookCreateInput
): Promise<Notebook> => {
  try {
    console.log('Creating notebook with data:', data);
    console.log('Current user:', userId);

    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .insert({
          title: data.title,
          description: data.description,
          color: data.color,
          icon: data.icon,
          user_id: userId,
          generation_status: 'pending' as NotebookGenerationStatus,
        })
        .select()
        .single()
    );

    console.log('Notebook created successfully:', notebook);
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
  updates: NotebookUpdateInput
): Promise<Notebook> => {
  try {
    console.log('Updating notebook:', id, updates);
    
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    console.log('Notebook updated successfully:', notebook);
    return notebook;
  } catch (error) {
    console.error('Error updating notebook:', error);
    handleApiError(error);
  }
};

/**
 * 노트북 삭제 (파일 정리 포함)
 */
export const deleteNotebook = async (id: string): Promise<Notebook> => {
  try {
    console.log('Starting notebook deletion process for:', id);
    
    // 노트북 정보 조회
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .select('id, title')
        .eq('id', id)
        .single()
    );

    console.log('Found notebook to delete:', notebook.title);

    // 노트북과 연결된 소스들 조회
    const sources = await safeApiCall(async () =>
      supabase
        .from('sources')
        .select('id, title, file_path, type')
        .eq('notebook_id', id)
    );

    console.log(`Found ${sources?.length || 0} sources to clean up`);

    // 파일 경로가 있는 소스들의 파일을 스토리지에서 삭제
    const filesToDelete = sources?.filter(source => source.file_path)
      .map(source => source.file_path) || [];
    
    if (filesToDelete.length > 0) {
      console.log('Deleting files from storage:', filesToDelete);
      
      try {
        await safeApiCall(async () =>
          supabase.storage
            .from('sources')
            .remove(filesToDelete)
        );
        console.log('All files deleted successfully from storage');
      } catch (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // 스토리지 삭제 실패해도 노트북 삭제는 계속 진행
      }
    } else {
      console.log('No files to delete from storage');
    }

    // 노트북 삭제 (cascade로 소스들도 함께 삭제됨)
    await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .delete()
        .eq('id', id)
    );
    
    console.log('Notebook deleted successfully with cascade deletion');
    return notebook;
  } catch (error) {
    console.error('Error in deletion process:', error);
    handleApiError(error);
  }
};

/**
 * 노트북 생성 상태 업데이트
 */
export const updateNotebookStatus = async (
  id: string, 
  status: NotebookGenerationStatus
): Promise<Notebook> => {
  try {
    console.log('Updating notebook status:', id, 'to:', status);
    
    const notebook = await safeApiCall(async () =>
      supabase
        .from('notebooks')
        .update({ generation_status: status })
        .eq('id', id)
        .select()
        .single()
    );

    console.log('Notebook status updated successfully:', notebook);
    return notebook;
  } catch (error) {
    console.error('Error updating notebook status:', error);
    handleApiError(error);
  }
};