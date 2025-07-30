/**
 * Crop API 서비스
 * 작물 관리 관련 CRUD 작업을 위한 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import type { Database } from '@/integrations/supabase/types';

type Crop = Database['public']['Tables']['crops']['Row'];
type CropInsert = Database['public']['Tables']['crops']['Insert'];
type CropUpdate = Database['public']['Tables']['crops']['Update'];

type FarmActivity = Database['public']['Tables']['farm_activities']['Row'];
type FarmActivityInsert = Database['public']['Tables']['farm_activities']['Insert'];

/**
 * 농장의 작물 목록 조회
 */
export const getCrops = async (farmId: string): Promise<Crop[]> => {
  try {
    const crops = await safeApiCall(async () =>
      supabase
        .from('crops')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false })
    );

    return crops || [];
  } catch (error) {
    console.error('Error fetching crops:', error);
    handleApiError(error);
  }
};

/**
 * 특정 작물 조회
 */
export const getCrop = async (id: string): Promise<Crop> => {
  try {
    const crop = await safeApiCall(async () =>
      supabase
        .from('crops')
        .select('*')
        .eq('id', id)
        .single()
    );

    return crop;
  } catch (error) {
    console.error('Error fetching crop:', error);
    handleApiError(error);
  }
};

/**
 * 작물 생성
 */
export const createCrop = async (data: CropInsert): Promise<Crop> => {
  try {
    const crop = await safeApiCall(async () =>
      supabase
        .from('crops')
        .insert(data)
        .select()
        .single()
    );

    return crop;
  } catch (error) {
    console.error('Error creating crop:', error);
    handleApiError(error);
  }
};

/**
 * 작물 업데이트
 */
export const updateCrop = async (
  id: string,
  updates: CropUpdate
): Promise<Crop> => {
  try {
    const crop = await safeApiCall(async () =>
      supabase
        .from('crops')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    );

    return crop;
  } catch (error) {
    console.error('Error updating crop:', error);
    handleApiError(error);
  }
};

/**
 * 작물 삭제
 */
export const deleteCrop = async (id: string): Promise<void> => {
  try {
    await safeApiCall(async () =>
      supabase
        .from('crops')
        .delete()
        .eq('id', id)
    );
  } catch (error) {
    console.error('Error deleting crop:', error);
    handleApiError(error);
  }
};

/**
 * 작물 성장 단계 업데이트
 */
export const updateCropGrowthStage = async (
  id: string,
  growthStage: string
): Promise<Crop> => {
  try {
    return await updateCrop(id, { growth_stage: growthStage });
  } catch (error) {
    console.error('Error updating crop growth stage:', error);
    handleApiError(error);
  }
};

/**
 * 작물 건강 상태 업데이트
 */
export const updateCropHealthStatus = async (
  id: string,
  healthStatus: string
): Promise<Crop> => {
  try {
    return await updateCrop(id, { health_status: healthStatus });
  } catch (error) {
    console.error('Error updating crop health status:', error);
    handleApiError(error);
  }
};

/**
 * 작물 활동 기록 조회
 */
export const getCropActivities = async (cropId: string): Promise<FarmActivity[]> => {
  try {
    const activities = await safeApiCall(async () =>
      supabase
        .from('farm_activities')
        .select('*')
        .eq('crop_id', cropId)
        .order('date', { ascending: false })
    );

    return activities || [];
  } catch (error) {
    console.error('Error fetching crop activities:', error);
    handleApiError(error);
  }
};

/**
 * 작물 활동 기록 추가
 */
export const addCropActivity = async (
  data: FarmActivityInsert
): Promise<FarmActivity> => {
  try {
    const activity = await safeApiCall(async () =>
      supabase
        .from('farm_activities')
        .insert(data)
        .select()
        .single()
    );

    return activity;
  } catch (error) {
    console.error('Error adding crop activity:', error);
    handleApiError(error);
  }
};

/**
 * 농장의 모든 작물 통계 조회
 */
export const getCropStatistics = async (farmId: string) => {
  try {
    const crops = await getCrops(farmId);
    
    const statistics = {
      totalCrops: crops.length,
      totalArea: crops.reduce((sum, crop) => sum + (crop.area_hectares || 0), 0),
      byHealthStatus: {} as Record<string, number>,
      byGrowthStage: {} as Record<string, number>,
      byCropType: {} as Record<string, number>,
    };

    crops.forEach(crop => {
      // 건강 상태별 집계
      if (crop.health_status) {
        statistics.byHealthStatus[crop.health_status] = 
          (statistics.byHealthStatus[crop.health_status] || 0) + 1;
      }

      // 성장 단계별 집계
      if (crop.growth_stage) {
        statistics.byGrowthStage[crop.growth_stage] = 
          (statistics.byGrowthStage[crop.growth_stage] || 0) + 1;
      }

      // 작물 종류별 집계
      statistics.byCropType[crop.name] = 
        (statistics.byCropType[crop.name] || 0) + 1;
    });

    return statistics;
  } catch (error) {
    console.error('Error fetching crop statistics:', error);
    handleApiError(error);
  }
};