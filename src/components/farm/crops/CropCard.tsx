import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sprout, Sun, Wheat, Package, Clock } from 'lucide-react';
import { Crop } from './types';

interface CropCardProps {
  crop: Crop;
  onSelect?: (crop: Crop) => void;
}

export function CropCard({ crop, onSelect }: CropCardProps) {
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
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect?.(crop)}
    >
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
  );
}