'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { invalidatePageCache } from '@/lib/cache/pageDataCache';
import {
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Camera,
  ArrowRight,
  ShieldCheck,
  Code2,
  User,
  AtSign,
  BookOpen,
} from 'lucide-react';

const SUGGESTED_COLLEGES = [
  'DTU Delhi',
  'IIT Bombay',
  'BITS Pilani',
  'IIT Delhi',
  'VIT Vellore',
  'IIIT Hyderabad',
  'NSUT Delhi',
  'IIT Kharagpur',
  'NIT Trichy',
  'Manipal (MIT)',
];

const SUGGESTED_SKILLS = [
  'React',
  'Next.js',
  'TypeScript',
  'Python',
  'AI / ML',
  'Node.js',
  'TailwindCSS',
  'UI / UX',
  'PostgreSQL',
  'C++',
  'Java',
  'Flutter',
  'Cloud / DevOps',
  'Solidity',
];

const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  '5th Year / Dual Degree',
  'Graduate / Masters',
  'PhD Researcher',
];

interface MandatoryOnboardingModalProps {
  forceOpen?: boolean;
}

export function MandatoryOnboardingModal({ forceOpen = false }: MandatoryOnboardingModalProps) {
  const { user, profile, refreshProfile, isLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [academicYear, setAcademicYear] = useState('2nd Year (Sophomore)');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('College builder excited to collaborate on innovative projects.');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if profile is incomplete
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setIsOpen(false);
      return;
    }

    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // A profile is incomplete if college is missing OR skills are empty OR username is missing
    const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
    const hasSkills = Boolean(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0);
    const hasUsername = Boolean(profile?.username && profile.username.trim().length > 0);

    const isIncomplete = !hasCollege || !hasSkills || !hasUsername;

    // Check if user already completed it in this session
    const sessionCompleted = typeof window !== 'undefined' && sessionStorage.getItem(`kollabrix_onboarding_done_${user.id}`) === 'true';

    if (isIncomplete && !sessionCompleted) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, profile, isLoading, forceOpen]);

  // Pre-fill initial values from user metadata
  useEffect(() => {
    if (!user) return;

    const meta = user.user_metadata || {};
    const emailPrefix = user.email ? user.email.split('@')[0] : 'student';

    const cleanUsername = (
      profile?.username ||
      meta.username ||
      emailPrefix.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() ||
      'builder'
    ).slice(0, 24);

    const cleanDisplayName =
      profile?.display_name ||
      meta.full_name ||
      meta.name ||
      meta.display_name ||
      emailPrefix ||
      'Student Builder';

    const initialAvatar =
      profile?.avatar_url ||
      meta.avatar_url ||
      meta.picture ||
      null;

    setDisplayName(cleanDisplayName);
    setUsername(cleanUsername);
    setAvatarUrl(initialAvatar);

    if (profile?.college) setCollege(profile.college);
    if (profile?.academic_year) setAcademicYear(profile.academic_year);
    if (profile?.course) setCourse(profile.course);
    if (profile?.skills && profile.skills.length > 0) setSkills(profile.skills);
    if (profile?.bio) setBio(profile.bio);
  }, [user, profile]);

  // Toggle skills
  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = customSkillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills((prev) => [...prev, trimmed]);
        setCustomSkillInput('');
      }
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const result = await uploadFileToStorage(file, {
        bucket: 'platform-assets',
        folder: 'avatars',
        maxSizeMB: 4,
      });

      if (result.success && result.url) {
        setAvatarUrl(result.url);
      }
    } catch (err) {
      console.warn('Avatar upload error:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Submit and save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) return;

    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMessage('Please enter your full display name.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters (letters, numbers, underscores).');
      return;
    }

    if (!college.trim()) {
      setErrorMessage('Please specify your college or university name.');
      return;
    }

    if (skills.length < 2) {
      setErrorMessage('Please select at least 2 primary technical skills.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        user_id: user.id,
        display_name: displayName.trim(),
        username: cleanUsername,
        avatar_url: avatarUrl || null,
        college: college.trim(),
        academic_year: academicYear,
        course: course.trim(),
        skills,
        bio: bio.trim() || 'College builder excited to collaborate on Kollabrix projects.',
        role: profile?.role || 'student',
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' });

        if (upsertErr) {
          throw upsertErr;
        }
      }

      // Mark session as completed
      try {
        sessionStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
        localStorage.setItem('linkora_auth_profile', JSON.stringify({ ...profile, ...payload }));
      } catch (e) {}

      invalidatePageCache();
      window.dispatchEvent(new Event('linkora_auth_updated'));

      await refreshProfile();

      setIsSuccess(true);

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        // If on /profile/setup, smoothly redirect to /explore
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/profile/setup')) {
          window.location.replace('/explore');
        }
      }, 900);
    } catch (err: any) {
      console.error('Failed to complete onboarding profile:', err);
      setErrorMessage(err?.message || 'Could not save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      {/* Sleek Floating Modal Card */}
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-[#090D16] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white overflow-hidden">
        {/* Top High-Tech Amber Radiant Glow Beam */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.8)]" />

        {/* Ambient Backlight Halo */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success State Celebration */}
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Identity Verified!</h3>
            <p className="text-sm text-slate-300 max-w-sm">
              Your collegiate profile is ready. Unlocking full access to Kollabrix...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
            {/* Header with Circular Avatar & Title */}
            <div className="flex items-center gap-4 sm:gap-5 border-b border-white/10 pb-5">
              {/* Sleek Circular Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-amber-400">
                        {(displayName || 'K').slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Micro Camera Upload Overlay Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Change Avatar Photo"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 border border-white/20 text-slate-300 hover:text-white hover:border-amber-400 transition-colors shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Title & Micro Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    Mandatory Setup
                  </span>
                  <span className="text-xs text-slate-400">Step 1 of 1</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                  Welcome, {displayName || 'Builder'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                  Complete your student profile before accessing the campus network.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {/* Row 1: Display Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Display Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Mayank Goyal"
                      className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Username <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="e.g. mayankgoyal"
                      className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                    />
                    <AtSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Row 2: College with Quick-Select Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  College / University <span className="text-amber-400">*</span>
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Delhi Technological University (DTU)"
                    className="w-full h-10 px-3 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>

                {/* Quick College Suggestions */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500 mr-1">Quick select:</span>
                  {SUGGESTED_COLLEGES.slice(0, 5).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setCollege(col)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        college === col
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Academic Year & Degree/Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#0c1220] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 transition-all"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr} className="bg-[#0c1220] text-white">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Primary Skills (At least 2 required) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Technical Skills (Select at least 2)</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {skills.length} selected
                  </span>
                </div>

                {/* Skill Chips Grid */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  {SUGGESTED_SKILLS.map((s) => {
                    const isSelected = skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-xs'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom skill input */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={addCustomSkill}
                    placeholder="Type custom skill and press Enter..."
                    className="w-full h-8 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Row 5: One-Line Tagline / Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  One-Line Builder Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Building full-stack MVPs & passionate about hackathons."
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Your identity is verified across all collegiate workspaces</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Enter Platform</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
