/**
 * 날씨 관련 타입 정의
 * 기상 데이터, 예보, 경고, 기상관측소 등 날씨와 관련된 모든 타입들을 정의합니다.
 */

import { BaseEntity, GeoLocation, LocationInfo, AlertSeverity, BaseFilter, SortOption, Units } from './domain';
import { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';

// === 기본 날씨 엔티티 (Supabase 기반) ===

// 날씨 데이터 타입
export type WeatherData = Tables<'weather_data'>;
export type WeatherDataInsert = TablesInsert<'weather_data'>;
export type WeatherDataUpdate = TablesUpdate<'weather_data'>;

// 기상관측소 타입
export type WeatherStation = Tables<'weather_stations'>;
export type WeatherStationInsert = TablesInsert<'weather_stations'>;
export type WeatherStationUpdate = TablesUpdate<'weather_stations'>;

// 날씨 경고 타입
export type WeatherAlert = Tables<'weather_alerts'>;
export type WeatherAlertInsert = TablesInsert<'weather_alerts'>;
export type WeatherAlertUpdate = TablesUpdate<'weather_alerts'>;

// === 현재 날씨 및 관측 데이터 ===

// 기상 측정 데이터 (단위 포함)
export interface WeatherMeasurement {
  temperature?: {
    value: number;
    unit: Units['temperature'];
  };
  humidity?: {
    value: number; // percentage
    unit: '%';
  };
  pressure?: {
    value: number;
    unit: Units['pressure'];
  };
  wind_speed?: {
    value: number;
    unit: Units['speed'];
  };
  wind_direction?: {
    value: number; // degrees (0-360)
    unit: 'degrees';
  };
  precipitation?: {
    value: number;
    unit: Units['precipitation'];
  };
  solar_radiation?: {
    value: number;
    unit: 'w/m2';
  };
  soil_temperature?: {
    value: number;
    unit: Units['temperature'];
  };
  soil_moisture?: {
    value: number; // percentage
    unit: '%';
  };
}

// 현재 날씨 상태
export interface CurrentWeather extends WeatherMeasurement {
  location: LocationInfo;
  recorded_at: Date | string;
  station_id: string;
  weather_condition?: WeatherCondition;
  feels_like_temperature?: number;
  visibility?: number; // km
  uv_index?: number;
  air_quality_index?: number;
}

// 날씨 상태
export type WeatherCondition = 
  | 'clear'           // 맑음
  | 'partly_cloudy'   // 구름조금
  | 'cloudy'          // 흐림
  | 'overcast'        // 구름많음
  | 'rain_light'      // 가벼운 비
  | 'rain_moderate'   // 보통 비
  | 'rain_heavy'      // 강한 비
  | 'thunderstorm'    // 뇌우
  | 'snow_light'      // 가벼운 눈
  | 'snow_moderate'   // 보통 눈
  | 'snow_heavy'      // 많은 눈
  | 'sleet'           // 진눈깨비
  | 'fog'             // 안개
  | 'mist'            // 박무
  | 'haze'            // 연무
  | 'dust'            // 황사
  | 'windy';          // 바람

// === 날씨 예보 ===

// 시간별 예보
export interface HourlyForecast extends WeatherMeasurement {
  forecast_time: Date | string;
  weather_condition: WeatherCondition;
  precipitation_probability?: number; // percentage
  cloud_cover?: number; // percentage
}

// 일별 예보
export interface DailyForecast {
  date: string; // YYYY-MM-DD
  weather_condition: WeatherCondition;
  temperature_min: number;
  temperature_max: number;
  humidity_min?: number;
  humidity_max?: number;
  precipitation_total?: number;
  precipitation_probability?: number;
  wind_speed_avg?: number;
  wind_speed_max?: number;
  wind_direction_avg?: number;
  sunrise?: string; // HH:MM
  sunset?: string;  // HH:MM
  moon_phase?: MoonPhase;
}

// 달의 위상
export type MoonPhase = 
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

// 종합 날씨 예보
export interface WeatherForecast {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[]; // 다음 48시간
  daily: DailyForecast[];   // 다음 7일
  last_updated: Date | string;
  data_source: string;
}

// === 기상관측소 관련 ===

// 관측소 유형
export type StationType = 
  | 'automatic'       // 자동관측소
  | 'manual'         // 유인관측소
  | 'agricultural'   // 농업기상관측소
  | 'marine'         // 해상관측소
  | 'aviation'       // 항공기상관측소
  | 'research'       // 연구용관측소
  | 'private';       // 개인관측소

// 관측소 상태
export type StationStatus = 
  | 'active'         // 정상운영
  | 'maintenance'    // 점검중
  | 'inactive'       // 비활성
  | 'error'          // 오류
  | 'offline';       // 오프라인

// 관측소 생성 입력
export interface WeatherStationCreateInput {
  name: string;
  station_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  station_type?: StationType;
  installation_date?: string;
  status?: StationStatus;
}

// 확장된 관측소 정보
export interface WeatherStationWithData extends WeatherStation {
  latest_data?: WeatherData;
  data_availability: {
    last_24h: number;    // 지난 24시간 데이터 개수
    last_7d: number;     // 지난 7일 데이터 개수
    last_30d: number;    // 지난 30일 데이터 개수
  };
  distance_km?: number; // 특정 지점으로부터의 거리
}

// === 날씨 경고 및 알림 ===

// 날씨 경고 유형
export type WeatherAlertType = 
  | 'temperature_extreme'  // 극한 온도
  | 'heat_wave'           // 폭염
  | 'cold_wave'           // 한파
  | 'heavy_rain'          // 호우
  | 'drought'             // 가뭄
  | 'strong_wind'         // 강풍
  | 'frost'               // 서리
  | 'hail'                // 우박
  | 'thunderstorm'        // 뇌우
  | 'snow_storm'          // 눈폭풍
  | 'typhoon'             // 태풍
  | 'air_quality'         // 대기질
  | 'uv_extreme'          // 자외선
  | 'agricultural';       // 농업특보

// 날씨 경고 생성 입력
export interface WeatherAlertCreateInput {
  alert_type: WeatherAlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  valid_from: string;
  valid_until?: string;
  farm_id?: string;
  user_id?: string;
}

// === 농업 기상 특화 타입 ===

// 농업 기상 지수
export interface AgriculturalIndex {
  date: string;
  growing_degree_days: number;      // 생장도일
  chill_hours?: number;             // 저온시간
  evapotranspiration: number;       // 증발산량
  soil_moisture_index: number;      // 토양수분지수
  pest_development_index?: number;  // 병해충발달지수
  disease_risk_index?: number;      // 병해위험지수
}

// 작물별 기상 요구사항
export interface CropWeatherRequirement {
  crop_name: string;
  optimal_temperature: {
    min: number;
    max: number;
    unit: Units['temperature'];
  };
  optimal_humidity: {
    min: number;
    max: number;
  };
  water_requirement: {
    daily_mm: number;
    growth_stage_multiplier: Record<string, number>;
  };
  frost_tolerance: 'high' | 'medium' | 'low' | 'none';
  heat_tolerance: 'high' | 'medium' | 'low';
  wind_tolerance: 'high' | 'medium' | 'low';
  critical_periods: Array<{
    stage: string;
    sensitivity: 'high' | 'medium' | 'low';
    weather_factors: WeatherFactor[];
  }>;
}

export type WeatherFactor = 
  | 'temperature'
  | 'humidity'
  | 'precipitation'
  | 'wind'
  | 'solar_radiation'
  | 'frost';

// 농업 기상 예보
export interface AgriculturalForecast {
  location: LocationInfo;
  crop_specific_advice: Array<{
    crop_name: string;
    growth_stage: string;
    recommendations: string[];
    warnings: string[];
    optimal_activities: string[];
  }>;
  field_work_conditions: {
    today: 'excellent' | 'good' | 'poor' | 'unsuitable';
    next_3_days: Array<{
      date: string;
      condition: 'excellent' | 'good' | 'poor' | 'unsuitable';
      activities: string[];
    }>;
  };
  irrigation_advice: {
    needed: boolean;
    amount_mm?: number;
    timing?: 'morning' | 'evening' | 'night';
    reasoning: string;
  };
}

// === 기상 데이터 분석 ===

// 기상 통계
export interface WeatherStats {
  period: {
    start: Date | string;
    end: Date | string;
  };
  temperature: {
    avg: number;
    min: number;
    max: number;
    extreme_days: number;
  };
  precipitation: {
    total: number;
    days_with_rain: number;
    max_daily: number;
    drought_days: number;
  };
  humidity: {
    avg: number;
    min: number;
    max: number;
  };
  wind: {
    avg_speed: number;
    max_speed: number;
    prevalent_direction: number;
  };
  growing_degree_days: number;
  frost_days: number;
}

// 기상 트렌드
export interface WeatherTrend {
  parameter: 'temperature' | 'precipitation' | 'humidity' | 'wind_speed';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trend: 'increasing' | 'decreasing' | 'stable' | 'variable';
  change_rate: number; // per period
  confidence: number;  // 0-1
  significance: 'high' | 'medium' | 'low';
}

// === 필터링 및 쿼리 옵션 ===

// 날씨 데이터 필터
export interface WeatherDataFilter extends BaseFilter {
  station_id?: string | string[];
  location?: {
    radius_km: number;
    center: GeoLocation;
  };
  recorded_after?: Date | string;
  recorded_before?: Date | string;
  temperature_min?: number;
  temperature_max?: number;
  precipitation_min?: number;
  precipitation_max?: number;
  has_precipitation?: boolean;
}

// 날씨 경고 필터
export interface WeatherAlertFilter extends BaseFilter {
  alert_type?: WeatherAlertType | WeatherAlertType[];
  severity?: AlertSeverity | AlertSeverity[];
  is_active?: boolean;
  farm_id?: string;
  user_id?: string;
}

// 정렬 옵션
export type WeatherDataSortField = 'recorded_at' | 'temperature' | 'precipitation' | 'humidity' | 'wind_speed';
export type WeatherAlertSortField = 'created_at' | 'valid_from' | 'severity' | 'alert_type';

export type WeatherDataSortOption = SortOption<WeatherDataSortField>;
export type WeatherAlertSortOption = SortOption<WeatherAlertSortField>;

// === 외부 API 연동 타입 ===

// 날씨 API 제공자
export type WeatherProvider = 
  | 'kma'           // 기상청
  | 'openweather'   // OpenWeatherMap
  | 'weatherapi'    // WeatherAPI
  | 'accuweather'   // AccuWeather
  | 'custom';       // 커스텀

// API 응답 타입
export interface WeatherApiResponse<T = any> {
  provider: WeatherProvider;
  data: T;
  timestamp: Date | string;
  cache_expiry?: Date | string;
  api_calls_remaining?: number;
}

// 날씨 API 설정
export interface WeatherApiConfig {
  provider: WeatherProvider;
  api_key: string;
  base_url: string;
  rate_limit: {
    requests_per_hour: number;
    requests_per_day: number;
  };
  cache_duration_minutes: number;
  enabled: boolean;
}