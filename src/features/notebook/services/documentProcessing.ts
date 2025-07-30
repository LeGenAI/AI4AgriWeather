/**
 * 문서 처리 서비스
 * 문서 처리 트리거, 상태 확인, 재시도 등을 담당
 */

import { supabase } from '@/shared/services/core/apiClient';
import { getSource, updateSourceStatus } from './sourcesApi';
import {
  Source,
  DocumentProcessingStatus,
  ProcessingStatus,
  SourceType,
} from './types';

// 처리 상태 체크 간격 (밀리초)
const POLLING_INTERVALS = {
  default: 2000,  // 2초
  fast: 1000,     // 1초
  slow: 5000,     // 5초
} as const;

// 최대 대기 시간 (밀리초)
const MAX_PROCESSING_TIME = {
  pdf: 5 * 60 * 1000,     // 5분
  text: 30 * 1000,        // 30초
  website: 2 * 60 * 1000, // 2분
  youtube: 3 * 60 * 1000, // 3분
  audio: 10 * 60 * 1000,  // 10분
} as const;

// 활성 처리 모니터링을 위한 맵
const activeProcessing = new Map<string, NodeJS.Timeout>();

/**
 * 문서 처리 트리거
 */
export const triggerDocumentProcessing = async (sourceId: string): Promise<void> => {
  const source = await getSource(sourceId);
  
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  // 이미 처리 중이거나 완료된 경우
  if (source.processing_status === 'processing' || source.processing_status === 'completed') {
    console.log(`Source ${sourceId} is already ${source.processing_status}`);
    return;
  }

  // 처리 시작
  await updateSourceStatus(sourceId, 'processing', {
    processingStartTime: new Date().toISOString(),
  });

  // 처리 모니터링 시작
  startProcessingMonitoring(sourceId, source.type);

  // Edge Function 호출 (실제 문서 처리)
  await callDocumentProcessingFunction(source);
};

/**
 * 처리 상태 확인
 */
export const checkProcessingStatus = async (sourceId: string): Promise<DocumentProcessingStatus> => {
  const source = await getSource(sourceId);
  
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  const metadata = source.metadata as Record<string, any> || {};
  const startTime = metadata.processingStartTime ? new Date(metadata.processingStartTime) : new Date();
  const now = new Date();
  const elapsed = now.getTime() - startTime.getTime();

  // 진행률 추정 (타입별로 다르게 계산)
  const estimatedDuration = MAX_PROCESSING_TIME[source.type] || MAX_PROCESSING_TIME.text;
  const estimatedProgress = Math.min(Math.round((elapsed / estimatedDuration) * 100), 95);

  // 남은 시간 추정
  const estimatedTimeRemaining = source.processing_status === 'processing' 
    ? Math.max(0, Math.round((estimatedDuration - elapsed) / 1000))
    : 0;

  return {
    sourceId,
    status: source.processing_status as ProcessingStatus || 'pending',
    progress: source.processing_status === 'completed' ? 100 : estimatedProgress,
    message: getProcessingMessage(source.processing_status as ProcessingStatus, source.type),
    error: metadata.processingError || undefined,
    estimatedTimeRemaining,
    lastUpdated: new Date(source.updated_at),
  };
};

/**
 * 처리 재시도
 */
export const retryProcessing = async (sourceId: string): Promise<void> => {
  const source = await getSource(sourceId);
  
  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  // 재시도 카운트 증가
  const metadata = source.metadata as Record<string, any> || {};
  const retryCount = (metadata.retryCount || 0) + 1;

  if (retryCount > 3) {
    throw new Error('최대 재시도 횟수를 초과했습니다.');
  }

  // 상태 초기화 및 재시도 정보 업데이트
  await updateSourceStatus(sourceId, 'pending', {
    ...metadata,
    retryCount,
    lastRetryTime: new Date().toISOString(),
    processingError: null,
  });

  // 잠시 대기 후 처리 트리거
  setTimeout(() => {
    triggerDocumentProcessing(sourceId).catch(console.error);
  }, 1000);
};

/**
 * 처리 취소
 */
export const cancelProcessing = async (sourceId: string): Promise<void> => {
  // 활성 모니터링 중지
  const timeout = activeProcessing.get(sourceId);
  if (timeout) {
    clearTimeout(timeout);
    activeProcessing.delete(sourceId);
  }

  // 상태 업데이트
  await updateSourceStatus(sourceId, 'cancelled', {
    cancelledAt: new Date().toISOString(),
  });
};

/**
 * 대기 중인 모든 소스 처리 시작
 */
