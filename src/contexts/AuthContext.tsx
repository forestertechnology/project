import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, forceLogout, initializeSession } from '../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  subscription_tier_id: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  sessionExpiresAt: number | null;
  timeUntilExpiration: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<{ emailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSessionExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState(0);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      setUser(data.user);
      await fetchProfile(data.user.id);
    } catch (error) {
      console.error('Sign in error:', error);
      setUser(null);
      setProfile(null);
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
  ) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{ 
          id: authData.user.id, 
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) throw profileError;

      setUser(authData.user);
      await fetchProfile(authData.user.id);
      
      return { emailConfirmation: !authData.session };
    } catch (error) {
      setUser(null);
      setProfile(null);
      throw error;
    }
  }

  async function signOut() {
    try {
      await forceLogout();
      
      setUser(null);
      setProfile(null);
      setSessionExpiresAt(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  const checkSessionExpiration = useCallback(() => {
    if (sessionExpiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = sessionExpiresAt - now;
      setTimeUntilExpiration(Math.max(timeLeft, 0));

      if (timeLeft <= 300) { // 5 minutes warning
        console.warn('Session will expire soon. Refreshing...');
        refreshSession().catch(console.error);
      }
    }
  }, [sessionExpiresAt]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        // Add a more strict check for session validity
        const currentTime = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < currentTime) {
          await signOut(); // Force logout if session is truly expired
          return;
        }
        setUser(session.user);
        setSessionExpiresAt(session.expires_at ?? null);
      } else {
        await signOut();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await signOut();
    }
  }, []);

  useEffect(() => {
    const checkExpirationInterval = setInterval(checkSessionExpiration, 60000); // Check every minute
    return () => clearInterval(checkExpirationInterval);
  }, [checkSessionExpiration]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Use the new initialization method
        const session = await initializeSession();
        
        if (session?.user) {
          setUser(session.user);
          setSessionExpiresAt(session.expires_at ?? null);
          
          try {
            await fetchProfile(session.user.id);
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setSessionExpiresAt(session.expires_at ?? null);
        try {
          await fetchProfile(session.user.id);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSessionExpiresAt(null);
      }
    });

    // Initial auth check
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    sessionExpiresAt,
    timeUntilExpiration,
    signIn,
    signUp,
    signOut,
    refreshSession,
    checkSessionExpiration
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
