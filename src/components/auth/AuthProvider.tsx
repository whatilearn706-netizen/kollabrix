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
  loginWithAdminPasscode: (passcode: string) => boolean;
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
  loginWithAdminPasscode: () => false,
  authModalOpen: false,
  authModalView: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Synchronous hydration from localStorage prevents sudden session dropping during rapid taps
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_auth_user');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_auth_session');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_auth_profile');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('linkora_auth_user')) return false;
      } catch (e) {}
    }
    return true;
  });

  const [configured, setConfigured] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  // Helper to persist auth data to localStorage
  const persistSessionData = (u: User | null, s: Session | null, p: Profile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (u) {
        localStorage.setItem('linkora_auth_user', JSON.stringify(u));
      } else {
        localStorage.removeItem('linkora_auth_user');
      }

      if (s) {
        localStorage.setItem('linkora_auth_session', JSON.stringify(s));
      } else {
        localStorage.removeItem('linkora_auth_session');
      }

      if (p) {
        localStorage.setItem('linkora_auth_profile', JSON.stringify(p));
      } else {
        localStorage.removeItem('linkora_auth_profile');
      }
    } catch (e) {}
  };

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
        try {
          localStorage.setItem('linkora_auth_profile', JSON.stringify(data));
        } catch (e) {}
        return data as Profile;
      }

      // If profile record does not exist yet (e.g. trigger didn't run), create initial record
      if (currentUser) {
        const email = currentUser.email || '';
        const phone = currentUser.phone || '';
        const rawIdentifier = email || phone || 'student';
        const cleanedId = rawIdentifier.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

        const initialUsername = (
          currentUser.user_metadata?.username ||
          (cleanedId || 'user') + Math.floor(100 + Math.random() * 900)
        ).slice(0, 20);

        const initialDisplayName =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.user_metadata?.display_name ||
          (email ? email.split('@')[0] : phone ? `User (${phone.slice(-4)})` : 'Student');

        const initialAvatar =
          currentUser.user_metadata?.avatar_url ||
          currentUser.user_metadata?.picture ||
          null;

        const isOwner = email.toLowerCase() === 'goyalmayank142@gmail.com' || userId === '9343b52f-f7e8-4ed8-a8a1-476829811b53';

        const newProfile: Partial<Profile> = {
          user_id: userId,
          username: initialUsername,
          display_name: initialDisplayName,
          avatar_url: initialAvatar,
          role: isOwner ? 'admin' : 'student',
          bio: 'College builder excited to collaborate on Linkora projects.',
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
          try {
            localStorage.setItem('linkora_auth_profile', JSON.stringify(created));
          } catch (e) {}
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

    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(currentSession.user.id, currentSession.user).then((p) => {
          persistSessionData(currentSession.user, currentSession, p);
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        // Only reset if no backup session in localStorage
        const cachedUser = localStorage.getItem('linkora_auth_user');
        if (!cachedUser) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        persistSessionData(null, null, null);
        try {
          localStorage.removeItem('linkora_admin_session');
          localStorage.removeItem('linkora_admin_passcode');
        } catch (e) {}
        setIsLoading(false);
        return;
      }

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        const p = await fetchProfile(newSession.user.id, newSession.user);
        persistSessionData(newSession.user, newSession, p);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Fast Passcode Login (Owner emergency bypass)
  const loginWithAdminPasscode = (passcode: string): boolean => {
    const clean = passcode.trim().toLowerCase();
    if (clean === 'admin7x9' || clean === 'linkora2026') {
      const mockAdminUser: any = {
        id: '9343b52f-f7e8-4ed8-a8a1-476829811b53',
        email: 'goyalmayank142@gmail.com',
        user_metadata: {
          display_name: 'Mayank Goyal (Owner)',
          username: 'mayank_admin',
        },
      };

      const mockAdminProfile: Profile = {
        user_id: '9343b52f-f7e8-4ed8-a8a1-476829811b53',
        username: 'mayank_admin',
        display_name: 'Mayank Goyal (Owner)',
        avatar_url: null,
        bio: 'Linkora Platform Owner & Administrator',
        role: 'admin',
        status: 'active',
        is_suspended: false,
        skills: ['Fullstack Engineering', 'Platform Governance'],
        interests: ['Collegiate Innovation', 'Open Source'],
        preferred_roles: ['Platform Owner'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(mockAdminUser);
      setProfile(mockAdminProfile);
      setIsLoading(false);

      try {
        localStorage.setItem('linkora_auth_user', JSON.stringify(mockAdminUser));
        localStorage.setItem('linkora_auth_profile', JSON.stringify(mockAdminProfile));
        localStorage.setItem('linkora_admin_session', 'true');
        localStorage.setItem('linkora_admin_passcode', clean);
        window.dispatchEvent(new Event('linkora_auth_updated'));
      } catch (e) {}

      return true;
    }
    return false;
  };

  const signOut = async () => {
    try {
      if (configured) {
        await supabase.auth.signOut().catch(() => {});
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      persistSessionData(null, null, null);
      try {
        localStorage.removeItem('linkora_admin_session');
        localStorage.removeItem('linkora_admin_passcode');
        sessionStorage.removeItem('linkora_maintenance_unlocked');
      } catch (e) {}
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
        loginWithAdminPasscode,
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

