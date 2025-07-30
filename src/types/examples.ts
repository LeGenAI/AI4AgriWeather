/**
 * 새로운 타입 시스템 사용 예제
 * 실제 사용 패턴을 보여주는 예제 코드들입니다.
 */

import {
  // 농업 관련 타입들
  Farm,
  Crop,
  FarmCreateInput,
  CropCreateInput,
  GrowthStage,
  ActivityType,
  FarmActivity,
  
  // 날씨 관련 타입들
  WeatherData,
  WeatherCondition,
  WeatherAlert,
  WeatherAlertType,
  CurrentWeather,
  
  // 사용자 관련 타입들
  Profile,
  UserRole,
  NotificationSettings,
  
  // 공통 도메인 타입들
  ApiResponse,
  ProcessingStatus,
  HealthStatus,
  Pagination,
  
  // 타입 가드 함수들
  isValidGrowthStage,
  isValidWeatherCondition,
  isValidUserRole,
  
  // 유틸리티 함수들
  safeParseDate,
  safeParseNumber,
  isValidEmail,
  isValidLatitude,
  isValidLongitude
} from './index';

// === 농장 관리 예제 ===

// 농장 생성
export function createFarmExample(): FarmCreateInput {
  return {
    name: '햇살농장',
    location_name: '경기도 파주시 문산읍',
    farm_type: 'crop_farm',
    description: '친환경 채소를 재배하는 농장입니다.',
    area_hectares: 5.5,
    latitude: 37.8361,
    longitude: 126.7794
  };
}

// 작물 생성 및 검증
export function createCropWithValidation(
  farmId: string, 
  cropName: string, 
  growthStage: string
): CropCreateInput | null {
  // 타입 가드를 사용하여 런타임 검증
  if (!isValidGrowthStage(growthStage)) {
    console.error('Invalid growth stage:', growthStage);
    return null;
  }
  
  return {
    farm_id: farmId,
    name: cropName,
    variety: '개량종',
    area_hectares: 1.2,
    planted_date: new Date().toISOString(),
    growth_stage: growthStage, // 이제 타입 안전함
    health_status: 'good',
    notes: `${cropName} 작물 등록`
  };
}

// 농장 통계 계산
export function calculateFarmStats(farm: Farm, crops: Crop[]): {
  totalCrops: number;
  healthyPercentage: number;
  harvestReady: number;
} {
  const totalCrops = crops.length;
  const healthyCrops = crops.filter(crop => 
    crop.health_status === 'excellent' || crop.health_status === 'good'
  ).length;
  const harvestReady = crops.filter(crop => 
    crop.growth_stage === 'harvest_ready'
  ).length;
  
  return {
    totalCrops,
    healthyPercentage: totalCrops > 0 ? (healthyCrops / totalCrops) * 100 : 0,
    harvestReady
  };
}

// === 날씨 데이터 처리 예제 ===

// 날씨 데이터 검증 및 변환
export function processWeatherData(rawData: any): CurrentWeather | null {
  try {
    const weather: CurrentWeather = {
      location: {
        location_name: rawData.location || '알 수 없는 위치',
        latitude: safeParseNumber(rawData.lat),
        longitude: safeParseNumber(rawData.lon)
      },
      recorded_at: safeParseDate(rawData.timestamp) || new Date(),
      station_id: rawData.stationId || 'unknown',
      temperature: rawData.temp ? {
        value: safeParseNumber(rawData.temp),
        unit: 'celsius'
      } : undefined,
      humidity: rawData.humidity ? {
        value: safeParseNumber(rawData.humidity),
        unit: '%'
      } : undefined,
      precipitation: rawData.rain ? {
        value: safeParseNumber(rawData.rain),
        unit: 'mm'
      } : undefined
    };
    
    // 날씨 상태 검증
    if (rawData.condition && isValidWeatherCondition(rawData.condition)) {
      weather.weather_condition = rawData.condition;
    }
    
    return weather;
  } catch (error) {
    console.error('Failed to process weather data:', error);
    return null;
  }
}

