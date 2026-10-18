'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Project,
  ProjectMilestone,
  ProblemStatement,
  ProblemSolution,
  ProjectMentoringNote,
  MentoringFeedbackType,
  ProjectStatus,
  ProjectCategory,
} from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import {
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  MessageSquare,
  Users,
  Flag,
  ArrowRight,
  ExternalLink,
  BookOpen,
  KeyRound,
  ShieldCheck,
  Award,
  Send,
  Trophy,
  Lock,
  Globe,
  Copy,
  Settings,
  Eye,
} from 'lucide-react';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';
import { CreateHackathonModal } from '@/components/hackathons/CreateHackathonModal';
import { HackathonSecurityModal } from '@/components/hackathons/HackathonSecurityModal';
import { Hackathon } from '@/types/database';

interface HackathonWithStats extends Hackathon {
  participants_count?: number;
  teams_count?: number;
  submissions_count?: number;
}

interface ProjectWithDetails extends Project {
  members?: Array<{
    user_id: string;
    role: string;
    profile?: {
      display_name: string;
      avatar_url?: string | null;
    } | null;
  }>;
  milestones?: ProjectMilestone[];
  mentoring_notes?: ProjectMentoringNote[];
}

const FEEDBACK_TYPES: MentoringFeedbackType[] = [
  'General',
  'Milestone Review',
  'Technical Guidance',
  'Commendation',
];

