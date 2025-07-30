import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface CropStatus {
  name: string;
  localName: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  nextAction: string;
  daysToHarvest?: number;
}

interface CropStatusSummaryProps {
  crops: CropStatus[];
}

export function CropStatusSummary({ crops }: CropStatusSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.cropStatus')}</span>
          <Link to="/crops" className="text-sm font-normal text-blue-600 hover:underline">
            {t('dashboard.viewAll')}
          </Link>
        </CardTitle>
        <CardDescription>
          {t('crops.healthStatus')} & {t('crops.nextAction')}
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
                  {t(`crops.${crop.health}`)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{crop.nextAction}</p>
              {crop.daysToHarvest && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('crops.daysToHarvest', { days: crop.daysToHarvest })}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}