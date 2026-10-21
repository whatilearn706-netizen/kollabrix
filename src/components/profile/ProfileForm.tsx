'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Profile } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { ProfileCompleteness } from '@/components/profile/ProfileCompleteness';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  User,
  Globe,
  Github,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  Linkedin,
  Lock,
  Clock,
} from 'lucide-react';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';
import { CollegeIdVerificationModal } from '@/components/profile/CollegeIdVerificationModal';

export interface ProfileFormProps {
  initialProfile?: Profile | null;
  isOnboarding?: boolean;
}

const ACADEMIC_YEARS = [
  { value: '', label: 'Select academic year...' },
  { value: '1st Year (Freshman)', label: '1st Year (Freshman)' },
  { value: '2nd Year (Sophomore)', label: '2nd Year (Sophomore)' },
  { value: '3rd Year (Junior)', label: '3rd Year (Junior)' },
  { value: '4th Year (Senior)', label: '4th Year (Senior)' },
  { value: '5th Year / Dual Degree', label: '5th Year / Dual Degree' },
  { value: 'Graduate / Master’s', label: 'Graduate / Master’s' },
  { value: 'PhD Researcher', label: 'PhD Researcher' },
];

export function ProfileForm({ initialProfile, isOnboarding = false }: ProfileFormProps) {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(
    initialProfile?.display_name || user?.user_metadata?.display_name || ''
  );
  const [username, setUsername] = useState(
    initialProfile?.username || user?.user_metadata?.username || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '');
  const [bio, setBio] = useState(
    initialProfile?.bio ||
      'College student passionate about building scalable web applications and collaborating on open source.'
  );
  const [college, setCollege] = useState(initialProfile?.college || '');
  const [course, setCourse] = useState(initialProfile?.course || '');
  const [academicYear, setAcademicYear] = useState(initialProfile?.academic_year || '');
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || []);
  const [interests, setInterests] = useState<string[]>(initialProfile?.interests || []);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(
    initialProfile?.preferred_roles || []
  );
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');
  const [isPortfolioPublic, setIsPortfolioPublic] = useState<boolean>(
    initialProfile?.is_portfolio_public ?? true
  );
  const [profileRole, setProfileRole] = useState(initialProfile?.role || 'student');

  const [isCollegeVerified, setIsCollegeVerified] = useState<boolean>(
    Boolean(initialProfile?.college_verified)
  );
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const hasUserEditedCollegeRef = useRef(false);

  const [facultyCode, setFacultyCode] = useState('');
  const [isVerifyingFaculty, setIsVerifyingFaculty] = useState(false);
  const [facultyVerifyMsg, setFacultyVerifyMsg] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    // Check authoritative student ID verification status via API once on mount
    const checkVerificationApi = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/verify/college-id', { headers });
        const data = await res.json();
        if (!isMounted || !data.success) return;

        if (data.isVerified) {
          setIsCollegeVerified(true);
          setVerificationStatus('approved');
          if (!hasUserEditedCollegeRef.current && data.verifiedCollege) {
            setCollege(data.verifiedCollege);
          }
        } else {
          setIsCollegeVerified(false);
          if (data.myRequest) {
            setVerificationStatus(data.myRequest.status);
            if (!hasUserEditedCollegeRef.current && data.myRequest.collegeName && !college) {
              setCollege(data.myRequest.collegeName);
            }
          } else {
            setVerificationStatus('none');
          }
          // Clean up any stale legacy test flags from user's browser
          try {
            localStorage.removeItem('linkora_college_verified');
            localStorage.removeItem('linkora_verified_college_name');
            localStorage.removeItem('linkora_verified_registry_cache');
          } catch (e) {}
        }
      } catch (e) {
        console.warn('Error fetching verification status:', e);
      }
    };

    checkVerificationApi();

    const handleUpdate = () => {
      if (!isMounted) return;
      checkVerificationApi();
    };

    window.addEventListener('linkora_college_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_college_updated', handleUpdate);
    };
  }, [initialProfile?.user_id]);

  const handleVerifyFacultyCode = async () => {
    setFacultyVerifyMsg(null);
    if (!facultyCode.trim()) {
      setFacultyVerifyMsg({ text: 'Please enter a faculty verification code.', isError: true });
      return;
    }
    try {
      setIsVerifyingFaculty(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/faculty/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: facultyCode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          if (user?.id) localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
          localStorage.setItem('teamforge_verified_faculty', 'true');
        }
        setProfileRole('teacher');
        setFacultyVerifyMsg({ text: data.message || 'Verified! You now have faculty mentor permissions.', isError: false });
        await refreshProfile();
      } else {
        setFacultyVerifyMsg({ text: data.error || 'Invalid faculty verification code.', isError: true });
      }
    } catch (err: unknown) {
      setFacultyVerifyMsg({
        text: err instanceof Error ? err.message : 'Verification failed.',
        isError: true,
      });
    } finally {
      setIsVerifyingFaculty(false);
    }
  };

  const previewProfile: Partial<Profile> = {
    display_name: displayName,
    username,
    bio,
    college,
    course,
    academic_year: academicYear,
    skills,
    interests,
    preferred_roles: preferredRoles,
    github_url: githubUrl,
    linkedin_url: linkedinUrl,
    portfolio_url: portfolioUrl,
    college_verified: isCollegeVerified,
  };

  const validateUsername = (val: string) => {
    const regex = /^[a-zA-Z0-9_-]{3,30}$/;
    return regex.test(val);
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('You must be signed in to update your profile.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase is not configured yet. Set up your environment variables in .env.local to persist profile updates to the database.'
      );
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (!validateUsername(username.trim())) {
      setError(
        'Username must be between 3 and 30 characters and contain only letters, numbers, underscores, and hyphens.'
      );
      return;
    }

    if (githubUrl && !validateUrl(githubUrl)) {
      setError('Please provide a valid GitHub URL (e.g. https://github.com/username).');
      return;
    }

    if (linkedinUrl && !validateUrl(linkedinUrl)) {
      setError('Please provide a valid LinkedIn URL (e.g. https://www.linkedin.com/in/username).');
      return;
    }

    if (portfolioUrl && !validateUrl(portfolioUrl)) {
      setError('Please provide a valid Portfolio URL (e.g. https://portfolio.me).');
      return;
    }

    try {
      setIsLoading(true);

      const payload: Record<string, any> = {
        user_id: user.id, // Strictly derived from the authenticated session
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        college: college.trim() || null,
        college_verified: isCollegeVerified,
        course: course.trim() || null,
        academic_year: academicYear || null,
        skills,
        interests,
        preferred_roles: preferredRoles,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        is_portfolio_public: isPortfolioPublic,
      };

      let { error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (upsertError && (upsertError.message.includes('column') || upsertError.code === '42703')) {
        // Fallback gracefully without newly added columns
        const safePayload = { ...payload };
        delete safePayload.college_verified;
        delete safePayload.linkedin_url;
        const res = await supabase.from('profiles').upsert(safePayload, { onConflict: 'user_id' });
        upsertError = res.error;
      }

      if (upsertError) {
        if (upsertError.message.includes('profiles_username_key') || upsertError.code === '23505') {
          setError('This username is already taken. Please choose another unique username.');
        } else {
          setError(upsertError.message);
        }
        return;
      }

      // Sync verification to platform_settings registry so universally visible across accounts
      if (user?.id) {
        try {
          const { data: pData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'linkedin_college_verifications')
            .maybeSingle();

          const existingList = Array.isArray(pData?.value) ? pData.value : [];
          let updatedList: any[];

          if (isCollegeVerified) {
            const record = {
              userId: user.id,
              username: username.trim().toLowerCase(),
              displayName: displayName.trim(),
              college: college.trim(),
              linkedinUrl: linkedinUrl.trim() || undefined,
              verifiedAt: new Date().toISOString(),
            };

            updatedList = [
              record,
              ...existingList.filter((item: any) => item.userId !== user.id),
            ].slice(0, 500);
          } else {
            updatedList = existingList.filter((item: any) => item.userId !== user.id);
          }

          await supabase.from('platform_settings').upsert({
            key: 'linkedin_college_verifications',
            value: updatedList,
            description: 'Registry of LinkedIn verified college affiliations and credentials.',
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          // non-blocking
        }
      }

      await refreshProfile();
      setSuccess('Profile successfully updated!');

      if (isOnboarding) {
        setTimeout(() => {
          router.push('/explore');
          router.refresh();
        }, 1000);
      } else {
        setTimeout(() => {
          router.push(`/profile/${username.trim().toLowerCase()}`);
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {/* Profile Completeness Checklist */}
      <ProfileCompleteness profile={previewProfile} />

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Basic Student Identity */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Student Information</h2>
          <p className="text-xs text-slate-400">
            How other students will identify and contact you on project teams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Maya Lin"
          />

          <Input
            label="Unique Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. maya_builds"
            helperText="3-30 chars: lowercase letters, numbers, _ and -"
          />
        </div>

        <FileUpload
          label="Profile Photo / Avatar"
          helperText="Upload a photo (PNG, JPG, WebP up to 5MB) or keep empty for initials"
          value={avatarUrl}
          onChange={setAvatarUrl}
          options={{ bucket: 'avatars', folder: 'profiles', maxSizeMB: 5 }}
        />

        <Textarea
          label="Short Bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe your passion, what you love building, or what kind of teams you're seeking."
        />
      </div>

      {/* College & Academics */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
        <div className="border-b border-charcoal-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">College & Academic Details</h2>
            <p className="text-xs text-slate-400">
              Helps match you with campus peers, ICPC teammates, or multi-institution cohorts.
            </p>
          </div>
          {isCollegeVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Collegiate
            </span>
          ) : verificationStatus === 'pending' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Wait for Verified
            </span>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-300">
              College / University Name
            </label>
            {isCollegeVerified ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified & Locked
              </span>
            ) : verificationStatus === 'pending' ? (
              <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Wait for Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsIdModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify with Student ID</span>
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              value={college}
              disabled={isCollegeVerified || verificationStatus === 'pending'}
              onChange={(e) => {
                hasUserEditedCollegeRef.current = true;
                setCollege(e.target.value);
              }}
              placeholder="e.g. Indian Institute of Technology Delhi"
              className={isCollegeVerified ? 'pr-9 bg-slate-900/60 border-emerald-500/40 text-slate-200 cursor-not-allowed' : ''}
            />
            {isCollegeVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" title="Locked: College affiliation verified by faculty/admin">
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>

          {isCollegeVerified ? (
            <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Your collegiate affiliation is officially verified via Student ID card. It is locked across all hackathons, ICPC rosters, and public profiles.
              </span>
            </div>
          ) : verificationStatus === 'pending' ? (
            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span>
                  Student ID card submitted. <strong className="text-amber-300 font-bold">Wait for Verified</strong> — our university administrator is reviewing your card.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsIdModalOpen(true)}
                className="shrink-0 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
              >
                Wait for Verified
              </Button>
            </div>
          ) : (
            <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Upload your College Student ID card to prevent scam profiles and unlock the official <strong className="text-emerald-400 font-semibold">🎓 Verified Collegiate</strong> badge.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsIdModalOpen(true)}
                className="shrink-0 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Verify Student ID
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Branch / Degree Program"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. B.Tech Computer Science"
          />

          <Select
            label="Academic Year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            options={ACADEMIC_YEARS}
          />
        </div>
      </div>

      {/* Skills, Interests, & Roles */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Skills & Interests</h2>
          <p className="text-xs text-slate-400">
            Pick your top skills and the types of projects that excite you.
          </p>
        </div>

        <TagInput
          label="Your Skills"
          placeholder="e.g. React, Python, C++, UI/UX, Docker..."
          tags={skills}
          onChange={setSkills}
          suggestions={[
            'React',
            'TypeScript',
            'Python',
            'Java',
            'C++',
            'UI/UX Design',
            'Node.js',
            'FastAPI',
            'PyTorch',
            'PostgreSQL',
            'Tailwind CSS',
            'Cloud / AWS',
          ]}
        />

        <TagInput
          label="Project Interests"
          placeholder="e.g. Web Development, AI/ML, Hackathons, Open Source..."
          tags={interests}
          onChange={setInterests}
          suggestions={[
            'Hackathons',
            'Web Development',
            'AI / ML',
            'Open Source',
            'Mobile Apps',
            'Social Impact',
            'Cybersecurity',
            'Developer Tools',
          ]}
        />

        <TagInput
          label="Preferred Team Roles"
          placeholder="e.g. Frontend Developer, ML Engineer, UI/UX Designer..."
          tags={preferredRoles}
          onChange={setPreferredRoles}
          suggestions={[
            'Frontend Developer',
            'Backend Developer',
            'Full-Stack Developer',
            'UI/UX Designer',
            'ML Engineer',
            'Project Lead',
            'Researcher',
          ]}
        />
      </div>

      {/* Social / Portfolio Links */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Online Presence</h2>
          <p className="text-xs text-slate-400">
            Share your work with teammates (email is kept private).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GitHub URL"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
            leftIcon={<Github className="w-4 h-4" />}
          />

          <Input
            label="LinkedIn Profile URL"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/username"
            leftIcon={<Linkedin className="w-4 h-4 text-[#70B5F9]" />}
          />
        </div>

        <Input
          label="Portfolio or Personal Website"
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.me"
          leftIcon={<Globe className="w-4 h-4" />}
        />
      </div>

      {/* Portfolio Privacy & College Role */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Portfolio Visibility & Institutional Role</h2>
          <p className="text-xs text-slate-400">
            Control the public visibility of your verified portfolio and access faculty mentor tools.
          </p>
        </div>

        {/* Public Portfolio Toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
          <div>
            <p className="text-sm font-semibold text-white">Public Student Portfolio</p>
            <p className="text-xs text-slate-400 mt-0.5">
              When enabled, your profile, founded projects, team memberships, and verified contribution evidence are public at /profile/{username || 'username'}.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={isPortfolioPublic}
              onChange={(e) => setIsPortfolioPublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-charcoal-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
        </div>

        {/* Faculty & Educator Role Verification */}
        <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-400" />
              <span className="text-sm font-semibold text-white">Institutional Role</span>
            </div>
            <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
              {profileRole === 'admin'
                ? 'Administrator'
                : profileRole === 'teacher' || initialProfile?.faculty_verified
                ? 'Faculty / Mentor'
                : initialProfile?.birth_year && initialProfile.birth_year > 2003
                ? `Student (Born ${initialProfile.birth_year})`
                : 'Student'}
            </span>
          </div>

          {profileRole !== 'teacher' && !initialProfile?.faculty_verified ? (
            <div className="pt-2 border-t border-charcoal-750 space-y-3">
              <p className="text-xs text-slate-400">
                Are you a college professor or academic mentor? Enter your institutional faculty passcode to activate educator privileges (authoring problem statements and providing project reviews).
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="e.g. FAC-2026-XXXX"
                  value={facultyCode}
                  onChange={(e) => setFacultyCode(e.target.value)}
                  className="bg-charcoal-900 border-charcoal-700 font-mono uppercase text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleVerifyFacultyCode}
                  isLoading={isVerifyingFaculty}
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                >
                  Verify Code
                </Button>
              </div>

              <div className="pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                  onClick={() => setIsDocModalOpen(true)}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                >
                  🇮🇳 Verify with DigiLocker (Aadhaar / Class 12th Marksheet)
                </Button>
              </div>

              <FacultyVerificationModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                onSuccess={async () => {
                  setProfileRole('teacher');
                  await refreshProfile();
                }}
              />
              <p className="text-[11px] text-slate-400">
                Institutional Passcodes are issued by your campus administrator in the Admin Control Center (Format: <code className="text-brand-300 font-mono">FAC-XXXX-XXXX</code>).
              </p>
              {facultyVerifyMsg && (
                <p className={`text-xs ${facultyVerifyMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {facultyVerifyMsg.text}
                </p>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-charcoal-750 space-y-2.5">
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Educator Status: You have access to post problem statements and evaluate student projects in the Mentor Dashboard.</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                onClick={() => setIsDocModalOpen(true)}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
              >
                🇮🇳 View / Re-verify DigiLocker Credential
              </Button>
              <FacultyVerificationModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                onSuccess={async () => {
                  setProfileRole('teacher');
                  await refreshProfile();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isOnboarding ? 'Complete Setup & Explore Projects' : 'Save Profile'}
        </Button>
      </div>

      {/* College Student ID Verification Modal */}
      <CollegeIdVerificationModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        collegeName={college}
        userId={user?.id}
        onCollegeNameChange={(name) => setCollege(name)}
        onSubmitted={(request) => {
          setVerificationStatus('pending');
          if (request?.collegeName) {
            setCollege(request.collegeName);
          }
        }}
        onVerified={(verifiedCollege) => {
          setCollege(verifiedCollege);
          setIsCollegeVerified(true);
          setVerificationStatus('approved');
        }}
      />
    </form>
  );
}
