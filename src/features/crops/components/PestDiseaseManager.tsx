import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Bug, AlertTriangle } from 'lucide-react';
import { PestDisease } from './types';

interface PestDiseaseManagerProps {
  pestDiseases: PestDisease[];
}

export function PestDiseaseManager({ pestDiseases }: PestDiseaseManagerProps) {
  const getSeverityIcon = (severity: PestDisease['severity']) => {
    switch (severity) {
      case 'high':
        return <Bug className="h-8 w-8 text-red-500 mt-1" />;
      case 'medium':
        return <AlertTriangle className="h-8 w-8 text-orange-500 mt-1" />;
      case 'low':
        return <AlertTriangle className="h-8 w-8 text-yellow-500 mt-1" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Pests & Diseases</CardTitle>
        <CardDescription>
          Early detection and treatment recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pestDiseases.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              {getSeverityIcon(item.severity)}
              <div className="flex-1">
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Affects: {item.affects} • Season: {item.season}
                </p>
                <p className="text-sm mt-2">
                  {item.description}
                </p>
                <Button size="sm" variant="outline" className="mt-2">
                  View Treatment
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}