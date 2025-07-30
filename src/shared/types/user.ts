/**
 * 사용자 및 프로필 관련 타입 정의
 * 사용자 계정, 프로필, 권한, 설정 등과 관련된 모든 타입들을 정의합니다.
 */

import { BaseEntity, UserPreferences, BaseFilter, SortOption } from './domain';
import { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types';
import { Farm } from './agriculture';

// === 기본 사용자 엔티티 (Supabase 기반) ===

// 사용자 프로필 타입
export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

// === 확장된 사용자 타입 ===

// 사용자 역할
export type UserRole = 
  | 'farmer'          // 농민
  | 'advisor'         // 농업지도사
  | 'researcher'      // 연구원
  | 'admin'          // 관리자
  | 'viewer';        // 조회자

// 구독 플랜
export type SubscriptionPlan = 
  | 'free'           // 무료
  | 'basic'          // 기본
  | 'premium'        // 프리미엄
  | 'enterprise';    // 기업

// 구독 상태
export type SubscriptionStatus = 
  | 'active'         // 활성
  | 'expired'        // 만료
  | 'cancelled'      // 취소
  | 'suspended';     // 정지

// 사용자 상태
export type UserStatus = 
  | 'active'         // 활성
  | 'inactive'       // 비활성
  | 'suspended'      // 정지
  | 'pending'        // 승인대기
  | 'verified';      // 인증완료

// === 확장된 프로필 타입 ===

// 프로필 생성 입력
export interface ProfileCreateInput {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// 프로필 업데이트 입력
export interface ProfileUpdateInput {
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: Address;
  bio?: string;
  role?: UserRole;
  preferences?: UserPreferences;
  emergency_contact?: EmergencyContact;
  professional_info?: ProfessionalInfo;
}

// 사용자 주소 정보
export interface Address {
  street?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_primary?: boolean;
}

// 비상 연락처
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone_number: string;
  email?: string;
}

// 전문가 정보
export interface ProfessionalInfo {
  occupation?: string;
  organization?: string;
  license_number?: string;
  years_of_experience?: number;
  specialization?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issue_date: string;
    expiry_date?: string;
    certificate_id?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_year: number;
  }>;
}

// 농장과 함께하는 확장된 프로필
export interface ProfileWithFarms extends Profile {
  farms: Farm[];
  farm_count: number;
  role: UserRole;
  status: UserStatus;
  last_login?: Date | string;
  subscription?: UserSubscription;
}

// === 구독 및 결제 ===

// 사용자 구독 정보
export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: Date | string;
  expires_at: Date | string;
  auto_renew: boolean;
  payment_method?: PaymentMethod;
  billing_cycle: 'monthly' | 'yearly';
  features: SubscriptionFeatures;
  usage: SubscriptionUsage;
}

// 결제 방법
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';
  last_four?: string;
  brand?: string;
  is_default: boolean;
  expires_at?: string;
}

// 구독 기능
export interface SubscriptionFeatures {
  max_farms: number;
  max_crops_per_farm: number;
  weather_alerts: boolean;
  ai_recommendations: boolean;
  historical_data_years: number;
  api_access: boolean;
  premium_support: boolean;
  custom_reports: boolean;
  data_export: boolean;
  mobile_app: boolean;
}

// 구독 사용량
export interface SubscriptionUsage {
  current_farms: number;
  current_crops: number;
  api_calls_this_month: number;
  storage_used_mb: number;
  reports_generated_this_month: number;
}

// === 권한 및 보안 ===

// 사용자 권한
export interface UserPermissions {
  farms: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  crops: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  weather: {
    read: boolean;
    manage_alerts: boolean;
  };
  reports: {
    create: boolean;
    export: boolean;
  };
  admin: {
    manage_users: boolean;
    system_settings: boolean;
    analytics: boolean;
  };
}

// 로그인 세션
export interface UserSession {
  user_id: string;
  session_id: string;
  device_info: {
    device_type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    ip_address: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
  created_at: Date | string;
  last_activity: Date | string;
  expires_at: Date | string;
  is_active: boolean;
}

// 사용자 활동 로그
export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: UserActivityType;
  activity_description: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date | string;
  metadata?: Record<string, any>;
}

