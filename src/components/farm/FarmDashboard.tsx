import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNotebooks } from '@/hooks/useNotebooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/ui/AppHeader';
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Wheat,
  Book,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
}

interface CropStatus {
  name: string;
  localName: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  nextAction: string;
  daysToHarvest?: number;
}

export function FarmDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: notebooks = [], isLoading: notebooksLoading } = useNotebooks();
  
  // Mock data - will be replaced with real API calls
  const weather: WeatherData = {
    temperature: 28,
    humidity: 65,
    rainfall: 2.5,
    windSpeed: 12,
    condition: 'sunny'
  };
  
  const crops: CropStatus[] = [
    {
      name: 'Maize',
      localName: 'Mahindi',
      health: 'excellent',
      nextAction: 'Apply fertilizer in 3 days',
      daysToHarvest: 45
    },
    {
      name: 'Coffee',
      localName: 'Kahawa',
      health: 'good',
      nextAction: 'Monitor for pests',
      daysToHarvest: 120
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Heavy rainfall expected in 2 days. Prepare drainage.',
      urgent: true
    },
    {
      type: 'info',
      message: 'Optimal planting window for rice starts next week.',
      urgent: false
    }
  ];

  // Get recent knowledge entries
  const recentKnowledgeEntries = notebooks
    .slice(0, 3)
    .map(notebook => ({
      id: notebook.id,
      title: notebook.title || 'Untitled',
      description: notebook.description,
      updated_at: notebook.updated_at,
      icon: getKnowledgeIcon(notebook.title || '')
    }));

  function getKnowledgeIcon(title: string) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('weather') || titleLower.includes('climate')) return Cloud;
    if (titleLower.includes('crop') || titleLower.includes('plant')) return Wheat;
    if (titleLower.includes('pest') || titleLower.includes('disease')) return AlertTriangle;
    return Book;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start space-x-3 ${
                  alert.type === 'warning' 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${
                  alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                }`} />
                <p className={`text-sm ${
                  alert.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Weather Overview */}
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

        {/* Crops Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('dashboard.cropStatus')}</span>
                <Link to="/crops" className="text-sm font-normal text-blue-600 hover:underline">
                  Manage All →
                </Link>
              </CardTitle>
              <CardDescription>
                Current status and upcoming actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crops.map((crop, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    crop.health === 'excellent' ? 'season-growing' :
                    crop.health === 'good' ? 'season-planting' :
                    crop.health === 'warning' ? 'season-harvest' :
                    'season-fallow'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{crop.name}</h4>
                        <p className="text-sm text-gray-600">{crop.localName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium crop-health-${crop.health}`}>
                        {crop.health}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{crop.nextAction}</p>
                    {crop.daysToHarvest && (
                      <p className="text-xs text-gray-500 mt-1">
                        {crop.daysToHarvest} days to harvest
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild className="h-auto flex-col py-4">
                  <Link to="/chat">
                    <Cloud className="h-8 w-8 mb-2 text-blue-600" />
                    <span>Ask About Weather</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col py-4">
                  <Link to="/knowledge">
                    <Wheat className="h-8 w-8 mb-2 text-green-600" />
                    <span>Knowledge Base</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col py-4">
                  <Link to="/crops">
                    <Calendar className="h-8 w-8 mb-2 text-orange-600" />
                    <span>Planting Calendar</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto flex-col py-4">
                  <Link to="/community">
                    <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
                    <span>Market Prices</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base & Activities */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Knowledge Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Knowledge Entries</span>
                <Link to="/knowledge" className="text-sm font-normal text-blue-600 hover:underline">
                  View All →
                </Link>
              </CardTitle>
              <CardDescription>
                Your latest agricultural insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notebooksLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : recentKnowledgeEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentKnowledgeEntries.map((entry) => {
                    const IconComponent = entry.icon;
                    return (
                      <div key={entry.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="p-1 bg-green-100 rounded">
                          <IconComponent className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/knowledge/${entry.id}`}
                            className="font-medium text-sm text-gray-900 hover:text-green-600 truncate block"
                          >
                            {entry.title}
                          </Link>
                          {entry.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.updated_at 
                              ? formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })
                              : 'Recently'
                            }
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <Button asChild variant="outline" className="w-full mt-2">
                    <Link to="/knowledge/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Knowledge
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">No knowledge entries yet</p>
                  <Button asChild size="sm">
                    <Link to="/knowledge/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Entry
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your farming journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Yesterday</span>
                  <span>Applied fertilizer to maize field</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">3 days ago</span>
                  <span>Received weather advisory for upcoming rain</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">1 week ago</span>
                  <span>Harvested 2 hectares of rice</span>
                </div>
                {notebooks.length > 0 && (
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Today</span>
                    <span>Added {notebooks.length} knowledge entries</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}