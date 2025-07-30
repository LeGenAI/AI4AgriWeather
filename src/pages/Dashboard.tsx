
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import AgriKnowledgeGrid from '@/components/dashboard/AgriKnowledgeGrid';
import AgriDashboardStats from '@/components/dashboard/AgriDashboardStats';
import EmptyDashboard from '@/components/dashboard/EmptyDashboard';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/features/authentication';
import LanguageDebugger from '@/components/LanguageDebugger';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { notebooks, isLoading, error, isError } = useNotebooks();
  const hasNotebooks = notebooks && notebooks.length > 0;

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader variant="minimal" showNavigation={false} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">{t('auth.title')}</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Show auth error if present
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader variant="minimal" showNavigation={false} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">{t('auth.title')}</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">{t('common.error')}: {authError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.next')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader variant="minimal" showNavigation={false} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">{t('auth.title')}</h1>
          </div>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Show notebooks error if present
  if (isError && error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader variant="minimal" showNavigation={false} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-medium text-gray-900 mb-2">{t('auth.title')}</h1>
          </div>
          <div className="text-center py-16">
            <p className="text-red-600">{t('common.error')}: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.next')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30">
      <UnifiedHeader variant="minimal" showNavigation={false} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-medium text-gray-900 mb-2 text-4xl">{t('dashboard.title')}</h1>
          <p className="text-gray-600 text-lg">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {hasNotebooks ? (
          <div className="space-y-8">
            <AgriDashboardStats knowledgeEntries={notebooks} isLoading={isLoading} />
            <AgriKnowledgeGrid />
          </div>
        ) : (
          <EmptyDashboard />
        )}
      </main>
      <LanguageDebugger />
    </div>
  );
};

export default Dashboard;
