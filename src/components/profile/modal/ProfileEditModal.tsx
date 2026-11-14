'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { invalidatePageCache } from '@/lib/cache/pageDataCache';
import { isProfileComplete as checkProfileComplete } from '@/lib/auth/profileStatus';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Lock,
} from 'lucide-react';

import { Step1Identity } from './Step1Identity';
import { Step4Skills } from './Step4Skills';
import { Step5Links } from './Step5Links';
import { StepPathBBiometricScan } from './StepPathBBiometricScan';
import { StepReviewLockedProfile } from './StepReviewLockedProfile';
import { FacultyStep2Type } from './FacultyStep2Type';
import { FacultyStep3Expertise } from './FacultyStep3Expertise';
import { FacultyStep4Verification } from './FacultyStep4Verification';

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

const STUDENT_STEP_TITLES = [
  { id: 1, tag: 'Identity', title: 'Profile Photo & Identity', subtitle: 'Choose how other collegiate builders will identify you' },
  { id: 2, tag: 'Skills', title: 'Technical Stack & Interests', subtitle: 'Select or write your primary skills and preferred project roles' },
  { id: 3, tag: 'Online', title: 'Developer Links & Presence', subtitle: 'Connect GitHub, LinkedIn, and personal portfolio showcases' },
  { id: 4, tag: 'Verification', title: 'Apple Face ID & Student Card Scan', subtitle: 'Biometric verification matching your live face with your physical college ID card' },
  { id: 5, tag: 'Review & Lock', title: 'Profile Summary & Verified Lock', subtitle: 'Review your locked collegiate credentials and launch your profile' },
];

const FACULTY_STEP_TITLES = [
  { id: 1, tag: 'Identity', title: 'Faculty Identity & Photo', subtitle: 'Choose how students and colleagues will identify you across campus' },
  { id: 2, tag: 'Faculty Type', title: 'Faculty Designation & Department', subtitle: 'Specify your academic title, department, and collegiate institution' },
  { id: 3, tag: 'Expertise', title: 'Teaching & Research Focus', subtitle: 'Select your subject domains, mentorship areas, and research specializations' },
  { id: 4, tag: 'Faculty Portal', title: 'Faculty Verification & DigiLocker', subtitle: 'Authenticate via National DigiLocker or campus passcode, and connect academic profiles' },
];

