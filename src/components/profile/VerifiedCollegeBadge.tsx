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

async function fetchVerifiedRegistry(): Promise<Set<string>> {
  if (globalVerifiedSet) return globalVerifiedSet;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const set = new Set<string>();
    try {
      const res = await fetch('/api/verify/linkedin-college');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verifications)) {
          for (const item of data.verifications) {
            if (item.userId) set.add(`uid:${item.userId}`);
            if (item.username) set.add(`user:${item.username.toLowerCase()}`);
            if (item.college) set.add(`col:${item.college.toLowerCase().trim()}`);
          }
        }
      }
    } catch {
      // Fallback via direct client if route is cached
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkedin_college_verifications')
          .maybeSingle();
        if (Array.isArray(data?.value)) {
          for (const item of data.value) {
            if (item.userId) set.add(`uid:${item.userId}`);
            if (item.username) set.add(`user:${item.username.toLowerCase()}`);
            if (item.college) set.add(`col:${item.college.toLowerCase().trim()}`);
          }
        }
      } catch {}
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
  const [localVerified, setLocalVerified] = useState<boolean>(Boolean(isVerified));

  useEffect(() => {
    // 1. If explicitly verified via prop
    if (isVerified === true) {
      setLocalVerified(true);
      return;
    }

    // 2. Check local storage (instant for current user's active session)
    try {
      const isLocallyVerified = localStorage.getItem('linkora_college_verified') === 'true';
      const verifiedCollegeName = localStorage.getItem('linkora_verified_college_name');
      if (
        isLocallyVerified &&
        college &&
        verifiedCollegeName &&
        college.toLowerCase().trim() === verifiedCollegeName.toLowerCase().trim()
      ) {
        setLocalVerified(true);
        return;
      }
    } catch (e) {}

    // 3. Check universal database registry so ALL other users & visitors see it
    let isMounted = true;
    fetchVerifiedRegistry().then((set) => {
      if (!isMounted) return;
      let matched = false;
      if (userId && set.has(`uid:${userId}`)) matched = true;
      if (username && set.has(`user:${username.toLowerCase().trim()}`)) matched = true;
      if (college && set.has(`col:${college.toLowerCase().trim()}`)) matched = true;

      if (matched) {
        setLocalVerified(true);
      }
    });

    // 4. Listen for real-time verification events
    const handleUpdate = () => {
      globalVerifiedSet = null; // Invalidate cache
      fetchVerifiedRegistry().then((set) => {
        if (!isMounted) return;
        let matched = false;
        if (userId && set.has(`uid:${userId}`)) matched = true;
        if (username && set.has(`user:${username.toLowerCase().trim()}`)) matched = true;
        if (college && set.has(`col:${college.toLowerCase().trim()}`)) matched = true;
        try {
          const isLocallyVerified = localStorage.getItem('linkora_college_verified') === 'true';
          const verifiedCollegeName = localStorage.getItem('linkora_verified_college_name');
          if (
            isLocallyVerified &&
            college &&
            verifiedCollegeName &&
            college.toLowerCase().trim() === verifiedCollegeName.toLowerCase().trim()
          ) {
            matched = true;
          }
        } catch (e) {}

        setLocalVerified(matched);
      });
    };

    window.addEventListener('linkora_college_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_college_updated', handleUpdate);
    };
  }, [college, isVerified, userId, username]);

  if (!college) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {showIcon && <GraduationCap className="w-3.5 h-3.5 opacity-70 shrink-0" />}
      <span className="truncate">{college}</span>
      {localVerified && (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#0A66C2]/15 text-[#0A66C2] dark:text-[#70B5F9] border border-[#0A66C2]/30 shadow-2xs shrink-0 select-none cursor-default"
          title="Verified College Affiliation via LinkedIn Education"
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-[#0A66C2] dark:text-[#70B5F9] stroke-[2.5]" />
          <span>Verified</span>
        </span>
      )}
    </span>
  );
}
