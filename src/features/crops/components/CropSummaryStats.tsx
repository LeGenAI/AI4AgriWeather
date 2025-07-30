import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Wheat, Sprout, TrendingUp, CheckCircle } from 'lucide-react';

interface CropSummaryStatsProps {
  stats: {
    totalArea: number;
    activeCrops: number;
    expectedYield: number;
    overallHealth: string;
  };
}

export function CropSummaryStats({ stats }: CropSummaryStatsProps) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Area</p>
              <p className="text-2xl font-bold">{stats.totalArea.toFixed(1)} ha</p>
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
              <p className="text-2xl font-bold">{stats.activeCrops}</p>
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
              <p className="text-2xl font-bold">{stats.expectedYield.toFixed(1)}t</p>
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
              <p className="text-2xl font-bold">{stats.overallHealth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}