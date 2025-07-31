/**
 * Configuration Service
 * Manages dynamic configuration loading from the server
 */

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  features?: {
    [key: string]: boolean;
  };
  api?: {
    [key: string]: string;
  };
}

export interface ConfigState {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;
  private listeners: Set<(state: ConfigState) => void> = new Set();
  private state: ConfigState = {
    config: null,
    isLoading: false,
    error: null,
  };

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Subscribe to configuration state changes
   */
  subscribe(listener: (state: ConfigState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call listener with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update the internal state and notify listeners
   */
  private setState(updates: Partial<ConfigState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  /**
   * Fetch configuration from the server
   */
  async fetchConfig(): Promise<AppConfig> {
    // If already loading, return the existing promise
    if (this.configPromise) {
      return this.configPromise;
    }

    // If config is already loaded, return it
    if (this.config && !this.state.error) {
      return this.config;
    }

    this.configPromise = this.loadConfig();
    
    try {
      const config = await this.configPromise;
      return config;
    } finally {
      this.configPromise = null;
    }
  }

  /**
   * Internal method to load configuration
   */
  private async loadConfig(): Promise<AppConfig> {
    this.setState({ isLoading: true, error: null });

    try {
      // First, try to load from the API endpoint
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API endpoint is not available, fall back to environment variables
        if (response.status === 404) {
          return this.loadFromEnvironment();
        }
        throw new Error(`Failed to fetch configuration: ${response.status} ${response.statusText}`);
      }

      const config = await response.json();
      
      // Validate the configuration
      if (!this.isValidConfig(config)) {
        throw new Error('Invalid configuration format received from server');
      }

      this.config = config;
      this.setState({ config, isLoading: false, error: null });
      return config;
    } catch (error) {
      // Fall back to environment variables if API fails
      console.warn('Failed to fetch configuration from API, falling back to environment variables:', error);
      return this.loadFromEnvironment();
    }
  }

  /**
   * Load configuration from environment variables (fallback)
   */
  private loadFromEnvironment(): AppConfig {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      const error = new Error(
        'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
      );
      this.setState({ config: null, isLoading: false, error });
      throw error;
    }

    const config: AppConfig = {
      supabase: {
        url,
        anonKey,
      },
    };

    this.config = config;
    this.setState({ config, isLoading: false, error: null });
    return config;
  }

  /**
   * Validate configuration object
   */
  private isValidConfig(config: any): config is AppConfig {
    return (
      config &&
      typeof config === 'object' &&
      config.supabase &&
      typeof config.supabase === 'object' &&
      typeof config.supabase.url === 'string' &&
      typeof config.supabase.anonKey === 'string' &&
      config.supabase.url.length > 0 &&
      config.supabase.anonKey.length > 0
    );
  }

  /**
   * Get the current configuration (if loaded)
   */
  getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Get the current state
   */
  getState(): ConfigState {
    return this.state;
  }

  /**
   * Clear the cached configuration (useful for testing or forcing a reload)
   */
  clearCache() {
    this.config = null;
    this.configPromise = null;
    this.setState({ config: null, isLoading: false, error: null });
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();