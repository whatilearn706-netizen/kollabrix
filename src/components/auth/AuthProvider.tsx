'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Profile } from '@/types/database';
import { AlertTriangle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithAdminPasscode: (passcode: string) => boolean;
  loginAsOwner: () => boolean;
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
  loginAsOwner: () => false,
  authModalOpen: false,
  authModalView: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

const DEFAULT_OWNER_USER: any = {
  id: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
  email: 'goyalmayank142@gmail.com',
  user_metadata: {
    display_name: 'Mayank Goyal (Owner)',
    username: 'mayank_admin',
  },
};

const DEFAULT_OWNER_PROFILE: Profile = {
  user_id: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
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
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [suspendedNotice, setSuspendedNotice] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('linkora_suspended_notice');
      } catch (e) {}
    }
    return null;
  });

  // Synchronous hydration from localStorage and 1-year cookies prevents session dropping across links
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('linkora_explicit_signout') === 'true') {
          return null;
        }
        const cachedProf = localStorage.getItem('linkora_auth_profile');
        if (cachedProf) {
          const parsedProf = JSON.parse(cachedProf);
          if (parsedProf?.is_suspended === true || parsedProf?.status === 'suspended') {
            return null;
          }
        }
        const cached = localStorage.getItem('linkora_auth_user');
        if (cached) return JSON.parse(cached);

        const hasUserCookie = document.cookie.includes('linkora_user_session=true');
        if (hasUserCookie) {
          const userIdMatch = document.cookie.match(/linkora_user_id=([^;]+)/);
          const userEmailMatch = document.cookie.match(/linkora_user_email=([^;]+)/);
          if (userIdMatch && userIdMatch[1]) {
            return {
              id: userIdMatch[1],
              email: userEmailMatch ? decodeURIComponent(userEmailMatch[1]) : '',
              user_metadata: {},
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as User;
          }
        }
      } catch (e) {}
    }
    return null;
  });

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('linkora_explicit_signout') === 'true') {
          return null;
        }
        const cachedProf = localStorage.getItem('linkora_auth_profile');
        if (cachedProf) {
          const parsedProf = JSON.parse(cachedProf);
          if (parsedProf?.is_suspended === true || parsedProf?.status === 'suspended') {
            return null;
          }
        }
        const cached = localStorage.getItem('linkora_auth_session');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('linkora_explicit_signout') === 'true') {
          return null;
        }
        const cached = localStorage.getItem('linkora_auth_profile');
        if (cached) {
          const parsedProf = JSON.parse(cached);
          if (parsedProf?.is_suspended === true || parsedProf?.status === 'suspended') {
            return null;
          }
          return parsedProf;
        }
      } catch (e) {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (
          localStorage.getItem('linkora_auth_user') ||
          localStorage.getItem('linkora_admin_session') === 'true' ||
          document.cookie.includes('linkora_admin_session=true') ||
          document.cookie.includes('linkora_user_session=true')
        ) {
          return false;
        }
      } catch (e) {}
    }
    return true;
  });

  const [configured, setConfigured] = useState(() => isSupabaseConfigured());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  // Helper to persist auth data to localStorage and persistent cookies for ALL authenticated accounts
  const persistSessionData = (u: User | null, s: Session | null, p: Profile | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (u) {
        localStorage.removeItem('linkora_explicit_signout');
        sessionStorage.removeItem('linkora_explicit_signout');
        sessionStorage.removeItem('linkora_signing_out');
        localStorage.setItem('linkora_auth_user', JSON.stringify(u));
        localStorage.setItem('linkora_auth_user_id', u.id);
        localStorage.setItem('linkora_auth_user_email', u.email || '');
        // 1-year persistent session cookie for all accounts across tabs and subdomains
        document.cookie = 'linkora_user_session=true; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = `linkora_user_id=${u.id}; path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `linkora_user_email=${encodeURIComponent(u.email || '')}; path=/; max-age=31536000; SameSite=Lax`;

        const email = (u.email || '').toLowerCase();
        if (email === 'goyalmayank142@gmail.com' || u.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53' || p?.role === 'admin') {
          localStorage.setItem('linkora_admin_session', 'true');
          document.cookie = 'linkora_admin_session=true; path=/; max-age=31536000; SameSite=Lax';
        }
      } else {
        localStorage.removeItem('linkora_auth_user');
        localStorage.removeItem('linkora_auth_user_id');
        localStorage.removeItem('linkora_auth_user_email');
      }

      if (s) {
        localStorage.setItem('linkora_auth_session', JSON.stringify(s));
      } else if (!u) {
        localStorage.removeItem('linkora_auth_session');
      }

      if (p) {
        localStorage.setItem('linkora_auth_profile', JSON.stringify(p));
      } else if (!u) {
        localStorage.removeItem('linkora_auth_profile');
      }
    } catch (e) {}
  };

  const performForcedSignOut = useCallback(async (reason?: string) => {
    const notice = reason || 'Your account has been suspended by administration. Access has been revoked.';
    setSuspendedNotice(notice);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('linkora_suspended_notice', notice);
        localStorage.setItem('linkora_explicit_signout', 'true');
        sessionStorage.setItem('linkora_signing_out', 'true');
        localStorage.removeItem('linkora_auth_user');
        localStorage.removeItem('linkora_auth_user_id');
        localStorage.removeItem('linkora_auth_user_email');
        localStorage.removeItem('linkora_auth_session');
        localStorage.removeItem('linkora_auth_profile');
        localStorage.removeItem('linkora_admin_session');
        localStorage.removeItem('linkora_admin_passcode');
        const expCookie = '; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'linkora_admin_session=' + expCookie;
        document.cookie = 'linkora_user_session=' + expCookie;
        document.cookie = 'linkora_user_email=' + expCookie;
        document.cookie = 'linkora_user_id=' + expCookie;
        window.dispatchEvent(new Event('linkora_auth_updated'));
      } catch (e) {}
    }

    setUser(null);
    setProfile(null);
    setSession(null);

    if (isSupabaseConfigured()) {
      await supabase.auth.signOut().catch(() => {});
    }
  }, []);

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
        const isOwner =
          email === 'goyalmayank142@gmail.com' ||
          userId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
          userId === '9343b52f-f7e8-4ed8-a8a1-476829811b53';

        if (isOwner) {
          data.role = 'admin';
          data.is_suspended = false;
          data.status = 'active';
        } else if (data.is_suspended === true || data.status === 'suspended') {
          console.warn('Suspended user detected during profile fetch:', userId);
          await performForcedSignOut(data.suspension_reason || 'This account has been suspended by administration.');
          return null;
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
  }, [performForcedSignOut]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id, user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    // If incoming OAuth authorization code lands outside /auth/callback, forward directly to exchange it
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code') && !window.location.pathname.startsWith('/auth/callback')) {
        window.location.replace('/auth/callback' + window.location.search);
        return;
      }
    }

    const isConfig = isSupabaseConfigured();
    setConfigured(isConfig);

    if (!isConfig) {
      setIsLoading(false);
      return;
    }

    // 1. Initial Session Retrieval from Supabase
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        persistSessionData(currentSession.user, currentSession, profile);
        fetchProfile(currentSession.user.id, currentSession.user).then((p) => {
          if (p) persistSessionData(currentSession.user, currentSession, p);
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        // If Supabase has no active session returned yet, NEVER drop cached multi-tab session!
        try {
          const cachedUser = localStorage.getItem('linkora_auth_user');
          const cachedProfile = localStorage.getItem('linkora_auth_profile');
          const cachedSession = localStorage.getItem('linkora_auth_session');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
            if (cachedProfile) setProfile(JSON.parse(cachedProfile));
            if (cachedSession) {
              const parsed = JSON.parse(cachedSession);
              setSession(parsed);
              if (parsed?.access_token && parsed?.refresh_token) {
                supabase.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                }).then(({ data }) => {
                  if (data?.session?.user) {
                    setUser(data.session.user);
                    setSession(data.session);
                  }
                }).catch(() => {});
              }
            }
          }
        } catch (e) {}
        setIsLoading(false);
      }
    });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        try {
          localStorage.removeItem('linkora_explicit_signout');
          sessionStorage.removeItem('linkora_explicit_signout');
          sessionStorage.removeItem('linkora_signing_out');
        } catch (e) {}
        setSession(newSession);
        setUser(newSession.user);
        persistSessionData(newSession.user, newSession, profile);
        fetchProfile(newSession.user.id, newSession.user).then((p) => {
          if (p) persistSessionData(newSession.user, newSession, p);
        });
        setIsLoading(false);
        return;
      }

      // ONLY wipe if user explicitly invoked signOut() in this browser!
      if (event === 'SIGNED_OUT') {
        const isExplicit =
          typeof window !== 'undefined' &&
          (sessionStorage.getItem('linkora_signing_out') === 'true' ||
           localStorage.getItem('linkora_explicit_signout') === 'true');

        if (isExplicit) {
          try {
            sessionStorage.removeItem('linkora_signing_out');
          } catch (e) {}
          setUser(null);
          setSession(null);
          setProfile(null);
          persistSessionData(null, null, null);
        } else {
          // Supabase SSR background client sent temporary SIGNED_OUT — preserve user from cache!
          try {
            const cachedUser = localStorage.getItem('linkora_auth_user');
            const cachedProfile = localStorage.getItem('linkora_auth_profile');
            const cachedSession = localStorage.getItem('linkora_auth_session');
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              if (cachedProfile) setProfile(JSON.parse(cachedProfile));
              if (cachedSession) {
                const parsed = JSON.parse(cachedSession);
                setSession(parsed);
                if (parsed?.access_token && parsed?.refresh_token) {
                  supabase.auth.setSession({
                    access_token: parsed.access_token,
                    refresh_token: parsed.refresh_token,
                  }).catch(() => {});
                }
              }
            }
          } catch (e) {}
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    });

    // 3. Real-Time Cross-Tab Synchronization (Never drop account when exchanging tabs)
    const syncAcrossTabs = () => {
      if (typeof window === 'undefined') return;
      try {
        // Only wipe state if an explicit sign-out occurred in another tab
        if (localStorage.getItem('linkora_explicit_signout') === 'true') {
          setUser(null);
          setProfile(null);
          setSession(null);
          return;
        }

        const rawUser = localStorage.getItem('linkora_auth_user');
        const rawProfile = localStorage.getItem('linkora_auth_profile');
        const rawSession = localStorage.getItem('linkora_auth_session');

        if (rawUser) {
          setUser(JSON.parse(rawUser));
          if (rawProfile) setProfile(JSON.parse(rawProfile));
          if (rawSession) setSession(JSON.parse(rawSession));
        } else if (document.cookie.includes('linkora_user_session=true')) {
          // If persistent cookie exists, preserve the logged-in session!
          const userIdMatch = document.cookie.match(/linkora_user_id=([^;]+)/);
          const userEmailMatch = document.cookie.match(/linkora_user_email=([^;]+)/);
          if (userIdMatch && userIdMatch[1]) {
            setUser((prev) => prev || ({
              id: userIdMatch[1],
              email: userEmailMatch ? decodeURIComponent(userEmailMatch[1]) : '',
              user_metadata: {},
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as User));
          }
        }
      } catch (e) {}
    };

    // 4. Real-Time Account Suspension Watcher (instant polling + server API + realtime channel)
    const checkSuspensionRealtime = async () => {
      try {
        let activeUserId = user?.id;
        let activeEmail = user?.email;
        if (!activeUserId && typeof window !== 'undefined') {
          activeUserId = localStorage.getItem('linkora_auth_user_id') || undefined;
          activeEmail = localStorage.getItem('linkora_auth_user_email') || undefined;
        }
        if (!activeUserId) return;

        const isOwner =
          activeEmail?.toLowerCase() === 'goyalmayank142@gmail.com' ||
          activeUserId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
          activeUserId === '9343b52f-f7e8-4ed8-a8a1-476829811b53';
        if (isOwner) return;

        // 1. Authoritative server-side suspension check (bypasses RLS & verifies DB + settings)
        try {
          const res = await fetch('/api/auth/check-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUserId }),
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            if (data.isSuspended) {
              await performForcedSignOut(data.reason || 'This account has been suspended by administration.');
              return;
            }
          }
        } catch (apiErr) {}

        // 2. Direct Supabase client query fallback
        const { data: prof } = await supabase
          .from('profiles')
          .select('is_suspended, status, suspension_reason')
          .eq('user_id', activeUserId)
          .maybeSingle();

        if (prof && (prof.is_suspended === true || prof.status === 'suspended')) {
          await performForcedSignOut(prof.suspension_reason || 'This account has been suspended by administration.');
        }
      } catch (e) {}
    };

    const suspensionInterval = setInterval(checkSuspensionRealtime, 3000);
    window.addEventListener('focus', checkSuspensionRealtime);
    window.addEventListener('visibilitychange', checkSuspensionRealtime);

    let realtimeChannel: any = null;
    const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('linkora_auth_user_id') : null);
    if (currentUserId && isConfig) {
      realtimeChannel = supabase
        .channel(`user-suspension-live-${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${currentUserId}`,
          },
          (payload: any) => {
            const updated = payload?.new;
            if (updated && (updated.is_suspended === true || updated.status === 'suspended')) {
              performForcedSignOut(updated.suspension_reason || 'This account has been suspended by administration.');
            }
          }
        )
        .subscribe();
    }

    window.addEventListener('storage', syncAcrossTabs);
    window.addEventListener('focus', syncAcrossTabs);
    window.addEventListener('visibilitychange', syncAcrossTabs);
    window.addEventListener('linkora_auth_updated', syncAcrossTabs);

    return () => {
      subscription.unsubscribe();
      clearInterval(suspensionInterval);
      window.removeEventListener('focus', checkSuspensionRealtime);
      window.removeEventListener('visibilitychange', checkSuspensionRealtime);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
      window.removeEventListener('storage', syncAcrossTabs);
      window.removeEventListener('focus', syncAcrossTabs);
      window.removeEventListener('visibilitychange', syncAcrossTabs);
      window.removeEventListener('linkora_auth_updated', syncAcrossTabs);
    };
  }, [fetchProfile, performForcedSignOut, user?.id, user?.email]);

  // Instant 1-Click Founder Login (Permanent)
  const loginAsOwner = useCallback((): boolean => {
    setUser(DEFAULT_OWNER_USER);
    setProfile(DEFAULT_OWNER_PROFILE);
    setIsLoading(false);

    try {
      localStorage.removeItem('linkora_explicit_signout');
      localStorage.setItem('linkora_auth_user', JSON.stringify(DEFAULT_OWNER_USER));
      localStorage.setItem('linkora_auth_profile', JSON.stringify(DEFAULT_OWNER_PROFILE));
      document.cookie = 'linkora_user_session=true; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'linkora_user_email=goyalmayank142@gmail.com; path=/; max-age=31536000; SameSite=Lax';
      window.dispatchEvent(new Event('linkora_auth_updated'));
    } catch (e) {}

    return true;
  }, []);

  // Passcode login delegator (Actual verification done strictly server-side)
  const loginWithAdminPasscode = (_passcode: string): boolean => {
    return false;
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('linkora_explicit_signout', 'true');
        sessionStorage.setItem('linkora_signing_out', 'true');
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      persistSessionData(null, null, null);
      try {
        localStorage.removeItem('linkora_admin_session');
        const expCookie = '; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'linkora_admin_session=' + expCookie;
        document.cookie = 'linkora_user_session=' + expCookie;
        document.cookie = 'linkora_user_email=' + expCookie;
        document.cookie = 'linkora_user_id=' + expCookie;
        sessionStorage.removeItem('linkora_maintenance_unlocked');
        window.dispatchEvent(new Event('linkora_auth_updated'));
      } catch (e) {}
      if (configured) {
        await supabase.auth.signOut().catch(() => {});
      }
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
        loginAsOwner,
        authModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}

      {/* Immediate Account Suspension Banner Modal */}
      {suspendedNotice && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0f131f] border border-rose-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Account Suspended</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your account has been suspended by platform administration. All active sessions have been securely terminated.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-rose-500/25 text-rose-300 text-xs text-left font-mono break-words">
              <span className="font-semibold text-rose-400 block mb-1">Notice / Reason:</span>
              {suspendedNotice}
            </div>

            <p className="text-[11px] text-slate-400">
              If you believe this suspension is in error or wish to appeal, please contact{' '}
              <span className="text-slate-200 font-medium">support@linkora-link.online</span>.
            </p>

            <button
              type="button"
              onClick={() => {
                setSuspendedNotice(null);
                try {
                  sessionStorage.removeItem('linkora_suspended_notice');
                } catch (e) {}
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors border border-slate-700 cursor-pointer"
            >
              Acknowledge &amp; Close
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
