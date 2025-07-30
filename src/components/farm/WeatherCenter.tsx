import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
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
  Info
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

// Mock data for weather forecast
const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  temperature: 22 + Math.random() * 10,
  humidity: 60 + Math.random() * 20,
  rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0,
}));

const weeklyData = [
  { day: 'Mon', high: 32, low: 22, rainfall: 0, condition: 'sunny' },
  { day: 'Tue', high: 30, low: 21, rainfall: 2, condition: 'cloudy' },
  { day: 'Wed', high: 28, low: 20, rainfall: 15, condition: 'rainy' },
  { day: 'Thu', high: 29, low: 21, rainfall: 5, condition: 'cloudy' },
  { day: 'Fri', high: 31, low: 22, rainfall: 0, condition: 'sunny' },
  { day: 'Sat', high: 33, low: 23, rainfall: 0, condition: 'sunny' },
  { day: 'Sun', high: 32, low: 22, rainfall: 1, condition: 'cloudy' },
];

const agriculturalIndices = {
  evapotranspiration: 5.2,
  soilMoisture: 65,
  uvIndex: 8,
  growingDegreeDays: 18,
};

export function WeatherCenter() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-50">
      <UnifiedHeader variant="full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Conditions */}
        <Card className="mb-6 bg-gradient-to-r from-blue-400 to-sky-300 text-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Current Conditions</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <Sun className="h-16 w-16" />
                  <div>
                    <p className="text-5xl font-bold">28°C</p>
                    <p className="text-lg">Mostly Sunny</p>
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  Good conditions for field work. UV protection recommended.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <p className="text-xl font-semibold">65%</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm">Wind Speed</span>
                  </div>
                  <p className="text-xl font-semibold">12 km/h</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Visibility</span>
                  </div>
                  <p className="text-xl font-semibold">10 km</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Gauge className="h-4 w-4" />
                    <span className="text-sm">Pressure</span>
                  </div>
                  <p className="text-xl font-semibold">1013 mb</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agricultural Indices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agricultural Indices</CardTitle>
            <CardDescription>
              Key metrics for farming decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Evapotranspiration</p>
                <p className="text-2xl font-bold text-green-700">
                  {agriculturalIndices.evapotranspiration} mm/day
                </p>
                <p className="text-xs text-gray-500 mt-1">Moderate water loss</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Soil Moisture</p>
                <p className="text-2xl font-bold text-blue-700">
                  {agriculturalIndices.soilMoisture}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Good for planting</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">UV Index</p>
                <p className="text-2xl font-bold text-orange-700">
                  {agriculturalIndices.uvIndex}
                </p>
                <p className="text-xs text-gray-500 mt-1">Very High</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Growing Degree Days</p>
                <p className="text-2xl font-bold text-purple-700">
                  {agriculturalIndices.growingDegreeDays}°C
                </p>
                <p className="text-xs text-gray-500 mt-1">Accumulated today</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Irrigation Recommendation</p>
                <p>Based on current evapotranspiration and soil moisture, irrigate 20-25mm in the next 2 days for optimal crop growth.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Tabs */}
        <Tabs defaultValue="hourly" className="space-y-4">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="hourly">24-Hour</TabsTrigger>
            <TabsTrigger value="weekly">7-Day</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly">
            <Card>
              <CardHeader>
                <CardTitle>24-Hour Forecast</CardTitle>
                <CardDescription>
                  Hourly temperature and rainfall predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis yAxisId="temp" orientation="left" />
                      <YAxis yAxisId="rain" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="temp"
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#ef4444" 
                        name="Temperature (°C)"
                      />
                      <Bar 
                        yAxisId="rain"
                        dataKey="rainfall" 
                        fill="#3b82f6" 
                        name="Rainfall (mm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Forecast</CardTitle>
                <CardDescription>
                  Weekly weather outlook for farm planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {weeklyData.map((day, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <p className="font-semibold w-12">{day.day}</p>
                        {getWeatherIcon(day.condition)}
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{day.high}°</span>
                          <TrendingDown className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600">{day.low}°</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {day.rainfall > 0 && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <Droplets className="h-4 w-4" />
                            <span className="text-sm">{day.rainfall}mm</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-600 capitalize">
                          {day.condition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Outlook</CardTitle>
                <CardDescription>
                  Long-term predictions and historical comparisons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Next 3 Months: Above Average Rainfall Expected
                    </h4>
                    <p className="text-sm text-green-700">
                      La Niña conditions are likely to bring 20-30% more rainfall than average. 
                      Good for water-intensive crops but monitor for flooding risks.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold">Masika (Long Rains)</p>
                      <p className="text-sm text-gray-600">March - May</p>
                      <p className="text-xs mt-1">Expected: Normal</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="font-semibold">Vuli (Short Rains)</p>
                      <p className="text-sm text-gray-600">October - December</p>
                      <p className="text-xs mt-1">Expected: Above Normal</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="font-semibold">Kiangazi (Dry)</p>
                      <p className="text-sm text-gray-600">June - September</p>
                      <p className="text-xs mt-1">Expected: Drier than usual</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Weather Alerts */}
        {alertsEnabled && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Active Weather Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CloudRain className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800">Heavy Rainfall Warning</p>
                    <p className="text-sm text-orange-700">
                      Expected 40-60mm of rain in the next 48 hours. Ensure proper drainage in fields and postpone fertilizer application.
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Valid until: Tomorrow 6:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}