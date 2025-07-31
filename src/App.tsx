import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, AuthForm } from '@/features/authentication';
import { FarmDashboard } from '@/features/dashboard';
import { WeatherCenter } from '@/features/weather';
import { CropManagement } from '@/features/crops';
import { AgriChat } from '@/features/chat';
import { KnowledgeBase, KnowledgeEntry, NewKnowledgeEntry } from '@/features/knowledge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/shared/components/ui/toaster';
import NotFoundPage from '@/pages/NotFoundPage';
import { UploadQueueProvider, useUploadQueue } from '@/hooks/useUploadQueue';
import { UploadQueueMonitor } from '@/components/upload/UploadQueueMonitor';
import { ConfigProvider } from '@/contexts/ConfigContext';

// Import the agricultural theme CSS
import '@/styles/agriculture-theme.css';

// Import i18n configuration
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ConfigProvider>
        <QueryClientProvider client={queryClient}>
          <UploadQueueProvider>
            <Router>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </Router>
          </UploadQueueProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </React.Suspense>
  );
}

// 별도의 컴포넌트로 분리하여 useUploadQueue 사용
function AppContent() {
  const { showMonitor, setShowMonitor, isMinimized, setIsMinimized } = useUploadQueue();

  return (
    <>
      <Routes>
              <Route path="/auth" element={<AuthForm />} />
              
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <FarmDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather"
                element={
                  <ProtectedRoute>
                    <WeatherCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crops"
                element={
                  <ProtectedRoute>
                    <CropManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <AgriChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute>
                    <KnowledgeBase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge/new"
                element={
                  <ProtectedRoute>
                    <NewKnowledgeEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge/:id"
                element={
                  <ProtectedRoute>
                    <KnowledgeEntry />
                  </ProtectedRoute>
                }
              />
              
              {/* Legacy routes redirect */}
              <Route path="/notebook/*" element={<Navigate to="/knowledge" replace />} />
              
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Upload Queue Monitor */}
      <UploadQueueMonitor
        open={showMonitor && !isMinimized}
        onOpenChange={setShowMonitor}
        minimized={isMinimized}
        onMinimize={() => setIsMinimized(true)}
      />
      
      <Toaster />
    </>
  );
}

export default App;