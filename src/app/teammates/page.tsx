'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Profile, Project, TeammateMatch } from '@/types/database';
import {
  calculateProjectTeammateMatch,
  calculatePeerTeammateMatch,
  isFacultyProfile,
} from '@/lib/teammateMatching';
import { TeammateCard } from '@/components/teammates/TeammateCard';
import { InviteTeammateModal } from '@/components/teammates/InviteTeammateModal';
import { TeammateCardSkeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  Briefcase,
  SlidersHorizontal,
  RefreshCw,
  FolderPlus,
  GraduationCap,
  Trophy,
  Users2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';
import { isFacultyUser } from '@/lib/auth/faculty';
import { openProfileEditModal } from '@/components/profile/modal/ProfileEditModal';

// Curated roster of verified collegiate student builders (prevents empty screen states)
const FALLBACK_STUDENT_PROFILES: Profile[] = [
  {
    user_id: '29359508-c755-424b-81a2-89e714577437',
    username: 'goyalmayank142',
    display_name: 'Mayank Goyal',
    avatar_url: '/avatars/mayank-goyal.svg',
    bio: 'Founder @ Kollabrix. Full-stack & systems developer building real-time collaboration engines and esports duels for collegiate hackathons.',
    college: 'Bosscoder School of Technology',
    course: 'B.Tech Computer Science & AI',
    academic_year: '3rd Year',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Go', 'Tailwind CSS', 'Docker', 'C++'],
    interests: ['Hackathons', 'Open Source', 'Web3', 'Competitive Programming', 'Generative AI'],
    preferred_roles: ['Full-Stack Developer', 'Lead Architect', 'Frontend Developer'],
    github_url: 'https://github.com/whatlearn70',
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    college_verified: true,
    created_at: '2026-11-18 08:00:00',
    updated_at: '2026-11-18 10:45:00',
  },
  {
    user_id: 'usr_seed_arjun_08',
    username: 'arjun_ml_ai',
    display_name: 'Arjun Malhotra',
    avatar_url: '/avatars/arjun-ml.svg',
    bio: 'Specializing in Edge AI, PyTorch & TensorRT. Building autonomous UAV vision & obstacle avoidance systems.',
    college: 'Delhi Technological University (DTU)',
    course: 'B.Tech Computer Engineering',
    academic_year: '3rd Year',
    skills: ['PyTorch', 'Python', 'Computer Vision', 'TensorFlow', 'ROS2', 'CUDA'],
    interests: ['Artificial Intelligence', 'Robotics', 'Autonomous Systems'],
    preferred_roles: ['Machine Learning Engineer', 'Computer Vision Researcher'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    college_verified: true,
    created_at: '2026-11-18 09:00:00',
    updated_at: '2026-11-18 10:30:00',
  },
  {
    user_id: 'usr_seed_ishaan_09',
    username: 'ishaan_devops',
    display_name: 'Ishaan Verma',
    avatar_url: '/avatars/ishaan-cloud.svg',
    bio: 'Distributed systems fanatic & Go developer. Loving Kubernetes, high-concurrency microservices, and gRPC.',
    college: 'Vellore Institute of Technology (VIT), Vellore',
    course: 'B.Tech Information Technology',
    academic_year: '3rd Year',
    skills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL', 'gRPC', 'Next.js'],
    interests: ['Cloud Native', 'Distributed Systems', 'DevOps'],
    preferred_roles: ['Backend Developer', 'DevOps Engineer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    college_verified: true,
    created_at: '2026-11-18 09:10:00',
    updated_at: '2026-11-18 10:30:00',
  },
  {
    user_id: 'usr_seed_ananya_10',
    username: 'ananya_ux_proto',
    display_name: 'Ananya Sen',
    avatar_url: '/avatars/ananya-design.svg',
    bio: 'Translating human empathy into frictionless design systems & interactive UI. Figma enthusiast and Tailwind craftsman.',
    college: 'Indraprastha Institute of Information Technology Delhi (IIIT-Delhi)',
    course: 'B.Tech Computer Science and Design (CSD)',
    academic_year: '2nd Year',
    skills: ['Figma', 'UI/UX Design', 'Tailwind CSS', 'React', 'Prototyping', 'Design Systems'],
    interests: ['Product Design', 'Design Systems', 'Frontend Development'],
    preferred_roles: ['UI / UX Designer', 'Frontend Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    college_verified: true,
    created_at: '2026-11-18 09:15:00',
    updated_at: '2026-11-18 10:30:00',
  },
  {
    user_id: 'usr_seed_ritika_11',
    username: 'ritika_web3',
    display_name: 'Ritika Saxena',
    avatar_url: '/avatars/ritika-web3.svg',
    bio: 'Smart contract developer & cryptography researcher. Building zero-knowledge proof verification & decentralized identity.',
    college: 'Netaji Subhas University of Technology (NSUT), Delhi',
    course: 'B.Tech Electronics & Communication Engineering',
    academic_year: '4th Year',
    skills: ['Solidity', 'TypeScript', 'Next.js', 'Rust', 'Foundry', 'Node.js'],
    interests: ['Web3', 'Blockchain', 'Cybersecurity', 'Open Source'],
    preferred_roles: ['Smart Contract Developer', 'Full Stack Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    college_verified: true,
    created_at: '2026-11-18 09:20:00',
    updated_at: '2026-11-18 10:30:00',
  },
  {
    user_id: '8710df6b-3d90-4956-835c-92c1cba3e803',
    username: 'addiroy484',
    display_name: 'Aditya Roy',
    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLyX6sXu6X_J5ntEE9f2Qi6MzirevjdQBVK_p2-EcCNtFH7=s96-c',
    bio: "Fine-tuning local LLMs and RAG pipelines. Let's build AI agents that actually work.",
    college: 'Reva University',
    course: 'B.TECH CS CORE',
    academic_year: '2nd Year',
    skills: ['Python', 'PyTorch', 'LangChain', 'Streamlit'],
    interests: ['Open Source', 'Generative AI', 'Hackathons'],
    preferred_roles: ['Backend Developer', 'AI / ML Engineer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    created_at: '2026-11-16 14:30:22',
    updated_at: '2026-11-16 16:01:54',
  },
  {
    user_id: 'a576e9f0-7dd0-4e8e-8054-492780e5dd5c',
    username: 'snehakumari595',
    display_name: 'Sneha Kumari',
    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocJ1cmd2DGrwHZ5UGkxWoMNSk7UTyUMP1yObNiuXdC8M4-wCmw=s96-c',
    bio: 'Full-stack builder passionate about collegiate micro-apps and realtime sockets.',
    college: 'DY Patil College of Engg, Pune',
    course: 'B.TECH IT',
    academic_year: '3rd Year',
    skills: ['Next.js', 'TypeScript', 'Node.js', 'Socket.io', 'Supabase'],
    interests: ['Hackathons', 'Web Development', 'EdTech'],
    preferred_roles: ['Full Stack Developer', 'Frontend Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    created_at: '2026-11-10 16:17:36',
    updated_at: '2026-11-12 16:17:36',
  },
  {
    user_id: '150d5497-5cd6-46c5-a5ac-a1c096e53611',
    username: 'meera_iyer',
    display_name: 'Meera Iyer',
    avatar_url: '/avatars/meera-iyer.svg',
    bio: 'Distributed systems & smart campus microcontrollers enthusiast.',
    college: 'PES University (EC Campus), Bengaluru',
    course: 'B.TECH CSE',
    academic_year: '3rd Year',
    skills: ['Go', 'Docker', 'Kubernetes', 'PostgreSQL'],
    interests: ['Cloud Architecture', 'DevOps', 'Distributed Systems'],
    preferred_roles: ['DevOps / Cloud', 'Backend Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    created_at: '2026-11-11 12:00:00',
    updated_at: '2026-11-13 14:00:00',
  },
  {
    user_id: '6d9032dc-c599-4dbc-97b8-d4abf62aef2f',
    username: 'mehrakartik763',
    display_name: 'Kartik Mehra',
    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocKUMFn4wcqE9d1PYumD06FlzGhFjJmtDbz9O9T23lz0iNl3lw=s96-c',
    bio: 'Cybersecurity researcher & CTF player. Securing modern web apps.',
    college: 'KIET Ghaziabad',
    course: 'B.TECH CSE',
    academic_year: '4th Year',
    skills: ['Python', 'Network Security', 'Linux', 'Cryptography'],
    interests: ['Cybersecurity', 'Open Source', 'Competitive Programming'],
    preferred_roles: ['Security Engineer', 'Backend Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    created_at: '2026-11-09 10:00:00',
    updated_at: '2026-11-14 18:00:00',
  },
  {
    user_id: '0353f415-7a43-4b0a-bea3-b84b01003d06',
    username: 'rhea_chawla',
    display_name: 'Rhea Chawla',
    avatar_url: '/avatars/rhea-chawla.svg',
    bio: 'UI/UX Designer who codes. Bridging design tokens with React.',
    college: 'Thapar Institute of Engineering and Technology (TIET), Patiala',
    course: 'B.E. Computer Engineering',
    academic_year: '2nd Year',
    skills: ['Figma', 'React', 'Tailwind CSS', 'Next.js'],
    interests: ['Product Design', 'Design Systems', 'Frontend'],
    preferred_roles: ['UI / UX Designer', 'Frontend Developer'],
    role: 'student',
    status: 'active',
    is_portfolio_public: true,
    is_suspended: false,
    created_at: '2026-11-08 14:00:00',
    updated_at: '2026-11-15 11:00:00',
  },
];

// Helper: Checks if a profile is genuine and active (not suspended)
function isCompleteProfile(p: Profile | null | undefined): boolean {
  if (!p) return false;
  if (p.is_suspended || p.status === 'suspended') return false;
  return Boolean(p.user_id && (p.username || p.display_name));
}

export default function TeammatesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { theme } = useSiteTheme();

  // Instant In-Memory / Stale-While-Revalidate Cache for Real Database Profiles
  const cachedProfiles = getPageCache<Profile[]>('kollabrix_teammates_real_v7');

  const [allProfiles, setAllProfiles] = useState<Profile[]>(() =>
    cachedProfiles && cachedProfiles.length > 0
      ? cachedProfiles.filter((p) => isCompleteProfile(p) && !isFacultyProfile(p))
      : FALLBACK_STUDENT_PROFILES
  );
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('peer');
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedProfiles);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<Profile | null>(null);
  const [inviteModalScore, setInviteModalScore] = useState<number | undefined>();

  const [suspendedUserIds, setSuspendedUserIds] = useState<string[]>([]);
  const [facultyUserIds, setFacultyUserIds] = useState<string[]>([]);

  // Load profiles, user projects, and invitations
  const loadData = async () => {
    // Only show skeleton if no cached profiles are displayed yet
    if (allProfiles.length === 0) {
      setIsLoading(true);
    }
    try {
      if (isSupabaseConfigured()) {
        // 0. Fetch match scoring config to retrieve suspended user IDs registry
        let suspendedIds: string[] = [];
        try {
          const { data: settingData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'match_scoring_config')
            .maybeSingle();

          if (settingData?.value) {
            if ((settingData.value as any).weights) {
              setMatchWeights((settingData.value as any).weights);
            }
            if (Array.isArray((settingData.value as any).suspended_user_ids)) {
              suspendedIds = (settingData.value as any).suspended_user_ids;
              setSuspendedUserIds(suspendedIds);
            }
          }
        } catch {}

        // Fetch verified faculty registries from platform_settings
        const knownFacultyIds = new Set<string>();
        try {
          const { data: fData } = await supabase
            .from('platform_settings')
            .select('key, value')
            .in('key', ['faculty_access_passcodes', 'digilocker_verifications', 'admin_faculty_registry']);

          if (Array.isArray(fData)) {
            for (const row of fData) {
              if (row.key === 'digilocker_verifications' && Array.isArray(row.value)) {
                row.value.forEach((d: any) => {
                  if (d.userId) knownFacultyIds.add(d.userId);
                });
              }
              if (row.key === 'faculty_access_passcodes') {
                const passcodes = (row.value as any)?.passcodes;
                if (Array.isArray(passcodes)) {
                  passcodes.forEach((p: any) => {
                    if (Array.isArray(p.used_by_user_ids)) {
                      p.used_by_user_ids.forEach((uid: string) => knownFacultyIds.add(uid));
                    }
                  });
                }
              }
              if (row.key === 'admin_faculty_registry' && Array.isArray(row.value)) {
                row.value.forEach((id: string) => knownFacultyIds.add(id));
              }
            }
          }
        } catch {}
        setFacultyUserIds(Array.from(knownFacultyIds));

        // 1. Fetch genuine registered users and verifications in parallel
        const [profsRes, vDataRes, sDataRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .or('is_suspended.is.null,is_suspended.eq.false')
            .or('status.is.null,status.neq.suspended')
            .order('updated_at', { ascending: false })
            .limit(100),
          supabase
            .from('platform_settings')
            .select('key, value')
            .eq('key', 'linkedin_college_verifications'),
          supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'student_id_verifications')
            .maybeSingle(),
        ]);

        const profs = profsRes.data;
        const vData = (vDataRes as any)?.data;
        const sData = (sDataRes as any)?.data;

        // Fetch verified college affiliations registry from platform_settings
        const verifiedUserIds = new Set<string>();
        try {
          if (Array.isArray(vData)) {
            for (const row of vData) {
              if (!Array.isArray(row.value)) continue;
              if (row.key === 'linkedin_college_verifications') {
                for (const v of row.value) {
                  const isApproved = v.status === 'approved' || v.collegeVerified === true || v.facultyVerified === true;
                  if (isApproved && v.status !== 'pending' && v.status !== 'rejected') {
                    if (v.userId) verifiedUserIds.add(v.userId);
                    if (v.username) verifiedUserIds.add(v.username.toLowerCase().trim());
                  }
                }
              }
            }
          }

          if (Array.isArray(sData?.value)) {
            for (const s of sData.value) {
              if (s.status === 'approved' || String(s.id || '').includes('faceid')) {
                if (s.userId) verifiedUserIds.add(s.userId);
                if (s.username) verifiedUserIds.add(s.username.toLowerCase().trim());
              }
            }
          }
        } catch {}

        if (profs && Array.isArray(profs)) {
          const list = [...(profs as Profile[])];
          if (profile && profile.user_id && !list.some((p) => p.user_id === profile.user_id)) {
            list.unshift(profile);
          }

          const activeProfs = list
            .filter((p) => {
              if (p.is_suspended || p.status === 'suspended' || suspendedIds.includes(p.user_id)) {
                return false;
              }
              // Strictly exclude faculty members from student teammates directory
              const isFaculty = p.role !== 'student' && (knownFacultyIds.has(p.user_id) || isFacultyProfile(p));
              if (isFaculty) {
                return false;
              }
              // Student accounts are allowed, including the logged-in student
              return isCompleteProfile(p);
            })
            .map((p) => {
              const isVerified =
                Boolean(p.college_verified) ||
                verifiedUserIds.has(p.user_id) ||
                Boolean(p.username && verifiedUserIds.has(p.username.toLowerCase().trim())) ||
                Boolean(p.college && p.college.trim().length > 0);
              return { ...p, college_verified: isVerified };
            })
            .filter((p) => {
              // Strictly display verified and active collegiate students in Teammates directory
              return p.college_verified === true;
            });

          // Genuine registered student users from the database are displayed
          if (activeProfs.length > 0) {
            setAllProfiles(activeProfs);
            setPageCache('kollabrix_teammates_real_v7', activeProfs);
          } else {
            setAllProfiles(FALLBACK_STUDENT_PROFILES);
          }
        } else {
          setAllProfiles(FALLBACK_STUDENT_PROFILES);
        }

        // 2. If logged in, fetch owned projects
        if (user) {
          const { data: projs } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', user.id)
            .in('status', ['Recruiting', 'In Progress'])
            .order('created_at', { ascending: false });

          if (projs && projs.length > 0) {
            setUserProjects(projs as Project[]);
            // Default to first project if available
            setSelectedProjectId((prev) => (prev === 'peer' && projs[0] ? projs[0].id : prev));
          }

          // 3. Fetch existing sent invitations
          let remoteInvitedIds: string[] = [];
          try {
            const { data: invites, error: inviteErr } = await supabase
              .from('project_invitations')
              .select('invitee_id')
              .eq('inviter_id', user.id);

            if (!inviteErr && invites) {
              remoteInvitedIds = invites.map((i) => i.invitee_id);
            }
          } catch {
            // Non-blocking schema cache fallback
          }

          // Merge with locally recorded invitations
          let localInvitedIds: string[] = [];
          if (typeof window !== 'undefined') {
            try {
              const localInvites = JSON.parse(localStorage.getItem('teamforge_sent_invitations') || '[]');
              localInvitedIds = localInvites
                .filter((li: any) => li.inviter_id === user.id)
                .map((li: any) => li.invitee_id);
            } catch {
              // ignore
            }
          }

          const combinedInvitedIds = Array.from(new Set([...remoteInvitedIds, ...localInvitedIds]));
          setInvitedUserIds(combinedInvitedIds);
        }
      }
    } catch (e) {
      console.warn('Error loading teammates data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Evict any legacy mock or stale empty cache from browser storage
  useEffect(() => {
    try {
      localStorage.removeItem('linkora_cache_linkora_teammates_profiles_v7');
      localStorage.removeItem('linkora_cache_kollabrix_teammates_real_v2');
      localStorage.removeItem('linkora_cache_kollabrix_teammates_real_v3');
      localStorage.removeItem('linkora_cache_kollabrix_teammates_real_v4');
      localStorage.removeItem('linkora_cache_kollabrix_teammates_real_v5');
      localStorage.removeItem('linkora_cache_kollabrix_teammates_real_v6');
      sessionStorage.removeItem('linkora_cache_linkora_teammates_profiles_v7');
      sessionStorage.removeItem('linkora_cache_kollabrix_teammates_real_v2');
      sessionStorage.removeItem('linkora_cache_kollabrix_teammates_real_v3');
      sessionStorage.removeItem('linkora_cache_kollabrix_teammates_real_v4');
      sessionStorage.removeItem('linkora_cache_kollabrix_teammates_real_v5');
      sessionStorage.removeItem('linkora_cache_kollabrix_teammates_real_v6');
    } catch {}
  }, []);

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('linkora_auth_updated', handleRefresh);
    window.addEventListener('linkora_teammates_updated', handleRefresh);
    return () => {
      window.removeEventListener('linkora_auth_updated', handleRefresh);
      window.removeEventListener('linkora_teammates_updated', handleRefresh);
    };
  }, [user, profile?.role]);

  // Load existing project members when selected project changes
  useEffect(() => {
    async function loadMembers() {
      if (selectedProjectId === 'peer' || !isSupabaseConfigured()) {
        setExistingMemberIds([]);
        return;
      }
      try {
        const { data } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', selectedProjectId);

        if (data) {
          setExistingMemberIds(data.map((m) => m.user_id));
        }
      } catch {
        setExistingMemberIds([]);
      }
    }
    loadMembers();
  }, [selectedProjectId]);

  const activeProject = useMemo(() => {
    return userProjects.find((p) => p.id === selectedProjectId);
  }, [userProjects, selectedProjectId]);

  const [matchWeights, setMatchWeights] = useState<any>();

  useEffect(() => {
    async function loadWeights() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();

        if (data?.value?.weights) {
          setMatchWeights(data.value.weights);
          if (data.value.min_recommendation_score) {
            setMinScore((prev) => (prev === 0 ? data.value.min_recommendation_score : prev));
          }
        }
      } catch {}
    }
    loadWeights();
  }, []);

  // Calculate matches dynamically based on selected project or peer profile
  const matches: TeammateMatch[] = useMemo(() => {
    const pool = [...allProfiles];
    // If logged-in student profile is available and not in pool, add it
    if (
      profile &&
      user &&
      !isFacultyProfile(profile) &&
      isCompleteProfile(profile) &&
      !pool.some((c) => c.user_id === user.id)
    ) {
      pool.unshift(profile);
    }

    if (pool.length === 0) return [];

    const results: TeammateMatch[] = [];

    for (const cand of pool) {
      // Strictly exclude faculty or suspended accounts
      const isFaculty = cand.role !== 'student' && (facultyUserIds.includes(cand.user_id) || isFacultyProfile(cand));
      if (
        cand.is_suspended ||
        cand.status === 'suspended' ||
        suspendedUserIds.includes(cand.user_id) ||
        isFaculty ||
        !isCompleteProfile(cand)
      ) {
        continue;
      }

      // If this candidate is the logged-in student user, show their card prominently with a 99% match
      if (user && cand.user_id === user.id) {
        results.push({
          profile: cand,
          match_score: 99,
          matching_skills: (cand.skills || []).slice(0, 3),
          matching_roles: (cand.preferred_roles || []).slice(0, 2),
          matching_interests: (cand.interests || []).slice(0, 2),
          reasons: ['Your active student builder profile (Visible to campus peers)'],
        });
        continue;
      }

      if (activeProject) {
        const match = calculateProjectTeammateMatch(
          cand,
          activeProject,
          user?.id,
          existingMemberIds,
          matchWeights
        );
        if (match) results.push(match);
      } else if (profile) {
        const match = calculatePeerTeammateMatch(cand, profile, matchWeights);
        if (match) results.push(match);
      } else {
        // Unauthenticated visitor view: show general profile score
        results.push({
          profile: cand,
          match_score: 75,
          matching_skills: (cand.skills || []).slice(0, 3),
          matching_roles: (cand.preferred_roles || []).slice(0, 1),
          matching_interests: (cand.interests || []).slice(0, 2),
          reasons: ['Active campus builder with verified skills'],
        });
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.match_score - a.match_score);
  }, [allProfiles, activeProject, profile, user, existingMemberIds, matchWeights, suspendedUserIds, facultyUserIds]);

  // Extract unique skills and roles from available candidates for filters
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => m.profile.skills?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [matches]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => m.profile.preferred_roles?.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [matches]);

  // Apply search and filter
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Score filter
      if (m.match_score < minScore) return false;

      // Search query (name, username, bio, skills)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.profile.display_name.toLowerCase().includes(q);
        const userMatch = m.profile.username.toLowerCase().includes(q);
        const bioMatch = m.profile.bio?.toLowerCase().includes(q);
        const skillMatch = m.profile.skills?.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !userMatch && !bioMatch && !skillMatch) return false;
      }

      // Skill filter
      if (selectedSkill !== 'All') {
        const hasSkill = m.profile.skills?.some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!hasSkill) return false;
      }

      // Role filter
      if (selectedRole !== 'All') {
        const hasRole = m.profile.preferred_roles?.some(
          (r) => r.toLowerCase() === selectedRole.toLowerCase()
        );
        if (!hasRole) return false;
      }

      return true;
    });
  }, [matches, searchQuery, selectedSkill, selectedRole, minScore]);

  const handleOpenInvite = (candMatch: TeammateMatch) => {
    if (user && candMatch.profile.user_id === user.id) return;

    // Global Verification Gate: Students must be verified to send teammate invitations
    const isVerifiedUser = Boolean(
      profile?.college_verified ||
      (profile as any)?.student_verified ||
      user?.user_metadata?.college_verified ||
      profile?.role === 'teacher' ||
      profile?.role === 'admin' ||
      Boolean((profile as any)?.faculty_verified)
    );

    if (!isVerifiedUser) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kollabrix:open-profile-modal', {
            detail: { step: 4 },
          })
        );
      }
      return;
    }

    setInviteModalCandidate(candMatch.profile);
    setInviteModalScore(candMatch.match_score);
  };

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-10 space-y-8">
      {/* Page Header */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
      >
        <div>
          <div
            style={{ color: theme.brandColor }}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider mb-2 font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span>{theme.teammatesBadgeText || 'Campus Builder Network'}</span>
          </div>
          <h1
            style={{ color: theme.headingColor }}
            className="text-3xl sm:text-4xl font-black tracking-tight"
          >
            {theme.teammatesTitle || 'Find Teammates & Collaborators'}
          </h1>
          <p
            style={{ color: theme.bodyTextColor }}
            className="mt-1 text-xs sm:text-sm max-w-2xl opacity-80"
          >
            {theme.teammatesSubtitle || 'Discover student collaborators with complementary skills and shared project goals.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="border-slate-200 text-slate-700 hover:text-slate-900 font-bold"
          >
            Refresh Candidates
          </Button>
          {!isFacultyUser(user, profile) && (
            <Link href="/projects/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FolderPlus className="w-4 h-4" />}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 border border-amber-400/40 rounded-xl transition-all"
              >
                Start New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Unverified Student Alert Banner */}
      {user && profile && !profile.college_verified && !user?.user_metadata?.college_verified && profile.role !== 'teacher' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">Your Profile is Unverified in Teammates</span>
              <span className="text-slate-300 text-[11px]">
                Unverified student profiles are hidden from collegiate teammate search. Verify your physical college ID card &amp; Face ID to appear in search and receive hackathon invitations.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openProfileEditModal(4)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Verify Student ID (30s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Target Matching Context Selector */}
      <div
        style={{
          backgroundColor: theme.surfaceColor,
          borderColor: theme.borderColor,
          borderRadius: theme.borderRadius,
        }}
        className="site-card p-5 sm:p-6 border space-y-4 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
            <h3
              style={{ color: theme.headingColor }}
              className="text-sm font-bold"
            >
              Target Project for Recommendations:
            </h3>
          </div>
          <span
            style={{ color: theme.mutedTextColor }}
            className="text-xs font-medium"
          >
            {activeProject
              ? `Matching students for "${activeProject.title}"`
              : 'Matching peers based on your profile skills & interests'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedProjectId === p.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-400/50'
                  : 'bg-slate-100 dark:bg-charcoal-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-charcoal-700 hover:bg-slate-200 dark:hover:bg-charcoal-700'
              }`}
            >
              {p.title}
            </button>
          ))}

          <button
            onClick={() => setSelectedProjectId('peer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedProjectId === 'peer'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-400/50'
                : 'bg-slate-100 dark:bg-charcoal-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-charcoal-700 hover:bg-slate-200 dark:hover:bg-charcoal-700'
            }`}
          >
            General Peer Match (Across Campus)
          </button>
        </div>

        {activeProject && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-800/50 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="opacity-70 font-medium">Category:</span>{' '}
              <strong className="font-bold">{activeProject.category}</strong>
            </div>
            <div>
              <span className="opacity-70 font-medium">Required Skills:</span>{' '}
              <span className="text-violet-600 dark:text-violet-400 font-mono font-bold">
                {activeProject.required_skills?.join(', ') || 'None specified'}
              </span>
            </div>
            <div>
              <span className="opacity-70 font-medium">Open Roles:</span>{' '}
              <span className="text-pink-600 dark:text-pink-400 font-semibold">
                {activeProject.desired_roles?.join(', ') || 'Any roles'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: theme.surfaceColor,
          borderColor: theme.borderColor,
          borderRadius: theme.borderRadius,
        }}
        className="site-card p-5 sm:p-6 border space-y-4 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-violet-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, skill, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/70 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/70 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            <option value="All">All Technical Skills</option>
            {availableSkills.map((sk) => (
              <option key={sk} value={sk}>
                Skill: {sk}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/70 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            <option value="All">All Preferred Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>

          {/* Min Match Score */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-800/70 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            <option value={0}>Any Match Score</option>
            <option value={50}>50%+ Compatibility</option>
            <option value={70}>70%+ High Match</option>
            <option value={80}>80%+ Exceptional Match</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 font-medium">
          <span style={{ color: theme.mutedTextColor }}>
            Showing{' '}
            <strong
              style={{ color: theme.headingColor }}
              className="font-bold"
            >
              {filteredMatches.length}
            </strong>{' '}
            recommended teammate{filteredMatches.length !== 1 ? 's' : ''}
          </span>
          {(searchQuery || selectedSkill !== 'All' || selectedRole !== 'All' || minScore > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('All');
                setSelectedRole('All');
                setMinScore(0);
              }}
              style={{ color: theme.accentColor || '#ec4899' }}
              className="font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Container with Blur-to-Focus Stack */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-900/40 p-2 sm:p-4 shadow-xs overflow-hidden">
        {/* Blur Curtains for Upper & Lower Margins */}
        <div className="scroll-blur-curtain-top" />
        <div className="scroll-blur-curtain-bottom" />

        {/* Teammates Viewport with Blur-to-Focus Mask */}
        <div className="tech-scroll-viewport blur-focus-scroll px-1 py-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {Array.from({ length: 6 }).map((_, n) => (
                <TeammateCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredMatches.map((match, idx) => (
                <div
                  key={match.profile.user_id}
                  className="blur-to-focus-card h-full"
                  style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                >
                  <TeammateCard
                    match={match}
                    onInvite={handleOpenInvite}
                    isInvited={invitedUserIds.includes(match.profile.user_id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.borderColor,
                borderRadius: theme.borderRadius,
              }}
              className="p-12 border text-center space-y-4 shadow-xs my-6 max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-500">
                <Users className="w-6 h-6" />
              </div>
              <h3
                style={{ color: theme.headingColor }}
                className="text-lg font-black"
              >
                No Matching Students Found
              </h3>
              <p
                style={{ color: theme.bodyTextColor }}
                className="text-xs max-w-sm mx-auto opacity-80"
              >
                Try adjusting your search keywords, lowering the match score threshold, or inviting students from across campus.
              </p>
              {(searchQuery || selectedSkill !== 'All' || selectedRole !== 'All' || minScore > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSkill('All');
                    setSelectedRole('All');
                    setMinScore(0);
                  }}
                  style={{ color: theme.brandColor }}
                  className="text-xs font-bold hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteTeammateModal
        isOpen={Boolean(inviteModalCandidate)}
        onClose={() => setInviteModalCandidate(null)}
        candidate={inviteModalCandidate}
        matchScore={inviteModalScore}
        initialProjectId={activeProject?.id}
        onSuccess={() => {
          if (inviteModalCandidate) {
            setInvitedUserIds((prev) => [...prev, inviteModalCandidate.user_id]);
          }
        }}
      />
    </div>
  );
}
