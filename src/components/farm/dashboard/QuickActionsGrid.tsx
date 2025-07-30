import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Wheat, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function QuickActionsGrid() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        <CardDescription>
          {t('dashboard.commonTasks')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/chat">
              <Cloud className="h-8 w-8 mb-2 text-blue-600" />
              <span>{t('dashboard.askAboutWeather')}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/knowledge">
              <Wheat className="h-8 w-8 mb-2 text-green-600" />
              <span>{t('dashboard.knowledgeBase')}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/crops">
              <Calendar className="h-8 w-8 mb-2 text-orange-600" />
              <span>{t('dashboard.plantingCalendar')}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto flex-col py-4">
            <Link to="/community">
              <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
              <span>{t('dashboard.marketPrices')}</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}