// 농업 관련 날씨 경고 생성
export function createAgriculturalAlert(
  temperature: number,
  crops: Crop[],
  farmId: string
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  
  // 서리 경고 (온도가 2도 이하)
  if (temperature <= 2) {
    alerts.push({
      id: crypto.randomUUID(),
      alert_type: 'frost',
      title: '서리 주의보',
      message: '온도가 영하로 떨어질 위험이 있습니다. 작물 보온에 주의하세요.',
      severity: 'high',
      valid_from: new Date().toISOString(),
      farm_id: farmId,
      created_at: new Date().toISOString(),
      is_read: false
    });
  }
  
  // 극한 고온 경고 (온도가 35도 이상)
  if (temperature >= 35) {
    const vulnerableCrops = crops.filter(crop => 
      crop.growth_stage === 'flowering' || crop.growth_stage === 'fruiting'
    );
    
    if (vulnerableCrops.length > 0) {
      alerts.push({
        id: crypto.randomUUID(),
        alert_type: 'heat_wave',
        title: '극한 고온 경고',
        message: `극한 고온으로 인해 ${vulnerableCrops.length}개 작물이 위험할 수 있습니다.`,
        severity: 'critical',
        valid_from: new Date().toISOString(),
        farm_id: farmId,
        created_at: new Date().toISOString(),
        is_read: false
      });
    }
  }
  
  return alerts;
}

// === 사용자 관리 예제 ===

// 사용자 프로필 검증
export function validateUserProfile(profileData: any): Profile | null {
  if (!profileData.email || !isValidEmail(profileData.email)) {
    console.error('Invalid email address');
    return null;
  }
  
  if (profileData.role && !isValidUserRole(profileData.role)) {
    console.error('Invalid user role:', profileData.role);
    return null;
  }
  
  return {
    id: profileData.id || crypto.randomUUID(),
    email: profileData.email,
    full_name: profileData.full_name || null,
    avatar_url: profileData.avatar_url || null,
    created_at: safeParseDate(profileData.created_at)?.toISOString() || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// 알림 설정 생성
export function createDefaultNotificationSettings(userId: string): NotificationSettings {
  return {
    user_id: userId,
    notification_types: {
      weather_alert: {
        enabled: true,
        email: true,
        push: true,
        frequency: 'immediate'
      },
      crop_reminder: {
        enabled: true,
        email: false,
        push: true,
        frequency: 'daily'
      },
      harvest_ready: {
        enabled: true,
        email: true,
        push: true,
        frequency: 'immediate'
      },
      activity_due: {
        enabled: true,
        email: false,
        push: true,
        frequency: 'daily'
      },
      system_update: {
        enabled: true,
        email: true,
        push: false,
        frequency: 'weekly'
      },
      subscription_expiry: {
        enabled: true,
        email: true,
        push: true,
        frequency: 'immediate'
      },
      security_alert: {
        enabled: true,
        email: true,
        push: true,
        frequency: 'immediate'
      }
    },
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '07:00',
      timezone: 'Asia/Seoul'
    },
    language: 'ko-KR',
    updated_at: new Date().toISOString()
  };
}

// === API 응답 처리 예제 ===

// 표준 API 응답 래퍼
export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    message: 'Success'
  };
}

export function createApiError(error: string): ApiResponse<never> {
  return {
    success: false,
    error,
    message: 'An error occurred'
  };
}

// 페이지네이션을 포함한 목록 응답
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<T[]> & { pagination: Pagination } {
  return {
    success: true,
    data: items,
    pagination: {
      page,
      pageSize,
      total
    }
  };
}

// === 데이터 변환 유틸리티 예제 ===

