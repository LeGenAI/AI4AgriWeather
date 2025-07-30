# 농업 특화 타입 시스템

AI4AgriWeather 프로젝트의 타입 시스템은 농업과 날씨 도메인에 특화된 중앙 집중식 타입 관리를 제공합니다.

## 구조 개요

```
src/types/
├── index.ts          # 중앙 진입점 - 모든 타입 재출력
├── domain.ts         # 공통 도메인 타입
├── agriculture.ts    # 농업 특화 타입
├── weather.ts        # 날씨 관련 타입
├── user.ts          # 사용자/프로필 타입
├── message.ts       # 기존 메시지 타입 (호환성)
└── README.md        # 이 파일
```

## 파일별 설명

### 1. `domain.ts` - 공통 도메인 타입
프로젝트 전체에서 사용되는 기본적인 타입들을 정의합니다.

**주요 타입:**
- `BaseEntity` - 기본 엔티티 구조
- `GeoLocation` - 지리적 위치
- `ProcessingStatus` - 처리 상태
- `HealthStatus` - 건강 상태
- `ApiResponse<T>` - API 응답 표준 형식
- `UserPreferences` - 사용자 선호도

```typescript
import { BaseEntity, ProcessingStatus, ApiResponse } from '@/types';

interface MyEntity extends BaseEntity {
  status: ProcessingStatus;
}

const response: ApiResponse<MyEntity> = {
  success: true,
  data: entity
};
```

### 2. `agriculture.ts` - 농업 특화 타입
농장, 작물, 농업 활동과 관련된 모든 타입들을 정의합니다.

**주요 타입:**
- `Farm`, `FarmCreateInput`, `FarmWithCrops`
- `Crop`, `CropCreateInput`, `CropWithFarm`
- `FarmActivity`, `ActivityType`, `GrowthStage`
- `AgricultureRecommendation`, `AgricultureInsight`

```typescript
import { Farm, Crop, GrowthStage, ActivityType } from '@/types';

const farm: Farm = {
  id: '123',
  name: '예시 농장',
  location_name: '서울시 강남구',
  // ... 기타 필드
};

const crop: Crop = {
  farm_id: farm.id,
  growth_stage: 'flowering' as GrowthStage,
  // ... 기타 필드
};
```

### 3. `weather.ts` - 날씨 관련 타입
기상 데이터, 예보, 경고 시스템과 관련된 타입들을 정의합니다.

**주요 타입:**
- `WeatherData`, `WeatherStation`, `WeatherAlert`
- `CurrentWeather`, `WeatherForecast`
- `WeatherCondition`, `WeatherAlertType`
- `AgriculturalIndex`, `CropWeatherRequirement`

```typescript
import { WeatherData, WeatherCondition, WeatherAlert } from '@/types';

const weather: WeatherData = {
  temperature: 25.5,
  humidity: 65,
  condition: 'partly_cloudy' as WeatherCondition,
  // ... 기타 필드
};
```

### 4. `user.ts` - 사용자/프로필 타입
사용자 계정, 프로필, 권한, 설정과 관련된 타입들을 정의합니다.

**주요 타입:**
- `Profile`, `ProfileCreateInput`, `ProfileWithFarms`
- `UserRole`, `UserPermissions`, `UserSubscription`
- `NotificationSettings`, `UserNotification`

```typescript
import { Profile, UserRole, NotificationSettings } from '@/types';

const profile: Profile = {
  email: 'farmer@example.com',
  role: 'farmer' as UserRole,
  // ... 기타 필드
};
```

## 사용 방법

### 1. 기본 사용법
```typescript
// 중앙 진입점에서 모든 타입을 가져올 수 있습니다
import { 
  Farm, 
  Crop, 
  WeatherData, 
  Profile, 
  ApiResponse 
} from '@/types';

// 또는 특정 도메인에서만 가져오기
import { Farm, Crop } from '@/types/agriculture';
import { WeatherData } from '@/types/weather';
```

### 2. 타입 가드 사용
```typescript
import { isValidGrowthStage, isValidWeatherCondition } from '@/types';

const userInput = 'flowering';
if (isValidGrowthStage(userInput)) {
  // userInput은 이제 GrowthStage 타입으로 추론됩니다
  console.log(`Valid growth stage: ${userInput}`);
}
```

### 3. API 응답 타입 활용
```typescript
import { ApiResponse, Farm } from '@/types';

async function getFarms(): Promise<ApiResponse<Farm[]>> {
  try {
    const farms = await api.get('/farms');
    return {
      success: true,
      data: farms
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 4. 필터링 및 정렬 타입 활용
```typescript
import { CropFilter, CropSortOption } from '@/types';

const filter: CropFilter = {
  growth_stage: ['flowering', 'fruiting'],
  health_status: 'good',
  planted_after: new Date('2024-01-01')
};

const sort: CropSortOption = {
  field: 'planted_date',
  ascending: false
};
```

## Supabase 호환성

모든 타입들은 Supabase 데이터베이스 스키마와 완전히 호환됩니다:

```typescript
import { Tables, TablesInsert, TablesUpdate } from '@/types';

// Supabase 타입들을 직접 사용
type Farm = Tables<'farms'>;
type FarmInsert = TablesInsert<'farms'>;
type FarmUpdate = TablesUpdate<'farms'>;

// 또는 우리의 확장 타입 사용
import { Farm, FarmCreateInput, FarmUpdateInput } from '@/types';
```

## 타입 확장 가이드

새로운 도메인 타입을 추가해야 할 때:

1. **기본 타입**: `domain.ts`에 추가
2. **농업 관련**: `agriculture.ts`에 추가  
3. **날씨 관련**: `weather.ts`에 추가
4. **사용자 관련**: `user.ts`에 추가
5. **새 도메인**: 새 파일 생성 후 `index.ts`에서 재출력

### 예시: 새 도메인 추가
```typescript
// src/types/inventory.ts
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  // ...
}

// src/types/index.ts에 추가
export * from './inventory';
```

## 베스트 프랙티스

1. **중앙 임포트 사용**: `@/types`에서 임포트하여 일관성 유지
2. **타입 가드 활용**: 런타임 검증이 필요한 경우 제공된 타입 가드 사용
3. **기본값 활용**: `DEFAULT_PAGINATION`, `DEFAULT_SORT` 등의 상수 활용
4. **API 응답 표준화**: `ApiResponse<T>` 타입 일관적 사용
5. **네이밍 컨벤션**: 
   - 인터페이스: PascalCase (예: `WeatherData`)
   - 타입 별칭: PascalCase (예: `WeatherCondition`)
   - 유니온 타입: snake_case 문자열 (예: `'partly_cloudy'`)

## 마이그레이션 가이드

기존 코드에서 새 타입 시스템으로 마이그레이션:

```typescript
// Before
import { Database } from '@/integrations/supabase/types';
type Farm = Database['public']['Tables']['farms']['Row'];

// After
import { Farm } from '@/types';

// Before
interface WeatherResponse {
  temperature: number;
  humidity: number;
}

// After
import { WeatherData, ApiResponse } from '@/types';
type WeatherResponse = ApiResponse<WeatherData>;
```

이 타입 시스템을 통해 더 안전하고 일관된 코드 작성이 가능하며, 농업과 날씨 도메인의 복잡성을 효과적으로 관리할 수 있습니다.