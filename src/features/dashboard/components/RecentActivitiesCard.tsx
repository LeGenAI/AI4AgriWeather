import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface RecentActivitiesCardProps {
  notebooksCount: number;
}

export function RecentActivitiesCard({ notebooksCount }: RecentActivitiesCardProps) {
  return (
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
          {notebooksCount > 0 && (
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Today</span>
              <span>Added {notebooksCount} knowledge entries</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}