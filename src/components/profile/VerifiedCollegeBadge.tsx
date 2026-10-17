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
  size?: 'xs' | 'sm' | 'md';
}

// Global in-memory cache shared across all badge instances to avoid duplicate requests
let globalVerifiedSet: Set<string> | null = null;
let fetchPromise: Promise<Set<string>> | null = null;

function checkSetMatch(
  set: Set<string>,
  userId?: string | null,
  username?: string | null,
  college?: string | null
): boolean {
  if (userId && set.has(`uid:${userId}`)) return true;
  if (username && set.has(`user:${username.toLowerCase().trim()}`)) return true;
  if (college && set.has(`col:${college.toLowerCase().trim()}`)) return true;
  return false;
}

export async function fetchVerifiedRegistry(force = false): Promise<Set<string>> {
  if (!force && globalVerifiedSet && globalVerifiedSet.size > 0) return globalVerifiedSet;
  if (!force && fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const set = new Set<string>();

    // Always include Mayank Goyal in registry
    set.add('uid:c86ce05f-24de-4a1a-a45f-944d4180b508');
    set.add('user:mayank142');
    set.add('col:bosscoder school of technology');

    // 1. Direct query to Supabase platform_settings (real-time database)
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
          if (item.college) set.add(`col:${item.college.toLowerCase().trim()}`);
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Fetch from API endpoint with no-store
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
            if (item.college) set.add(`col:${item.college.toLowerCase().trim()}`);
          }
        }
      }
    } catch (e) {
      // ignore
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
  size = 'sm',
}: VerifiedCollegeBadgeProps) {
  const isKnownVerified =
    isVerified === true ||
    username?.toLowerCase().trim() === 'mayank142' ||
    userId === 'c86ce05f-24de-4a1a-a45f-944d4180b508';

  const [localVerified, setLocalVerified] = useState<boolean>(() => {
    if (isKnownVerified) return true;
    if (typeof window !== 'undefined') {
      try {
        const isLocallyVerified = localStorage.getItem('linkora_college_verified') === 'true';
        const verifiedCollegeName = localStorage.getItem('linkora_verified_college_name');
        if (
          isLocallyVerified &&
          college &&
          verifiedCollegeName &&
          college.toLowerCase().trim() === verifiedCollegeName.toLowerCase().trim()
        ) {
          return true;
        }
        const cachedRegistry = localStorage.getItem('linkora_verified_registry_cache');
        if (cachedRegistry) {
          const list = JSON.parse(cachedRegistry);
          if (Array.isArray(list)) {
            const tempSet = new Set<string>(list);
            if (checkSetMatch(tempSet, userId, username, college)) return true;
          }
        }
      } catch (e) {}
    }
    return false;
  });

  useEffect(() => {
    if (isKnownVerified) {
      setLocalVerified(true);
      return;
    }

    let isMounted = true;

    // Check universal database registry so ALL other users & visitors see it
    fetchVerifiedRegistry().then((set) => {
      if (!isMounted) return;
      if (checkSetMatch(set, userId, username, college)) {
        setLocalVerified(true);
      }
    });

    // Listen for real-time verification events
    const handleUpdate = () => {
      fetchVerifiedRegistry(true).then((set) => {
        if (!isMounted) return;
        const matched = checkSetMatch(set, userId, username, college);
        setLocalVerified(matched || isKnownVerified);
      });
    };

    window.addEventListener('linkora_college_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_college_updated', handleUpdate);
    };
  }, [college, isVerified, userId, username, isKnownVerified]);

  if (!college) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {showIcon && <GraduationCap className="w-3.5 h-3.5 opacity-70 shrink-0" />}
      <span className="truncate">{college}</span>
      {localVerified && (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#0A66C2]/15 text-[#0A66C2] dark:text-[#70B5F9] border border-[#0A66C2]/30 shadow-2xs shrink-0 select-none cursor-default"
          title="Verified College Affiliation via LinkedIn Education"
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-[#0A66C2] dark:text-[#70B5F9] stroke-[2.5]" />
          <span>Verified</span>
        </span>
      )}
    </span>
  );
}
