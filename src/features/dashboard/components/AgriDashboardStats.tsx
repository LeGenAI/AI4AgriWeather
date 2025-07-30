import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { 
  Wheat, 
  Cloud, 
  Bug, 
  TrendingUp, 
  Calendar,
  MapPin,
  Users,
  BookOpen,
  BarChart3,
  Clock
} from 'lucide-react';
import { useAuth } from '@/features/authentication';
import { getCategoryIcon, getCategoryName, AGRICULTURAL_CATEGORIES } from '@/utils/agricultureTemplates';

interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  crop_types: string[];
  sources: any[];
}

interface AgriDashboardStatsProps {
  knowledgeEntries: KnowledgeEntry[];
  isLoading: boolean;
}

const AgriDashboardStats = ({ knowledgeEntries, isLoading }: AgriDashboardStatsProps) => {
  const { profile } = useAuth();

  // Calculate statistics
  const totalEntries = knowledgeEntries?.length || 0;
  const categoryCounts = knowledgeEntries?.reduce((acc, entry) => {
    const category = entry.category || 'general_farming';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const recentEntries = knowledgeEntries?.filter(entry => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(entry.created_at) > oneWeekAgo;
  })?.length || 0;

  const cropSpecificEntries = knowledgeEntries?.filter(entry => 
    entry.crop_types && entry.crop_types.length > 0
  )?.length || 0;

  const weatherRelatedEntries = knowledgeEntries?.filter(entry => 
    entry.category === 'weather_climate'
  )?.length || 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with Farmer Info */}
      {profile && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-green-800">
                  Welcome back, {profile.full_name || 'Farmer'}!
                </CardTitle>
                <CardDescription className="text-green-600 mt-2">
                  {profile.farm_name && `${profile.farm_name} • `}
                  {profile.farm_location && `${profile.farm_location} • `}
                  {profile.farm_size && `${profile.farm_size} ${profile.farm_size_unit}`}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.region?.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.farming_experience} years exp.</span>
                  </div>
                </div>
              </div>
            </div>
            {profile.primary_crops && profile.primary_crops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm font-medium text-green-700">Primary crops:</span>
                {profile.primary_crops.slice(0, 5).map(crop => (
                  <Badge key={crop} variant="secondary" className="bg-green-100 text-green-800">
                    {crop.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
                {profile.primary_crops.length > 5 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +{profile.primary_crops.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Total agricultural knowledge entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEntries}</div>
            <p className="text-xs text-muted-foreground">
              New entries this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crop-Specific</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cropSpecificEntries}</div>
            <p className="text-xs text-muted-foreground">
              Entries with crop information
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather Insights</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weatherRelatedEntries}</div>
            <p className="text-xs text-muted-foreground">
              Weather & climate entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Knowledge Categories</span>
            </CardTitle>
            <CardDescription>
              Distribution of your agricultural knowledge entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(AGRICULTURAL_CATEGORIES).map(([key, category]) => {
              const count = categoryCounts[key] || 0;
              const percentage = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common agricultural knowledge entry types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Weather Forecast</p>
                    <p className="text-sm text-blue-600">Track weekly weather patterns</p>
                  </div>
                </div>
                <Badge variant="secondary">Guide</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wheat className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Crop Planning</p>
                    <p className="text-sm text-green-600">Plan planting schedules</p>
                  </div>
                </div>
                <Badge variant="secondary">Template</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bug className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Pest Control</p>
                    <p className="text-sm text-red-600">Identify and manage pests</p>
                  </div>
                </div>
                <Badge variant="secondary">Reference</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Market Prices</p>
                    <p className="text-sm text-purple-600">Track crop market trends</p>
                  </div>
                </div>
                <Badge variant="secondary">Analysis</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgriDashboardStats;