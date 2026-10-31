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
  ShieldCheck,
  ExternalLink,
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

const STEP_TITLES = [
  { id: 1, tag: 'Identity', title: 'Profile Photo & Identity', subtitle: 'Choose how other collegiate builders will identify you' },
  { id: 2, tag: 'Campus', title: 'College Affiliation & Student ID', subtitle: 'Specify your campus and attach your student verification badge' },
  { id: 3, tag: 'Academics', title: 'Academic Year & Degree', subtitle: 'Select your study year and search your engineering or tech degree' },
  { id: 4, tag: 'Skills', title: 'Technical Stack & Interests', subtitle: 'Select or write your primary skills and preferred project roles' },
  { id: 5, tag: 'Online', title: 'Developer Links & Presence', subtitle: 'Connect GitHub, LinkedIn, and personal portfolio showcases' },
  { id: 6, tag: 'Role', title: 'Account Role & Faculty Portal', subtitle: 'Confirm student builder access or activate the Faculty Mentor Portal' },
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
  const [facultyDepartment, setFacultyDepartment] = useState('Computer Science & Engineering');
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

    const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
    const hasSkills = Boolean(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0);
    const hasUsername = Boolean(profile?.username && profile.username.trim().length > 0);

    const isIncomplete = !hasCollege || !hasSkills || !hasUsername;
    const sessionCompleted = typeof window !== 'undefined' && sessionStorage.getItem(`kollabrix_onboarding_done_${user.id}`) === 'true';

    if (isIncomplete && !sessionCompleted) {
      setIsOpen(true);
    }
  }, [user, profile, isLoading, forceOpen]);

  // 3. Hydrate form fields from profile
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
      if (!facultyDesignation.trim()) {
        setErrorMessage('Please specify your faculty designation/title.');
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

      // If student ID was uploaded, notify verification endpoint for Admin Control Center
      if (studentIdUrl) {
        fetch('/api/verify/college-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeName: college.trim() || 'Collegiate Institution',
            studentRollNumber: studentRollNo.trim() || 'ROLL-PENDING',
            idCardImage: studentIdUrl,
            userId: user.id,
            username: cleanU,
            studentName: displayName.trim(),
            course: course.trim(),
            academicYear,
            email: user.email,
          }),
        }).catch((err) => console.warn('Admin queue notification note:', err));
      }

      // Mark session complete & upgrade cookies to 1-year persistent
      try {
        sessionStorage.setItem('kollabrix_tab_active_session', 'true');
        sessionStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
        localStorage.setItem('linkora_auth_profile', JSON.stringify({ ...profile, ...payload }));
        document.cookie = 'linkora_user_session=true; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'linkora_user_id=' + user.id + '; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'linkora_user_email=' + encodeURIComponent(user.email || '') + '; path=/; max-age=31536000; SameSite=Lax';
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
      }, 1200);
    } catch (err: any) {
      console.error('Failed to save collegiate profile:', err);
      setErrorMessage(err?.message || 'Could not save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentStepMeta = STEP_TITLES[currentStep - 1];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      {/* Sleek Floating Modal Window */}
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#080C14] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 text-white overflow-hidden">
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
              {isFaculty
                ? 'Your faculty profile is saved. You now have access to the Faculty Mentor Portal.'
                : 'Your profile changes have synced across the campus network. Welcome to Kollabrix!'}
            </p>
            {isFaculty && (
              <a
                href="/teacher/dashboard"
                className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30"
              >
                <span>Go to Faculty Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Header: Clean Segmented Progress Bar & Title (No Cluttered Market Pills!) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    Step {currentStep} of {STEP_TITLES.length}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentStepMeta.tag}
                  </span>
                </div>

                {/* Minimal Close Button */}
                {canClose && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Ultra-Clean Segmented Progress Line */}
              <div className="grid grid-cols-6 gap-1.5">
                {STEP_TITLES.map((s) => {
                  const isCurrent = currentStep === s.id;
                  const isPast = currentStep > s.id;
                  return (
                    <div
                      key={s.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : isPast
                          ? 'bg-amber-500/40'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Step Title & Subtitle */}
              <div className="pt-1">
                <h3 className="text-lg font-black text-white tracking-tight">
                  {currentStepMeta.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentStepMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step Body */}
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
                  displayName={displayName}
                  username={username}
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
                    <span>Next: {STEP_TITLES[currentStep].tag}</span>
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
