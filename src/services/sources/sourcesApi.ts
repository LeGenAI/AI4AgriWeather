/**
 * Sources API 서비스
 * 소스 CRUD 작업을 담당
 */

import { supabase, safeApiCall } from '../core/apiClient';
import { deleteFile } from '../core/storage';
import {
  Source,
  SourceInsert,
  SourceUpdate,
  SourceCreateInput,
  SourceUpdateInput,
  SourceQueryOptions,
  SourcesApiResponse,
  SourceApiResponse,
  ProcessingStatus,
  SourceType,
} from './types';

/**
 * 노트북별 소스 목록 조회
 */
export const getSources = async (
  notebookId: string,
  options?: SourceQueryOptions
): Promise<Source[]> => {
  return await safeApiCall(async () => {
    let query = supabase
      .from('sources')
      .select('*')
      .eq('notebook_id', notebookId);

    // 필터 적용
    if (options?.filter) {
      const { filter } = options;
      
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        query = query.in('type', types);
      }
      
      if (filter.processingStatus) {
        const statuses = Array.isArray(filter.processingStatus) 
          ? filter.processingStatus 
          : [filter.processingStatus];
        query = query.in('processing_status', statuses);
      }
      
      if (filter.hasContent !== undefined) {
        if (filter.hasContent) {
          query = query.not('content', 'is', null);
        } else {
          query = query.is('content', null);
        }
      }
      
      if (filter.hasFile !== undefined) {
        if (filter.hasFile) {
          query = query.not('file_path', 'is', null);
        } else {
          query = query.is('file_path', null);
        }
      }
      
      if (filter.createdAfter) {
        query = query.gte('created_at', filter.createdAfter.toISOString());
      }
      
      if (filter.createdBefore) {
        query = query.lte('created_at', filter.createdBefore.toISOString());
      }
      
      if (filter.searchQuery) {
        query = query.or(
          `title.ilike.%${filter.searchQuery}%,content.ilike.%${filter.searchQuery}%`
        );
      }
    }

    // 정렬 적용
    if (options?.sort) {
      const { field, ascending = false } = options.sort;
      query = query.order(field, { ascending });
    } else {
      // 기본 정렬: 최신순
      query = query.order('created_at', { ascending: false });
    }

    // 페이지네이션
    if (options?.limit) {
      query = query.limit(options.limit);
      if (options.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  });
};

/**
 * 개별 소스 조회
 */
export const getSource = async (sourceId: string): Promise<Source> => {
  return await safeApiCall(async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .single();
      
    if (error) throw error;
    return data;
  });
};

/**
 * 소스 생성
 */
export const createSource = async (input: SourceCreateInput): Promise<Source> => {
  const insertData: SourceInsert = {
    notebook_id: input.notebookId,
    title: input.title,
    type: input.type,
    content: input.content || null,
    url: input.url || null,
    processing_status: input.processingStatus || 'pending',
    metadata: input.metadata || {},
    display_name: input.displayName || null,
    file_size: input.file_size || null,
  };

  const { data, error } = await supabase
    .from('sources')
    .insert([insertData])  // 배열로 전달
    .select()
    .single();
  
  console.log('Source creation response:', { 
    data, 
    error, 
    insertData,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : null 
  });
  
  if (error) {
    console.error('Error creating source:', error);
    throw error;
  }
  
  if (!data) {
    console.error('No data returned from source creation');
    
    // fallback: 직접 조회해보기
    const { data: fetchedData } = await supabase
      .from('sources')
      .select('*')
      .eq('notebook_id', input.notebookId)
      .eq('title', input.title)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (fetchedData) {
      console.log('Found source by direct query:', fetchedData);
      return fetchedData;
    }
    
    throw new Error('Failed to create source - no data returned');
  }
  
  return data;
};

/**
 * 소스 업데이트
 */
export const updateSource = async (
  sourceId: string, 
  updates: SourceUpdateInput
): Promise<Source> => {
  const updateData: SourceUpdate = {};
  
  // 업데이트할 필드만 포함
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.filePath !== undefined) updateData.file_path = updates.filePath;
  if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
  if (updates.processingStatus !== undefined) updateData.processing_status = updates.processingStatus;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
  if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
  if (updates.summary !== undefined) updateData.summary = updates.summary;

  const { data, error } = await supabase
    .from('sources')
    .update(updateData)
    .eq('id', sourceId)
    .select()
    .maybeSingle(); // single() 대신 maybeSingle() 사용
    
  if (error) {
    console.error('Error updating source:', error);
    throw error;
  }
  
  if (!data) {
    console.warn('Source not found for update:', sourceId);
    // 업데이트된 소스를 찾을 수 없는 경우, 다시 조회
    const { data: fetchedData } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .maybeSingle();
      
    if (fetchedData) {
      return fetchedData;
    }
    
    throw new Error(`Source not found: ${sourceId}`);
  }
  
  return data;
};

/**
 * 소스 삭제 (스토리지 파일 포함)
 */