export default function TeacherDashboardPage() {
  const { user, profile, refreshProfile, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'projects' | 'problems' | 'feedback' | 'hackathons'>('projects');
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [myProblems, setMyProblems] = useState<ProblemStatement[]>([]);
  const [myNotes, setMyNotes] = useState<ProjectMentoringNote[]>([]);
  const [myHackathons, setMyHackathons] = useState<HackathonWithStats[]>([]);
  const [isCreateHackathonOpen, setIsCreateHackathonOpen] = useState(false);
  const [securityModalHackathon, setSecurityModalHackathon] = useState<Hackathon | null>(null);
  const [copiedJoinCode, setCopiedJoinCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'All'>('All');

  // Mentoring Feedback Modal State
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [feedbackType, setFeedbackType] = useState<MentoringFeedbackType>('General');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Problem applications review state
  const [problemApplications, setProblemApplications] = useState<any[]>([]);
  const [problemSolutions, setProblemSolutions] = useState<ProblemSolution[]>([]);
  const [selectedProblemForReview, setSelectedProblemForReview] = useState<ProblemStatement | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Faculty verification state for non-teachers
  const [facultyCode, setFacultyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [isDocVerifyOpen, setIsDocVerifyOpen] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Authoritative server-side status check for revocations
  useEffect(() => {
    async function checkStatus() {
      if (!user) {
        setIsCheckingStatus(false);
        return;
      }
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/faculty/status', { headers });
        const data = await res.json();
        if (data.isRevoked) {
          setIsRevoked(true);
          setVerifyError('Your faculty access has been revoked by an administrator. Please enter an active access passcode to regain access.');
        } else {
          setIsRevoked(false);
        }
      } catch (err) {
        console.warn('Error checking faculty status:', err);
      } finally {
        setIsCheckingStatus(false);
      }
    }
    checkStatus();
  }, [user]);

  const [isPreviewingGateAsVisitor, setIsPreviewingGateAsVisitor] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview_gate') === 'true') {
        setIsPreviewingGateAsVisitor(true);
      }
    }
  }, []);

  const [adminBypassGranted, setAdminBypassGranted] = useState(false);

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    user?.email === 'goyalmayank142@gmail.com' ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('linkora_admin_session') === 'true' ||
       localStorage.getItem('linkora_admin_role') === 'admin'))
  );

  const isTeacher =
    !isRevoked &&
    !isPreviewingGateAsVisitor &&
    Boolean(
      profile?.role === 'teacher' ||
      profile?.role === 'admin' ||
      Boolean(profile?.faculty_verified) ||
      (isAdmin && adminBypassGranted && !isRevoked) ||
      (profile?.role !== 'student' &&
        typeof window !== 'undefined' &&
        (localStorage.getItem(`linkora_faculty_verified_${user?.id}`) === 'true' ||
         localStorage.getItem('teamforge_verified_faculty') === 'true'))
    );

  const loadDashboardData = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. Fetch projects with owner, members, milestones, and problem statements
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college
          ),
          members:project_members(
            user_id,
            role,
            profile:profiles(
              display_name,
              avatar_url
            )
          ),
          milestones:project_milestones(
            id,
            title,
            target_date,
            status
          ),
          mentoring_notes:project_mentoring_notes(
            id,
            content,
            feedback_type,
            created_at,
            mentor_id
          )
        `)
        .order('created_at', { ascending: false });

      if (!projError && projData) {
        setProjects(projData as unknown as ProjectWithDetails[]);
      }

      // 2. Fetch problems authored by this teacher
      const { data: probData, error: probError } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      let authoredProblems: ProblemStatement[] = [];
      if (!probError && probData) {
        authoredProblems = probData as unknown as ProblemStatement[];
      }

      // Also merge community problem statements authored by this user
      try {
        const { data: commRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'community_problem_statements')
          .maybeSingle();

        if (commRow?.value && Array.isArray(commRow.value)) {
          const matchingComm = commRow.value.filter((p: any) => p.author_id === user.id);
          const existingIds = new Set(authoredProblems.map((p) => p.id));
          for (const cp of matchingComm) {
            if (cp && cp.id && !existingIds.has(cp.id)) {
              authoredProblems.unshift(cp);
            }
          }
        }
      } catch {}

      setMyProblems(authoredProblems);

      // 3. Fetch mentoring notes given by this teacher
      const { data: noteData, error: noteError } = await supabase
        .from('project_mentoring_notes')
        .select(`
          *,
          project:projects(
            id,
            title,
            category
          )
        `)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (!noteError && noteData) {
        setMyNotes(noteData as unknown as ProjectMentoringNote[]);
      }

      // 4. Fetch hackathons authored by this teacher with fallback & local sync
      let rawHacks: any[] = [];
      try {
        const { data: hackData, error: hackError } = await supabase
          .from('hackathons')
          .select(`
            *,
            participants:hackathon_participants(count),
            teams:hackathon_teams(count),
            submissions:hackathon_submissions(count)
          `)
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (!hackError && hackData) {
          rawHacks = hackData.map((h: any) => ({
            ...h,
            participants_count: h.participants?.[0]?.count ?? 0,
            teams_count: h.teams?.[0]?.count ?? 0,
            submissions_count: h.submissions?.[0]?.count ?? 0,
          }));
        } else {
          // Fallback to simple select without relations
          const { data: simpleData } = await supabase
            .from('hackathons')
            .select('*')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false });

          if (simpleData) {
            rawHacks = simpleData.map((h: any) => ({
              ...h,
              participants_count: 0,
              teams_count: 0,
              submissions_count: 0,
            }));
          }
        }
      } catch {
        // ignore
      }

      // Fetch deleted hackathons list to prevent suppressed items from reappearing
      let deletedSet = new Set<string>();
      try {
        const hRes = await fetch(`/api/hackathons?_t=${Date.now()}`, { cache: 'no-store' });
        const hData = await hRes.json();
        const dIds: string[] = hData?.deletedIds || [];
        const dTitles: string[] = hData?.deletedTitles || [];
        deletedSet = new Set([...dIds, ...dTitles].map((id: string) => id.trim().toLowerCase()));
      } catch {}

      // Merge with locally authored hackathons
      let localHacks: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const survivingStored = stored.filter((h: any) => {
            const isDel =
              (h.id && deletedSet.has(h.id.toLowerCase())) ||
              (h.join_code && deletedSet.has(h.join_code.toLowerCase())) ||
              (h.title && deletedSet.has(h.title.trim().toLowerCase()));
            return !isDel;
          });
          if (survivingStored.length !== stored.length) {
            localStorage.setItem('teamforge_created_hackathons', JSON.stringify(survivingStored));
          }

          localHacks = survivingStored.filter((h: any) => h.creator_id === user.id || !h.creator_id).map((h: any) => ({
            ...h,
            participants_count: 0,
            teams_count: 0,
            submissions_count: 0,
          }));
        } catch {}
      }

      const combinedHacks = [...localHacks, ...rawHacks];
      const seenHackIds = new Set<string>();
      const dedupedHacks: HackathonWithStats[] = [];
      for (const item of combinedHacks) {
        if (item && item.id && !seenHackIds.has(item.id)) {
          const isDel =
            deletedSet.has(item.id.toLowerCase()) ||
            (item.join_code && deletedSet.has(item.join_code.toLowerCase())) ||
            (item.title && deletedSet.has(item.title.trim().toLowerCase()));
          if (!isDel) {
            seenHackIds.add(item.id);
          let cleanItem = { ...item };
          if (cleanItem.description?.includes('<!-- HACKATHON_META:')) {
            try {
              const metaStr = cleanItem.description.split('<!-- HACKATHON_META:')[1].split('-->')[0];
              const meta = JSON.parse(metaStr);
              cleanItem.access_type = meta.access_type || cleanItem.access_type || 'private';
              cleanItem.join_code = meta.join_code || cleanItem.join_code;
              cleanItem.description = cleanItem.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
            } catch {}
          }
          if (!cleanItem.join_code && cleanItem.website_url?.includes('/h/')) {
            cleanItem.join_code = cleanItem.website_url.split('/h/')[1]?.split(/[?#]/)[0];
            cleanItem.access_type = cleanItem.access_type || 'private';
          }
          dedupedHacks.push(cleanItem);
        }
      }
    }

      setMyHackathons(dedupedHacks);

      // 5. Fetch student applications for problems authored by this teacher
      try {
        const appsRes = await fetch(`/api/problems/applications?author_id=${user.id}`);
        const appsData = await appsRes.json();
        if (appsRes.ok && appsData.success && Array.isArray(appsData.applications)) {
          setProblemApplications(appsData.applications);
        }
      } catch (err) {
        console.warn('Problem applications load notice:', err);
      }

      // 6. Fetch submitted problem answers / solutions
      try {
        const solRes = await fetch('/api/problems/solutions');
        const solData = await solRes.json();
        if (solRes.ok && solData.success && Array.isArray(solData.solutions)) {
          setProblemSolutions(solData.solutions);
        }
      } catch (err) {
        console.warn('Problem solutions load notice:', err);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Faculty Verification
  const handleVerifyFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifySuccess(null);

    const code = facultyCode.trim().toUpperCase();
    if (!code) {
      setVerifyError('Please enter an institutional faculty code or admin-issued passcode.');
      return;
    }

    const cleanNoSpaces = code.replace(/[\s-_]/g, '');
    if (
      cleanNoSpaces === 'FACULTY2026' ||
      code.includes('FACULTY2026') ||
      code.includes('FACULTY 2026') ||
      code.includes('FACULTY-2026')
    ) {
      setVerifyError('⛔ Access Denied: "FACULTY2026" has been permanently blocked and revoked. It was only an example format. Please enter an active administrator-issued passcode (e.g. FAC-849201) or authenticate via DigiLocker.');
      return;
    }

    // Allow admin passcode bypass directly
    if (code === 'ADMIN7X9' || cleanNoSpaces === 'ADMIN7X9') {
      setAdminBypassGranted(true);
      setVerifySuccess('Admin access granted! Entering Faculty Dashboard...');
      return;
    }

    if (!user) {
      openAuthModal('login');
      setVerifyError('Please sign in or register first so your faculty status can be activated on your account.');
      return;
    }

    try {
      setIsVerifying(true);

      // 1. Check admin-generated passcodes and platform settings via API endpoint
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/faculty/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, userId: user?.id }),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        setIsRevoked(false);
        setVerifyError(null);
        if (typeof window !== 'undefined') {
          if (user?.id) localStorage.setItem(`linkora_faculty_verified_${user.id}`, 'true');
          localStorage.setItem('teamforge_verified_faculty', 'true');
        }
        setVerifySuccess(resData.message || 'Faculty status verified! Loading mentor dashboard...');
        await refreshProfile();
        await loadDashboardData();
        return;
      }

      // If explicit custom error from API (e.g. inactive passcode, max uses reached)
      if (res.status === 403 || res.status === 400) {
        setVerifyError(resData.error || 'This passcode is invalid, inactive, or has reached its usage limit.');
        return;
      }

      setVerifyError(
        resData.error ||
          'Invalid faculty code. Please request an access passcode from your platform administrator or verify via institutional documents.'
      );
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Error verifying faculty code.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit Feedback Note
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!user || !selectedProject) return;

    if (!feedbackContent.trim()) {
      setFeedbackError('Feedback note cannot be empty.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);

      const payload = {
        project_id: selectedProject.id,
        mentor_id: user.id,
        content: feedbackContent.trim(),
        feedback_type: feedbackType,
      };

      const { data: newNote, error: insertError } = await supabase
        .from('project_mentoring_notes')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Send in-app notification to project owner
      if (selectedProject.owner_id && selectedProject.owner_id !== user.id) {
        await supabase.from('notifications').insert({
          recipient_id: selectedProject.owner_id,
          sender_id: user.id,
          type: 'feedback_received',
          title: 'Faculty Mentor Feedback',
          message: `${profile?.display_name || 'A faculty mentor'} posted ${feedbackType.toLowerCase()} feedback on your project "${selectedProject.title}".`,
          link: `/projects/${selectedProject.id}`,
        });
      }

      setFeedbackSuccess('Mentoring feedback posted successfully!');
      setFeedbackContent('');

      // Refresh list
      await loadDashboardData();

      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackSuccess(null);
      }, 1000);
    } catch (err: unknown) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleReviewProblemApp = async (appId: string, newStatus: 'Accepted' | 'Rejected') => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/problems/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ application_id: appId, status: newStatus }),
      });

      setProblemApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.warn('Error reviewing problem applicant:', err);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchTerm, statusFilter, categoryFilter]);

  if (!isTeacher) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 max-w-xl mx-auto">
        {/* Platform Administrator Control Bar */}
        {isAdmin && (
          <div className="mb-4 p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <div className="font-bold flex items-center gap-1.5 text-indigo-300 text-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Platform Owner / Admin Active ({user?.email || 'Owner'})</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                The Faculty Gate is shown so you can test DigiLocker or passcode verification. You can also bypass anytime.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => setAdminBypassGranted(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 text-xs font-bold py-2 px-3.5 shadow-md"
            >
              Enter Dashboard →
            </Button>
          </div>
        )}

        {isPreviewingGateAsVisitor && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-3 shadow-lg">
            <span className="font-semibold">👁️ Admin Faculty Gate Test View (Regular unverified visitors see this screen)</span>
            <button
              type="button"
              onClick={() => setIsPreviewingGateAsVisitor(false)}
              className="px-2.5 py-1 rounded-xl bg-amber-500 text-charcoal-950 font-bold hover:bg-amber-400 text-xs shrink-0"
            >
              ← Exit Test View
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-brand-500/30 bg-midnight-900/90 p-8 shadow-card relative overflow-hidden">
          {/* Top Indian Tricolor Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 absolute top-0 left-0 right-0" />

          <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-4 mt-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Faculty &amp; Mentor Verification
          </h1>
          <p className="text-sm text-slate-300 text-center mb-6 leading-relaxed">
            The Mentor Dashboard gives professors and faculty access to monitor student project
            milestones, provide formal evaluation notes, and author institution problem statements.
          </p>

          {/* PRIMARY: Government DigiLocker Verification */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-blue-950/40 border border-indigo-500/30 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Recommended: Instant Gov.in Verification
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UIDAI / CBSE</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify your official credentials directly through DigiLocker with E-Aadhaar or Class 12th Marksheet. Zero manual file uploads required.
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-2.5 text-sm shadow-md"
              onClick={() => setIsDocVerifyOpen(true)}
              leftIcon={<ShieldCheck className="w-4 h-4 text-white" />}
            >
              🇮🇳 Connect DigiLocker (Aadhaar / Class 12th Marksheet)
            </Button>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-midnight-750"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase font-semibold">Or Enter Institutional Passcode</span>
            <div className="flex-grow border-t border-midnight-750"></div>
          </div>

          <form onSubmit={handleVerifyFaculty} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Faculty Access Passcode
              </label>
              <Input
                type="text"
                value={facultyCode}
                onChange={(e) => setFacultyCode(e.target.value)}
                placeholder="e.g. FAC-849201"
                className="font-mono uppercase bg-midnight-850 border-midnight-700 text-white"
              />
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Enter your campus administrator passcode (<code className="text-brand-300 font-mono font-bold">FAC-XXXXXX</code>). <span className="text-rose-400 font-semibold font-mono">FACULTY2026</span> is permanently disabled.
              </p>
            </div>

            {verifyError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{verifyError}</span>
              </div>
            )}

            {verifySuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{verifySuccess}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              className="w-full bg-midnight-800 hover:bg-midnight-750 text-white border border-midnight-700 font-semibold"
              isLoading={isVerifying}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Verify Faculty Passcode
            </Button>
          </form>

          <FacultyVerificationModal
            isOpen={isDocVerifyOpen}
            onClose={() => setIsDocVerifyOpen(false)}
            onSuccess={async () => {
              setIsPreviewingGateAsVisitor(false);
              await refreshProfile();
              await loadDashboardData();
              if (!user) {
                openAuthModal('login');
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-brand-400 mb-1.5 font-mono">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Mentorship Portal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Teacher &amp; Mentor Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Supervise collegiate projects, inspect team deliverables, review milestones, and publish
            academic challenges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDocVerifyOpen(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
            leftIcon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          >
            🇮🇳 DigiLocker Identity
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewingGateAsVisitor(true)}
              className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10 text-xs"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Test Gate
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateHackathonOpen(true)}
            leftIcon={<Trophy className="w-4 h-4" />}
          >
            Host Hackathon
          </Button>
          <Link href="/problems/new">
            <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Post Problem
            </Button>
          </Link>
          <Link href="/problems">
            <Button variant="ghost" size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
              Problem Directory
            </Button>
          </Link>
        </div>
      </div>

      <FacultyVerificationModal
        isOpen={isDocVerifyOpen}
        onClose={() => setIsDocVerifyOpen(false)}
        onSuccess={async () => {
          await refreshProfile();
          await loadDashboardData();
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-midnight-750/70 bg-midnight-900/80 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Student Projects</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white">{projects.length}</p>
          <span className="text-[11px] text-slate-500">Across all college departments</span>
        </div>

        <div className="p-5 rounded-2xl border border-midnight-750/70 bg-midnight-900/80 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>College Hackathons</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{myHackathons.length}</p>
          <span className="text-[11px] text-slate-500">Private campus events hosted</span>
        </div>

        <div className="p-5 rounded-2xl border border-midnight-750/70 bg-midnight-900/80 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>My Problem Statements</span>
            <FileCode2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{myProblems.length}</p>
          <span className="text-[11px] text-slate-500">
            {myProblems.filter((p) => p.status === 'Published').length} published active
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-midnight-750/70 bg-midnight-900/80 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Feedback Given</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{myNotes.length}</p>
          <span className="text-[11px] text-slate-500">Mentoring notes & reviews</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-midnight-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
            activeTab === 'projects'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Projects ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('hackathons')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
            activeTab === 'hackathons'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          College Hackathons ({myHackathons.length})
        </button>

        <button
          onClick={() => setActiveTab('problems')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
            activeTab === 'problems'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Problem Statements ({myProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Feedback History ({myNotes.length})
        </button>
      </div>

      {/* Tab Content: Student Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects by title, summary, or lead student..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Recruiting', label: 'Recruiting' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Completed', label: 'Completed' },
                ]}
                className="w-36"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading student projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/30 p-12 text-center">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white mb-1">No Projects Found</p>
              <p className="text-xs text-slate-400">
                {searchTerm ? 'No projects match your current filters.' : 'No student projects have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => {
                const totalMilestones = p.milestones?.length || 0;
                const completedMilestones =
                  p.milestones?.filter((m) => m.status === 'Completed').length || 0;
                const milestoneProgress =
                  totalMilestones > 0
                    ? Math.round((completedMilestones / totalMilestones) * 100)
                    : 0;

                const notesCount = p.mentoring_notes?.length || 0;

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/50 hover:border-charcoal-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Status badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="category" size="sm">
                            {p.category}
                          </Badge>
                          <Badge variant="status" status={p.status} size="sm" />
                        </div>
                        {notesCount > 0 && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {notesCount} {notesCount === 1 ? 'note' : 'notes'}
                          </span>
                        )}
                      </div>

                      {/* Title & Summary */}
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-base font-bold text-white hover:text-brand-300 transition-colors line-clamp-1 mb-1 block"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {p.summary}
                      </p>

                      {/* Milestone Progress */}
                      <div className="mb-4 p-3 rounded-xl bg-charcoal-850/60 border border-charcoal-800">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                            <Flag className="w-3.5 h-3.5 text-brand-400" />
                            Milestones
                          </span>
                          <span className="text-slate-400">
                            {completedMilestones} / {totalMilestones} completed ({milestoneProgress}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-charcoal-700 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-300"
                            style={{ width: `${milestoneProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Team Roster */}
                      <div className="mb-4">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          Team Roster ({p.current_team_size}/{p.desired_team_size})
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Owner */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs text-slate-200">
                            <Avatar
                              name={p.owner?.display_name || 'Owner'}
                              src={p.owner?.avatar_url}
                              size="sm"
                            />
                            <span className="truncate max-w-[100px]">
                              {p.owner?.display_name || 'Lead'}
                            </span>
                            <span className="text-[10px] text-brand-400 font-semibold">(Lead)</span>
                          </div>

                          {/* Members */}
                          {p.members?.map((m, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-charcoal-800/80 border border-charcoal-700/80 text-xs text-slate-300"
                            >
                              <Avatar
                                name={m.profile?.display_name || 'Member'}
                                src={m.profile?.avatar_url}
                                size="sm"
                              />
                              <span className="truncate max-w-[90px]">
                                {m.profile?.display_name || 'Student'}
                              </span>
                              <span className="text-[10px] text-slate-400">({m.role})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-charcoal-800 text-xs">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(p);
                          setFeedbackModalOpen(true);
                        }}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-brand-400" />}
                      >
                        Provide Feedback
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: My Problem Statements */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">My Authored Problem Statements</h2>
              <p className="text-xs text-slate-400">
                Manage challenges, edit requirements, or archive past statements.
              </p>
            </div>
            <Link href="/problems/new">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Post New Problem
              </Button>
            </Link>
          </div>

          {myProblems.length === 0 ? (
            <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/30 p-12 text-center">
              <FileCode2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white mb-1">
                You haven&apos;t posted any problem statements yet.
              </p>
              <p className="text-xs text-slate-400 mb-4">
                Publish a research challenge or industry problem for student teams to select.
              </p>
              <Link href="/problems/new">
                <Button size="sm" variant="primary">
                  Post Problem Statement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myProblems.map((prob) => {
                const appsForProb = problemApplications.filter(
                  (a) => a.problem_statement_id === prob.id
                );
                const pendingCount = appsForProb.filter((a) => a.status === 'Pending').length;

                return (
                  <div
                    key={prob.id}
                    className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="category" size="sm">
                          {prob.category}
                        </Badge>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            prob.status === 'Published'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : prob.status === 'Draft'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600'
                          }`}
                        >
                          {prob.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          Posted {new Date(prob.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`/problems/${prob.id}`}
                        className="text-base font-bold text-white hover:text-brand-300 transition-colors"
                      >
                        {prob.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1 max-w-2xl">
                        {prob.description}
                      </p>

                      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{appsForProb.length} {appsForProb.length === 1 ? 'Applicant' : 'Applicants'}</span>
                          {pendingCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              {pendingCount} new
                            </span>
                          )}
                        </span>

                        {(prob.team_size || prob.min_team_size) && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>Team Size: {prob.team_size || `${prob.min_team_size || 1}–${prob.max_team_size || 4} Students`}</span>
                          </span>
                        )}

                        {(() => {
                          const sols = problemSolutions.filter((s) => s.problem_id === prob.id);
                          return (
                            <Link
                              href={`/problems/${prob.id}#solutions`}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{sols.length} {sols.length === 1 ? 'Problem Answer' : 'Problem Answers'}</span>
                            </Link>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedProblemForReview(prob);
                          setIsReviewModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20"
                        leftIcon={<Users className="w-3.5 h-3.5" />}
                      >
                        Review Applicants ({appsForProb.length})
                      </Button>
                      <Link href={`/problems/${prob.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/problems/${prob.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Feedback History */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Feedback & Review Log</h2>
            <p className="text-xs text-slate-400">
              All academic notes, milestone evaluations, and technical recommendations provided by you.
            </p>
          </div>

          {myNotes.length === 0 ? (
            <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/30 p-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white mb-1">
                No Mentoring Notes Recorded
              </p>
              <p className="text-xs text-slate-400">
                Select any student project to record milestone feedback, architecture guidance, or commendations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/50"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {note.feedback_type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${note.project_id}`}
                      className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-medium"
                    >
                      <span>Open Project</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: College Hackathons */}
      {activeTab === 'hackathons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/40">
            <div>
              <h3 className="text-base font-bold text-white">Private College Hackathons</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Host private campus hackathons with salted passcodes, release challenge problem statements, and conduct rubric-based evaluations.
              </p>
            </div>
            <Link href="/hackathons/new">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Host New Hackathon
              </Button>
            </Link>
          </div>

          {myHackathons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-charcoal-750 bg-charcoal-900/20 p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-white mb-1">
                No College Hackathons Hosted Yet
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                Launch a private college hackathon with an access password, release challenge problem statements, and track student teams and project deliverables.
              </p>
              <Link href="/hackathons/new">
                <Button
                  variant="primary"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Host Your First College Hackathon
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {myHackathons.map((h) => {
                const joinUrl = typeof window !== 'undefined'
                  ? `${window.location.origin}/h/${h.join_code}`
                  : `/h/${h.join_code}`;
                const isCopied = copiedJoinCode === h.join_code;

                return (
                  <div
                    key={h.id}
                    className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              h.access_type === 'private'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                : 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                            }`}
                          >
                            {h.access_type === 'private' ? (
                              <>
                                <Lock className="w-3 h-3" />
                                Private Access
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3" />
                                Open Public
                              </>
                            )}
                          </span>

                          <span
                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border ${
                              h.status === 'Published'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-700/50 border-slate-600 text-slate-300'
                            }`}
                          >
                            {h.status || 'Published'}
                          </span>

                          {h.results_published && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300">
                              <Award className="w-3 h-3" />
                              Results Published
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => setSecurityModalHackathon(h)}
                          title="Manage Access & Passcode"
                          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-charcoal-800 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-white mb-1.5">{h.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{h.description}</p>

                      {/* Stat Counters */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 mb-4 text-center">
                        <div>
                          <div className="text-base font-bold text-white">{h.participants_count ?? 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Students</div>
                        </div>
                        <div>
                          <div className="text-base font-bold text-brand-300">{h.teams_count ?? 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Teams</div>
                        </div>
                        <div>
                          <div className="text-base font-bold text-emerald-300">{h.submissions_count ?? 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Submissions</div>
                        </div>
                      </div>

                      {/* Shareable Link Box */}
                      {h.join_code && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-950 border border-charcoal-800 mb-4">
                          <div className="flex-1 truncate font-mono text-[11px] text-slate-400 px-1">
                            {joinUrl}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(joinUrl);
                              setCopiedJoinCode(h.join_code!);
                              setTimeout(() => setCopiedJoinCode(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-charcoal-800">
                      <div className="text-[11px] text-slate-400">
                        {h.submission_deadline ? (
                          <span>Due: {new Date(h.submission_deadline).toLocaleDateString()}</span>
                        ) : (
                          <span>Mode: {h.mode}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSecurityModalHackathon(h)}
                          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          Access
                        </Button>
                        <Link href={`/hackathons/${h.id}/workspace`}>
                          <Button
                            variant="primary"
                            size="sm"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            Workspace
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mentoring Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Provide Faculty Mentoring Feedback"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Target Project:</p>
            <p className="text-sm font-semibold text-white">{selectedProject?.title}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Feedback Category
            </label>
            <Select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as MentoringFeedbackType)}
              options={FEEDBACK_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mentoring Notes & Evaluation
            </label>
            <Textarea
              rows={5}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Detail your evaluation of their progress, code quality, architecture advice, or milestone completion..."
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              This note will be visible to the team members on their project dashboard and trigger an alert.
            </span>
          </div>

          {feedbackError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{feedbackError}</span>
            </div>
          )}

          {feedbackSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingFeedback}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Publish Mentoring Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Problem Applicants Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedProblemForReview(null);
        }}
        title={`Review Applicants: ${selectedProblemForReview?.title || 'Problem Challenge'}`}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-1">
          {/* Header summary */}
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="category" size="sm">
                {selectedProblemForReview?.category}
              </Badge>
              <span className="text-xs text-slate-400">
                Difficulty: <strong className="text-white">{selectedProblemForReview?.difficulty}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {selectedProblemForReview?.description}
            </p>
          </div>

          {/* List of applicants */}
          {(() => {
            const apps = problemApplications.filter(
              (a) => a.problem_statement_id === selectedProblemForReview?.id
            );

            if (apps.length === 0) {
              const problemLink = typeof window !== 'undefined'
                ? `${window.location.origin}/problems/${selectedProblemForReview?.id}`
                : `/problems/${selectedProblemForReview?.id}`;

              return (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Student Applicants Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Students will appear here as soon as they click <strong>&quot;Apply to Tackle this Problem&quot;</strong>. Share the link in your college WhatsApp group to kick off team formation!
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(problemLink);
                      alert('Problem statement link copied! Share this with your students.');
                    }}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                    className="text-xs text-brand-300 border-brand-500/30"
                  >
                    Copy Student Invite Link
                  </Button>
                </div>
              );
            }

            return (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={app.applicant?.avatar_url}
                          name={app.applicant?.display_name || 'Student'}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {app.applicant?.display_name || 'Student'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              @{app.applicant?.username}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {app.applicant?.college || 'College of Engineering'}
                            {app.applicant?.course ? ` • ${app.applicant.course}` : ''}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : app.status === 'Rejected'
                            ? 'bg-red-500/15 border-red-500/30 text-red-400'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs text-slate-200 leading-relaxed">
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="text-[10px] uppercase font-bold text-indigo-400">
                          Proposed Role: {app.proposed_role}
                        </div>
                        {app.team_size && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span>Applicant Team: {app.team_size}</span>
                          </span>
                        )}
                      </div>
                      <p className="italic">&ldquo;{app.message}&rdquo;</p>
                    </div>

                    {app.applicant?.skills && app.applicant.skills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {app.applicant.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-300 border border-charcoal-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-charcoal-800/80 text-[11px] text-slate-400">
                      <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>

                      <div className="flex items-center gap-2">
                        {app.status !== 'Accepted' && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3"
                            onClick={() => handleReviewProblemApp(app.id, 'Accepted')}
                            leftIcon={<CheckCircle2 className="w-3 h-3" />}
                          >
                            Accept
                          </Button>
                        )}
                        {app.status !== 'Rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs h-7 px-3"
                            onClick={() => handleReviewProblemApp(app.id, 'Rejected')}
                            leftIcon={<AlertCircle className="w-3 h-3" />}
                          >
                            Decline
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </Modal>

      <CreateHackathonModal
        isOpen={isCreateHackathonOpen}
        onClose={() => setIsCreateHackathonOpen(false)}
        onSuccess={async () => {
          setIsCreateHackathonOpen(false);
          await loadDashboardData();
        }}
      />

      <HackathonSecurityModal
        hackathon={securityModalHackathon}
        isOpen={Boolean(securityModalHackathon)}
        onClose={() => setSecurityModalHackathon(null)}
        onUpdated={async () => {
          await loadDashboardData();
        }}
      />
    </div>
  );
}
