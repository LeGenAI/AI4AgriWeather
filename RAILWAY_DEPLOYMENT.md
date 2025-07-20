# Railway 배포 가이드

이 문서는 AI4AgriWeather 애플리케이션을 Railway에 배포하는 방법을 안내합니다.

## 사전 준비사항

1. [Railway 계정](https://railway.app) 생성
2. [Railway CLI](https://docs.railway.app/cli/installation) 설치 (선택사항)
3. Supabase 프로젝트 및 인증 정보

## 배포 방법

### 방법 1: GitHub 연동 배포 (권장)

1. **GitHub 리포지토리 준비**
   ```bash
   git add .
   git commit -m "Railway 배포 준비"
   git push origin main
   ```

2. **Railway에서 프로젝트 생성**
   - [Railway Dashboard](https://railway.app/dashboard)에 로그인
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 해당 리포지토리 선택

3. **환경 변수 설정**
   Railway Dashboard에서 Variables 탭으로 이동 후 다음 환경 변수들을 설정:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```

### 방법 2: Railway CLI 사용

1. **CLI 로그인**
   ```bash
   railway login
   ```

2. **프로젝트 초기화**
   ```bash
   railway init
   ```

3. **환경 변수 설정**
   ```bash
   railway variables set VITE_SUPABASE_URL="your_supabase_url"
   railway variables set VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   railway variables set NODE_ENV="production"
   ```

4. **배포 실행**
   ```bash
   railway up
   ```

## 배포 설정 파일

### `railway.json`
Railway 플랫폼 설정을 정의합니다.

### `nixpacks.toml`
빌드 프로세스와 실행 명령을 설정합니다.

### `package.json`
프로덕션용 시작 스크립트가 포함되어 있습니다:
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 시작

## Supabase 설정

Railway 배포 후 Supabase에서 다음 설정을 업데이트해야 합니다:

1. **Site URL 추가**
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL에 Railway 도메인 추가 (예: `https://your-app.railway.app`)

2. **Redirect URLs 추가**
   - 동일한 위치에서 Redirect URLs에 다음 추가:
     - `https://your-app.railway.app/auth`
     - `https://your-app.railway.app/`

## 빌드 확인

로컬에서 프로덕션 빌드를 테스트:
```bash
npm run build
npm run preview
```

## 도메인 설정 (선택사항)

Railway에서 커스텀 도메인을 설정할 수 있습니다:
1. Railway Dashboard → Settings → Domains
2. "Custom Domain" 추가
3. DNS 설정 업데이트

## 모니터링

Railway Dashboard에서 다음을 모니터링할 수 있습니다:
- 배포 상태
- 로그
- 메트릭스
- 환경 변수

## 문제 해결

### 빌드 실패
1. 로컬에서 `npm run build` 실행하여 오류 확인
2. Railway 로그에서 상세 오류 메시지 확인

### 환경 변수 문제
1. Railway Dashboard에서 환경 변수 확인
2. Supabase URL 및 키 유효성 검증

### 인증 문제
1. Supabase Site URL 및 Redirect URLs 확인
2. Railway 도메인이 Supabase에 등록되어 있는지 확인

## 업데이트

GitHub 연동 배포의 경우 main 브랜치에 푸시하면 자동 배포됩니다:
```bash
git add .
git commit -m "업데이트 내용"
git push origin main
```

## 다국어 지원

현재 애플리케이션은 다음 언어를 지원합니다:
- 한국어 (ko)
- 영어 (en)  
- 스와힐리어 (sw)

사용자의 브라우저 언어 설정에 따라 자동으로 언어가 선택되며, 헤더의 언어 선택기로 수동 변경도 가능합니다.