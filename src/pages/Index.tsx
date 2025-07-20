
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from './Dashboard';
import Auth from './Auth';
import AgriOnboarding from '@/components/auth/AgriOnboarding';

const Index = () => {
  const { isAuthenticated, needsOnboarding, loading, error, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding if user is authenticated but hasn't completed onboarding
  if (isAuthenticated && needsOnboarding) {
    return <AgriOnboarding onComplete={refreshProfile} />;
  }

  return isAuthenticated ? <Dashboard /> : <Auth />;
};

export default Index;
