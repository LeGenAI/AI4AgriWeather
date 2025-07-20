import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppHeader from '@/components/ui/AppHeader';
import { 
  Wheat,
  Sprout,
  Bug,
  Calendar,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  localName: string;
  plantedDate: string;
  expectedHarvest: string;
  area: number; // hectares
  variety: string;
  stage: 'germination' | 'vegetative' | 'flowering' | 'maturity';
  health: 'excellent' | 'good' | 'warning' | 'critical';
  lastAction: string;
  nextAction: string;
  yield: number; // expected kg/hectare
}

const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Maize',
    localName: 'Mahindi',
    plantedDate: '2024-03-15',
    expectedHarvest: '2024-07-15',
    area: 2.5,
    variety: 'H614D',
    stage: 'flowering',
    health: 'excellent',
    lastAction: 'Applied fertilizer',
    nextAction: 'Monitor for pests',
    yield: 4500
  },
  {
    id: '2',
    name: 'Coffee',
    localName: 'Kahawa',
    plantedDate: '2022-04-20',
    expectedHarvest: '2024-10-01',
    area: 1.5,
    variety: 'Arabica',
    stage: 'maturity',
    health: 'good',
    lastAction: 'Pruned branches',
    nextAction: 'Prepare for harvest',
    yield: 800
  },
  {
    id: '3',
    name: 'Rice',
    localName: 'Mchele',
    plantedDate: '2024-04-01',
    expectedHarvest: '2024-08-01',
    area: 3.0,
    variety: 'IR64',
    stage: 'vegetative',
    health: 'warning',
    lastAction: 'Irrigated field',
    nextAction: 'Apply pesticide',
    yield: 3200
  }
];

const cropGuides = {
  maize: {
    season: 'March - July',
    waterNeeds: '500-800mm',
    soilType: 'Well-drained loamy',
    spacing: '75cm x 25cm',
    fertilizer: 'DAP at planting, CAN at knee height'
  },
  coffee: {
    season: 'Year-round (harvest Oct-Dec)',
    waterNeeds: '1200-1500mm',
    soilType: 'Deep, well-drained volcanic',
    spacing: '2.5m x 2.5m',
    fertilizer: 'NPK 20:10:10 quarterly'
  },
  rice: {
    season: 'April - August',
    waterNeeds: '1200-1500mm',
    soilType: 'Clay loam, water retentive',
    spacing: '20cm x 20cm',
    fertilizer: 'Urea in splits'
  }
};

export function CropManagement() {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStageIcon = (stage: Crop['stage']) => {
    switch (stage) {
      case 'germination':
        return <Sprout className="h-4 w-4" />;
      case 'vegetative':
        return <Sun className="h-4 w-4" />;
      case 'flowering':
        return <Wheat className="h-4 w-4" />;
      case 'maturity':
        return <Package className="h-4 w-4" />;
    }
  };

  const getHealthColor = (health: Crop['health']) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
    }
  };

  const getProgressPercentage = (planted: string, harvest: string) => {
    const plantedDate = new Date(planted);
    const harvestDate = new Date(harvest);
    const today = new Date();
    const totalDays = harvestDate.getTime() - plantedDate.getTime();
    const daysPassed = today.getTime() - plantedDate.getTime();
    return Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Planting Calendar</TabsTrigger>
            <TabsTrigger value="guides">Crop Guides</TabsTrigger>
            <TabsTrigger value="pests">Pest & Disease</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Area</p>
                      <p className="text-2xl font-bold">7.0 ha</p>
                    </div>
                    <Wheat className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Crops</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <Sprout className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Expected Yield</p>
                      <p className="text-2xl font-bold">25.4t</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Health Status</p>
                      <p className="text-2xl font-bold">Good</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crop List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCrops.map((crop) => (
                <Card key={crop.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{crop.name}</CardTitle>
                        <CardDescription>{crop.localName} • {crop.variety}</CardDescription>
                      </div>
                      <Badge className={getHealthColor(crop.health)}>
                        {crop.health}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Area</span>
                        <span className="font-medium">{crop.area} ha</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stage</span>
                        <div className="flex items-center gap-1">
                          {getStageIcon(crop.stage)}
                          <span className="font-medium capitalize">{crop.stage}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {Math.round(getProgressPercentage(crop.plantedDate, crop.expectedHarvest))}%
                          </span>
                        </div>
                        <Progress 
                          value={getProgressPercentage(crop.plantedDate, crop.expectedHarvest)} 
                          className="h-2"
                        />
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 mb-1">Next Action:</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {crop.nextAction}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Planting Calendar</CardTitle>
                <CardDescription>
                  Optimal planting and harvesting times for your region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar visualization would go here */}
                  <div className="grid grid-cols-12 gap-2 text-xs">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                      <div key={month} className="text-center font-medium text-gray-600">
                        {month}
                      </div>
                    ))}
                  </div>
                  
                  {/* Maize planting season */}
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div className="absolute left-[16.66%] right-[41.66%] h-full bg-green-400 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">Maize</span>
                    </div>
                  </div>
                  
                  {/* Rice planting season */}
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div className="absolute left-[25%] right-[33.33%] h-full bg-blue-400 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">Rice</span>
                    </div>
                  </div>
                  
                  {/* Coffee harvest season */}
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div className="absolute left-[75%] right-0 h-full bg-orange-400 rounded flex items-center justify-center">
                      <span className="text-xs font-medium">Coffee Harvest</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> The calendar shows general planting windows. 
                    Always check current weather conditions and soil moisture before planting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(cropGuides).map(([crop, guide]) => (
                <Card key={crop}>
                  <CardHeader>
                    <CardTitle className="capitalize">{crop} Growing Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Season:</dt>
                        <dd className="text-sm font-medium">{guide.season}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Water Needs:</dt>
                        <dd className="text-sm font-medium">{guide.waterNeeds}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Soil Type:</dt>
                        <dd className="text-sm font-medium">{guide.soilType}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Spacing:</dt>
                        <dd className="text-sm font-medium">{guide.spacing}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 mb-1">Fertilizer:</dt>
                        <dd className="text-sm font-medium">{guide.fertilizer}</dd>
                      </div>
                    </dl>
                    <Button className="w-full mt-4" variant="outline">
                      View Full Guide
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pests">
            <Card>
              <CardHeader>
                <CardTitle>Common Pests & Diseases</CardTitle>
                <CardDescription>
                  Early detection and treatment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Bug className="h-8 w-8 text-red-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Fall Armyworm</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Affects: Maize • Season: All year
                      </p>
                      <p className="text-sm mt-2">
                        Look for ragged holes in leaves and larvae in whorls. 
                        Apply recommended pesticides early morning or late evening.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Treatment
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-orange-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Coffee Berry Disease</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Affects: Coffee • Season: Rainy season
                      </p>
                      <p className="text-sm mt-2">
                        Dark sunken lesions on berries. Prevent with copper-based fungicides 
                        before and during flowering.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Treatment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}