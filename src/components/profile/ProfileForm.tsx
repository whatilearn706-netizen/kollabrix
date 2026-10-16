'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';

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
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');
  const [isPortfolioPublic, setIsPortfolioPublic] = useState<boolean>(
    initialProfile?.is_portfolio_public ?? true
  );
  const [profileRole, setProfileRole] = useState(initialProfile?.role || 'student');
  const [facultyCode, setFacultyCode] = useState('');
  const [isVerifyingFaculty, setIsVerifyingFaculty] = useState(false);
  const [facultyVerifyMsg, setFacultyVerifyMsg] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerifyFacultyCode = async () => {
    setFacultyVerifyMsg(null);
    if (!facultyCode.trim()) {
      setFacultyVerifyMsg({ text: 'Please enter a faculty verification code.', isError: true });
      return;
    }
    try {
      setIsVerifyingFaculty(true);
      const { data, error: rpcError } = await supabase.rpc('verify_faculty_code', {
        access_code: facultyCode.trim(),
      });
      if (rpcError) {
        setFacultyVerifyMsg({ text: rpcError.message, isError: true });
      } else if (data && data.success) {
        setProfileRole('teacher');
        setFacultyVerifyMsg({ text: 'Verified! You now have faculty mentor permissions.', isError: false });
        await refreshProfile();
      } else {
        setFacultyVerifyMsg({ text: data?.error || 'Invalid verification code.', isError: true });
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
    portfolio_url: portfolioUrl,
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

    if (portfolioUrl && !validateUrl(portfolioUrl)) {
      setError('Please provide a valid Portfolio URL (e.g. https://portfolio.me).');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        user_id: user.id, // Strictly derived from the authenticated session
        username: username.trim().toLowerCase(),
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        college: college.trim() || null,
        course: course.trim() || null,
        academic_year: academicYear || null,
        skills,
        interests,
        preferred_roles: preferredRoles,
        github_url: githubUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        is_portfolio_public: isPortfolioPublic,
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' });

      if (upsertError) {
        if (upsertError.message.includes('profiles_username_key') || upsertError.code === '23505') {
          setError('This username is already taken. Please choose another unique username.');
        } else {
          setError(upsertError.message);
        }
        return;
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
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">College & Academic Details</h2>
          <p className="text-xs text-slate-400">
            Helps match you with campus peers or multi-institution cohorts.
          </p>
        </div>

        <Input
          label="College / University Name"
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          placeholder="e.g. University of Engineering & Applied Sciences"
        />

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
            label="Portfolio or Personal Website"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yourportfolio.me"
            leftIcon={<Globe className="w-4 h-4" />}
          />
        </div>
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
              {initialProfile?.birth_year && initialProfile.birth_year > 2003
                ? `Student (Born ${initialProfile.birth_year})`
                : profileRole === 'teacher'
                ? 'Faculty / Mentor'
                : profileRole === 'admin'
                ? 'Administrator'
                : 'Student'}
            </span>
          </div>

          {profileRole !== 'teacher' || (initialProfile?.birth_year && initialProfile.birth_year > 2003) ? (
            <div className="pt-2 border-t border-charcoal-750 space-y-3">
              <p className="text-xs text-slate-400">
                Are you a college professor or academic mentor? Enter your institutional faculty passcode to activate educator privileges (authoring problem statements and providing project reviews).
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="e.g. FACULTY2026"
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
                  className="w-full text-xs"
                  onClick={() => setIsDocModalOpen(true)}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                >
                  Or Verify with Aadhaar / Class 12th Marksheet
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
              <p className="text-[11px] text-slate-500">
                Institutional demo key: <code className="text-brand-300 font-bold">FACULTY2026</code> (Requires birthdate &le; 2003)
              </p>
              {facultyVerifyMsg && (
                <p className={`text-xs ${facultyVerifyMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {facultyVerifyMsg.text}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Educator Status: You have access to post problem statements and evaluate student projects in the Mentor Dashboard.</span>
            </p>
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
    </form>
  );
}