export const processPendingSources = async (notebookId?: string): Promise<void> => {
  let query = supabase
    .from('sources')
    .select('*')
    .eq('processing_status', 'pending')
    .order('created_at', { ascending: true });

  if (notebookId) {
    query = query.eq('notebook_id', notebookId);
  }

  const { data: pendingSources, error } = await query;
  
  if (error) throw error;

  // 순차적으로 처리 (동시 처리로 인한 부하 방지)
  for (const source of pendingSources || []) {
    try {
      await triggerDocumentProcessing(source.id);
      
      // 다음 처리 전 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to process source ${source.id}:`, error);
      
      // 에러 발생해도 다른 소스는 계속 처리
      await updateSourceStatus(source.id, 'failed', {
        processingError: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
};

/**
 * 처리 통계 조회
 */
export const getProcessingStats = async (notebookId?: string) => {
  let query = supabase
    .from('sources')
    .select('processing_status');

  if (notebookId) {
    query = query.eq('notebook_id', notebookId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  data?.forEach((source) => {
    stats.total++;
    const status = source.processing_status as ProcessingStatus || 'pending';
    stats[status]++;
  });

  return stats;
};

// 내부 헬퍼 함수들

/**
 * 문서 처리 Edge Function 호출
 */
const callDocumentProcessingFunction = async (source: Source): Promise<void> => {
  try {
    // 실제 구현에서는 Edge Function을 호출
    // 현재는 시뮬레이션을 위한 타임아웃 사용
    const processingTime = getProcessingTime(source.type);
    
    setTimeout(async () => {
      try {
        // 처리 완료 시뮬레이션
        await updateSourceStatus(source.id, 'completed', {
          processingCompletedAt: new Date().toISOString(),
          processingDuration: processingTime,
        });
        
        // 활성 처리에서 제거
        activeProcessing.delete(source.id);
      } catch (error) {
        console.error(`Failed to complete processing for source ${source.id}:`, error);
        await updateSourceStatus(source.id, 'failed', {
          processingError: error instanceof Error ? error.message : 'Processing failed',
        });
        
        activeProcessing.delete(source.id);
      }
    }, processingTime);

  } catch (error) {
    console.error('Failed to trigger document processing:', error);
    await updateSourceStatus(source.id, 'failed', {
      processingError: error instanceof Error ? error.message : 'Failed to start processing',
    });
  }
};

/**
 * 처리 모니터링 시작
 */
const startProcessingMonitoring = (sourceId: string, sourceType: SourceType): void => {
  // 기존 모니터링이 있으면 중지
  const existingTimeout = activeProcessing.get(sourceId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  const maxTime = MAX_PROCESSING_TIME[sourceType];
  const interval = POLLING_INTERVALS.default;

  // 최대 대기 시간 후 타임아웃 처리
  const timeoutId = setTimeout(async () => {
    try {
      const source = await getSource(sourceId);
      
      // 아직 처리 중이면 타임아웃으로 처리
      if (source.processing_status === 'processing') {
        await updateSourceStatus(sourceId, 'failed', {
          processingError: 'Processing timeout',
          processingTimeout: true,
        });
      }
    } catch (error) {
      console.error(`Failed to handle timeout for source ${sourceId}:`, error);
    } finally {
      activeProcessing.delete(sourceId);
    }
  }, maxTime);

  activeProcessing.set(sourceId, timeoutId);
};

/**
 * 소스 타입별 처리 시간 반환 (시뮬레이션용)
 */
const getProcessingTime = (sourceType: SourceType): number => {
  const baseTimes = {
    pdf: 15000,     // 15초
    text: 3000,     // 3초
    website: 8000,  // 8초
    youtube: 12000, // 12초
    audio: 25000,   // 25초
  };

  const baseTime = baseTimes[sourceType] || baseTimes.text;
  
  // 약간의 랜덤성 추가 (±20%)
  const variation = baseTime * 0.2;
  return baseTime + (Math.random() - 0.5) * variation;
};

/**
 * 처리 상태별 메시지 반환
 */
const getProcessingMessage = (status: ProcessingStatus, sourceType: SourceType): string => {
  const typeNames = {
    pdf: 'PDF 문서',
    text: '텍스트',
    website: '웹페이지',
    youtube: 'YouTube 동영상',
    audio: '오디오 파일',
  };

  const typeName = typeNames[sourceType] || '문서';

  switch (status) {
    case 'pending':
      return `${typeName} 처리 대기 중입니다.`;
    case 'processing':
      return `${typeName}를 분석하고 있습니다.`;
    case 'completed':
      return `${typeName} 처리가 완료되었습니다.`;
    case 'failed':
      return `${typeName} 처리 중 오류가 발생했습니다.`;
    case 'cancelled':
      return `${typeName} 처리가 취소되었습니다.`;
    default:
      return '처리 상태를 확인할 수 없습니다.';
  }
};

/**
 * 모든 활성 처리 중지
 */
export const stopAllProcessing = (): void => {
  activeProcessing.forEach((timeout) => {
    clearTimeout(timeout);
  });
  activeProcessing.clear();
};

/**
 * 활성 처리 목록 조회
 */
export const getActiveProcessing = (): string[] => {
  return Array.from(activeProcessing.keys());
};

/**
 * 처리 상태 실시간 구독
 */
export const subscribeToProcessingUpdates = (
  notebookId: string,
  callback: (sourceId: string, status: DocumentProcessingStatus) => void
) => {
  const channel = supabase
    .channel('processing-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sources',
        filter: `notebook_id=eq.${notebookId}`,
      },
      async (payload: any) => {
        const updatedSource = payload.new as Source;
        if (updatedSource.processing_status) {
          const status = await checkProcessingStatus(updatedSource.id);
          callback(updatedSource.id, status);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};