/**
 * Tests for the configuration service
 */

import { configService } from '../configService';

// Mock fetch globally
global.fetch = jest.fn();

describe('ConfigService', () => {
  beforeEach(() => {
    // Clear any cached configuration
    configService.clearCache();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
    // Clear environment variables
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchConfig', () => {
    it('should fetch configuration from API endpoint', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
        features: {
          testFeature: true,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const config = await configService.fetchConfig();

      expect(global.fetch).toHaveBeenCalledWith('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(config).toEqual(mockConfig);
    });

    it('should fall back to environment variables when API returns 404', async () => {
      process.env.VITE_SUPABASE_URL = 'https://env.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'env-anon-key';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const config = await configService.fetchConfig();

      expect(config).toEqual({
        supabase: {
          url: 'https://env.supabase.co',
          anonKey: 'env-anon-key',
        },
      });
    });

    it('should throw error when environment variables are missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(configService.fetchConfig()).rejects.toThrow(
        'Missing Supabase configuration'
      );
    });

    it('should validate configuration format', async () => {
      const invalidConfig = {
        supabase: {
          // Missing required fields
          url: '',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidConfig,
      });

      // Should fall back to environment variables
      process.env.VITE_SUPABASE_URL = 'https://env.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'env-anon-key';

      const config = await configService.fetchConfig();

      expect(config.supabase.url).toBe('https://env.supabase.co');
    });

    it('should cache configuration after first fetch', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      // First call
      await configService.fetchConfig();
      // Second call
      await configService.fetchConfig();

      // Fetch should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent fetch requests', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      // Make multiple concurrent requests
      const [config1, config2, config3] = await Promise.all([
        configService.fetchConfig(),
        configService.fetchConfig(),
        configService.fetchConfig(),
      ]);

      // All should return the same config
      expect(config1).toEqual(mockConfig);
      expect(config2).toEqual(mockConfig);
      expect(config3).toEqual(mockConfig);

      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers of state changes', async () => {
      const listener = jest.fn();
      const unsubscribe = configService.subscribe(listener);

      // Listener should be called immediately with current state
      expect(listener).toHaveBeenCalledWith({
        config: null,
        isLoading: false,
        error: null,
      });

      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      await configService.fetchConfig();

      // Listener should be called with loading state and then success state
      expect(listener).toHaveBeenCalledWith({
        config: null,
        isLoading: true,
        error: null,
      });
      expect(listener).toHaveBeenCalledWith({
        config: mockConfig,
        isLoading: false,
        error: null,
      });

      // Cleanup
      unsubscribe();
    });

    it('should stop notifying after unsubscribe', async () => {
      const listener = jest.fn();
      const unsubscribe = configService.subscribe(listener);
      
      // Clear initial call
      listener.mockClear();
      
      // Unsubscribe
      unsubscribe();

      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      await configService.fetchConfig();

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear cached configuration', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      });

      // First fetch
      await configService.fetchConfig();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      configService.clearCache();

      // Second fetch should call API again
      await configService.fetchConfig();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});