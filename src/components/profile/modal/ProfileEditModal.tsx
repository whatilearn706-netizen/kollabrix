'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { invalidatePageCache } from '@/lib/cache/pageDataCache';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  GraduationCap,
  BookOpen,
  Code2,
  Globe,
  Award,
  ShieldCheck,
} from 'lucide-react';

import { Step1Identity } from './Step1Identity';
import { Step2College } from './Step2College';
import { Step3Academics } from './Step3Academics';
import { Step4Skills } from './Step4Skills';
import { Step5Links } from './Step5Links';
import { Step6Role } from './Step6Role';

export function openProfileEditModal(initialStep: number = 1) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kollabrix:open-profile-modal', { detail: { step: initialStep } })
    );
  }
}

interface ProfileEditModalProps {
  forceOpen?: boolean;
  mode?: 'onboarding' | 'edit';
}

const STEPS = [
  { id: 1, name: 'Identity', icon: User },
  { id: 2, name: 'Campus & ID', icon: GraduationCap },
  { id: 3, name: 'Degree & Year', icon: BookOpen },
  { id: 4, name: 'Skills & Focus', icon: Code2 },
  { id: 5, name: 'Online Links', icon: Globe },
  { id: 6, name: 'Role & Complete', icon: Award },
];

export function ProfileEditModal({ forceOpen = false, mode = 'onboarding' }: ProfileEditModalProps) {
  const { user, profile, refreshProfile, isLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('College builder excited to collaborate on innovative projects.');

  const [college, setCollege] = useState('');
  const [studentIdUrl, setStudentIdUrl] = useState<string | null>(null);
  const [studentRollNo, setStudentRollNo] = useState('');

  const [academicYear, setAcademicYear] = useState('2nd Year (Sophomore)');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering (CSE)');

  const [skills, setSkills] = useState<string[]>(['React', 'Next.js']);
  const [interests, setInterests] = useState<string[]>(['Hackathons', 'Open Source']);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(['Full-Stack Developer']);

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(true);

  const [isFaculty, setIsFaculty] = useState(false);
  const [facultyDesignation, setFacultyDesignation] = useState('Assistant Professor');
  const [facultyDepartment, setFacultyDepartment] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyDocUrl, setFacultyDocUrl] = useState<string | null>(null);

  // 1. Listen for global open triggers
  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e?.detail?.step && typeof e.detail.step === 'number') {
        setCurrentStep(e.detail.step);
      } else {
        setCurrentStep(1);
      }
      setIsOpen(true);
    };

    window.addEventListener('kollabrix:open-profile-modal', handleOpen);
    return () => window.removeEventListener('kollabrix:open-profile-modal', handleOpen);
  }, []);

  // 2. Evaluate onboarding condition
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

    // Check completeness
    const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
    const hasSkills = Boolean(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0);
    const hasUsername = Boolean(profile?.username && profile.username.trim().length > 0);

    const isIncomplete = !hasCollege || !hasSkills || !hasUsername;
    const sessionCompleted = typeof window !== 'undefined' && sessionStorage.getItem(`kollabrix_onboarding_done_${user.id}`) === 'true';

    if (isIncomplete && !sessionCompleted) {
      setIsOpen(true);
    }
  }, [user, profile, isLoading, forceOpen]);

  // 3. Hydrate form fields when user or profile changes
  useEffect(() => {
    if (!user) return;

    const meta = user.user_metadata || {};
    const emailPrefix = user.email ? user.email.split('@')[0] : 'builder';

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

    if (profile?.bio) setBio(profile.bio);
    if (profile?.college) setCollege(profile.college);
    if (profile?.academic_year) setAcademicYear(profile.academic_year);
    if (profile?.course) setCourse(profile.course);
    if (profile?.skills && profile.skills.length > 0) setSkills(profile.skills);
    if (profile?.interests && profile.interests.length > 0) setInterests(profile.interests);
    if (profile?.preferred_roles && profile.preferred_roles.length > 0) setPreferredRoles(profile.preferred_roles);

    if (profile?.github_url) setGithubUrl(profile.github_url);
    if (profile?.linkedin_url) setLinkedinUrl(profile.linkedin_url);
    if (profile?.portfolio_url) setPortfolioUrl(profile.portfolio_url);
    if (typeof profile?.is_portfolio_public === 'boolean') {
      setIsPortfolioPublic(profile.is_portfolio_public);
    }

    if (profile?.role === 'teacher') {
      setIsFaculty(true);
    }
  }, [user, profile]);

  // Can this modal be dismissed?
  const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
  const hasSkills = Boolean(profile?.skills && profile.skills.length > 0);
  const isProfileComplete = hasCollege && hasSkills;
  const canClose = mode === 'edit' || isProfileComplete;

  // Validation before advancing steps
  const validateCurrentStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setErrorMessage('Please provide your full display name.');
        return false;
      }
      const cleanU = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!cleanU || cleanU.length < 3) {
        setErrorMessage('Username must be at least 3 characters.');
        return false;
      }
    } else if (step === 2) {
      if (!college.trim()) {
        setErrorMessage('Please specify your college or university name.');
        return false;
      }
    } else if (step === 3) {
      if (!academicYear) {
        setErrorMessage('Please select your academic year.');
        return false;
      }
      if (!course.trim()) {
        setErrorMessage('Please select or specify your degree / course.');
        return false;
      }
    } else if (step === 4) {
      if (skills.length < 2) {
        setErrorMessage('Please select at least 2 primary technical skills.');
        return false;
      }
    } else if (step === 6 && isFaculty) {
      if (!facultyDepartment.trim()) {
        setErrorMessage('Please specify your academic department/school.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSaveProfile();
      }
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit and save profile
  const handleSaveProfile = async () => {
    if (!validateCurrentStep(6)) return;
    if (!user) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const cleanU = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const assignedRole = isFaculty ? 'teacher' : (profile?.role || 'student');

      const payload = {
        user_id: user.id,
        display_name: displayName.trim(),
        username: cleanU,
        avatar_url: avatarUrl || null,
        bio: bio.trim(),
        college: college.trim(),
        academic_year: academicYear,
        course: course.trim(),
        skills,
        interests,
        preferred_roles: preferredRoles,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        is_portfolio_public: isPortfolioPublic,
        role: assignedRole,
        verification_doc_type: isFaculty ? (facultyDocUrl || 'faculty_pending') : (studentIdUrl || null),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' });

        if (upsertErr) throw upsertErr;
      }

      // If student ID was uploaded, optionally record in verification endpoint
      if (studentIdUrl) {
        fetch('/api/verify/college-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeName: college.trim(),
            studentRollNumber: studentRollNo.trim() || 'ID_ATTACHED',
            idCardImage: studentIdUrl,
            userId: user.id,
            username: cleanU,
            studentName: displayName.trim(),
            course: course.trim(),
            academicYear,
            email: user.email,
          }),
        }).catch((err) => console.warn('Could not notify verification endpoint:', err));
      }

      // Mark session complete
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
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/profile/setup')) {
          window.location.replace('/explore');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save collegiate profile:', err);
      setErrorMessage(err?.message || 'Could not save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      {/* Sleek Floating Modal Window */}
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#080C14] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-white overflow-hidden">
        {/* Top Radiant Amber Edge Glow */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.85)]" />

        {/* Ambient Backlight Halo */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success State Celebration */}
        {isSuccess ? (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Collegiate Profile Saved!</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Your profile changes have synced across the campus network. Welcome to Kollabrix!
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Modal Header & Step Indicator */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    {mode === 'edit' || isProfileComplete ? 'Profile Settings' : 'Collegiate Onboarding'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Step {currentStep} of {STEPS.length}
                  </span>
                </div>

                {/* Close Button (Enabled in edit mode or when profile is complete) */}
                {canClose && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Step Navigation Tabs */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {STEPS.map((s) => {
                  const isCurrent = currentStep === s.id;
                  const isPast = currentStep > s.id;
                  const StepIcon = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (isPast || validateCurrentStep(currentStep)) {
                          setCurrentStep(s.id);
                        }
                      }}
                      className={`h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs font-mono ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                          : isPast
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/[0.02] text-slate-500 border border-white/5'
                      }`}
                      title={s.name}
                    >
                      {isPast ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden md:inline text-[11px] truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[280px]">
              {currentStep === 1 && (
                <Step1Identity
                  displayName={displayName}
                  setDisplayName={setDisplayName}
                  username={username}
                  setUsername={setUsername}
                  avatarUrl={avatarUrl}
                  setAvatarUrl={setAvatarUrl}
                  bio={bio}
                  setBio={setBio}
                />
              )}

              {currentStep === 2 && (
                <Step2College
                  college={college}
                  setCollege={setCollege}
                  studentIdUrl={studentIdUrl}
                  setStudentIdUrl={setStudentIdUrl}
                  studentRollNo={studentRollNo}
                  setStudentRollNo={setStudentRollNo}
                />
              )}

              {currentStep === 3 && (
                <Step3Academics
                  academicYear={academicYear}
                  setAcademicYear={setAcademicYear}
                  course={course}
                  setCourse={setCourse}
                />
              )}

              {currentStep === 4 && (
                <Step4Skills
                  skills={skills}
                  setSkills={setSkills}
                  interests={interests}
                  setInterests={setInterests}
                  preferredRoles={preferredRoles}
                  setPreferredRoles={setPreferredRoles}
                />
              )}

              {currentStep === 5 && (
                <Step5Links
                  githubUrl={githubUrl}
                  setGithubUrl={setGithubUrl}
                  linkedinUrl={linkedinUrl}
                  setLinkedinUrl={setLinkedinUrl}
                  portfolioUrl={portfolioUrl}
                  setPortfolioUrl={setPortfolioUrl}
                  isPortfolioPublic={isPortfolioPublic}
                  setIsPortfolioPublic={setIsPortfolioPublic}
                />
              )}

              {currentStep === 6 && (
                <Step6Role
                  isFaculty={isFaculty}
                  setIsFaculty={setIsFaculty}
                  facultyDesignation={facultyDesignation}
                  setFacultyDesignation={setFacultyDesignation}
                  facultyDepartment={facultyDepartment}
                  setFacultyDepartment={setFacultyDepartment}
                  facultyEmail={facultyEmail}
                  setFacultyEmail={setFacultyEmail}
                  facultyDocUrl={facultyDocUrl}
                  setFacultyDocUrl={setFacultyDocUrl}
                />
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : canClose ? (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Complete setup to unlock</span>
                  </div>
                )}
              </div>

              <div>
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <span>Next: {STEPS[currentStep].name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSaveProfile}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Profile...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isFaculty ? 'Submit Faculty Profile' : 'Save & Complete Profile'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
