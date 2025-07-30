import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import {
  WeatherSummaryCard,
  CropStatusSummary,
  AlertsSection,
  QuickActionsGrid,
  RecentKnowledgeSection,
  RecentActivitiesCard,
  useDashboardData
} from './dashboard';


export function FarmDashboard() {
  const {
    weather,
    crops,
    alerts,
    knowledgeEntries,
    notebooksCount,
    isKnowledgeLoading
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
      <UnifiedHeader variant="full" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        <AlertsSection alerts={alerts} />

        {/* Weather Overview */}
        <WeatherSummaryCard weather={weather} />

        {/* Crops Status & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CropStatusSummary crops={crops} />
          <QuickActionsGrid />
        </div>

        {/* Knowledge Base & Activities */}
        <div className="grid md:grid-cols-2 gap-6">
          <RecentKnowledgeSection 
            knowledgeEntries={knowledgeEntries} 
            isLoading={isKnowledgeLoading} 
          />
          <RecentActivitiesCard notebooksCount={notebooksCount} />
        </div>
      </main>
    </div>
  );
}