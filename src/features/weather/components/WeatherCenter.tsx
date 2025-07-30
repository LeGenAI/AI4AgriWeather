import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useQuery } from '@tanstack/react-query';
import { 
  getLatestWeatherData, 
  getWeatherData, 
  getAllLocationsLatestWeather,
  getAvailableLocations,
  subscribeToWeatherUpdates,
  getWeatherStatistics
} from '../services/weatherApi';
import { useToast } from '@/shared/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import weatherTranslations from '@/i18n/weather-translations.json';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Info,
  Loader2,
  RefreshCw,
  Waves,
  Sprout,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function WeatherCenter() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof typeof weatherTranslations.weather;
  const t = weatherTranslations.weather[currentLang] || weatherTranslations.weather.en;

  // Fetch available locations
  const { data: locations = [] } = useQuery({
    queryKey: ['availableLocations'],
    queryFn: getAvailableLocations,
    staleTime: 5 * 60 * 1000,
  });

  // Set default location when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0]);
    }
  }, [locations, selectedLocation]);

  // Fetch latest weather data for selected location
  const { 
    data: currentWeather, 
    isLoading: isLoadingCurrent, 
    refetch: refetchCurrent,
    isRefetching: isRefetchingCurrent 
  } = useQuery({
    queryKey: ['latestWeather', selectedLocation],
    queryFn: () => getLatestWeatherData(selectedLocation),
    enabled: !!selectedLocation,
    refetchInterval: 30 * 60 * 1000,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  });

  // Fetch historical weather data for charts (last 24 hours)
  const { 
    data: historicalData = [], 
    isLoading: isLoadingHistorical,
    refetch: refetchHistorical,
    isRefetching: isRefetchingHistorical
  } = useQuery({
    queryKey: ['historicalWeather', selectedLocation],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
      return getWeatherData(selectedLocation, startDate.toISOString(), endDate.toISOString());
    },
    enabled: !!selectedLocation,
  });

  // Fetch weekly weather statistics
  const { 
    data: weeklyStats,
    refetch: refetchStats,
    isRefetching: isRefetchingStats
  } = useQuery({
    queryKey: ['weeklyStats', selectedLocation],
    queryFn: () => getWeatherStatistics(selectedLocation, 7),
    enabled: !!selectedLocation,
  });

  // Fetch all locations latest weather for overview
  const { 
    data: allLocationsWeather = [],
    refetch: refetchAllLocations,
    isRefetching: isRefetchingAllLocations
  } = useQuery({
    queryKey: ['allLocationsWeather'],
    queryFn: getAllLocationsLatestWeather,
    refetchInterval: 30 * 60 * 1000,
  });

  // Subscribe to real-time weather updates
  useEffect(() => {
    if (!selectedLocation) return;

    const unsubscribe = subscribeToWeatherUpdates(selectedLocation, (newData) => {
      toast({
        title: "Weather Updated",
        description: `New weather data received for ${selectedLocation}`,
      });
      refetchCurrent();
    });

    return () => unsubscribe();
  }, [selectedLocation, refetchCurrent, toast]);

  // Transform historical data for charts
  const hourlyData = Array.isArray(historicalData) ? historicalData.map((data) => ({
    hour: new Date(data.recorded_at).toLocaleTimeString(currentLang, { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    temperature: parseFloat(data.temperature) || 0,
    humidity: parseFloat(data.humidity) || 0,
    rainfall: parseFloat(data.precipitation) || parseFloat(data.rainfall) || 0,
  })) : [];

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className="h-16 w-16 text-yellow-400" />;
    } else if (conditionLower.includes('rain')) {
      return <CloudRain className="h-16 w-16 text-blue-400" />;
    } else if (conditionLower.includes('cloud')) {
      return <Cloud className="h-16 w-16 text-gray-400" />;
    }
    return <Cloud className="h-16 w-16 text-gray-400" />;
  };

  const getWeatherAdvice = (weather: any) => {
    if (!weather) return t.farmingAdvice.goodConditions;
    
    const temp = parseFloat(weather.temperature) || 0;
    const humidity = parseFloat(weather.humidity) || 0;
    const rainfall = parseFloat(weather.precipitation) || parseFloat(weather.rainfall) || 0;
    const windSpeed = parseFloat(weather.wind_speed) || 0;
    
    if (rainfall > 10) {
      return t.farmingAdvice.heavyRain;
    } else if (temp > 35) {
      return t.farmingAdvice.hotConditions;
    } else if (humidity > 80 && temp > 25) {
      return t.farmingAdvice.highHumidity;
    } else if (temp < 10) {
      return t.farmingAdvice.coldConditions;
    } else if (humidity > 80 && temp < 15) {
      return t.farmingAdvice.coolHumid;
    } else if (windSpeed > 8) {
      return t.farmingAdvice.strongWinds;
    } else {
      return t.farmingAdvice.goodConditions;
    }
  };

  const calculateAgriculturalIndices = (weather: any) => {
    if (!weather) return {
      evapotranspiration: 0,
      soilMoisture: 0,
      uvIndex: 0,
      growingDegreeDays: 0,
    };

    const temp = parseFloat(weather.temperature) || 20;
    const humidity = parseFloat(weather.humidity) || 60;
    const windSpeed = parseFloat(weather.wind_speed) || 2;
    
    // Simple ET calculation (Hargreaves method approximation)
    const et = Math.max(0, 0.0023 * (temp + 17.8) * Math.sqrt(Math.abs(10)) * 0.408);
    
    // Estimate soil moisture based on recent rainfall and humidity
    const rainfall = parseFloat(weather.precipitation) || parseFloat(weather.rainfall) || 0;
    const soilMoisture = Math.min(100, humidity * 0.7 + rainfall * 2);
    
    // UV Index estimation based on time and cloudiness
    const cloudiness = parseFloat(weather.cloudiness) || 0;
    const uvIndex = Math.max(0, Math.min(11, 8 * (1 - cloudiness / 100)));
    
    // Growing Degree Days (base 10°C)
    const gdd = Math.max(0, temp - 10);

    return {
      evapotranspiration: Math.round(et * 10) / 10,
      soilMoisture: Math.round(soilMoisture),
      uvIndex: Math.round(uvIndex),
      growingDegreeDays: Math.round(gdd),
    };
  };

  const agriculturalIndices = calculateAgriculturalIndices(currentWeather);

  // Get location display name with emoji
  const getLocationDisplay = (location: string) => {
    const locationMap: { [key: string]: { name: string, emoji: string } } = {
      'Mbeya,TZ': { name: 'Mbeya, Tanzania', emoji: '🇹🇿' },
      'Seoul,KR': { name: 'Seoul, Korea', emoji: '🇰🇷' },
      'Dar es Salaam,TZ': { name: 'Dar es Salaam, Tanzania', emoji: '🇹🇿' }
    };
    return locationMap[location] || { name: location, emoji: '📍' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <UnifiedHeader variant="full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Conditions */}
        <Card className="mb-6 bg-gradient-to-r from-green-400 to-blue-400 text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold">{t.currentConditions}</h2>
                  <div className="flex items-center gap-2">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-[250px] bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder={t.selectLocation} />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => {
                          const display = getLocationDisplay(location);
                          return (
                            <SelectItem key={location} value={location}>
                              <span className="flex items-center gap-2">
                                <span>{display.emoji}</span>
                                <span>{display.name}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={async () => {
                        console.log('Refreshing all weather data...');
                        
                        // Show loading toast
                        const loadingToast = toast({
                          title: "Refreshing Weather Data",
                          description: "Updating all weather information...",
                          duration: 60000, // Long duration, will dismiss manually
                        });
                        
                        try {
                          // Refresh all queries in parallel
                          await Promise.all([
                            refetchCurrent(),
                            refetchHistorical(),
                            refetchStats(),
                            refetchAllLocations()
                          ]);
                          
                          // Dismiss loading toast and show success
                          loadingToast.dismiss();
                          toast({
                            title: "Weather Updated Successfully",
                            description: `All weather data has been refreshed for ${getLocationDisplay(selectedLocation).name}`,
                            duration: 3000,
                          });
                        } catch (error) {
                          console.error('Error refreshing weather data:', error);
                          loadingToast.dismiss();
                          toast({
                            title: "Update Failed",
                            description: "Unable to refresh weather data. Please try again.",
                            variant: "destructive",
                            duration: 5000,
                          });
                        }
                      }}
                      disabled={isLoadingCurrent || isRefetchingCurrent || isRefetchingHistorical || isRefetchingStats || isRefetchingAllLocations}
                    >
                      <RefreshCw className={`h-4 w-4 ${(isRefetchingCurrent || isRefetchingHistorical || isRefetchingStats || isRefetchingAllLocations) ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                {isLoadingCurrent ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : currentWeather ? (
                  <>
                    <div className="flex items-center space-x-4 mb-4">
                      {getWeatherIcon(currentWeather.weather_condition || '')}
                      <div>
                        <p className="text-5xl font-bold">
                          {currentWeather.temperature != null ? Math.round(currentWeather.temperature) : 'N/A'}°C
                        </p>
                        <p className="text-lg">
                          {currentWeather.weather_description || currentWeather.weather_condition || 'N/A'}
                        </p>
                        <p className="text-xs opacity-75">
                          Updated: {new Date(currentWeather.recorded_at).toLocaleString(currentLang)}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur">
                      <p className="text-sm font-medium">{t.farmingAdvice.title || 'Today\'s Farming Advice'}</p>
                      <p className="text-sm mt-1">{getWeatherAdvice(currentWeather)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-90">No weather data available</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">{t.humidity}</span>
                  </div>
                  <p className="text-xl font-semibold">{currentWeather?.humidity != null ? Math.round(currentWeather.humidity) : 'N/A'}%</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm">{t.windSpeed}</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {currentWeather?.wind_speed != null ? Math.round(currentWeather.wind_speed * 3.6) : 'N/A'} km/h
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{t.visibility}</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {currentWeather?.visibility != null ? `${(currentWeather.visibility / 1000).toFixed(1)} km` : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Gauge className="h-4 w-4" />
                    <span className="text-sm">{t.pressure}</span>
                  </div>
                  <p className="text-xl font-semibold">{currentWeather?.pressure != null ? Math.round(currentWeather.pressure) : 'N/A'} mb</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Indices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              {t.agriculturalIndices}
            </CardTitle>
            <CardDescription>
              Key metrics for farming decisions based on current weather
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Waves className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600 mb-1">{t.evapotranspiration}</p>
                <p className="text-2xl font-bold text-green-700">
                  {agriculturalIndices.evapotranspiration} mm/day
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {agriculturalIndices.evapotranspiration > 5 ? t.highWaterLoss : t.moderateWaterLoss}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600 mb-1">{t.soilMoisture}</p>
                <p className="text-2xl font-bold text-blue-700">
                  {agriculturalIndices.soilMoisture}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {agriculturalIndices.soilMoisture > 60 ? t.goodForPlanting : t.needsIrrigation}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Sun className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-gray-600 mb-1">{t.uvIndex}</p>
                <p className="text-2xl font-bold text-orange-700">
                  {agriculturalIndices.uvIndex}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {agriculturalIndices.uvIndex > 7 ? 'Very High' : 
                   agriculturalIndices.uvIndex > 5 ? 'High' : 'Moderate'}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">{t.growingDegreeDays}</p>
                <p className="text-2xl font-bold text-purple-700">
                  {agriculturalIndices.growingDegreeDays}°C
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.accumulatedToday}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">{t.irrigationRecommendation}</p>
                <p>
                  {agriculturalIndices.soilMoisture < 40 
                    ? t.irrigationAdvice.critical
                    : agriculturalIndices.soilMoisture < 60
                    ? t.irrigationAdvice.soon
                    : t.irrigationAdvice.adequate
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Statistics Summary */}
        {weeklyStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t.weeklyStats}</CardTitle>
              <CardDescription>
                Weather statistics for the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.avgTemperature}</p>
                  <p className="text-xl font-semibold">{weeklyStats.avgTemperature}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.maxTemperature}</p>
                  <p className="text-xl font-semibold text-red-600">{weeklyStats.maxTemperature}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.minTemperature}</p>
                  <p className="text-xl font-semibold text-blue-600">{weeklyStats.minTemperature}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.totalRainfall}</p>
                  <p className="text-xl font-semibold">{weeklyStats.totalRainfall}mm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.avgHumidity}</p>
                  <p className="text-xl font-semibold">{weeklyStats.avgHumidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{t.avgWindSpeed}</p>
                  <p className="text-xl font-semibold">{Math.round(weeklyStats.avgWindSpeed * 3.6)} km/h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forecast Tabs */}
        <Tabs defaultValue="hourly" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="hourly">{t.hourHistory}</TabsTrigger>
            <TabsTrigger value="locations">{t.allLocations}</TabsTrigger>
            <TabsTrigger value="alerts">{t.weatherAlerts}</TabsTrigger>
          </TabsList>

          {/* 24-Hour History */}
          <TabsContent value="hourly">
            <Card>
              <CardHeader>
                <CardTitle>{t.hourHistory}</CardTitle>
                <CardDescription>
                  Temperature, humidity, and rainfall trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistorical ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : hourlyData.length > 0 ? (
                  <>
                    <div className="h-[300px] mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis yAxisId="temp" orientation="left" />
                          <YAxis yAxisId="humidity" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line
                            yAxisId="temp"
                            type="monotone"
                            dataKey="temperature"
                            stroke="#ef4444"
                            name={`${t.temperature} (°C)`}
                            strokeWidth={2}
                          />
                          <Line
                            yAxisId="humidity"
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3b82f6"
                            name={`${t.humidity} (%)`}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="rainfall" fill="#3b82f6" name={`${t.precipitation} (mm)`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No historical data available for this location
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Locations Overview */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>{t.allLocations}</CardTitle>
                <CardDescription>
                  Current weather conditions across all monitored locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allLocationsWeather.map((location) => {
                    const display = getLocationDisplay(location.location_name);
                    return (
                      <Card key={location.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedLocation(location.location_name)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <span>{display.emoji}</span>
                              <span>{display.name}</span>
                            </h3>
                            <div className="scale-75">
                              {getWeatherIcon(location.weather_condition || '')}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-2xl font-bold">{Math.round(parseFloat(location.temperature) || 0)}°C</p>
                            <p className="text-gray-600">{location.weather_condition}</p>
                            <div className="flex justify-between">
                              <span>{t.humidity}: {Math.round(parseFloat(location.humidity) || 0)}%</span>
                              <span>{t.precipitation}: {parseFloat(location.precipitation) || 0}mm</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weather Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t.weatherAlerts}</CardTitle>
                    <CardDescription>
                      Stay informed about important weather changes
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Alerts</span>
                    <Button
                      variant={alertsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAlertsEnabled(!alertsEnabled)}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      {alertsEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentWeather && (
                    <>
                      {(parseFloat(currentWeather.temperature) || 0) > 35 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-800">{t.extremeHeatWarning || 'Extreme Heat Warning'}</p>
                              <p className="text-sm text-red-700 mt-1">
                                {t.farmingAdvice.hotConditions}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {(parseFloat(currentWeather.precipitation) || 0) > 20 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <CloudRain className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-800">{t.heavyRainfallAlert || 'Heavy Rainfall Alert'}</p>
                              <p className="text-sm text-blue-700 mt-1">
                                {t.farmingAdvice.heavyRain}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {(parseFloat(currentWeather.wind_speed) || 0) > 10 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Wind className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="font-semibold text-yellow-800">{t.strongWindAdvisory || 'Strong Wind Advisory'}</p>
                              <p className="text-sm text-yellow-700 mt-1">
                                {t.farmingAdvice.strongWinds}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {!currentWeather || (!((parseFloat(currentWeather.temperature) || 0) > 35) && 
                    !((parseFloat(currentWeather.precipitation) || 0) > 20) && 
                    !((parseFloat(currentWeather.wind_speed) || 0) > 10)) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-800">{t.noActiveAlerts}</p>
                          <p className="text-sm text-green-700 mt-1">
                            {t.farmingAdvice.goodConditions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}