/**
 * 타입 시스템 중앙 진입점
 * 모든 도메인 타입들을 여기서 재출력하여 편리하게 사용할 수 있도록 합니다.
 */

// === 도메인 타입들 ===
export * from './domain';
export * from './agriculture';
export * from './weather';
export * from './user';

// === 기존 타입들과의 호환성 ===
export * from './message';

// === Supabase 타입들 (재출력) ===
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json
} from '../integrations/supabase/types';

// === 타입 가드 및 유틸리티 함수들 ===

// 농장 관련 타입 가드
export const isValidFarmType = (value: any): value is import('./agriculture').FarmType => {
  const validTypes = [
    'crop_farm', 'livestock', 'dairy', 'orchard', 
    'greenhouse', 'hydroponic', 'organic', 'mixed', 'research'
  ];
  return typeof value === 'string' && validTypes.includes(value);
};

// 작물 성장 단계 타입 가드
export const isValidGrowthStage = (value: any): value is import('./agriculture').GrowthStage => {
  const validStages = [
    'seed', 'germination', 'seedling', 'vegetative', 'flowering',
    'fruiting', 'maturing', 'harvest_ready', 'harvested', 'dormant'
  ];
  return typeof value === 'string' && validStages.includes(value);
};

// 날씨 상태 타입 가드
export const isValidWeatherCondition = (value: any): value is import('./weather').WeatherCondition => {
  const validConditions = [
    'clear', 'partly_cloudy', 'cloudy', 'overcast',
    'rain_light', 'rain_moderate', 'rain_heavy', 'thunderstorm',
    'snow_light', 'snow_moderate', 'snow_heavy', 'sleet',
    'fog', 'mist', 'haze', 'dust', 'windy'
  ];
  return typeof value === 'string' && validConditions.includes(value);
};

// 사용자 역할 타입 가드
export const isValidUserRole = (value: any): value is import('./user').UserRole => {
  const validRoles = ['farmer', 'advisor', 'researcher', 'admin', 'viewer'];
  return typeof value === 'string' && validRoles.includes(value);
};

// 건강 상태 타입 가드
export const isValidHealthStatus = (value: any): value is import('./domain').HealthStatus => {
  const validStatuses = ['excellent', 'good', 'fair', 'poor', 'critical', 'unknown'];
  return typeof value === 'string' && validStatuses.includes(value);
};

// 처리 상태 타입 가드
export const isValidProcessingStatus = (value: any): value is import('./domain').ProcessingStatus => {
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
  return typeof value === 'string' && validStatuses.includes(value);
};

// === 타입 변환 유틸리티 ===

// 문자열을 Date로 안전하게 변환
export const safeParseDate = (dateString: string | Date): Date | null => {
  if (dateString instanceof Date) return dateString;
  if (typeof dateString === 'string') {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

// 숫자 값을 안전하게 파싱
export const safeParseNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// 위도/경도 유효성 검증
export const isValidLatitude = (lat: number): boolean => {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
};

export const isValidLongitude = (lng: number): boolean => {
  return typeof lng === 'number' && lng >= -180 && lng <= 180;
};

// 이메일 유효성 검증
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// === 타입 별칭들 (편의성을 위한) ===

// 자주 사용되는 ID 타입들
export type UserId = string;
export type FarmId = string;
export type CropId = string;
export type WeatherStationId = string;
export type NotificationId = string;

// 자주 사용되는 날짜 타입들
export type Timestamp = string | Date;
export type DateString = string; // YYYY-MM-DD 형식
export type TimeString = string; // HH:MM 형식
export type DateTimeString = string; // ISO 8601 형식

// API 응답에서 자주 사용되는 타입들
export type ApiSuccess<T> = import('./domain').ApiResponse<T> & { success: true; data: T };
export type ApiError = import('./domain').ApiResponse<never> & { success: false; error: string };

// === 상수들 ===

// 기본 페이지네이션 설정
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20
} as const;

// 기본 정렬 설정
export const DEFAULT_SORT = {
  ascending: false
} as const;

// 지원되는 파일 확장자들
export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'] as const;
export const SUPPORTED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.rtf'] as const;
export const SUPPORTED_SPREADSHEET_EXTENSIONS = ['.xls', '.xlsx', '.csv'] as const;

// API 제한사항
export const API_LIMITS = {
  MAX_FILE_SIZE_MB: 50,
  MAX_FILES_PER_UPLOAD: 10,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TITLE_LENGTH: 200,
  MIN_PASSWORD_LENGTH: 8
} as const;

// 시간 상수들 (밀리초)
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;