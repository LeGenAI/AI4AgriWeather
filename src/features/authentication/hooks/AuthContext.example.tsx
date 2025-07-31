/**
 * Example: Migrated AuthContext using dynamic Supabase configuration
 * This shows how to update the existing AuthContext to use the new configuration system
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use the dynamic Supabase client
  const { client: supabase, isLoading: isConfigLoading, error: configError } = useSupabase();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateAuthState = async (newSession: Session | null) => {
    console.log('AuthContext: Updating auth state:', newSession?.user?.email || 'No session');
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    // Clear any previous errors on successful auth
    if (newSession && error) {
      setError(null);
    }

    // Fetch profile if user is authenticated
    if (newSession?.user) {
      await fetchProfile(newSession.user.id);
    } else {
      setProfile(null);
    }
  };

  const clearAuthState = () => {
    console.log('AuthContext: Clearing auth state');
    setSession(null);
    setUser(null);
    setProfile(null);
    setError(null);
  };

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('AuthContext: Profile not found, creating new profile');
          const newProfile = {
            id: userId,
            email: user?.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            onboarding_completed: false,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('AuthContext: Error creating profile:', createError);
            throw createError;
          }

          console.log('AuthContext: Profile created:', createdProfile);
          setProfile(createdProfile);
        } else {
          console.error('AuthContext: Error fetching profile:', error);
          throw error;
        }
      } else {
        console.log('AuthContext: Profile fetched:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('AuthContext: Failed to fetch/create profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    }
  };

  const refreshProfile = async () => {
    if (user && supabase) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    
    try {
      console.log('AuthContext: Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearAuthState();
    } catch (err) {
      console.error('AuthContext: Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  // Initialize auth state when Supabase client is ready
  useEffect(() => {
    if (!supabase) return;

    // Check active session
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth state');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          setError(error.message);
        } else {
          await updateAuthState(session);
        }
      } catch (err) {
        console.error('AuthContext: Failed to initialize auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event);
        await updateAuthState(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]); // Re-run when Supabase client becomes available

  const isAuthenticated = !!session;
  const needsOnboarding = isAuthenticated && profile && !profile.onboarding_completed;

  // Handle configuration loading state
  if (isConfigLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Handle configuration error
  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-destructive mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">{configError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    isAuthenticated,
    needsOnboarding,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};