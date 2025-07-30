import { useState, useMemo } from 'react';
import { Crop, CropGuide, PestDisease } from './types';

const mockCrops: Crop[] = [
  {
    id: '1',
    name: 'Maize',
    localName: 'Mahindi',
    plantedDate: '2024-03-15',
    expectedHarvest: '2024-07-15',
    area: 2.5,
    variety: 'H614D',
    stage: 'flowering',
    health: 'excellent',
    lastAction: 'Applied fertilizer',
    nextAction: 'Monitor for pests',
    yield: 4500
  },
  {
    id: '2',
    name: 'Coffee',
    localName: 'Kahawa',
    plantedDate: '2022-04-20',
    expectedHarvest: '2024-10-01',
    area: 1.5,
    variety: 'Arabica',
    stage: 'maturity',
    health: 'good',
    lastAction: 'Pruned branches',
    nextAction: 'Prepare for harvest',
    yield: 800
  },
  {
    id: '3',
    name: 'Rice',
    localName: 'Mchele',
    plantedDate: '2024-04-01',
    expectedHarvest: '2024-08-01',
    area: 3.0,
    variety: 'IR64',
    stage: 'vegetative',
    health: 'warning',
    lastAction: 'Irrigated field',
    nextAction: 'Apply pesticide',
    yield: 3200
  }
];

const cropGuides: Record<string, CropGuide> = {
  maize: {
    season: 'March - July',
    waterNeeds: '500-800mm',
    soilType: 'Well-drained loamy',
    spacing: '75cm x 25cm',
    fertilizer: 'DAP at planting, CAN at knee height'
  },
  coffee: {
    season: 'Year-round (harvest Oct-Dec)',
    waterNeeds: '1200-1500mm',
    soilType: 'Deep, well-drained volcanic',
    spacing: '2.5m x 2.5m',
    fertilizer: 'NPK 20:10:10 quarterly'
  },
  rice: {
    season: 'April - August',
    waterNeeds: '1200-1500mm',
    soilType: 'Clay loam, water retentive',
    spacing: '20cm x 20cm',
    fertilizer: 'Urea in splits'
  }
};

const pestDiseases: PestDisease[] = [
  {
    id: '1',
    name: 'Fall Armyworm',
    affects: 'Maize',
    season: 'All year',
    description: 'Look for ragged holes in leaves and larvae in whorls. Apply recommended pesticides early morning or late evening.',
    treatment: 'Apply recommended pesticides early morning or late evening',
    severity: 'high'
  },
  {
    id: '2',
    name: 'Coffee Berry Disease',
    affects: 'Coffee',
    season: 'Rainy season',
    description: 'Dark sunken lesions on berries. Prevent with copper-based fungicides before and during flowering.',
    treatment: 'Prevent with copper-based fungicides before and during flowering',
    severity: 'medium'
  }
];

export function useCropData() {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrops = useMemo(() => {
    return mockCrops.filter(crop => 
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.localName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const summaryStats = useMemo(() => {
    const totalArea = mockCrops.reduce((sum, crop) => sum + crop.area, 0);
    const activeCrops = mockCrops.length;
    const expectedYield = mockCrops.reduce((sum, crop) => sum + (crop.yield * crop.area / 1000), 0);
    const healthyCount = mockCrops.filter(crop => crop.health === 'excellent' || crop.health === 'good').length;
    const overallHealth = healthyCount / mockCrops.length >= 0.8 ? 'Good' : 'Fair';

    return {
      totalArea,
      activeCrops,
      expectedYield,
      overallHealth
    };
  }, []);

  return {
    crops: filteredCrops,
    allCrops: mockCrops,
    selectedCrop,
    setSelectedCrop,
    searchTerm,
    setSearchTerm,
    summaryStats,
    cropGuides,
    pestDiseases
  };
}