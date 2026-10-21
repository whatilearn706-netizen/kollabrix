'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface VerifiedCollegeBadgeProps {
  college?: string | null;
  isVerified?: boolean;
  userId?: string | null;
  username?: string | null;
  className?: string;
  showIcon?: boolean;
  showUnverified?: boolean;
  size?: 'xs' | 'sm' | 'md';
  badgeOnly?: boolean;
}

// Global in-memory cache shared across all badge instances to avoid duplicate requests
let globalVerifiedSet: Set<string> | null = null;
let fetchPromise: Promise<Set<string>> | null = null;

function checkSetMatch(
  set: Set<string>,
  userId?: string | null,
  username?: string | null
): boolean {
  if (userId && set.has(`uid:${userId}`)) return true;
  if (username && set.has(`user:${username.toLowerCase().trim()}`)) return true;
  return false;
}

export async function fetchVerifiedRegistry(force = false): Promise<Set<string>> {
  if (!force && globalVerifiedSet) return globalVerifiedSet;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const set = new Set<string>();

    // 1. Direct query to Supabase platform_settings (real-time database)
    let directSuccess = false;
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'linkedin_college_verifications')
        .maybeSingle();

      if (Array.isArray(data?.value)) {
        for (const item of data.value) {
          if (item.userId) set.add(`uid:${item.userId}`);
          if (item.username) set.add(`user:${item.username.toLowerCase().trim()}`);
        }
        directSuccess = true;
      }
    } catch (e) {
      // ignore
    }

    // 2. Fallback to API endpoint only if direct query failed
    if (!directSuccess) {
      try {
        const res = await fetch('/api/verify/linkedin-college', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.verifications)) {
            for (const item of data.verifications) {
              if (item.userId) set.add(`uid:${item.userId}`);
              if (item.username) set.add(`user:${item.username.toLowerCase().trim()}`);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('linkora_verified_registry_cache', JSON.stringify(Array.from(set)));
      } catch (e) {}
    }

    globalVerifiedSet = set;
    fetchPromise = null;
    return set;
  })();

  return fetchPromise;
}

export function VerifiedCollegeBadge({
  college,
  isVerified,
  userId,
  username,
  className = '',
  showIcon = false,
  showUnverified = true,
  size = 'sm',
  badgeOnly = false,
}: VerifiedCollegeBadgeProps) {
  const [localVerified, setLocalVerified] = useState<boolean>(() => {
    if (isVerified === true) return true;
    if (isVerified === false) return false;
    if (typeof window !== 'undefined') {
      try {
        const cachedRegistry = localStorage.getItem('linkora_verified_registry_cache');
        if (cachedRegistry) {
          const list = JSON.parse(cachedRegistry);
          if (Array.isArray(list)) {
            const tempSet = new Set<string>(list);
            if (checkSetMatch(tempSet, userId, username)) return true;
          }
        }
      } catch (e) {}
    }
    return false;
  });

  useEffect(() => {
    if (isVerified === true) {
      setLocalVerified(true);
      return;
    }
    if (isVerified === false) {
      setLocalVerified(false);
      return;
    }

    let isMounted = true;

    // Check universal database registry so ALL other users & visitors see it
    fetchVerifiedRegistry().then((set) => {
      if (!isMounted) return;
      setLocalVerified(checkSetMatch(set, userId, username));
    });

    // Listen for real-time verification events
    const handleUpdate = () => {
      globalVerifiedSet = null;
      fetchVerifiedRegistry(true).then((set) => {
        if (!isMounted) return;
        setLocalVerified(checkSetMatch(set, userId, username));
      });
    };

    window.addEventListener('linkora_college_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_college_updated', handleUpdate);
    };
  }, [college, isVerified, userId, username]);

  if (!college && !badgeOnly) return null;

  if (badgeOnly) {
    if (localVerified) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs shrink-0 select-none cursor-default whitespace-nowrap ${className}`}
          title="Official College Affiliation Verified via Student ID Card"
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Verified</span>
        </span>
      );
    }
    if (showUnverified) {
      return (
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-2xs shrink-0 select-none cursor-default whitespace-nowrap ${className}`}
          title="College Affiliation Not Yet Verified"
        >
          <span>Not Verified</span>
        </span>
      );
    }
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 min-w-0 max-w-full ${className}`}>
      {showIcon && <GraduationCap className="w-3.5 h-3.5 opacity-70 shrink-0" />}
      <span className="truncate">{college}</span>
      {localVerified ? (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs shrink-0 select-none cursor-default whitespace-nowrap"
          title="Official College Affiliation Verified via Student ID Card"
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          <span>Verified</span>
        </span>
      ) : showUnverified ? (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-2xs shrink-0 select-none cursor-default whitespace-nowrap"
          title="College Affiliation Not Yet Verified"
        >
          <span>Not Verified</span>
        </span>
      ) : null}
    </span>
  );
}
