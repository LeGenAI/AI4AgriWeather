export interface Crop {
  id: string;
  name: string;
  localName: string;
  plantedDate: string;
  expectedHarvest: string;
  area: number; // hectares
  variety: string;
  stage: 'germination' | 'vegetative' | 'flowering' | 'maturity';
  health: 'excellent' | 'good' | 'warning' | 'critical';
  lastAction: string;
  nextAction: string;
  yield: number; // expected kg/hectare
}

export interface CropGuide {
  season: string;
  waterNeeds: string;
  soilType: string;
  spacing: string;
  fertilizer: string;
}

export interface PestDisease {
  id: string;
  name: string;
  affects: string;
  season: string;
  description: string;
  treatment: string;
  severity: 'low' | 'medium' | 'high';
}