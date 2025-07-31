/**
 * Supabase Dynamic Loader
 * Loads Supabase client configuration dynamically from the config service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { configService, AppConfig } from './configService';
import { useEffect, useState } from 'react';

// Store for the Supabase client instance
let supabaseInstance: SupabaseClient<Database> | null = null;
let initializationPromise: Promise<SupabaseClient<Database>> | null = null;

/**
 * Initialize Supabase client with dynamic configuration
 */
export async function initializeSupabase(): Promise<SupabaseClient<Database>> {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already initialized, return the instance
  if (supabaseInstance) {
    return supabaseInstance;
  }

  initializationPromise = createSupabaseClient();
  
  try {
    const client = await initializationPromise;
    return client;
  } finally {
    initializationPromise = null;
  }
}

/**
 * Internal method to create the Supabase client
 */
async function createSupabaseClient(): Promise<SupabaseClient<Database>> {
  const config = await configService.fetchConfig();
  
  if (!config.supabase) {
    throw new Error('Supabase configuration is missing');
  }

  supabaseInstance = createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-client-info': 'insights-lm-public',
        },
      },
    }
  );

  return supabaseInstance;
}

/**
 * Get the Supabase client instance
 * Note: This will throw if called before initialization
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    throw new Error(
      'Supabase client not initialized. Please ensure the app is wrapped with ConfigProvider.'
    );
  }
  return supabaseInstance;
}

/**
 * Hook to use Supabase client in React components
 */
export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadClient() {
      try {
        const supabase = await initializeSupabase();
        if (mounted) {
          setClient(supabase);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Supabase'));
          setIsLoading(false);
        }
      }
    }

    loadClient();

    return () => {
      mounted = false;
    };
  }, []);

  return { client, isLoading, error };
}

/**
 * Hook to get the current configuration
 */
export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to configuration changes
    const unsubscribe = configService.subscribe((state) => {
      setConfig(state.config);
      setIsLoading(state.isLoading);
      setError(state.error);
    });

    // Trigger initial load if not already loaded
    if (!config && !isLoading && !error) {
      configService.fetchConfig().catch(() => {
        // Error is handled by the subscription
      });
    }

    return unsubscribe;
  }, []);

  return { config, isLoading, error };
}

/**
 * Reset the Supabase client (useful for testing or config changes)
 */
export function resetSupabaseClient() {
  supabaseInstance = null;
  initializationPromise = null;
  configService.clearCache();
}