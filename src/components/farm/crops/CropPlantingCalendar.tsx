import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CropPlantingCalendar() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planting Calendar</CardTitle>
        <CardDescription>
          Optimal planting and harvesting times for your region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar header */}
          <div className="grid grid-cols-12 gap-2 text-xs">
            {months.map((month) => (
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
  );
}