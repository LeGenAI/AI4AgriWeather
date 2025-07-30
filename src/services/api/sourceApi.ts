/**
 * Source API 서비스
 * 소스(출처) 관련 CRUD 작업을 위한 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import type { Database } from '@/integrations/supabase/types';

type Source = Database['public']['Tables']['sources']['Row'];
type SourceInsert = Database['public']['Tables']['sources']['Insert'];
type SourceUpdate = Database['public']['Tables']['sources']['Update'];

/**
 * 노트북의 소스 목록 조회
 */
export const getSources = async (notebookId: string): Promise<Source[]> => {
  try {
    const sources = await safeApiCall(async () =>
      supabase
        .from('sources')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false })
    );

    return sources || [];
  } catch (error) {
    console.error('Error fetching sources:', error);
    handleApiError(error);
  }
};

/**
 * 특정 소스 조회
 */
export const getSource = async (id: string): Promise<Source> => {
  try {
    const source = await safeApiCall(async () =>
      supabase
        .from('sources')
        .select('*')
        .eq('id', id)
        .single()
    );

    return source;
  } catch (error) {
    console.error('Error fetching source:', error);
    handleApiError(error);
  }
};

/**
 * 소스 생성
 */
export const createSource = async (data: SourceInsert): Promise<Source> => {
  try {
    const source = await safeApiCall(async () =>
      supabase
        .from('sources')
        .insert(data)
        .select()
        .single()
    );

    return source;
  } catch (error) {
    console.error('Error creating source:', error);
    handleApiError(error);
  }
};

/**
 * 소스 업데이트
 */
export const updateSource = async (
  id: string,
  updates: SourceUpdate
): Promise<Source> => {
  try {
    const source = await safeApiCall(async () =>
      supabase
        .from('sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    return source;
  } catch (error) {
    console.error('Error updating source:', error);
    handleApiError(error);
  }
};

/**
 * 소스 삭제
 */
export const deleteSource = async (id: string): Promise<void> => {
  try {
    // 파일 경로가 있다면 스토리지에서도 삭제
    const source = await getSource(id);
    
    if (source.file_path) {
      try {
        await safeApiCall(async () =>
          supabase.storage
            .from('sources')
            .remove([source.file_path!])
        );
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // 스토리지 삭제 실패해도 계속 진행
      }
    }

    await safeApiCall(async () =>
      supabase
        .from('sources')
        .delete()
        .eq('id', id)
    );
  } catch (error) {
    console.error('Error deleting source:', error);
    handleApiError(error);
  }
};

/**
 * 여러 소스 일괄 삭제
 */
export const deleteSources = async (ids: string[]): Promise<void> => {
  try {
    // 파일 경로들 조회
    const sources = await safeApiCall(async () =>
      supabase
        .from('sources')
        .select('file_path')
        .in('id', ids)
    );

    // 파일 경로가 있는 소스들의 파일을 스토리지에서 삭제
    const filePaths = sources?.filter(s => s.file_path).map(s => s.file_path!) || [];
    
    if (filePaths.length > 0) {
      try {
        await safeApiCall(async () =>
          supabase.storage
            .from('sources')
            .remove(filePaths)
        );
      } catch (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // 스토리지 삭제 실패해도 계속 진행
      }
    }

    await safeApiCall(async () =>
      supabase
        .from('sources')
        .delete()
        .in('id', ids)
    );
  } catch (error) {
    console.error('Error deleting sources:', error);
    handleApiError(error);
  }
};