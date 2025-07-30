/**
 * 실시간 구독 관리 서비스
 * Supabase Realtime 기능을 중앙화
 */

import { supabase } from './apiClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ChangeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeSubscriptionOptions<T = any> {
  table: string;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old_record: T }) => void;
  onChange?: (payload: { eventType: ChangeEventType; new: T; old: T }) => void;
}

export interface RealtimeManager {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * 테이블 변경사항 구독
 */
export const subscribeToTable = <T>(
  channelName: string,
  options: RealtimeSubscriptionOptions<T>
): RealtimeManager => {
  const { table, filter, onInsert, onUpdate, onDelete, onChange } = options;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        // 공통 onChange 콜백 호출
        if (onChange) {
          onChange({ eventType, new: newRecord, old: oldRecord });
        }

        // 이벤트별 개별 콜백 호출
        switch (eventType) {
          case 'INSERT':
            if (onInsert) onInsert(newRecord);
            break;
          case 'UPDATE':
            if (onUpdate) onUpdate(newRecord);
            break;
          case 'DELETE':
            if (onDelete) onDelete({ old_record: oldRecord });
            break;
        }
      }
    )
    .subscribe();

  const unsubscribe = () => {
    supabase.removeChannel(channel);
  };

  return { channel, unsubscribe };
};

/**
 * 사용자별 노트북 변경사항 구독
 */
export const subscribeToUserNotebooks = (
  userId: string,
  callbacks: {
    onInsert?: (notebook: any) => void;
    onUpdate?: (notebook: any) => void;
    onDelete?: (payload: { old_record: any }) => void;
  }
): RealtimeManager => {
  return subscribeToTable(`notebooks-${userId}`, {
    table: 'notebooks',
    filter: `user_id=eq.${userId}`,
    ...callbacks,
  });
};

/**
 * 노트북별 소스 변경사항 구독
 */
export const subscribeToNotebookSources = (
  notebookId: string,
  callbacks: {
    onInsert?: (source: any) => void;
    onUpdate?: (source: any) => void;
    onDelete?: (payload: { old_record: any }) => void;
  }
): RealtimeManager => {
  return subscribeToTable(`sources-${notebookId}`, {
    table: 'sources',
    filter: `notebook_id=eq.${notebookId}`,
    ...callbacks,
  });
};

/**
 * 노트북별 노트 변경사항 구독
 */
export const subscribeToNotebookNotes = (
  notebookId: string,
  callbacks: {
    onInsert?: (note: any) => void;
    onUpdate?: (note: any) => void;
    onDelete?: (payload: { old_record: any }) => void;
  }
): RealtimeManager => {
  return subscribeToTable(`notes-${notebookId}`, {
    table: 'notes',
    filter: `notebook_id=eq.${notebookId}`,
    ...callbacks,
  });
};

/**
 * 채팅 메시지 변경사항 구독
 */
export const subscribeToChatMessages = (
  sessionId: string,
  callbacks: {
    onInsert?: (message: any) => void;
    onUpdate?: (message: any) => void;
    onDelete?: (payload: { old_record: any }) => void;
  }
): RealtimeManager => {
  return subscribeToTable(`chat-${sessionId}`, {
    table: 'n8n_chat_histories',
    filter: `session_id=eq.${sessionId}`,
    ...callbacks,
  });
};

/**
 * 여러 구독을 한번에 관리하는 매니저
 */
export class RealtimeSubscriptionManager {
  private subscriptions: Map<string, RealtimeManager> = new Map();

  /**
   * 구독 추가
   */
  add(key: string, manager: RealtimeManager): void {
    // 기존 구독이 있다면 해제
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key)?.unsubscribe();
    }
    
    this.subscriptions.set(key, manager);
  }

  /**
   * 특정 구독 해제
   */
  remove(key: string): void {
    const manager = this.subscriptions.get(key);
    if (manager) {
      manager.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  /**
   * 모든 구독 해제
   */
  removeAll(): void {
    this.subscriptions.forEach((manager) => {
      manager.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * 구독 상태 확인
   */
  has(key: string): boolean {
    return this.subscriptions.has(key);
  }

  /**
   * 활성 구독 개수
   */
  get size(): number {
    return this.subscriptions.size;
  }
}