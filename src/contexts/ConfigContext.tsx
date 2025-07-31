/**
 * Configuration Context
 * Provides configuration to the entire application and handles initial loading
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { configService, AppConfig, ConfigState } from '@/services/config/configService';
import { initializeSupabase } from '@/services/config/supabaseLoader';

interface ConfigContextValue {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

/**
 * Loading screen component
 */
const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Loading Configuration</h2>
        <p className="text-sm text-muted-foreground">Please wait while we set up the application...</p>
      </div>
    </div>
  </div>
);

/**
 * Error screen component
 */
const ErrorScreen: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Configuration Error</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Failed to load application configuration. This might be a temporary issue.
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-sm font-mono text-destructive">{error.message}</p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
        
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Troubleshooting
          </summary>
          <div className="mt-2 space-y-2 text-muted-foreground">
            <p>If the problem persists:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </div>
);

/**
 * Configuration Provider Component
 */
export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfigState>({
    config: null,
    isLoading: true,
    error: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load configuration and initialize services
  const loadConfiguration = async () => {
    try {
      setState({ config: null, isLoading: true, error: null });
      
      // Fetch configuration
      const config = await configService.fetchConfig();
      
      // Initialize Supabase with the configuration
      await initializeSupabase();
      
      setState({ config, isLoading: false, error: null });
      setIsInitialized(true);
    } catch (error) {
      setState({
        config: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      });
    }
  };

  useEffect(() => {
    // Subscribe to configuration changes
    const unsubscribe = configService.subscribe((newState) => {
      setState(newState);
    });

    // Initial load
    loadConfiguration();

    return unsubscribe;
  }, []);

  const contextValue: ConfigContextValue = {
    config: state.config,
    isLoading: state.isLoading,
    error: state.error,
    reload: loadConfiguration,
  };

  // Show loading screen while configuration is being fetched
  if (state.isLoading && !isInitialized) {
    return <LoadingScreen />;
  }

  // Show error screen if configuration failed to load
  if (state.error && !isInitialized) {
    return <ErrorScreen error={state.error} onRetry={loadConfiguration} />;
  }

  // Render children with configuration context
  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

/**
 * Hook to use configuration context
 */
export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  
  return context;
};

/**
 * Hook to get a specific configuration value
 */
export const useConfigValue = <T = any>(path: string): T | undefined => {
  const { config } = useConfigContext();
  
  if (!config) return undefined;
  
  // Simple path resolver (e.g., "supabase.url" -> config.supabase.url)
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value as T;
};

/**
 * Hook to check if a feature is enabled
 */
export const useFeatureFlag = (featureName: string): boolean => {
  const features = useConfigValue<Record<string, boolean>>('features');
  return features?.[featureName] ?? false;
};