// Supabase 데이터를 확장 타입으로 변환
export function enhanceCropData(
  crop: Crop,
  farm: Farm
): Crop & { 
  days_since_planted?: number;
  days_to_harvest?: number;
  growth_progress_percentage?: number;
} {
  const enhancedCrop = { ...crop };
  
  if (crop.planted_date) {
    const plantedDate = safeParseDate(crop.planted_date);
    if (plantedDate) {
      const daysSincePlanted = Math.floor(
        (Date.now() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      (enhancedCrop as any).days_since_planted = daysSincePlanted;
    }
  }
  
  if (crop.expected_harvest_date) {
    const harvestDate = safeParseDate(crop.expected_harvest_date);
    if (harvestDate) {
      const daysToHarvest = Math.floor(
        (harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      (enhancedCrop as any).days_to_harvest = daysToHarvest;
    }
  }
  
  // 성장 단계별 진행률 계산 (예시)
  const stageProgress: Record<GrowthStage, number> = {
    seed: 0,
    germination: 10,
    seedling: 20,
    vegetative: 40,
    flowering: 60,
    fruiting: 75,
    maturing: 90,
    harvest_ready: 95,
    harvested: 100,
    dormant: 0
  };
  
  if (crop.growth_stage && isValidGrowthStage(crop.growth_stage)) {
    (enhancedCrop as any).growth_progress_percentage = stageProgress[crop.growth_stage];
  }
  
  return enhancedCrop;
}

// === 검색 및 필터링 예제 ===

// 작물 필터링 함수
export function filterCrops(
  crops: Crop[],
  filters: {
    healthStatus?: HealthStatus[];
    growthStage?: GrowthStage[];
    farmId?: string;
    searchQuery?: string;
  }
): Crop[] {
  return crops.filter(crop => {
    // 건강 상태 필터
    if (filters.healthStatus && filters.healthStatus.length > 0) {
      if (!crop.health_status || !filters.healthStatus.includes(crop.health_status as HealthStatus)) {
        return false;
      }
    }
    
    // 성장 단계 필터
    if (filters.growthStage && filters.growthStage.length > 0) {
      if (!crop.growth_stage || !filters.growthStage.includes(crop.growth_stage as GrowthStage)) {
        return false;
      }
    }
    
    // 농장 ID 필터
    if (filters.farmId && crop.farm_id !== filters.farmId) {
      return false;
    }
    
    // 검색어 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = crop.name.toLowerCase().includes(query);
      const matchesVariety = crop.variety?.toLowerCase().includes(query);
      const matchesNotes = crop.notes?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesVariety && !matchesNotes) {
        return false;
      }
    }
    
    return true;
  });
}

// === 유효성 검증 예제 ===

// 농장 데이터 유효성 검증
export function validateFarmData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('농장명은 필수입니다.');
  }
  
  if (!data.location_name || typeof data.location_name !== 'string') {
    errors.push('위치명은 필수입니다.');
  }
  
  if (data.area_hectares !== undefined) {
    const area = safeParseNumber(data.area_hectares);
    if (area < 0 || area > 10000) {
      errors.push('농장 면적은 0 이상 10,000 헥타르 이하여야 합니다.');
    }
  }
  
  if (data.latitude !== undefined && !isValidLatitude(safeParseNumber(data.latitude))) {
    errors.push('위도 값이 올바르지 않습니다. (-90 ~ 90 사이의 값)');
  }
  
  if (data.longitude !== undefined && !isValidLongitude(safeParseNumber(data.longitude))) {
    errors.push('경도 값이 올바르지 않습니다. (-180 ~ 180 사이의 값)');
  }
  
  return errors;
}

export default {
  // 농장 관련
  createFarmExample,
  createCropWithValidation,
  calculateFarmStats,
  
  // 날씨 관련
  processWeatherData,
  createAgriculturalAlert,
  
  // 사용자 관련
  validateUserProfile,
  createDefaultNotificationSettings,
  
  // API 관련
  createApiResponse,
  createApiError,
  createPaginatedResponse,
  
  // 유틸리티
  enhanceCropData,
  filterCrops,
  validateFarmData
};