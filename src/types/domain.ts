/**
 * 공통 도메인 타입 정의
 * 프로젝트 전체에서 사용되는 기본 타입들을 정의합니다.
 */

// 기본 엔티티 메타데이터
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// 지리적 위치 정보
export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

// 주소/위치 정보
export interface LocationInfo extends Partial<GeoLocation> {
  location_name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  region?: string;
  country?: string;
}

// 시간 범위
export interface TimeRange {
  start: string | Date;
  end: string | Date;
}

// 페이지네이션
export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}

// 정렬 옵션
export interface SortOption<T = string> {
  field: T;
  ascending?: boolean;
}

// API 응답 공통 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: Pagination;
}

// 필터링 기본 타입
export interface BaseFilter {
  created_after?: Date | string;
  created_before?: Date | string;
  updated_after?: Date | string;
  updated_before?: Date | string;
  search_query?: string;
}

// 상태 타입들
export type ProcessingStatus = 
  | 'pending'     // 대기중
  | 'processing'  // 처리중
  | 'completed'   // 완료
  | 'failed'      // 실패
  | 'cancelled';  // 취소됨

export type HealthStatus = 
  | 'excellent'   // 매우 좋음
  | 'good'        // 좋음
  | 'fair'        // 보통
  | 'poor'        // 나쁨
  | 'critical'    // 심각함
  | 'unknown';    // 알 수 없음

export type AlertSeverity = 
  | 'low'         // 낮음
  | 'medium'      // 보통
  | 'high'        // 높음
  | 'critical';   // 심각함

// 단위 시스템
export type UnitSystem = 'metric' | 'imperial';

// 측정 단위들
export interface Units {
  temperature: 'celsius' | 'fahrenheit';
  length: 'cm' | 'inch' | 'meter' | 'feet';
  area: 'hectare' | 'acre' | 'sqm' | 'sqft';
  weight: 'kg' | 'pound' | 'gram' | 'ounce';
  volume: 'liter' | 'gallon' | 'ml' | 'cup';
  speed: 'kmh' | 'mph' | 'ms';
  pressure: 'hpa' | 'inchHg' | 'mmHg' | 'psi';
  precipitation: 'mm' | 'inch';
}

// 타임존
export type Timezone = string; // ISO timezone format (e.g., 'Asia/Seoul', 'UTC')

// 언어/로케일
export type Locale = 'ko-KR' | 'en-US' | 'ja-JP' | 'zh-CN';

// 파일 관련 타입
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
  last_modified?: Date;
  checksum?: string;
}

export interface FileUploadProgress {
  file_id: string;
  file_name: string;
  progress: number;        // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  upload_start_time: Date;
  estimated_time_remaining?: number; // seconds
}

// 알림/경고 기본 타입
export interface BaseAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  alert_type: string;
  is_read: boolean;
  valid_from: string | Date;
  valid_until?: string | Date;
  created_at: string;
}

// 사용자 선호도
export interface UserPreferences {
  unit_system: UnitSystem;
  units: Partial<Units>;
  timezone: Timezone;
  locale: Locale;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  default_dashboard_view?: string;
}

// 검색 및 필터링 공통 타입
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOption[];
  pagination?: Partial<Pagination>;
}

// 통계 기본 타입
export interface BaseStats {
  total: number;
  active: number;
  inactive: number;
  recent_changes: number; // 최근 변경사항 수
  last_updated: Date | string;
}

// 데이터 검증 결과
export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings?: string[];
}

// 실시간 이벤트 타입
export interface RealtimeEvent<T = any> {
  event_type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new_data?: T;
  old_data?: T;
  timestamp: Date | string;
}

// 에러 타입
export interface DomainError {
  code: string;
  message: string;
  details?: any;
  timestamp?: Date | string;
  context?: Record<string, any>;
}

// 설정 타입
export interface AppSettings {
  app_name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    weather_integration: boolean;
    ai_recommendations: boolean;
    mobile_app: boolean;
    api_access: boolean;
  };
  limits: {
    max_file_size_mb: number;
    max_farms_per_user: number;
    max_crops_per_farm: number;
    api_requests_per_hour: number;
  };
}