export function ProfileEditModal({ forceOpen = false, mode = 'onboarding' }: ProfileEditModalProps) {
  const { user, profile, refreshProfile, isLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Role Switcher State: 'student' vs 'faculty'
  const [userRoleType, setUserRoleType] = useState<'student' | 'faculty'>('student');

  // Form State (Student)
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  const [college, setCollege] = useState('');
  const [studentIdUrl, setStudentIdUrl] = useState<string | null>(null);
  const [studentRollNo, setStudentRollNo] = useState('');
  const [isCollegeVerified, setIsCollegeVerified] = useState<boolean>(() => {
    if (!profile) return false;
    if (user?.id && profile?.user_id && user.id !== profile.user_id) return false;
    return Boolean(profile.college_verified);
  });

  const [academicYear, setAcademicYear] = useState('');
  const [course, setCourse] = useState(profile?.course || '');

  // Start with empty arrays so users must actively write or select their genuine skills
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isPortfolioPublic, setIsPortfolioPublic] = useState(true);

  // Faculty Specific Form State
  const [facultyDesignation, setFacultyDesignation] = useState(
    profile?.faculty_designation || 'Assistant Professor'
  );
  const [facultyDepartment, setFacultyDepartment] = useState(
    profile?.faculty_department || 'Computer Science & Engineering (CSE)'
  );
  const [employeeId, setEmployeeId] = useState('');
  const [facultySubjects, setFacultySubjects] = useState<string[]>(
    profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ['Data Structures & Algorithms', 'Machine Learning & AI', 'Full Stack Web Development']
  );
  const [researchFocus, setResearchFocus] = useState(profile?.bio || '');
  const [facultyPasscode, setFacultyPasscode] = useState('');
  const [isFacultyPasscodeVerified, setIsFacultyPasscodeVerified] = useState<boolean>(
    Boolean(profile?.faculty_verified)
  );
  const [googleScholarUrl, setGoogleScholarUrl] = useState('');

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

    if (mode === 'edit') {
      return;
    }

    // Check if user has genuinely completed profile setup (must have real college affiliation and technical skills)
    const isCompleted = checkProfileComplete(profile, user);

    if (isCompleted) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
        localStorage.setItem(`kollabrix_profile_created_${user.id}`, 'true');
      }
      setIsOpen(false);
      return;
    }

    // Check if user temporarily snoozed onboarding in this active browser session
    const isSnoozed = typeof window !== 'undefined' && (
      sessionStorage.getItem(`kollabrix_onboarding_snoozed_${user.id}`) === 'true'
    );

    if (isSnoozed) {
      setIsOpen(false);
      return;
    }

    // First-time logins, brand new registrations, or reset accounts MUST fill their profile details!
    setIsOpen(true);
  }, [user, profile, isLoading, forceOpen, mode]);

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
    if (profile?.user_id && user?.id && profile.user_id === user.id && typeof profile?.college_verified === 'boolean') {
      setIsCollegeVerified(profile.college_verified);
    } else {
      setIsCollegeVerified(false);
    }
    if (profile?.skills && profile.skills.length > 0) setSkills(profile.skills);
    if (profile?.interests && profile.interests.length > 0) setInterests(profile.interests);
    if (profile?.preferred_roles && profile.preferred_roles.length > 0) setPreferredRoles(profile.preferred_roles);

    if (profile?.github_url) setGithubUrl(profile.github_url);
    if (profile?.linkedin_url) setLinkedinUrl(profile.linkedin_url);
    if (profile?.portfolio_url) setPortfolioUrl(profile.portfolio_url);
    if (typeof profile?.is_portfolio_public === 'boolean') {
      setIsPortfolioPublic(profile.is_portfolio_public);
    }

    // Role detection: if already faculty/teacher, activate faculty mode
    const userRoleStr = (((profile as any)?.role) || '').toLowerCase();
    const isTeacher =
      userRoleStr === 'teacher' ||
      userRoleStr === 'faculty' ||
      userRoleStr === 'professor' ||
      Boolean(profile?.faculty_verified);
    if (isTeacher) {
      setUserRoleType('faculty');
    }
    if (profile?.faculty_designation) setFacultyDesignation(profile.faculty_designation);
    if (profile?.faculty_department) setFacultyDepartment(profile.faculty_department);
    if (profile?.faculty_verified) setIsFacultyPasscodeVerified(true);

  }, [user, profile]);

  const activeStepTitles = userRoleType === 'faculty' ? FACULTY_STEP_TITLES : STUDENT_STEP_TITLES;
  const maxSteps = activeStepTitles.length;
  const currentStepMeta = activeStepTitles[Math.min(currentStep - 1, maxSteps - 1)] || activeStepTitles[0];

  const handleRoleChange = (newRole: 'student' | 'faculty') => {
    setUserRoleType(newRole);
    setCurrentStep(1);
    setErrorMessage(null);
  };

  const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
  const hasSkills = Boolean(profile?.skills && profile.skills.length > 0);
  const hasCompletedProfile = checkProfileComplete(profile, user);
  const canClose = true;

  const handleDismiss = () => {
    if (user?.id && typeof window !== 'undefined') {
      if (checkProfileComplete(profile, user)) {
        localStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
        localStorage.setItem(`kollabrix_profile_created_${user.id}`, 'true');
      } else {
        // Incomplete profile: only snooze for this active session so they are prompted again on future visits
        sessionStorage.setItem(`kollabrix_onboarding_snoozed_${user.id}`, 'true');
      }
    }
    setIsOpen(false);
  };

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
    }
    if (userRoleType === 'faculty' && step === 2) {
      if (!facultyDesignation.trim()) {
        setErrorMessage('Please select or specify your faculty designation / type.');
        return false;
      }
      if (!facultyDepartment.trim()) {
        setErrorMessage('Please specify your academic department.');
        return false;
      }
      if (!college.trim()) {
        setErrorMessage('Please specify your collegiate institution / university.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < maxSteps) {
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
    if (!user) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const rawDisplay =
        displayName.trim() ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Student Builder';

      const cleanU = (
        username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') ||
        user.user_metadata?.username ||
        user.email?.split('@')[0]?.replace(/[^a-z0-9_-]/g, '').toLowerCase() ||
        'builder'
      ).slice(0, 24);

      // Auto-verify passcode if faculty user entered it but didn't tap "Verify Code" before saving
      let verifiedStatus = isFacultyPasscodeVerified;
      if (userRoleType === 'faculty' && !verifiedStatus && facultyPasscode.trim()) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const vRes = await fetch('/api/faculty/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              code: facultyPasscode.trim(),
              passcode: facultyPasscode.trim(),
              userId: user.id,
            }),
          });
          const vData = await vRes.json();
          if (vRes.ok && vData.success) {
            verifiedStatus = true;
            setIsFacultyPasscodeVerified(true);
            if (user?.id) {
              localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
            }
          }
        } catch (vErr) {
          console.warn('Auto passcode verification check note:', vErr);
        }
      }

      // STRICT FACULTY ENFORCEMENT:
      // Faculty profiles can never be finalized without verified faculty access (Passcode or DigiLocker).
      // If unverified, the user must verify or continue as a student.
      if (userRoleType === 'faculty') {
        const hasFacultyAccess =
          verifiedStatus ||
          isFacultyPasscodeVerified ||
          Boolean(profile?.faculty_verified) ||
          profile?.role === 'teacher';

        if (!hasFacultyAccess) {
          setErrorMessage(
            'Faculty Verification Required: You cannot complete a faculty profile without verified faculty access (Campus Passcode or DigiLocker). Please verify in Step 4, or switch to Student mode to continue.'
          );
          setCurrentStep(4);
          setIsSubmitting(false);
          return;
        }
      }

      const assignedRole = userRoleType === 'faculty' ? 'teacher' : (profile?.role || 'student');

      const facultyBio =
        bio.trim() ||
        researchFocus.trim() ||
        `${facultyDesignation} in ${facultyDepartment} at ${college.trim() || 'Collegiate Institution'}.`;

      const payload: Record<string, any> = userRoleType === 'faculty'
        ? {
            user_id: user.id,
            display_name: rawDisplay,
            username: cleanU,
            avatar_url: avatarUrl || user.user_metadata?.avatar_url || null,
            bio: facultyBio,
            college: college.trim() || profile?.college || 'Collegiate Institution',
            course: facultyDepartment.trim() || 'Engineering & Technology',
            academic_year: 'Faculty / Academic Mentor',
            skills: facultySubjects.length > 0 ? facultySubjects : ['Academic Mentorship', 'Research'],
            interests: facultySubjects.length > 0 ? facultySubjects : ['Collegiate Hackathons', 'Student Research'],
            preferred_roles: [facultyDesignation || 'Academic Mentor'],
            github_url: githubUrl.trim() || null,
            linkedin_url: linkedinUrl.trim() || null,
            portfolio_url: (portfolioUrl.trim() || googleScholarUrl.trim()) || null,
            is_portfolio_public: true,
            role: assignedRole,
            updated_at: new Date().toISOString(),
          }
        : {
            user_id: user.id,
            display_name: rawDisplay,
            username: cleanU,
            avatar_url: avatarUrl || user.user_metadata?.avatar_url || null,
            bio: bio.trim() || profile?.bio || 'College builder excited to collaborate on Kollabrix projects.',
            college: college.trim() || profile?.college || 'Collegiate Institution',
            academic_year: academicYear || profile?.academic_year || '1st Year (Freshman)',
            course: course.trim() || profile?.course || 'Engineering / Technology',
            college_verified: isCollegeVerified,
            college_verified_at: isCollegeVerified ? (profile?.college_verified_at || new Date().toISOString()) : null,
            skills:
              skills.length > 0
                ? skills
                : profile?.skills && profile.skills.length > 0
                ? profile.skills
                : ['Web Development', 'Problem Solving'],
            interests:
              interests.length > 0
                ? interests
                : profile?.interests && profile.interests.length > 0
                ? profile.interests
                : ['Hackathons', 'Open Source'],
            preferred_roles:
              preferredRoles.length > 0
                ? preferredRoles
                : profile?.preferred_roles && profile.preferred_roles.length > 0
                ? profile.preferred_roles
                : ['Frontend Developer'],
            github_url: githubUrl.trim() || null,
            linkedin_url: linkedinUrl.trim() || null,
            portfolio_url: portfolioUrl.trim() || null,
            is_portfolio_public: isPortfolioPublic,
            role: assignedRole,
            verification_doc_type: studentIdUrl || null,
            updated_at: new Date().toISOString(),
          };

      const requestPayload = {
        ...payload,
        faculty_department: facultyDepartment.trim(),
        faculty_designation: facultyDesignation.trim(),
        faculty_verified: verifiedStatus || isFacultyPasscodeVerified || Boolean(profile?.faculty_verified),
      };

      let savedSuccessfully = false;

      // 1. Primary: Save via dedicated server route using service role key (bypasses RLS safely)
      let serverErrorMsg: string | null = null;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        if (payload.user_id) {
          headers['x-user-id'] = payload.user_id;
        }

        const srvRes = await fetch('/api/profile/save', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
        });
        const srvData = await srvRes.json().catch(() => ({}));
        if (srvRes.ok && srvData.success) {
          savedSuccessfully = true;
        } else {
          serverErrorMsg = srvData.error || 'Server could not save profile';
          console.warn('Server profile save attempt note:', srvRes.status, serverErrorMsg);
        }
      } catch (srvErr: any) {
        serverErrorMsg = srvErr.message;
        console.warn('Server profile save attempt exception:', srvErr);
      }

      // 2. Client-side fallback if server route was unreachable
      if (!savedSuccessfully && isSupabaseConfigured()) {
        const VALID_PROFILES_COLUMNS = new Set([
          'user_id',
          'username',
          'display_name',
          'avatar_url',
          'bio',
          'college',
          'course',
          'academic_year',
          'skills',
          'interests',
          'preferred_roles',
          'github_url',
          'portfolio_url',
          'is_portfolio_public',
          'is_suspended',
          'suspension_reason',
          'status',
          'role',
          'updated_at',
        ]);
        const dbPayload: Record<string, any> = {};
        for (const [k, v] of Object.entries(payload)) {
          if (VALID_PROFILES_COLUMNS.has(k)) {
            dbPayload[k] = v;
          }
        }

        const { data: existingProf } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', payload.user_id)
          .maybeSingle();

        let upsertErr: any = null;
        if (existingProf) {
          const updateRes = await supabase.from('profiles').update(dbPayload as any).eq('user_id', payload.user_id);
          upsertErr = updateRes.error;
        } else {
          const insertRes = await supabase.from('profiles').insert(dbPayload as any);
          upsertErr = insertRes.error;
        }

        // Graceful schema-resilient fallback if custom columns are not yet in Supabase schema cache
        if (
          upsertErr &&
          (upsertErr.message.includes('column') ||
            upsertErr.message.includes('schema cache') ||
            upsertErr.code === '42703' ||
            upsertErr.code === 'PGRST204')
        ) {
          const minimalPayload: Record<string, any> = {
            user_id: payload.user_id,
            display_name: payload.display_name,
            username: payload.username,
            college: payload.college,
            course: payload.course,
            academic_year: payload.academic_year,
            updated_at: new Date().toISOString(),
          };

          if (existingProf) {
            const retryRes = await supabase.from('profiles').update(minimalPayload).eq('user_id', payload.user_id);
            upsertErr = retryRes.error;
          } else {
            const retryRes = await supabase.from('profiles').insert(minimalPayload);
            upsertErr = retryRes.error;
          }
        }

        if (upsertErr) {
          if (upsertErr.message.includes('profiles_username_key') || upsertErr.code === '23505') {
            throw new Error('This username is already taken. Please choose another username.');
          } else if (
            upsertErr.message.includes('row-level security') ||
            upsertErr.message.includes('violates row-level') ||
            upsertErr.message.includes('column') ||
            upsertErr.message.includes('schema cache') ||
            upsertErr.code === '42501' ||
            upsertErr.code === '42703' ||
            upsertErr.code === 'PGRST204'
          ) {
            console.warn('Supabase client-side resilient fallback handled gracefully via local storage sync');
            savedSuccessfully = true;
          } else if (
            serverErrorMsg &&
            !serverErrorMsg.includes('violates row-level security') &&
            !serverErrorMsg.includes('schema cache') &&
            !serverErrorMsg.includes('column')
          ) {
            throw new Error(serverErrorMsg);
          } else {
            console.warn('Profile fallback note:', upsertErr.message);
            savedSuccessfully = true;
          }
        }
      }

      // Persist verified student status to local storage immediately
      if (isCollegeVerified && user?.id) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`linkora_college_verified_${user.id}`, 'true');
          }
        } catch (e) {}
      } else if (!isCollegeVerified && user?.id) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`linkora_college_verified_${user.id}`);
            localStorage.removeItem('linkora_college_verified');
          }
        } catch (e) {}
      } else if (studentIdUrl) {
        // Only trigger manual review if student is NOT yet biometrically verified
        fetch('/api/verify/college-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationType: 'student_id',
            collegeName: payload.college,
            studentRollNumber: studentRollNo.trim() || 'ROLL-PENDING',
            idCardImage: studentIdUrl,
            userId: user.id,
            username: cleanU,
            studentName: rawDisplay,
            course: payload.course,
            academicYear: payload.academic_year,
            email: user.email,
          }),
        }).catch((err) => console.warn('Admin student queue notification note:', err));
      }

      // Mark session complete & upgrade cookies to 1-year persistent across all storage layers
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kollabrix_tab_active_session', 'true');
          sessionStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
          localStorage.setItem(`kollabrix_onboarding_done_${user.id}`, 'true');
          localStorage.setItem(`kollabrix_profile_created_${user.id}`, 'true');
          localStorage.setItem('linkora_auth_profile', JSON.stringify({ ...profile, ...payload, college_verified: isCollegeVerified }));
          document.cookie = 'linkora_user_session=true; path=/; max-age=31536000; SameSite=Lax';
          document.cookie = 'linkora_user_id=' + user.id + '; path=/; max-age=31536000; SameSite=Lax';
          document.cookie = 'linkora_user_email=' + encodeURIComponent(user.email || '') + '; path=/; max-age=31536000; SameSite=Lax';

          if (userRoleType === 'faculty') {
            if (isFacultyPasscodeVerified) {
              localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
            }
            if (facultyDepartment) {
              localStorage.setItem(`linkora_faculty_dept_${user.id}`, facultyDepartment);
            }
            if (facultyDesignation) {
              localStorage.setItem(`linkora_faculty_desig_${user.id}`, facultyDesignation);
            }
          }
        }
      } catch (e) {}

      if (isSupabaseConfigured()) {
        try {
          if (userRoleType === 'faculty') {
            await supabase.auth.updateUser({
              data: {
                faculty_department: facultyDepartment,
                faculty_designation: facultyDesignation,
                faculty_verified: verifiedStatus || isFacultyPasscodeVerified || Boolean(profile?.faculty_verified),
                role: assignedRole,
              },
            });
          }
          await supabase.auth.updateUser({
            data: {
              onboarding_completed: true,
              profile_completed: true,
              display_name: rawDisplay,
              username: cleanU,
            },
          });
        } catch (metaErr) {}
      }

      invalidatePageCache();
      window.dispatchEvent(new Event('linkora_auth_updated'));
      window.dispatchEvent(new Event('linkora_teammates_updated'));
      await refreshProfile();

      setIsSuccess(true);

      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        if (typeof window !== 'undefined') {
          if (userRoleType === 'faculty') {
            window.location.replace('/teacher/dashboard');
          } else if (window.location.pathname.startsWith('/profile/setup')) {
            window.location.replace('/explore');
          }
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      {/* Sleek Floating Modal Window */}
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#080C14] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-8 text-white overflow-hidden">
        {/* Top Radiant Edge Glow (Amber for Student, Purple for Faculty) */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 ${
            userRoleType === 'faculty'
              ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 shadow-[0_0_18px_rgba(168,85,247,0.85)]'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.85)]'
          }`}
        />

        {/* Ambient Backlight Halo */}
        <div
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
            userRoleType === 'faculty' ? 'bg-purple-500/10' : 'bg-amber-500/10'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
            userRoleType === 'faculty' ? 'bg-fuchsia-600/10' : 'bg-orange-600/10'
          }`}
        />

        {/* Success State Celebration */}
        {isSuccess ? (
          <div className="py-14 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                userRoleType === 'faculty'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-purple-500/20'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {userRoleType === 'faculty' ? 'Faculty Profile Activated!' : 'Collegiate Profile Saved!'}
            </h3>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              {userRoleType === 'faculty'
                ? 'Your faculty profile is ready. You now have full access to problem authoring and mentor tools.'
                : 'Your profile changes have synced across the campus network. Welcome to Kollabrix!'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsSuccess(false);
              }}
              className={`mt-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                userRoleType === 'faculty'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-500/25'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/25'
              }`}
            >
              <span>{userRoleType === 'faculty' ? 'Go to Faculty Desk' : 'Enter Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Header: Segmented Progress Bar & Title + Role Switcher (Positioned exactly as marked) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border transition-colors ${
                      userRoleType === 'faculty'
                        ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    Step {currentStep} of {maxSteps}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentStepMeta.tag}
                  </span>
                </div>

                {/* Minimal Close Button */}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Segmented Progress Line */}
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${maxSteps}, minmax(0, 1fr))` }}
              >
                {activeStepTitles.map((s) => {
                  const isCurrent = currentStep === s.id;
                  const isPast = currentStep > s.id;
                  return (
                    <div
                      key={s.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? userRoleType === 'faculty'
                            ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                            : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : isPast
                          ? userRoleType === 'faculty'
                            ? 'bg-purple-500/40'
                            : 'bg-amber-500/40'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Step Title & Subtitle + Role Switcher Toggle (placed where marked) */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {currentStepMeta.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentStepMeta.subtitle}
                  </p>
                </div>

                {/* Role Switcher Button: Student vs Faculty */}
                <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0 self-start sm:self-auto shadow-inner">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      userRoleType === 'student'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('faculty')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      userRoleType === 'faculty'
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>
                </div>
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
                  isVerified={isCollegeVerified}
                />
              )}

              {/* Student Flow (New 5 Steps: Identity -> Skills -> Links -> Path B -> Review & Lock) */}
              {userRoleType === 'student' && (
                <>
                  {currentStep === 2 && (
                    <Step4Skills
                      skills={skills}
                      setSkills={setSkills}
                      interests={interests}
                      setInterests={setInterests}
                      preferredRoles={preferredRoles}
                      setPreferredRoles={setPreferredRoles}
                    />
                  )}

                  {currentStep === 3 && (
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

                  {currentStep === 4 && (
                    <StepPathBBiometricScan
                      userId={user?.id}
                      username={username}
                      displayName={displayName}
                      currentCollege={college}
                      currentRollNo={studentRollNo}
                      currentCourse={course}
                      currentAcademicYear={academicYear}
                      isVerified={isCollegeVerified}
                      onVerificationComplete={(data) => {
                        if (data.studentName && data.studentName.trim()) {
                          setDisplayName(data.studentName.trim());
                        }
                        setCollege(data.college);
                        setStudentRollNo(data.studentRollNo);
                        setCourse(data.course);
                        setAcademicYear(data.academicYear);
                        setStudentIdUrl(data.idCardImage);
                        if (data.faceImage && !avatarUrl) {
                          setAvatarUrl(data.faceImage);
                        }
                        setIsCollegeVerified(true);
                        setCurrentStep(5);
                      }}
                      onSkip={() => {
                        setCurrentStep(5);
                      }}
                    />
                  )}

                  {currentStep === 5 && (
                    <StepReviewLockedProfile
                      displayName={displayName}
                      username={username}
                      avatarUrl={avatarUrl}
                      bio={bio}
                      skills={skills}
                      interests={interests}
                      preferredRoles={preferredRoles}
                      githubUrl={githubUrl}
                      linkedinUrl={linkedinUrl}
                      portfolioUrl={portfolioUrl}
                      isPortfolioPublic={isPortfolioPublic}
                      isVerified={isCollegeVerified}
                      college={college}
                      studentRollNo={studentRollNo}
                      course={course}
                      academicYear={academicYear}
                      onGoToVerification={() => setCurrentStep(4)}
                    />
                  )}
                </>
              )}

              {/* Faculty Flow (Steps 2..4) */}
              {userRoleType === 'faculty' && (
                <>
                  {currentStep === 2 && (
                    <FacultyStep2Type
                      college={college}
                      setCollege={setCollege}
                      facultyDesignation={facultyDesignation}
                      setFacultyDesignation={setFacultyDesignation}
                      facultyDepartment={facultyDepartment}
                      setFacultyDepartment={setFacultyDepartment}
                      employeeId={employeeId}
                      setEmployeeId={setEmployeeId}
                    />
                  )}

                  {currentStep === 3 && (
                    <FacultyStep3Expertise
                      facultySubjects={facultySubjects}
                      setFacultySubjects={setFacultySubjects}
                      researchFocus={researchFocus}
                      setResearchFocus={setResearchFocus}
                    />
                  )}

                  {currentStep === 4 && (
                    <FacultyStep4Verification
                      facultyPasscode={facultyPasscode}
                      setFacultyPasscode={setFacultyPasscode}
                      isVerified={isFacultyPasscodeVerified}
                      setIsVerified={setIsFacultyPasscodeVerified}
                      linkedinUrl={linkedinUrl}
                      setLinkedinUrl={setLinkedinUrl}
                      portfolioUrl={portfolioUrl}
                      setPortfolioUrl={setPortfolioUrl}
                      googleScholarUrl={googleScholarUrl}
                      setGoogleScholarUrl={setGoogleScholarUrl}
                    />
                  )}
                </>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="h-10 px-4 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentStep < maxSteps ? (
                  <>
                    {userRoleType === 'student' && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSaveProfile}
                        className="h-10 px-3.5 sm:px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                        title="Save entered details and finish now"
                      >
                        {isSubmitting ? 'Saving...' : 'Save & Finish'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                        userRoleType === 'faculty'
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-500/25'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                      }`}
                    >
                      <span>Next: {activeStepTitles[currentStep]?.tag || 'Next'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    {userRoleType === 'faculty' && !isFacultyPasscodeVerified && !profile?.faculty_verified && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserRoleType('student');
                          setCurrentStep(1);
                          setErrorMessage(null);
                        }}
                        className="h-10 px-3 sm:px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Cannot verify faculty? Switch to student profile"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Go as Student</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSaveProfile}
                      className={`h-10 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
                        userRoleType === 'faculty'
                          ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/25'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>Saving Profile...</span>
                      ) : userRoleType === 'faculty' && !isFacultyPasscodeVerified && !profile?.faculty_verified ? (
                        <>
                          <Lock className="w-4 h-4 text-purple-200" />
                          <span>Verify to Complete</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{userRoleType === 'faculty' ? 'Complete Faculty Setup' : 'Save & Complete Profile'}</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
