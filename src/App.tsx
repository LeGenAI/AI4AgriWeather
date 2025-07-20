import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthForm from '@/components/auth/AuthForm';
import { FarmDashboard } from '@/components/farm/FarmDashboard';
import { WeatherCenter } from '@/components/farm/WeatherCenter';
import { CropManagement } from '@/components/farm/CropManagement';
import { AgriChat } from '@/components/farm/AgriChat';
import { KnowledgeBase } from '@/components/farm/KnowledgeBase';
import { KnowledgeEntry } from '@/components/farm/KnowledgeEntry';
import { NewKnowledgeEntry } from '@/components/farm/NewKnowledgeEntry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import NotFoundPage from '@/pages/NotFoundPage';

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;