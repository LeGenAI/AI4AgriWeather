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
 * 지역별 날씨 데이터 조회 (기간별)
 */
export const getWeatherData = async (
  locationName: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherData[]> => {
  try {
    let query = supabase
      .from('weather_data')
      .select('*')
      .eq('location_name', locationName)
      .order('recorded_at', { ascending: false });

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error in getWeatherData:', error);
      return [];
    }

    // Convert string numbers to actual numbers
    const convertedData = (data || []).map(item => ({
      ...item,
      temperature: item.temperature ? parseFloat(item.temperature) : null,
      humidity: item.humidity ? parseFloat(item.humidity) : null,
      pressure: item.pressure ? parseFloat(item.pressure) : null,
      wind_speed: item.wind_speed ? parseFloat(item.wind_speed) : null,
      wind_direction: item.wind_direction ? parseInt(item.wind_direction) : null,
      precipitation: item.precipitation ? parseFloat(item.precipitation) : null,
      feels_like: item.feels_like ? parseFloat(item.feels_like) : null,
      visibility: item.visibility ? parseInt(item.visibility) : null,
      cloudiness: item.cloudiness ? parseInt(item.cloudiness) : null,
      latitude: item.latitude ? parseFloat(item.latitude) : null,
      longitude: item.longitude ? parseFloat(item.longitude) : null,
    }));

    return convertedData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Always return an array to prevent .map errors
    return [];
  }
};

/**
 * 농장의 날씨 데이터 조회 (기간별)
 * @deprecated Use getWeatherData with locationName instead
 */
export const getWeatherDataByFarmId = async (
  farmId: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherData[]> => {
  // For backward compatibility, could map farmId to location
  // For now, return empty array
  return [];
};

/**
 * 최신 날씨 데이터 조회
 */
export const getLatestWeatherData = async (locationName: string): Promise<WeatherData | null> => {
  try {
    console.log('=== Fetching latest weather data ===');
    console.log('Location:', locationName);
    console.log('Timestamp:', new Date().toISOString());
    
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('location_name', locationName)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    console.log('=== Weather data received ===');
    console.log('Raw data:', JSON.stringify(data, null, 2));
    console.log('Recorded at:', data?.recorded_at);
    console.log('Temperature:', data?.temperature);
    console.log('Weather condition:', data?.weather_condition);
    
    // Convert string numbers to actual numbers
    if (data) {
      const convertedData = {
        ...data,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        humidity: data.humidity ? parseFloat(data.humidity) : null,
        pressure: data.pressure ? parseFloat(data.pressure) : null,
        wind_speed: data.wind_speed ? parseFloat(data.wind_speed) : null,
        wind_direction: data.wind_direction ? parseInt(data.wind_direction) : null,
        precipitation: data.precipitation ? parseFloat(data.precipitation) : null,
        feels_like: data.feels_like ? parseFloat(data.feels_like) : null,
        visibility: data.visibility ? parseInt(data.visibility) : null,
        cloudiness: data.cloudiness ? parseInt(data.cloudiness) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
      };
      console.log('=== Converted data ===');
      console.log('Converted temperature:', convertedData.temperature);
      console.log('Converted humidity:', convertedData.humidity);
      return convertedData;
    }
    return data;
  } catch (error) {
    console.error('Error fetching latest weather data:', error);
    return null;
  }
};

/**
 * 모든 위치의 최신 날씨 데이터 조회
 */
export const getAllLocationsLatestWeather = async (): Promise<WeatherData[]> => {
  try {
    console.log('=== Fetching all locations weather data ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get distinct locations with their latest weather data
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .order('location_name')
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Supabase error in getAllLocations:', error);
      return [];
    }

    console.log('Total records received:', data?.length);

    // Group by location and get the latest record for each
    const latestByLocation = new Map<string, WeatherData>();
    
    data?.forEach(record => {
      if (!latestByLocation.has(record.location_name)) {
        console.log(`Latest for ${record.location_name}:`, {
          recorded_at: record.recorded_at,
          temperature: record.temperature,
          weather_condition: record.weather_condition
        });
        latestByLocation.set(record.location_name, record);
      }
    });

    const result = Array.from(latestByLocation.values()).map(data => ({
      ...data,
      temperature: data.temperature ? parseFloat(data.temperature) : null,
      humidity: data.humidity ? parseFloat(data.humidity) : null,
      pressure: data.pressure ? parseFloat(data.pressure) : null,
      wind_speed: data.wind_speed ? parseFloat(data.wind_speed) : null,
      wind_direction: data.wind_direction ? parseInt(data.wind_direction) : null,
      precipitation: data.precipitation ? parseFloat(data.precipitation) : null,
      feels_like: data.feels_like ? parseFloat(data.feels_like) : null,
      visibility: data.visibility ? parseInt(data.visibility) : null,
      cloudiness: data.cloudiness ? parseInt(data.cloudiness) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    }));
    
    console.log('=== Final grouped locations ===');
    result.forEach(loc => {
      console.log(`${loc.location_name}: ${loc.temperature}°C at ${loc.recorded_at}`);
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching all locations weather:', error);
    return [];
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
  locationName: string,
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
      locationName,
      startDate.toISOString(),
      new Date().toISOString()
    );

    // Ensure weatherData is an array
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
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
        acc.totalRainfall += data.precipitation || 0;  // Fixed: use precipitation field
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
    // Return default values on error
    return {
      avgTemperature: 0,
      totalRainfall: 0,
      avgHumidity: 0,
      avgWindSpeed: 0,
      maxTemperature: 0,
      minTemperature: 0,
    };
  }
};

/**
 * 사용 가능한 모든 위치 목록 조회
 */
export const getAvailableLocations = async (): Promise<string[]> => {
  try {
    console.log('Fetching available locations...');
    
    const { data, error } = await supabase
      .from('weather_data')
      .select('location_name')
      .order('location_name');

    if (error) {
      console.error('Supabase error in getAvailableLocations:', error);
      return [];
    }

    console.log('Location data received:', data?.length, 'records');

    // Get unique location names
    const uniqueLocations = [...new Set(data?.map(item => item.location_name) || [])];
    console.log('Unique locations:', uniqueLocations);
    return uniqueLocations;
  } catch (error) {
    console.error('Error fetching available locations:', error);
    return [];
  }
};

/**
 * 위치별 실시간 날씨 데이터 구독
 */
export const subscribeToWeatherUpdates = (
  locationName: string,
  callback: (data: WeatherData) => void
) => {
  const subscription = supabase
    .channel('weather-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'weather_data',
        filter: `location_name=eq.${locationName}`
      },
      (payload) => {
        callback(payload.new as WeatherData);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};