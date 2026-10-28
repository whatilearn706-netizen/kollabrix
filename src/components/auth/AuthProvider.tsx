'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const isSigningOutRef = useRef(false);

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
    const notice = reason || 'Your account has been suspended. Access has been revoked.';
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
        const expCookie = '; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
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
        // Enforce suspension for every account, including the platform owner.
        if (data.is_suspended === true || data.status === 'suspended') {
          console.warn('Suspended user detected during profile fetch:', userId);
          await performForcedSignOut(data.suspension_reason || 'This account has been suspended.');
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

        const newProfile: Partial<Profile> = {
          user_id: userId,
          username: initialUsername,
          display_name: initialDisplayName,
          avatar_url: initialAvatar,
          role: 'student',
          bio: 'College builder excited to collaborate on Kollabrix projects.',
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
      const isExplicitSignOut =
        isSigningOutRef.current ||
        (typeof window !== 'undefined' &&
          (sessionStorage.getItem('linkora_signing_out') === 'true' ||
            localStorage.getItem('linkora_explicit_signout') === 'true'));

      if (isExplicitSignOut) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

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
      const isExplicitSignOut =
        isSigningOutRef.current ||
        (typeof window !== 'undefined' &&
          (sessionStorage.getItem('linkora_signing_out') === 'true' ||
            localStorage.getItem('linkora_explicit_signout') === 'true'));

      // If explicit signout is active and user didn't intentionally trigger a fresh SIGNED_IN event, never restore
      if (isExplicitSignOut && event !== 'SIGNED_IN') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (newSession?.user) {
        isSigningOutRef.current = false;
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
        try {
          sessionStorage.removeItem('linkora_signing_out');
        } catch (e) {}
        setUser(null);
        setSession(null);
        setProfile(null);
        persistSessionData(null, null, null);
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
        if (
          isSigningOutRef.current ||
          localStorage.getItem('linkora_explicit_signout') === 'true' ||
          sessionStorage.getItem('linkora_signing_out') === 'true'
        ) {
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
              await performForcedSignOut(data.reason || 'This account has been suspended.');
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
          await performForcedSignOut(prof.suspension_reason || 'This account has been suspended.');
        }
      } catch (e) {}
    };

    const suspensionInterval = setInterval(checkSuspensionRealtime, 60000);
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
              performForcedSignOut(updated.suspension_reason || 'This account has been suspended.');
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

  // Client-side owner impersonation is disabled.
  const loginAsOwner = useCallback((): boolean => false, []);

  // Passcode login delegator (Actual verification done strictly server-side)
  const loginWithAdminPasscode = (_passcode: string): boolean => {
    return false;
  };

  const signOut = async () => {
    try {
      isSigningOutRef.current = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('linkora_signing_out', 'true');
        localStorage.setItem('linkora_explicit_signout', 'true');
      }

      // 1. Immediately zero-out React state for instant UI update (0ms transition)
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsLoading(false);

      // 2. Wipe Linkora storage & credentials
      persistSessionData(null, null, null);

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('linkora_student_id_status');
          localStorage.removeItem('linkora_auth_user');
          localStorage.removeItem('linkora_auth_user_id');
          localStorage.removeItem('linkora_auth_user_email');
          localStorage.removeItem('linkora_auth_session');
          localStorage.removeItem('linkora_auth_profile');
          sessionStorage.removeItem('linkora_maintenance_unlocked');

          // Purge all Supabase and Linkora keys in localStorage
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.startsWith('linkora_'))) {
              localStorage.removeItem(key);
            }
          }

          // Expire Linkora session cookies across paths
          const cookieNames = [
            'linkora_user_session',
            'linkora_user_email',
            'linkora_user_id',
          ];
          cookieNames.forEach((name) => {
            document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          });

          // Purge all Supabase auth cookies (sb-*)
          document.cookie.split(';').forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.startsWith('sb-') || name.startsWith('linkora_')) {
              document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
              document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
          });

          window.dispatchEvent(new Event('linkora_auth_updated'));
        } catch (e) {}
      }

      // 3. Inform Supabase Auth client to revoke both local cache and remote session
      if (configured) {
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {}
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      // 4. If current route requires authentication, redirect cleanly to homepage
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (
          path.includes('control-center') ||
          path.startsWith('/profile/setup') ||
          path.startsWith('/settings') ||
          path.startsWith('/my-') ||
          path.startsWith('/projects/new')
        ) {
          window.location.href = '/';
        }
      }
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
                Your account has been suspended. All active sessions have been securely terminated.
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
