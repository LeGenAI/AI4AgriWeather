# 헤더 컴포넌트 사용 가이드

## ⚠️ 중요: 헤더 컴포넌트 구조

현재 프로젝트에는 두 개의 헤더 컴포넌트가 존재합니다:

### 1. AppHeader (`/src/components/ui/AppHeader.tsx`)
- **용도**: 전체 앱의 메인 헤더 (네비게이션 포함)
- **특징**:
  - 네비게이션 메뉴 (Dashboard, Weather, Crops, Chat, Knowledge)
  - 언어 선택 기능 (6개 언어)
  - 모바일 반응형 메뉴
  - 뒤로가기 버튼 옵션
  - 페이지별 제목과 부제목 자동 설정
- **사용 위치**: 대부분의 페이지 (Weather, Crops, Chat, Knowledge 등)

### 2. DashboardHeader (`/src/components/dashboard/DashboardHeader.tsx`)
- **용도**: 대시보드 페이지 전용 헤더 (간소화된 버전)
- **특징**:
  - 언어 선택 기능 (6개 언어)
  - 사용자 정보 표시
  - 프로필 설정 메뉴
  - 네비게이션 메뉴 없음
- **사용 위치**: Dashboard 페이지 (`/src/pages/Dashboard.tsx`)

## 🆕 통합 헤더 컴포넌트 (권장)

### UnifiedHeader (`/src/components/layout/UnifiedHeader.tsx`)
- **용도**: 모든 페이지에서 사용 가능한 통합 헤더
- **Props**:
  - `variant`: 'full' (네비게이션 포함) | 'minimal' (네비게이션 없음)
  - `showNavigation`: 네비게이션 메뉴 표시 여부
  - `title`: 커스텀 제목
  - `subtitle`: 커스텀 부제목
  - `showBackButton`: 뒤로가기 버튼 표시
  - `onBackClick`: 뒤로가기 커스텀 핸들러

### 사용 예시:
```typescript
// Dashboard 페이지 (DashboardHeader 대체)
<UnifiedHeader variant="minimal" showNavigation={false} />

// 다른 페이지들 (AppHeader 대체)
<UnifiedHeader variant="full" />

// 커스텀 제목과 뒤로가기 버튼
<UnifiedHeader 
  title="Custom Title" 
  subtitle="Custom Subtitle"
  showBackButton 
  onBackClick={() => navigate('/home')}
/>
```

## 🎯 권장사항

### 즉시 적용 가능:
1. 새로운 페이지는 `UnifiedHeader` 사용
2. 기존 페이지 점진적 마이그레이션
3. 하나의 컴포넌트만 관리하므로 유지보수 용이

### 마이그레이션 계획:
1. **Phase 1**: 새 페이지부터 UnifiedHeader 적용
2. **Phase 2**: AppHeader 사용 페이지를 UnifiedHeader로 변경
3. **Phase 3**: DashboardHeader를 UnifiedHeader로 변경
4. **Phase 4**: 기존 AppHeader, DashboardHeader 제거

## 📝 체크리스트

헤더 관련 변경 시 확인사항:
- [ ] 언어 선택 기능이 필요한가? → 두 헤더 모두 업데이트
- [ ] 네비게이션이 필요한가? → AppHeader 사용
- [ ] 대시보드 페이지인가? → DashboardHeader 사용
- [ ] i18n 키 추가했는가? → 모든 언어 파일 업데이트

## 🚨 주의사항

1. **중복 수정 방지**: 헤더 기능 수정 시 반드시 두 컴포넌트 모두 확인
2. **일관성 유지**: 언어 선택, 사용자 메뉴 등 공통 기능은 동일하게 구현
3. **i18n 동기화**: 새로운 텍스트 추가 시 번역 키 통일

---

*마지막 업데이트: 2025-01-23*
*작성자: AI4AgriWeather 개발팀*