import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
}

interface WeatherSummaryCardProps {
  weather: WeatherData;
}

export function WeatherSummaryCard({ weather }: WeatherSummaryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 weather-sunny">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('weather.current')}</span>
          <Link to="/weather" className="text-sm font-normal text-blue-600 hover:underline">
            View Details →
          </Link>
        </CardTitle>
        <CardDescription>
          {t('dashboard.quickWeather')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Thermometer className="h-4 w-4" />
              <span className="text-sm">{t('dashboard.temperature')}</span>
            </div>
            <p className="text-2xl font-bold">{weather.temperature}°C</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">{t('dashboard.humidity')}</span>
            </div>
            <p className="text-2xl font-bold">{weather.humidity}%</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Cloud className="h-4 w-4" />
              <span className="text-sm">{t('dashboard.rainfall')}</span>
            </div>
            <p className="text-2xl font-bold">{weather.rainfall}mm</p>
          </div>
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-600 mb-1">
              <Wind className="h-4 w-4" />
              <span className="text-sm">{t('dashboard.windSpeed')}</span>
            </div>
            <p className="text-2xl font-bold">{weather.windSpeed}km/h</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}