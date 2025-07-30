/**
 * 파일 스토리지 서비스
 * Supabase Storage 작업을 중앙화
 */

import { supabase, safeApiCall, ApiError } from './apiClient';

export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
  contentType?: string;
}

export interface FileUploadResult {
  path: string;
  fullPath: string;
  id: string;
}

export interface FileDownloadOptions {
  bucket: string;
  path: string;
  download?: boolean;
}

/**
 * 파일 업로드
 */
export const uploadFile = async (options: FileUploadOptions): Promise<FileUploadResult> => {
  const { bucket, path, file, upsert = false, contentType } = options;

  const uploadOptions: any = {
    upsert,
  };

  if (contentType) {
    uploadOptions.contentType = contentType;
  }

  const result = await safeApiCall(async () => {
    return await supabase.storage
      .from(bucket)
      .upload(path, file, uploadOptions);
  });

  return {
    path: result.path,
    fullPath: result.fullPath || `${bucket}/${path}`,
    id: result.id,
  };
};

/**
 * 파일 다운로드 URL 생성
 */
export const getFileUrl = async (options: FileDownloadOptions): Promise<string> => {
  const { bucket, path, download = false } = options;

  const result = await safeApiCall(async () => {
    if (download) {
      return await supabase.storage.from(bucket).download(path);
    } else {
      return await supabase.storage.from(bucket).createSignedUrl(path, 3600); // 1시간 유효
    }
  });

  if (download) {
    return URL.createObjectURL(result);
  }

  return result.signedUrl;
};

/**
 * 파일 삭제
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  await safeApiCall(async () => {
    return await supabase.storage.from(bucket).remove([path]);
  });
};

/**
 * 파일 목록 조회
 */
export const listFiles = async (
  bucket: string, 
  path?: string,
  options?: { limit?: number; offset?: number }
): Promise<any[]> => {
  return await safeApiCall(async () => {
    return await supabase.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit,
        offset: options?.offset,
      });
  });
};

/**
 * 파일 정보 조회
 */
export const getFileInfo = async (bucket: string, path: string) => {
  return await safeApiCall(async () => {
    return await supabase.storage.from(bucket).list(path);
  });
};

/**
 * 파일 크기 및 타입 검증
 */
export const validateFile = (
  file: File, 
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): void => {
  const { maxSize = 50 * 1024 * 1024, allowedTypes } = options; // 기본 50MB

  if (file.size > maxSize) {
    throw new ApiError(
      `File size exceeds limit. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      'FILE_TOO_LARGE'
    );
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    throw new ApiError(
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      'FILE_TYPE_NOT_ALLOWED'
    );
  }
};

/**
 * 파일명 안전화 (한글 및 특수문자 처리)
 */
export const sanitizeFileName = (fileName: string, keepExtension = true): string => {
  const extension = keepExtension ? fileName.substring(fileName.lastIndexOf('.')) : '';
  const name = keepExtension ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
  
  // 한글, 영문, 숫자, 하이픈, 언더스코어만 허용
  const sanitized = name
    .replace(/[^\w가-힣\-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

  return sanitized + extension;
};

/**
 * 고유한 파일 경로 생성
 */
export const generateUniqueFilePath = (
  notebookId: string, 
  originalFileName: string
): string => {
  const sanitizedName = sanitizeFileName(originalFileName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${notebookId}/${timestamp}_${randomSuffix}_${sanitizedName}`;
};