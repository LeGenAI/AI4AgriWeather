import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/authentication/hooks';
import { useNotebookGeneration } from './useNotebookGeneration';
import { useEffect, useMemo } from 'react';
import {
  getSources,
  createSource,
  updateSource as updateSourceService,
  updateSourceStatus,
  isFirstSource,
  Source,
  SourceCreateInput,
  SourceUpdateInput,
  SourceQueryOptions,
  ProcessingStatus,
} from '../services';
import { subscribeToNotebookSources } from '@/shared/services/core/realtime';

export const useSources = (notebookId?: string, options?: SourceQueryOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { generateNotebookContentAsync } = useNotebookGeneration();

  // Sources 데이터 조회
  const {
    data: sources = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sources', notebookId, options],
    queryFn: async () => {
      if (!notebookId) return [];
      
      console.log('📊 Fetching sources for notebook:', notebookId);
      const data = await getSources(notebookId, options);
      console.log('✅ Sources fetched successfully:', data.length, 'sources');
      
      return data;
    },
    enabled: !!notebookId,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 실시간 구독 설정
  useEffect(() => {
    if (!notebookId || !user) return;

    console.log('🔄 Setting up realtime subscription for sources, notebook:', notebookId);

    const subscription = subscribeToNotebookSources(notebookId, {
      onInsert: (newSource: Source) => {
        console.log('📥 Realtime INSERT:', newSource);
        queryClient.setQueryData(['sources', notebookId], (oldSources: Source[] = []) => {
          const exists = oldSources.some(source => source.id === newSource.id);
          if (exists) {
            console.log('Source already exists, skipping INSERT:', newSource.id);
            return oldSources;
          }
          return [newSource, ...oldSources];
        });
      },
      onUpdate: (updatedSource: Source) => {
        console.log('🔄 Realtime UPDATE:', updatedSource);
        queryClient.setQueryData(['sources', notebookId], (oldSources: Source[] = []) => {
          return oldSources.map(source => 
            source.id === updatedSource.id ? updatedSource : source
          );
        });
      },
      onDelete: ({ old_record: deletedSource }) => {
        console.log('🗑️ Realtime DELETE:', deletedSource);
        queryClient.setQueryData(['sources', notebookId], (oldSources: Source[] = []) => {
          return oldSources.filter(source => source.id !== deletedSource.id);
        });
      },
    });

    return () => {
      console.log('🧹 Cleaning up realtime subscription for sources');
      subscription.unsubscribe();
    };
  }, [notebookId, user, queryClient]);

  // 소스 추가 Mutation
  const addSource = useMutation({
    mutationFn: async (sourceData: SourceCreateInput) => {
      if (!user) throw new Error('User not authenticated');

      console.log('➕ Adding new source:', sourceData.title, 'type:', sourceData.type);
      const newSource = await createSource(sourceData);
      
      console.log('✅ Source created successfully:', newSource.id);
      return newSource;
    },
    onSuccess: async (newSource) => {
      console.log('🎉 Source added successfully:', newSource);
      
      // 첫 번째 소스인 경우 노트북 생성 트리거 확인
      if (notebookId) {
        const isFirst = await isFirstSource(notebookId);
        
        if (isFirst) {
          console.log('📝 This is the first source, checking notebook generation...');
          
          // 노트북 생성 상태 확인 및 트리거
          const canGenerate = 
            (newSource.type === 'pdf' && newSource.file_path) ||
            (newSource.type === 'text' && newSource.content) ||
            (newSource.type === 'website' && newSource.url) ||
            (newSource.type === 'youtube' && newSource.url) ||
            (newSource.type === 'audio' && newSource.file_path);
          
          if (canGenerate) {
            try {
              await generateNotebookContentAsync({
                notebookId,
                filePath: newSource.file_path || newSource.url,
                sourceType: newSource.type
              });
            } catch (error) {
              console.error('Failed to generate notebook content:', error);
            }
          }
        }
      }
    },
  });

  // 소스 업데이트 Mutation
  const updateSource = useMutation({
    mutationFn: async ({ sourceId, updates }: { 
      sourceId: string; 
      updates: SourceUpdateInput 
    }) => {
      console.log('🔄 Updating source:', sourceId, 'updates:', updates);
      return await updateSourceService(sourceId, updates);
    },
    onSuccess: async (updatedSource) => {
      console.log('✅ Source updated successfully:', updatedSource.id);
      
      // 파일 경로가 추가되고 첫 번째 소스인 경우 생성 트리거
      if (updatedSource.file_path && notebookId) {
        const currentSources = queryClient.getQueryData(['sources', notebookId]) as Source[] || [];
        const isFirst = currentSources.length === 1;
        
        if (isFirst) {
          try {
            await generateNotebookContentAsync({
              notebookId,
              filePath: updatedSource.file_path,
              sourceType: updatedSource.type
            });
          } catch (error) {
            console.error('Failed to generate notebook content:', error);
          }
        }
      }
    },
  });

  // 소스 완료 표시 Mutation
  const markSourceCompleted = useMutation({
    mutationFn: async (sourceId: string) => {
      return await updateSourceStatus(sourceId, 'completed');
    },
    onSuccess: (data) => {
      console.log('✅ Source marked as completed:', data.id);
    },
  });

  // 편의 함수들
  const sourcesByType = useMemo(() => {
    const grouped: Record<string, Source[]> = {};
    sources.forEach(source => {
      if (!grouped[source.type]) {
        grouped[source.type] = [];
      }
      grouped[source.type].push(source);
    });
    return grouped;
  }, [sources]);

  const sourcesByStatus = useMemo(() => {
    const grouped: Record<ProcessingStatus, Source[]> = {
      pending: [],
      processing: [],
      completed: [],
      failed: [],
      cancelled: [],
    };
    sources.forEach(source => {
      const status = source.processing_status as ProcessingStatus || 'pending';
      grouped[status].push(source);
    });
    return grouped;
  }, [sources]);

  const sourceStats = useMemo(() => {
    return {
      total: sources.length,
      completed: sourcesByStatus.completed.length,
      pending: sourcesByStatus.pending.length,
      processing: sourcesByStatus.processing.length,
      failed: sourcesByStatus.failed.length,
      totalFileSize: sources.reduce((sum, source) => sum + (source.file_size || 0), 0),
    };
  }, [sources, sourcesByStatus]);

  return {
    // 데이터
    sources,
    sourcesByType,
    sourcesByStatus,
    sourceStats,
    
    // 상태
    isLoading,
    error,
    
    // 액션
    addSource: addSource.mutate,
    addSourceAsync: addSource.mutateAsync,
    isAdding: addSource.isPending,
    
    updateSource: updateSource.mutate,
    updateSourceAsync: updateSource.mutateAsync,
    isUpdating: updateSource.isPending,
    
    markSourceCompleted: markSourceCompleted.mutate,
    markSourceCompletedAsync: markSourceCompleted.mutateAsync,
    
    // 유틸리티
    refetch: () => queryClient.invalidateQueries({ queryKey: ['sources', notebookId] }),
  };
};