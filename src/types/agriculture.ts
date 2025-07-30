/**
 * 농업 특화 타입 정의
 * 농장, 작물, 농업 활동과 관련된 모든 타입들을 정의합니다.
 */

import { BaseEntity, GeoLocation, LocationInfo, HealthStatus, BaseFilter, SortOption } from './domain';
import { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';

// === 기본 농업 엔티티 ===

// 농장 타입 (Supabase 기반)
export type Farm = Tables<'farms'>;
export type FarmInsert = TablesInsert<'farms'>;
export type FarmUpdate = TablesUpdate<'farms'>;

// 작물 타입 (Supabase 기반)
export type Crop = Tables<'crops'>;
export type CropInsert = TablesInsert<'crops'>;
export type CropUpdate = TablesUpdate<'crops'>;

// 농업 활동 타입 (Supabase 기반)
export type FarmActivity = Tables<'farm_activities'>;
export type FarmActivityInsert = TablesInsert<'farm_activities'>;
export type FarmActivityUpdate = TablesUpdate<'farm_activities'>;

// === 농장 관련 타입 ===

// 농장 유형
export type FarmType = 
  | 'crop_farm'       // 작물농장
  | 'livestock'       // 축산농장
  | 'dairy'          // 낙농농장
  | 'orchard'        // 과수원
  | 'greenhouse'     // 온실농장
  | 'hydroponic'     // 수경재배
  | 'organic'        // 유기농장
  | 'mixed'          // 복합농장
  | 'research';      // 연구농장

// 농장 생성 입력
export interface FarmCreateInput {
  name: string;
  location_name: string;
  farm_type?: FarmType;
  description?: string;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
}

// 농장 업데이트 입력
export interface FarmUpdateInput {
  name?: string;
  location_name?: string;
  farm_type?: FarmType;
  description?: string;
  area_hectares?: number;
  latitude?: number;
  longitude?: number;
}

// 농장과 작물 정보를 포함한 확장 타입
export interface FarmWithCrops extends Farm {
  crops: Crop[];
  crop_count: number;
  total_crop_area?: number;
  active_crops: number;
}

// 농장 통계
export interface FarmStats {
  total_area: number;
  cultivated_area: number;
  crop_count: number;
  active_crops: number;
  harvest_ready: number;
  health_distribution: Record<HealthStatus, number>;
  recent_activities: number;
}

// === 작물 관련 타입 ===

// 작물 성장 단계
export type GrowthStage = 
  | 'seed'           // 씨앗
  | 'germination'    // 발아
  | 'seedling'       // 모종
  | 'vegetative'     // 영양성장
  | 'flowering'      // 개화
  | 'fruiting'       // 결실
  | 'maturing'       // 성숙
  | 'harvest_ready'  // 수확가능
  | 'harvested'      // 수확완료
  | 'dormant';       // 휴면

// 작물 카테고리
export type CropCategory = 
  | 'cereals'        // 곡물
  | 'vegetables'     // 채소
  | 'fruits'         // 과일
  | 'herbs'          // 허브
  | 'legumes'        // 콩류
  | 'tubers'         // 구근류
  | 'fodder'         // 사료작물
  | 'ornamental'     // 관상식물
  | 'medicinal';     // 약용식물

// 작물 생성 입력
export interface CropCreateInput {
  farm_id: string;
  name: string;
  variety?: string;
  area_hectares?: number;
  planted_date?: string;
  expected_harvest_date?: string;
  growth_stage?: GrowthStage;
  health_status?: HealthStatus;
  notes?: string;
}

// 작물 업데이트 입력
export interface CropUpdateInput {
  name?: string;
  variety?: string;
  area_hectares?: number;
  planted_date?: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  growth_stage?: GrowthStage;
  health_status?: HealthStatus;
  notes?: string;
}

// 작물과 농장 정보를 포함한 확장 타입
export interface CropWithFarm extends Crop {
  farm: Farm;
  days_since_planted?: number;
  days_to_harvest?: number;
  growth_progress_percentage?: number;
}

// 작물 통계
export interface CropStats {
  total_crops: number;
  by_category: Record<CropCategory, number>;
  by_growth_stage: Record<GrowthStage, number>;
  by_health_status: Record<HealthStatus, number>;
  harvest_this_month: number;
  planted_this_month: number;
}

// === 농업 활동 관련 타입 ===

// 농업 활동 유형
export type ActivityType = 
  | 'planting'       // 파종/정식
  | 'watering'       // 물주기
  | 'fertilizing'    // 시비
  | 'pest_control'   // 방제
  | 'pruning'        // 전정
  | 'weeding'        // 제초
  | 'harvesting'     // 수확
  | 'soil_prep'      // 토양준비
  | 'monitoring'     // 모니터링
  | 'maintenance'    // 유지보수
  | 'treatment'      // 처리
  | 'other';         // 기타

// 농업 활동 생성 입력
export interface ActivityCreateInput {
  farm_id: string;
  crop_id?: string;
  activity_type: ActivityType;
  description: string;
  performed_at: string;
  cost?: number;
  quantity?: number;
  unit?: string;
}

// 농업 활동 업데이트 입력
export interface ActivityUpdateInput {
  activity_type?: ActivityType;
  description?: string;
  performed_at?: string;
  cost?: number;
  quantity?: number;
  unit?: string;
}

// 활동과 관련 정보를 포함한 확장 타입
export interface ActivityWithRelations extends FarmActivity {
  farm: Farm;
  crop?: Crop;
}

// 농업 활동 통계
export interface ActivityStats {
  total_activities: number;
  by_type: Record<ActivityType, number>;
  total_cost: number;
  this_month_activities: number;
  this_week_activities: number;
  recent_activities: ActivityWithRelations[];
}

// === 필터링 및 쿼리 옵션 ===

// 농장 필터
export interface FarmFilter extends BaseFilter {
  farm_type?: FarmType | FarmType[];
  min_area?: number;
  max_area?: number;
  has_crops?: boolean;
  location?: {
    radius_km?: number;
    center: GeoLocation;
  };
}

// 작물 필터
export interface CropFilter extends BaseFilter {
  farm_id?: string;
  growth_stage?: GrowthStage | GrowthStage[];
  health_status?: HealthStatus | HealthStatus[];
  category?: CropCategory | CropCategory[];
  planted_after?: Date | string;
  planted_before?: Date | string;
  harvest_due?: boolean; // 수확 예정인 작물만
  harvest_overdue?: boolean; // 수확이 늦은 작물만
}

// 농업 활동 필터
export interface ActivityFilter extends BaseFilter {
  farm_id?: string;
  crop_id?: string;
  activity_type?: ActivityType | ActivityType[];
  performed_after?: Date | string;
  performed_before?: Date | string;
  min_cost?: number;
  max_cost?: number;
  has_cost?: boolean;
}

// 정렬 옵션들
export type FarmSortField = 'created_at' | 'updated_at' | 'name' | 'area_hectares' | 'location_name';
export type CropSortField = 'created_at' | 'updated_at' | 'name' | 'planted_date' | 'expected_harvest_date' | 'area_hectares';
export type ActivitySortField = 'created_at' | 'updated_at' | 'performed_at' | 'activity_type' | 'cost';

export type FarmSortOption = SortOption<FarmSortField>;
export type CropSortOption = SortOption<CropSortField>;
export type ActivitySortOption = SortOption<ActivitySortField>;

// === AI 추천 및 인사이트 타입 ===

// 농업 추천사항
export interface AgricultureRecommendation {
  id: string;
  type: 'planting' | 'fertilizing' | 'pest_control' | 'harvesting' | 'irrigation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  target_entity_type: 'farm' | 'crop' | 'activity';
  target_entity_id: string;
  suggested_action?: string;
  estimated_cost?: number;
  estimated_time?: number; // hours
  deadline?: Date | string;
  created_at: Date | string;
  is_dismissed: boolean;
}

// 농업 인사이트
export interface AgricultureInsight {
  id: string;
  title: string;
  description: string;
  insight_type: 'performance' | 'trend' | 'anomaly' | 'prediction' | 'optimization';
  data: any; // 차트 데이터 등
  farm_id?: string;
  crop_id?: string;
  generated_at: Date | string;
  confidence_score: number; // 0-1
}

// === 계절 및 기후 연관 타입 ===

// 재배 시즌
export interface GrowingSeason {
  id: string;
  name: string;
  start_date: string; // MM-DD 형식
  end_date: string;   // MM-DD 형식
  suitable_crops: string[];
  region?: string;
  climate_zone?: string;
}

// 작물 캘린더
export interface CropCalendar {
  crop_name: string;
  variety?: string;
  planting_window: {
    start: string; // MM-DD
    end: string;   // MM-DD
  };
  harvest_window: {
    start: string; // MM-DD
    end: string;   // MM-DD
  };
  growth_duration_days: number;
  climate_requirements: {
    min_temperature?: number;
    max_temperature?: number;
    min_rainfall?: number;
    max_rainfall?: number;
    soil_ph_range?: [number, number];
  };
  region?: string;
}