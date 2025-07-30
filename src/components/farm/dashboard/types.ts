export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'stormy';
}

export interface CropStatus {
  name: string;
  localName: string;
  health: 'excellent' | 'good' | 'warning' | 'critical';
  nextAction: string;
  daysToHarvest?: number;
}

export interface Alert {
  type: 'warning' | 'info';
  message: string;
  urgent: boolean;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  description?: string;
  updated_at?: string;
  icon: React.ComponentType<{ className?: string }>;
}