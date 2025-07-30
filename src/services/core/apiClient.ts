/**
 * 공통 API 클라이언트 설정
 * 모든 Supabase API 호출의 중앙 집중화
 */

import { supabase } from '@/integrations/supabase/client';

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 공통 에러 처리 함수
 */
export const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  
  if (error.code) {
    throw new ApiError(error.message || 'API request failed', error.code, error.details);
  }
  
  throw new ApiError(error.message || 'Unknown API error');
};

/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: ApiError;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/**
 * 안전한 API 호출 래퍼
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error('SafeApiCall error:', error);
    handleApiError(error);
    throw error; // handleApiError가 throw하지만 명시적으로 한번 더
  }
};

/**
 * Supabase 클라이언트 인스턴스 export
 */
export { supabase };

/**
 * 공통 쿼리 옵션
 */
export const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5분
  gcTime: 10 * 60 * 1000,   // 10분 (이전 cacheTime)
  retry: 1,
  refetchOnWindowFocus: false,
} as const;