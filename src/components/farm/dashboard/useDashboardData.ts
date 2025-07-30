import { useMemo } from 'react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { WeatherData, CropStatus, Alert, KnowledgeEntry } from './types';
import { getKnowledgeIcon } from './RecentKnowledgeSection';
import { useTranslation } from 'react-i18next';

// Mock data - will be replaced with real API calls
const mockWeatherData: WeatherData = {
  temperature: 28,
  humidity: 65,
  rainfall: 2.5,
  windSpeed: 12,
  condition: 'sunny'
};

  const mockCropsData: CropStatus[] = [
    {
      name: t('crops.maize'),
      localName: t('crops.maizeLocal'),
      health: 'excellent',
      nextAction: t('crops.applyFertilizerDays', { days: 3 }),
      daysToHarvest: 45
    },
    {
      name: t('crops.coffee'),
      localName: t('crops.coffeeLocal'),
      health: 'good',
      nextAction: t('crops.monitorPests'),
      daysToHarvest: 120
    }
  ];

  const mockAlertsData: Alert[] = [
    {
      type: 'warning',
      message: t('alerts.heavyRainfallWarning', { days: 2 }),
      urgent: true
    },
    {
      type: 'info',
      message: t('alerts.plantingWindowInfo'),
      urgent: false
    }
  ];

export function useDashboardData() {
  const { t } = useTranslation();
  const { data: notebooks = [], isLoading: notebooksLoading } = useNotebooks();
  
  // Transform notebooks to knowledge entries
  const recentKnowledgeEntries: KnowledgeEntry[] = useMemo(() => 
    notebooks
      .slice(0, 3)
      .map(notebook => ({
        id: notebook.id,
        title: notebook.title || 'Untitled',
        description: notebook.description,
        updated_at: notebook.updated_at,
        icon: getKnowledgeIcon(notebook.title || '')
      })), 
    [notebooks]
  );

  return {
    weather: mockWeatherData,
    crops: mockCropsData,
    alerts: mockAlertsData,
    knowledgeEntries: recentKnowledgeEntries,
    notebooksCount: notebooks.length,
    isKnowledgeLoading: notebooksLoading
  };
}