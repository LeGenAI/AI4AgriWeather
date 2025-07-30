/**
 * Profile API 서비스
 * 사용자 프로필 관련 CRUD 작업을 위한 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * 사용자 프로필 조회
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const profile = await safeApiCall(async () =>
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    );

    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    // 프로필이 없을 수도 있으므로 null 반환
    return null;
  }
};

/**
 * 프로필 생성
 */
export const createProfile = async (data: ProfileInsert): Promise<Profile> => {
  try {
    const profile = await safeApiCall(async () =>
      supabase
        .from('profiles')
        .insert(data)
        .select()
        .single()
    );

    return profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    handleApiError(error);
  }
};

/**
 * 프로필 업데이트
 */
export const updateProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> => {
  try {
    const profile = await safeApiCall(async () =>
      supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    );

    return profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    handleApiError(error);
  }
};

/**
 * 프로필 생성 또는 업데이트 (upsert)
 */
export const upsertProfile = async (data: ProfileInsert): Promise<Profile> => {
  try {
    const profile = await safeApiCall(async () =>
      supabase
        .from('profiles')
        .upsert(data)
        .select()
        .single()
    );

    return profile;
  } catch (error) {
    console.error('Error upserting profile:', error);
    handleApiError(error);
  }
};

/**
 * 프로필 삭제
 */
export const deleteProfile = async (userId: string): Promise<void> => {
  try {
    await safeApiCall(async () =>
      supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
    );
  } catch (error) {
    console.error('Error deleting profile:', error);
    handleApiError(error);
  }
};

/**
 * 프로필 사진 업로드
 */
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // 스토리지에 파일 업로드
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 프로필 업데이트
    await updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    handleApiError(error);
  }
};

/**
 * 프로필 사진 삭제
 */
export const deleteProfilePhoto = async (userId: string): Promise<void> => {
  try {
    const profile = await getProfile(userId);
    
    if (profile?.avatar_url) {
      // URL에서 파일 경로 추출
      const urlParts = profile.avatar_url.split('/');
      const fileName = urlParts.slice(-2).join('/');

      // 스토리지에서 파일 삭제
      await safeApiCall(async () =>
        supabase.storage
          .from('avatars')
          .remove([fileName])
      );

      // 프로필 업데이트
      await updateProfile(userId, { avatar_url: null });
    }
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    handleApiError(error);
  }
};