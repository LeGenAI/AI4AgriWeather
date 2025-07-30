import { useMemo } from 'react';
import { useNotebooks } from '@/features/notebook/hooks';
import { WeatherData, CropStatus, Alert, KnowledgeEntry } from '../types';
import { getKnowledgeIcon } from '../components/RecentKnowledgeSection';

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
    name: 'Maize',
    localName: 'Mahindi',
    health: 'excellent',
    nextAction: 'Apply fertilizer in 3 days',
    daysToHarvest: 45
  },
  {
    name: 'Coffee',
    localName: 'Kahawa',
    health: 'good',
    nextAction: 'Monitor for pests',
    daysToHarvest: 120
  }
];

const mockAlertsData: Alert[] = [
  {
    type: 'warning',
    message: 'Heavy rainfall expected in 2 days. Prepare drainage.',
    urgent: true
  },
  {
    type: 'info',
    message: 'Optimal planting window for rice starts next week.',
    urgent: false
  }
];

export function useDashboardData() {
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