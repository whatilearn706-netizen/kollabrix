'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  authModalOpen: boolean;
  authModalView: 'login' | 'signup';
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  authModalOpen: false,
  authModalView: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching user profile:', error.message);
      }

      if (data) {
        const email = (currentUser?.email || '').trim().toLowerCase();
        if (email === 'goyalmayank142@gmail.com' || userId === '9343b52f-f7e8-4ed8-a8a1-476829811b53') {
          data.role = 'admin';
          data.is_suspended = false;
          data.status = 'active';
        }
        setProfile(data as Profile);
        return data as Profile;
      }

      // If profile record does not exist yet (e.g. trigger didn't run), create initial record
      if (currentUser) {
        const email = currentUser.email || 'student';
        const initialUsername =
          (currentUser.user_metadata?.username ||
            email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(100 + Math.random() * 900))
            .slice(0, 20);
        const initialDisplayName =
          currentUser.user_metadata?.display_name || email.split('@')[0] || 'Student';

        const newProfile: Partial<Profile> = {
          user_id: userId,
          username: initialUsername,
          display_name: initialDisplayName,
          bio: 'College student excited to build and collaborate on innovative projects.',
          skills: [],
          interests: [],
          preferred_roles: [],
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select('*')
          .single();

        if (!createError && created) {
          setProfile(created as Profile);
          return created as Profile;
        }
      }
    } catch (err) {
      console.warn('Failed to load or initialize profile:', err);
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const isConfig = isSupabaseConfigured();
    setConfigured(isConfig);

    if (!isConfig) {
      setIsLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    if (!configured) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const openAuthModal = (view: 'login' | 'signup' = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: configured,
        signOut,
        refreshProfile,
        authModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
