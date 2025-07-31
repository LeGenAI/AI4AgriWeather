/**
 * Tests for Supabase loader and React hooks
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useSupabase, useConfig, initializeSupabase, resetSupabaseClient } from '../supabaseLoader';
import { configService } from '../configService';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

// Mock the config service
jest.mock('../configService', () => ({
  configService: {
    fetchConfig: jest.fn(),
    subscribe: jest.fn(),
    clearCache: jest.fn(),
  },
}));

describe('supabaseLoader', () => {
  beforeEach(() => {
    resetSupabaseClient();
    jest.clearAllMocks();
  });

  describe('initializeSupabase', () => {
    it('should create Supabase client with configuration', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      const client = await initializeSupabase();

      expect(configService.fetchConfig).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it('should return the same instance on multiple calls', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      const client1 = await initializeSupabase();
      const client2 = await initializeSupabase();

      expect(client1).toBe(client2);
      expect(configService.fetchConfig).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent initialization', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      const [client1, client2, client3] = await Promise.all([
        initializeSupabase(),
        initializeSupabase(),
        initializeSupabase(),
      ]);

      expect(client1).toBe(client2);
      expect(client2).toBe(client3);
      expect(configService.fetchConfig).toHaveBeenCalledTimes(1);
    });

    it('should throw error if configuration is missing Supabase config', async () => {
      const mockConfig = {
        // Missing supabase config
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      await expect(initializeSupabase()).rejects.toThrow('Supabase configuration is missing');
    });
  });

  describe('useSupabase', () => {
    it('should return loading state initially', () => {
      (configService.fetchConfig as jest.Mock).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useSupabase());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.client).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should return client after loading', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      const { result } = renderHook(() => useSupabase());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.client).toBeDefined();
      expect(result.current.error).toBe(null);
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to load configuration');
      (configService.fetchConfig as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSupabase());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.client).toBe(null);
      expect(result.current.error).toEqual(error);
    });

    it('should cleanup on unmount', () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValueOnce(mockConfig);

      const { unmount } = renderHook(() => useSupabase());

      unmount();

      // Should not cause any errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('useConfig', () => {
    it('should subscribe to configuration changes', () => {
      const mockSubscribe = configService.subscribe as jest.Mock;
      mockSubscribe.mockReturnValue(jest.fn());

      renderHook(() => useConfig());

      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should update state when configuration changes', () => {
      let subscribeCallback: any;
      const mockSubscribe = configService.subscribe as jest.Mock;
      mockSubscribe.mockImplementation((callback) => {
        subscribeCallback = callback;
        // Call immediately with initial state
        callback({
          config: null,
          isLoading: true,
          error: null,
        });
        return jest.fn();
      });

      const { result } = renderHook(() => useConfig());

      expect(result.current.config).toBe(null);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);

      // Simulate configuration loaded
      act(() => {
        subscribeCallback({
          config: {
            supabase: {
              url: 'https://test.supabase.co',
              anonKey: 'test-anon-key',
            },
          },
          isLoading: false,
          error: null,
        });
      });

      expect(result.current.config).toEqual({
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn();
      const mockSubscribe = configService.subscribe as jest.Mock;
      mockSubscribe.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useConfig());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should trigger config fetch if not loaded', () => {
      const mockSubscribe = configService.subscribe as jest.Mock;
      mockSubscribe.mockImplementation((callback) => {
        callback({
          config: null,
          isLoading: false,
          error: null,
        });
        return jest.fn();
      });

      const mockFetchConfig = configService.fetchConfig as jest.Mock;
      mockFetchConfig.mockResolvedValue({});

      renderHook(() => useConfig());

      expect(mockFetchConfig).toHaveBeenCalled();
    });
  });

  describe('resetSupabaseClient', () => {
    it('should reset client and clear cache', async () => {
      const mockConfig = {
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        },
      };

      (configService.fetchConfig as jest.Mock).mockResolvedValue(mockConfig);
      (configService.clearCache as jest.Mock).mockImplementation(() => {});

      // Initialize client
      await initializeSupabase();
      
      // Reset
      resetSupabaseClient();

      expect(configService.clearCache).toHaveBeenCalled();

      // Should create new client on next initialization
      const newClient = await initializeSupabase();
      expect(configService.fetchConfig).toHaveBeenCalledTimes(2);
    });
  });
});