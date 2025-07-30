/**
 * Weather API 서비스
 * 날씨 데이터 관련 CRUD 작업을 위한 API 서비스
 */

import { safeApiCall, handleApiError, supabase } from '@/services/core/apiClient';
import type { Database } from '@/integrations/supabase/types';

type WeatherData = Database['public']['Tables']['weather_data']['Row'];
type WeatherDataInsert = Database['public']['Tables']['weather_data']['Insert'];
type WeatherAlert = Database['public']['Tables']['weather_alerts']['Row'];
type WeatherAlertInsert = Database['public']['Tables']['weather_alerts']['Insert'];

/**
 * 농장의 날씨 데이터 조회 (기간별)
 */
export const getWeatherData = async (
  farmId: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherData[]> => {
  try {
    let query = supabase
      .from('weather_data')
      .select('*')
      .eq('farm_id', farmId)
      .order('recorded_at', { ascending: false });

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const weatherData = await safeApiCall(async () => query);

    return weatherData || [];
  } catch (error) {
    console.error('Error fetching weather data:', error);
    handleApiError(error);
  }
};

/**
 * 최신 날씨 데이터 조회
 */
export const getLatestWeatherData = async (farmId: string): Promise<WeatherData | null> => {
  try {
    const data = await safeApiCall(async () =>
      supabase
        .from('weather_data')
        .select('*')
        .eq('farm_id', farmId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()
    );

    return data;
  } catch (error) {
    console.error('Error fetching latest weather data:', error);
    return null;
  }
};

/**
 * 날씨 데이터 기록
 */
export const recordWeatherData = async (data: WeatherDataInsert): Promise<WeatherData> => {
  try {
    const weatherData = await safeApiCall(async () =>
      supabase
        .from('weather_data')
        .insert(data)
        .select()
        .single()
    );

    return weatherData;
  } catch (error) {
    console.error('Error recording weather data:', error);
    handleApiError(error);
  }
};

/**
 * 날씨 데이터 일괄 기록
 */
export const recordWeatherDataBatch = async (
  dataArray: WeatherDataInsert[]
): Promise<WeatherData[]> => {
  try {
    const weatherData = await safeApiCall(async () =>
      supabase
        .from('weather_data')
        .insert(dataArray)
        .select()
    );

    return weatherData || [];
  } catch (error) {
    console.error('Error recording weather data batch:', error);
    handleApiError(error);
  }
};

/**
 * 날씨 알림 조회
 */
export const getWeatherAlerts = async (
  farmId: string,
  active?: boolean
): Promise<WeatherAlert[]> => {
  try {
    let query = supabase
      .from('weather_alerts')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active);
    }

    const alerts = await safeApiCall(async () => query);

    return alerts || [];
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    handleApiError(error);
  }
};

/**
 * 날씨 알림 생성
 */
export const createWeatherAlert = async (data: WeatherAlertInsert): Promise<WeatherAlert> => {
  try {
    const alert = await safeApiCall(async () =>
      supabase
        .from('weather_alerts')
        .insert(data)
        .select()
        .single()
    );

    return alert;
  } catch (error) {
    console.error('Error creating weather alert:', error);
    handleApiError(error);
  }
};

/**
 * 날씨 알림 비활성화
 */
export const deactivateWeatherAlert = async (id: string): Promise<void> => {
  try {
    await safeApiCall(async () =>
      supabase
        .from('weather_alerts')
        .update({ is_active: false })
        .eq('id', id)
    );
  } catch (error) {
    console.error('Error deactivating weather alert:', error);
    handleApiError(error);
  }
};

/**
 * 날씨 통계 조회
 */
export const getWeatherStatistics = async (
  farmId: string,
  days: number = 7
): Promise<{
  avgTemperature: number;
  totalRainfall: number;
  avgHumidity: number;
  avgWindSpeed: number;
  maxTemperature: number;
  minTemperature: number;
}> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const weatherData = await getWeatherData(
      farmId,
      startDate.toISOString(),
      new Date().toISOString()
    );

    if (weatherData.length === 0) {
      return {
        avgTemperature: 0,
        totalRainfall: 0,
        avgHumidity: 0,
        avgWindSpeed: 0,
        maxTemperature: 0,
        minTemperature: 0,
      };
    }

    const statistics = weatherData.reduce(
      (acc, data) => {
        acc.sumTemperature += data.temperature || 0;
        acc.totalRainfall += data.rainfall || 0;
        acc.sumHumidity += data.humidity || 0;
        acc.sumWindSpeed += data.wind_speed || 0;
        acc.maxTemperature = Math.max(acc.maxTemperature, data.temperature || 0);
        acc.minTemperature = Math.min(acc.minTemperature, data.temperature || Infinity);
        return acc;
      },
      {
        sumTemperature: 0,
        totalRainfall: 0,
        sumHumidity: 0,
        sumWindSpeed: 0,
        maxTemperature: -Infinity,
        minTemperature: Infinity,
      }
    );

    const count = weatherData.length;

    return {
      avgTemperature: Math.round(statistics.sumTemperature / count * 10) / 10,
      totalRainfall: Math.round(statistics.totalRainfall * 10) / 10,
      avgHumidity: Math.round(statistics.sumHumidity / count * 10) / 10,
      avgWindSpeed: Math.round(statistics.sumWindSpeed / count * 10) / 10,
      maxTemperature: statistics.maxTemperature === -Infinity ? 0 : statistics.maxTemperature,
      minTemperature: statistics.minTemperature === Infinity ? 0 : statistics.minTemperature,
    };
  } catch (error) {
    console.error('Error fetching weather statistics:', error);
    handleApiError(error);
  }
};

/**
 * 외부 날씨 API에서 데이터 가져오기 (예시)
 */
export const fetchExternalWeatherData = async (
  latitude: number,
  longitude: number
): Promise<{
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
}> => {
  try {
    // 여기에 실제 외부 날씨 API 호출 로직을 구현
    // 예: OpenWeatherMap, Weather API 등
    
    // 임시 데이터 반환
    return {
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      rainfall: Math.random() * 10,
      windSpeed: Math.random() * 20,
      description: '맑음',
    };
  } catch (error) {
    console.error('Error fetching external weather data:', error);
    handleApiError(error);
  }
};