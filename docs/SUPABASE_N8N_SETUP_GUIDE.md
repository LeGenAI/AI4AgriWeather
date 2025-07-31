# Supabase & n8n 연동 설정 가이드

## 🚨 현재 문제점

1. **PDF 텍스트 추출 안됨**: `DOCUMENT_PROCESSING_WEBHOOK_URL` 환경 변수가 설정되지 않음
2. **노트북 요약 생성 안됨**: n8n 워크플로우가 연결되지 않음
3. **소스 업데이트 실패**: ID 불일치 문제

## 🔧 필수 설정 사항

### 1. Supabase Edge Functions 환경 변수 설정

Supabase 대시보드에서 다음 환경 변수를 설정해야 합니다:

1. **프로젝트 대시보드 접속**
   - https://supabase.com/dashboard/project/[your-project-id]

2. **Settings → Edge Functions → Secrets 메뉴로 이동**

3. **다음 환경 변수 추가**:

```bash
# n8n Extract Text 워크플로우 웹훅 URL
DOCUMENT_PROCESSING_WEBHOOK_URL=https://your-n8n-domain.com/webhook/YOUR_WEBHOOK_ID

# n8n 인증 헤더 (Bearer 토큰)
NOTEBOOK_GENERATION_AUTH=Bearer YOUR_SECRET_TOKEN

# 추가 웹훅 URL들 (선택사항)
NOTEBOOK_GENERATION_WEBHOOK_URL=https://your-n8n-domain.com/webhook/NOTEBOOK_GEN_ID
PODCAST_GENERATION_WEBHOOK_URL=https://your-n8n-domain.com/webhook/PODCAST_GEN_ID
```

### 2. n8n 워크플로우 설정

1. **n8n 에디터에서 워크플로우 Import**:
   - `/n8n/InsightsLM___Extract_Text.json`
   - `/n8n/InsightsLM___Generate_Notebook_Details.json`
   - `/n8n/InsightsLM___Upsert_to_Vector_Store.json`

2. **각 워크플로우의 Webhook 노드 설정**:
   - Webhook 노드 클릭
   - "Production URL" 복사
   - Authentication: Header Auth 설정
   - Credential 생성 (Name과 Value 설정)

3. **Supabase 연결 설정**:
   - 각 워크플로우의 Supabase 노드에 자격 증명 추가
   - Host: `db.[your-project-id].supabase.co`
   - Database: `postgres`
   - User와 Password는 Supabase 대시보드에서 확인

### 3. 테스트 방법

1. **환경 변수 확인** (Supabase CLI 사용):
```bash
supabase secrets list --project-ref [your-project-id]
```

2. **Edge Function 로그 확인**:
```bash
supabase functions logs process-document --project-ref [your-project-id]
```

3. **수동 테스트**:
```bash
# Edge Function 직접 호출
curl -X POST https://[your-project-id].supabase.co/functions/v1/process-document \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "test-id",
    "filePath": "test.pdf",
    "sourceType": "pdf"
  }'
```

## 📝 체크리스트

- [ ] Supabase Edge Functions에 환경 변수 설정 완료
- [ ] n8n 워크플로우 Import 및 설정 완료
- [ ] Webhook URL들을 환경 변수에 정확히 입력
- [ ] n8n Webhook Authentication 설정 완료
- [ ] Supabase 연결 자격 증명 설정 완료
- [ ] 테스트 파일 업로드 성공
- [ ] PDF 텍스트 추출 확인
- [ ] 벡터 임베딩 생성 확인

## 🔍 디버깅 팁

1. **파일 업로드는 되는데 처리가 안 될 때**:
   - Edge Function 로그 확인
   - 환경 변수 설정 확인
   - n8n 워크플로우 활성화 상태 확인

2. **소스 업데이트 실패 시**:
   - sources 테이블의 실제 ID 확인
   - RLS 정책 확인

3. **n8n 워크플로우 실행 안 될 때**:
   - Webhook URL이 Production URL인지 확인
   - Authentication 헤더 일치 확인
   - n8n 로그 확인

## 🎯 예상 결과

설정이 완료되면:
1. PDF 업로드 시 자동으로 텍스트 추출
2. 추출된 텍스트가 벡터 DB에 저장
3. 노트북 요약이 자동 생성
4. 챗봇이 업로드된 문서 내용을 기반으로 답변

---

**주의**: 모든 URL과 토큰은 실제 값으로 교체해야 합니다!