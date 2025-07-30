# 챗 시스템 수정 계획

## 현재 문제점 분석

### 1. 메시지 포맷 불일치
- **n8n 워크플로우**: AI 응답을 JSON 문자열로 중첩 저장
- **프론트엔드**: 중첩된 JSON을 파싱하려고 시도하지만 불안정함
- **Edge Function**: 사용자 메시지만 저장하고 AI 응답은 n8n이 처리

### 2. 타입 시스템 불일치
- `msg.role` vs `msg.message.type` 혼용
- `msg.created_at` 속성 누락
- 메시지 구조가 일관되지 않음

### 3. 에러 처리 미흡
- n8n 웹훅 실패 시 사용자에게 피드백 없음
- Realtime 연결 실패 시 재연결 로직 불완전

## 수정 방안

### 1. 즉시 수정 가능한 부분

#### A. n8n 워크플로우 수정
- Supabase 노드의 메시지 저장 형식 수정
- JSON 문자열 중첩 제거
- 정확한 메시지 구조로 저장

#### B. 프론트엔드 메시지 파싱 개선
- 안전한 JSON 파싱 함수 구현
- 다양한 메시지 형식 지원
- 타입 안정성 강화

### 2. 단계별 구현 계획

#### Phase 1: 긴급 수정 (즉시)
1. ✅ AgricultureChatArea.tsx 문법 오류 수정
2. Edge Function 개선 (사용자 메시지 저장)
3. useChatMessages 훅의 메시지 변환 로직 개선

#### Phase 2: n8n 워크플로우 개선 (다음)
1. 메시지 저장 형식 표준화
2. 에러 처리 노드 추가
3. 벡터 검색 통합 강화

#### Phase 3: 시스템 통합 (마지막)
1. 지식 베이스와 챗 연동
2. 실시간 상태 관리 개선
3. 에러 복구 메커니즘 구현

## 구현 상세

### 1. 메시지 구조 표준화

```typescript
interface StandardMessage {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string | {
      segments: MessageSegment[];
      citations: Citation[];
    };
    timestamp: string;
    metadata?: any;
  };
}
```

### 2. n8n 워크플로우 수정 사항

현재:
```json
"fieldValue": "{\"type\": \"ai\", \"content\": \"{\\\"output\\\":[...]}\", ...}"
```

수정 후:
```json
"fieldValue": {
  "type": "ai",
  "content": {
    "segments": "={{ $json.output.map(o => ({text: o.text})) }}",
    "citations": "={{ $json.output.flatMap(o => o.citations || []) }}"
  },
  "timestamp": "={{ new Date().toISOString() }}",
  "metadata": {
    "model": "{{ $('AI Agent').params.model }}",
    "processingTime": "={{ Date.now() - $('Webhook').item.timestamp }}"
  }
}
```

### 3. 프론트엔드 수정 사항

#### A. 메시지 타입 정의 통합
```typescript
// src/types/message.ts
export interface ChatMessage {
  id: number;
  session_id: string;
  created_at?: string; // Optional for backward compatibility
  message: {
    type: 'human' | 'ai';
    content: string | StructuredContent;
    timestamp?: string;
    metadata?: Record<string, any>;
  };
}
```

#### B. 안전한 파싱 함수
```typescript
const parseMessageContent = (content: any): string | StructuredContent => {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed.output && Array.isArray(parsed.output)) {
        return transformToStructuredContent(parsed);
      }
      return content;
    } catch {
      return content;
    }
  }
  return content;
};
```

## 테스트 계획

1. **단위 테스트**
   - 메시지 파싱 함수
   - 타입 변환 로직
   - 에러 처리

2. **통합 테스트**
   - 사용자 메시지 전송
   - AI 응답 수신
   - 실시간 업데이트

3. **E2E 테스트**
   - 전체 대화 플로우
   - 에러 시나리오
   - 지식 베이스 연동

## 모니터링

1. **로깅 추가**
   - Edge Function 요청/응답
   - n8n 웹훅 상태
   - 메시지 파싱 실패

2. **메트릭 수집**
   - 응답 시간
   - 에러율
   - 메시지 변환 성공률

## 롤백 계획

변경사항이 문제를 일으킬 경우:
1. Edge Function 이전 버전으로 롤백
2. n8n 워크플로우 백업 복원
3. 프론트엔드 이전 커밋으로 되돌리기