export const deleteSource = async (sourceId: string): Promise<void> => {
  return await safeApiCall(async () => {
    // 먼저 소스 정보 조회
    const source = await getSource(sourceId);
    
    // 스토리지 파일 삭제 (있는 경우)
    if (source.file_path) {
      try {
        await deleteFile('sources', source.file_path);
        console.log(`✅ File deleted from storage: ${source.file_path}`);
      } catch (error) {
        console.warn(`⚠️  Failed to delete file from storage: ${source.file_path}`, error);
        // 파일 삭제 실패해도 계속 진행 (파일이 이미 없을 수 있음)
      }
    }
    
    // 데이터베이스에서 소스 삭제
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId);
      
    if (error) throw error;
    
    console.log(`✅ Source deleted successfully: ${sourceId}`);
  });
};

/**
 * 소스 처리 상태 업데이트
 */
export const updateSourceStatus = async (
  sourceId: string, 
  status: ProcessingStatus,
  metadata?: Record<string, any>
): Promise<Source> => {
  return await safeApiCall(async () => {
    const updateData: SourceUpdate = {
      processing_status: status,
    };
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    const { data, error } = await supabase
      .from('sources')
      .update(updateData)
      .eq('id', sourceId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  });
};

/**
 * 노트북의 첫 번째 소스인지 확인
 */
export const isFirstSource = async (notebookId: string): Promise<boolean> => {
  return await safeApiCall(async () => {
    const { count, error } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .eq('notebook_id', notebookId);
      
    if (error) throw error;
    return (count || 0) === 0;
  });
};

/**
 * 처리 완료된 소스 개수 조회
 */
export const getCompletedSourcesCount = async (notebookId: string): Promise<number> => {
  return await safeApiCall(async () => {
    const { count, error } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .eq('notebook_id', notebookId)
      .eq('processing_status', 'completed');
      
    if (error) throw error;
    return count || 0;
  });
};

/**
 * 처리 대기중인 소스들 조회
 */
export const getPendingSources = async (notebookId?: string): Promise<Source[]> => {
  return await safeApiCall(async () => {
    let query = supabase
      .from('sources')
      .select('*')
      .in('processing_status', ['pending', 'processing'])
      .order('created_at', { ascending: true });

    if (notebookId) {
      query = query.eq('notebook_id', notebookId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  });
};

/**
 * 소스 타입별 개수 조회
 */
export const getSourcesCountByType = async (notebookId: string): Promise<Record<SourceType, number>> => {
  return await safeApiCall(async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('type')
      .eq('notebook_id', notebookId);
      
    if (error) throw error;
    
    const counts: Record<SourceType, number> = {
      pdf: 0,
      text: 0,
      website: 0,
      youtube: 0,
      audio: 0,
    };
    
    data?.forEach((source) => {
      counts[source.type as SourceType]++;
    });
    
    return counts;
  });
};

/**
 * 파일 크기 기준 가장 큰 소스들 조회
 */
export const getLargestSources = async (
  notebookId: string, 
  limit = 5
): Promise<Source[]> => {
  return await safeApiCall(async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('notebook_id', notebookId)
      .not('file_size', 'is', null)
      .order('file_size', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  });
};

/**
 * 최근 생성된 소스들 조회
 */
export const getRecentSources = async (
  notebookId: string,
  days = 7,
  limit = 10
): Promise<Source[]> => {
  return await safeApiCall(async () => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('notebook_id', notebookId)
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  });
};

/**
 * 소스 제목 중복 체크
 */
export const checkTitleExists = async (
  notebookId: string, 
  title: string,
  excludeId?: string
): Promise<boolean> => {
  return await safeApiCall(async () => {
    let query = supabase
      .from('sources')
      .select('id')
      .eq('notebook_id', notebookId)
      .eq('title', title);
      
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data?.length || 0) > 0;
  });
};

/**
 * 벌크 소스 상태 업데이트
 */
export const bulkUpdateSourceStatus = async (
  sourceIds: string[], 
  status: ProcessingStatus
): Promise<Source[]> => {
  return await safeApiCall(async () => {
    const { data, error } = await supabase
      .from('sources')
      .update({ processing_status: status })
      .in('id', sourceIds)
      .select();
      
    if (error) throw error;
    return data || [];
  });
};

/**
 * 실시간 소스 변경 사항 구독
 */
export const subscribeToNotebookSources = (
  notebookId: string,
  callbacks: {
    onInsert?: (source: Source) => void;
    onUpdate?: (source: Source) => void;
    onDelete?: (payload: { old_record: Source }) => void;
  }
) => {
  console.log('🔄 Setting up realtime subscription for notebook sources:', notebookId);

  const subscription = supabase
    .channel(`sources_${notebookId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sources',
        filter: `notebook_id=eq.${notebookId}`
      },
      (payload) => {
        console.log('📥 Realtime INSERT received:', payload);
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as Source);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sources',
        filter: `notebook_id=eq.${notebookId}`
      },
      (payload) => {
        console.log('🔄 Realtime UPDATE received:', payload);
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Source);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'sources',
        filter: `notebook_id=eq.${notebookId}`
      },
      (payload) => {
        console.log('🗑️ Realtime DELETE received:', payload);
        if (callbacks.onDelete) {
          callbacks.onDelete({ old_record: payload.old as Source });
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status for sources:', status);
    });

  return subscription;
};