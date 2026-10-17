'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';

interface VerifiedCollegeBadgeProps {
  college?: string | null;
  isVerified?: boolean;
  className?: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

export function VerifiedCollegeBadge({
  college,
  isVerified,
  className = '',
  showIcon = false,
  size = 'sm',
}: VerifiedCollegeBadgeProps) {
  const [localVerified, setLocalVerified] = useState<boolean>(Boolean(isVerified));

  useEffect(() => {
    if (isVerified !== undefined) {
      setLocalVerified(Boolean(isVerified));
    } else {
      try {
        const isLocallyVerified = localStorage.getItem('linkora_college_verified') === 'true';
        const verifiedCollegeName = localStorage.getItem('linkora_verified_college_name');
        if (isLocallyVerified && college && verifiedCollegeName && college.toLowerCase() === verifiedCollegeName.toLowerCase()) {
          setLocalVerified(true);
        }
      } catch (e) {}
    }

    const handleUpdate = () => {
      try {
        const isLocallyVerified = localStorage.getItem('linkora_college_verified') === 'true';
        const verifiedCollegeName = localStorage.getItem('linkora_verified_college_name');
        if (isLocallyVerified && college && verifiedCollegeName && college.toLowerCase() === verifiedCollegeName.toLowerCase()) {
          setLocalVerified(true);
        }
      } catch (e) {}
    };

    window.addEventListener('linkora_college_updated', handleUpdate);
    return () => window.removeEventListener('linkora_college_updated', handleUpdate);
  }, [college, isVerified]);

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
