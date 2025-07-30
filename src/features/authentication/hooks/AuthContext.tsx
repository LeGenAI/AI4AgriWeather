
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

          setProfile(createdProfile);
          return;
        }
        
        console.error('AuthContext: Error fetching profile:', error);
        throw error;
      }

      console.log('AuthContext: Profile fetched successfully');
      setProfile(data);
    } catch (err) {
      console.error('AuthContext: Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'Profile fetch error');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting logout process...');
      
      // Clear local state immediately to provide instant feedback
      clearAuthState();
      
      // Attempt to sign out from server
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('AuthContext: Logout error:', error);
        
        // If session is invalid on server, we've already cleared local state
        if (error.message.includes('session_not_found') || 
            error.message.includes('Session not found') ||
            error.status === 403) {
          console.log('AuthContext: Session already invalid on server');
          return;
        }
        
        // For other errors, still ensure local session is cleared
        await supabase.auth.signOut({ scope: 'local' });
        return;
      }
      
      console.log('AuthContext: Logout successful');
    } catch (err) {
      console.error('AuthContext: Unexpected logout error:', err);
      
      // Even if there's an error, try to clear local session
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (localError) {
        console.error('AuthContext: Failed to clear local session:', localError);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        console.log('AuthContext: Auth state changed:', event, newSession?.user?.email || 'No session');
        
        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Handle sign in events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          updateAuthState(newSession).then(() => {
            setLoading(false);
          });
          return;
        }
        
        // For other events, update state if there's an actual change
        if (session?.access_token !== newSession?.access_token) {
          updateAuthState(newSession).then(() => {
            if (loading) setLoading(false);
          });
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthContext: Error getting initial session:', sessionError);
          
          // If the session is invalid, clear local state
          if (sessionError.message.includes('session_not_found') || 
              sessionError.message.includes('Session not found')) {
            console.log('AuthContext: Session not found on server, clearing local session');
            await supabase.auth.signOut({ scope: 'local' });
            if (mounted) {
              clearAuthState();
              setLoading(false);
            }
            return;
          }
          
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          console.log('AuthContext: Initial session:', initialSession?.user?.email || 'No session');
          await updateAuthState(initialSession);
          setLoading(false);
        }
      } catch (err) {
        console.error('AuthContext: Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication error');
          setLoading(false);
        }
      }
    };

    // Initialize auth state after setting up listener
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only once

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    needsOnboarding: !!user && !!profile && !profile.onboarding_completed,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
