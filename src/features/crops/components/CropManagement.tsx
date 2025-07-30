import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { Filter, Search } from 'lucide-react';
import { CropCard } from './CropCard';
import { CropSummaryStats } from './CropSummaryStats';
import { CropPlantingCalendar } from './CropPlantingCalendar';
import { CropGuidesList } from './CropGuidesList';
import { PestDiseaseManager } from './PestDiseaseManager';
import { useCropData } from '../hooks';


export function CropManagement() {
  const {
    crops,
    selectedCrop,
    setSelectedCrop,
    searchTerm,
    setSearchTerm,
    summaryStats,
    cropGuides,
    pestDiseases
  } = useCropData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <UnifiedHeader variant="full" />

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
            <CropSummaryStats stats={summaryStats} />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map((crop) => (
                <CropCard 
                  key={crop.id} 
                  crop={crop} 
                  onSelect={setSelectedCrop}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CropPlantingCalendar />
          </TabsContent>

          <TabsContent value="guides">
            <CropGuidesList cropGuides={cropGuides} />
          </TabsContent>

          <TabsContent value="pests">
            <PestDiseaseManager pestDiseases={pestDiseases} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}