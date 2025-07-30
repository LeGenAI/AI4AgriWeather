import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { CropGuide } from './types';

interface CropGuidesListProps {
  cropGuides: Record<string, CropGuide>;
}

export function CropGuidesList({ cropGuides }: CropGuidesListProps) {
  return (
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
  );
}