export type UserActivityType = 
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'farm_create'
  | 'farm_update'
  | 'farm_delete'
  | 'crop_create'
  | 'crop_update'
  | 'crop_delete'
  | 'report_generate'
  | 'settings_change'
  | 'password_change'
  | 'subscription_change';

// === 알림 설정 ===

// 알림 타입
export type NotificationType = 
  | 'weather_alert'
  | 'crop_reminder'
  | 'harvest_ready'
  | 'activity_due'
  | 'system_update'
  | 'subscription_expiry'
  | 'security_alert';

// 알림 설정
export interface NotificationSettings {
  user_id: string;
  notification_types: Record<NotificationType, {
    enabled: boolean;
    email: boolean;
    push: boolean;
    sms?: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly';
  }>;
  quiet_hours?: {
    enabled: boolean;
    start_time: string; // HH:MM
    end_time: string;   // HH:MM
    timezone: string;
  };
  language: string;
  updated_at: Date | string;
}

// 사용자 알림
export interface UserNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  delivery_channels: Array<'email' | 'push' | 'sms' | 'in_app'>;
  created_at: Date | string;
  scheduled_for?: Date | string;
  sent_at?: Date | string;
  read_at?: Date | string;
  expires_at?: Date | string;
}

// === 팀 및 공유 ===

// 팀 (농장 공유)
export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

// 팀 멤버
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  permissions: TeamPermissions;
  invited_at: Date | string;
  joined_at?: Date | string;
  status: 'pending' | 'active' | 'suspended';
}

export type TeamRole = 
  | 'owner'
  | 'admin'
  | 'editor'
  | 'viewer';

// 팀 권한
export interface TeamPermissions {
  farm_access: string[]; // farm IDs
  can_invite: boolean;
  can_edit_crops: boolean;
  can_add_activities: boolean;
  can_view_reports: boolean;
  can_manage_settings: boolean;
}

// === 필터링 및 쿼리 옵션 ===

// 사용자 필터
export interface UserFilter extends BaseFilter {
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  subscription_plan?: SubscriptionPlan | SubscriptionPlan[];
  subscription_status?: SubscriptionStatus | SubscriptionStatus[];
  has_farms?: boolean;
  last_login_after?: Date | string;
  last_login_before?: Date | string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

// 알림 필터
export interface NotificationFilter extends BaseFilter {
  user_id?: string;
  type?: NotificationType | NotificationType[];
  is_read?: boolean;
  is_sent?: boolean;
  scheduled_after?: Date | string;
  scheduled_before?: Date | string;
}

// 정렬 옵션
export type UserSortField = 'created_at' | 'updated_at' | 'full_name' | 'email' | 'last_login';
export type NotificationSortField = 'created_at' | 'scheduled_for' | 'sent_at' | 'read_at';

export type UserSortOption = SortOption<UserSortField>;
export type NotificationSortOption = SortOption<NotificationSortField>;

// === 사용자 통계 ===

// 사용자 대시보드 통계
export interface UserDashboardStats {
  farms_count: number;
  crops_count: number;
  active_crops: number;
  upcoming_harvests: number;
  unread_notifications: number;
  weather_alerts_today: number;
  recent_activities: number;
  subscription_days_remaining?: number;
}

// 사용자 사용 패턴
export interface UserUsageStats {
  login_frequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  feature_usage: Record<string, number>;
  most_active_hours: number[]; // 0-23
  device_preferences: Record<string, number>;
  location_sessions: Record<string, number>;
}

// === 온보딩 및 헬프 ===

// 온보딩 상태
export interface OnboardingState {
  user_id: string;
  is_completed: boolean;
  current_step: number;
  total_steps: number;
  completed_steps: string[];
  skipped_steps: string[];
  started_at: Date | string;
  completed_at?: Date | string;
}

// 사용자 피드백
export interface UserFeedback {
  id: string;
  user_id: string;
  type: 'bug_report' | 'feature_request' | 'general' | 'compliment';
  title: string;
  description: string;
  rating?: number; // 1-5
  category?: string;
  page_url?: string;
  device_info?: Record<string, any>;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: Date | string;
  updated_at: Date | string;
}