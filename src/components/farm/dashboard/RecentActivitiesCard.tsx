import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface RecentActivitiesCardProps {
  notebooksCount: number;
}

export function RecentActivitiesCard({ notebooksCount }: RecentActivitiesCardProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentActivities')}</CardTitle>
        <CardDescription>
          {t('dashboard.yourFarmingJourney')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">{t('common.yesterday')}</span>
            <span>{t('activities.appliedFertilizer')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">{t('activities.threeDaysAgo')}</span>
            <span>{t('activities.receivedWeatherAdvisory')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">{t('activities.oneWeekAgo')}</span>
            <span>{t('activities.harvestedRice')}</span>
          </div>
          {notebooksCount > 0 && (
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">{t('common.today')}</span>
              <span>{t('activities.addedKnowledgeEntries', { notebooksCount })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}