# Features Architecture

이 디렉토리는 피처 기반 아키텍처를 구현합니다. 각 피처는 독립적이고 응집력 있는 모듈로 구성되어 있습니다.

## 구조

```
src/features/
├── authentication/          # 인증 관련 기능
│   ├── components/         # 인증 컴포넌트들
│   ├── hooks/             # 인증 관련 훅들
│   ├── services/          # 인증 API 서비스
│   └── types/             # 인증 타입 정의
├── chat/                   # 채팅 기능
│   ├── components/        # 채팅 컴포넌트들
│   ├── hooks/            # 채팅 관련 훅들
│   ├── services/         # 채팅 API 서비스
│   └── types/            # 채팅 타입 정의
├── crops/                  # 작물 관리 기능
│   ├── components/        # 작물 관리 컴포넌트들
│   ├── hooks/            # 작물 관련 훅들
│   ├── services/         # 작물 API 서비스
│   └── types/            # 작물 타입 정의
├── dashboard/             # 대시보드 기능
│   ├── components/       # 대시보드 컴포넌트들
│   ├── hooks/           # 대시보드 관련 훅들
│   ├── services/        # 대시보드 API 서비스
│   └── types/           # 대시보드 타입 정의
├── knowledge/            # 지식 베이스 기능
│   ├── components/      # 지식 베이스 컴포넌트들
│   ├── hooks/          # 지식 베이스 관련 훅들
│   ├── services/       # 지식 베이스 API 서비스
│   └── types/          # 지식 베이스 타입 정의
├── notebook/            # 노트북 기능
│   ├── components/     # 노트북 컴포넌트들
│   ├── hooks/         # 노트북 관련 훅들
│   ├── services/      # 노트북 API 서비스
│   └── types/         # 노트북 타입 정의
└── weather/            # 날씨 기능
    ├── components/    # 날씨 컴포넌트들
    ├── hooks/        # 날씨 관련 훅들
    ├── services/     # 날씨 API 서비스
    └── types/        # 날씨 타입 정의
```

## 설계 원칙

### 1. 도메인 기반 분리
각 피처는 특정 비즈니스 도메인에 해당하며, 관련된 모든 코드를 포함합니다.

### 2. 자체 완결성
각 피처는 독립적으로 동작할 수 있도록 설계되었습니다.

### 3. 명확한 인터페이스
각 피처는 index.ts 파일을 통해 공개 API를 명확하게 정의합니다.

### 4. 계층별 구조
각 피처 내부는 다음과 같은 계층으로 구성됩니다:
- **components/**: 해당 피처의 React 컴포넌트들
- **hooks/**: 해당 피처의 커스텀 훅들
- **services/**: 해당 피처의 API 호출 및 비즈니스 로직
- **types/**: 해당 피처의 TypeScript 타입 정의

## Import 가이드라인

### 피처 간 Import
```typescript
// 다른 피처에서 import할 때는 피처의 index를 통해서만
import { AuthProvider, useAuth } from '@/features/authentication';
import { WeatherCenter } from '@/features/weather';
```

### 피처 내부 Import
```typescript
// 같은 피처 내에서는 상대 경로 사용
import { CropCard } from '../components';
import { useCropData } from '../hooks';
import { Crop } from '../types';
```

### Shared 모듈 Import
```typescript
// 공통 컴포넌트, 훅, 유틸리티 등
import { Button, Card } from '@/shared/components/ui';
import { useToast } from '@/shared/hooks';
import { cn } from '@/shared/utils';
```

## 피처 확장 가이드

새로운 피처를 추가할 때는 다음 단계를 따르세요:

1. **디렉토리 생성**: `src/features/[feature-name]/`
2. **하위 디렉토리 생성**: `components/`, `hooks/`, `services/`, `types/`
3. **index.ts 파일 생성**: 각 디렉토리와 루트에
4. **피처 등록**: `src/features/index.ts`에 추가

## 마이그레이션 완료 상태

- ✅ Authentication 피처 (인증)
- ✅ Chat 피처 (채팅)
- ✅ Crops 피처 (작물 관리)
- ✅ Dashboard 피처 (대시보드)
- ✅ Knowledge 피처 (지식 베이스)
- ✅ Notebook 피처 (노트북)
- ✅ Weather 피처 (날씨)
- ✅ Shared 모듈 (공통 요소)

## 이점

1. **유지보수성**: 관련 코드가 한 곳에 모여있어 유지보수가 쉽습니다.
2. **확장성**: 새로운 피처를 독립적으로 추가할 수 있습니다.
3. **재사용성**: 피처별로 명확한 인터페이스를 제공합니다.
4. **테스트 용이성**: 피처별로 독립적인 테스트가 가능합니다.
5. **팀 협업**: 피처별로 개발자가 분담하여 작업할 수 있습니다.