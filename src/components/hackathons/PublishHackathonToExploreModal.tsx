'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  X,
  Sparkles,
  Rocket,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface PublishHackathonToExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    id: string;
    team_name: string;
    description?: string | null;
    members?: any[];
  };
  hackathon: {
    id: string;
    title: string;
    max_team_size?: number;
    themes?: string[];
  };
  isPublished?: boolean;
  onStatusChange?: (published: boolean) => void;
}

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'AI / Machine Learning',
  'Cloud & DevOps',
  'Cybersecurity',
  'Blockchain & Web3',
  'IoT & Embedded Systems',
  'Data Science & Analytics',
  'Game Development',
  'Other',
];

const SUGGESTED_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI / UX Designer',
  'AI / ML Engineer',
  'Mobile App Developer',
  'DevOps / Cloud Engineer',
];

export function PublishHackathonToExploreModal({
  isOpen,
  onClose,
  team,
  hackathon,
  isPublished = false,
  onStatusChange,
}: PublishHackathonToExploreModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState(team.team_name || '');
  const [summary, setSummary] = useState(
    team.description || `Building an innovative solution for the ${hackathon.title} sprint.`
  );
  const [description, setDescription] = useState(
    `We are competing in ${hackathon.title} and building a high-impact prototype. We are actively looking for talented, passionate collegiate builders to join our squad and ship together!`
  );
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [techInput, setTechInput] = useState(
    Array.isArray(hackathon.themes) && hackathon.themes.length > 0
      ? hackathon.themes.join(', ')
      : 'React, Next.js, TypeScript, TailwindCSS'
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    'Frontend Developer',
    'Backend Developer',
  ]);
  const [customRole, setCustomRole] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDelisting, setIsDelisting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (team.team_name) setTitle(team.team_name);
  }, [team.team_name]);

  if (!isOpen) return null;

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAddCustomRole = () => {
    const trimmed = customRole.trim();
    if (trimmed && !selectedRoles.includes(trimmed)) {
      setSelectedRoles((prev) => [...prev, trimmed]);
      setCustomRole('');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || title.trim().length < 2) {
      setErrorMsg('Please provide a project title (at least 2 characters).');
      return;
    }

    if (!summary.trim() || summary.trim().length < 10) {
      setErrorMsg('Please provide a brief project summary (at least 10 characters).');
      return;
    }

    if (selectedRoles.length === 0) {
      setErrorMsg('Please select at least 1 open role that your squad needs.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (user.id) headers['x-user-id'] = user.id;

      const technologies = techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/hackathons/teams/publish-explore', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teamId: team.id,
          hackathonId: hackathon.id,
          action: 'publish',
          title: title.trim(),
          summary: summary.trim(),
          description: description.trim(),
          category,
          difficulty,
          technologies: technologies.length > 0 ? technologies : ['Next.js', 'React'],
          required_skills: technologies.length > 0 ? technologies : ['Software Engineering'],
          desired_roles: selectedRoles,
          desired_team_size: hackathon.max_team_size || 4,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to list squad on Explore.');
      }

      // Invalidate Explore cache so it shows immediately
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('linkora_explore_projects_p1');
          sessionStorage.removeItem('linkora_explore_count_p1');
          localStorage.removeItem('linkora_explore_projects_p1');
          localStorage.removeItem('linkora_explore_count_p1');
          localStorage.setItem(`tf_hackathon_team_explore_${team.id}`, 'true');
        } catch {}
      }

      setSuccessMsg(data.message || '🎉 Your squad is now live on Explore!');
      if (onStatusChange) onStatusChange(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing squad to Explore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelist = async () => {
    if (!user) return;
    setIsDelisting(true);
    setErrorMsg(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (user.id) headers['x-user-id'] = user.id;

      const res = await fetch('/api/hackathons/teams/publish-explore', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teamId: team.id,
          hackathonId: hackathon.id,
          action: 'delist',
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delist squad from Explore.');
      }

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('linkora_explore_projects_p1');
          sessionStorage.removeItem('linkora_explore_count_p1');
          localStorage.removeItem('linkora_explore_projects_p1');
          localStorage.removeItem('linkora_explore_count_p1');
          localStorage.removeItem(`tf_hackathon_team_explore_${team.id}`);
        } catch {}
      }

      setSuccessMsg('Squad has been delisted from Explore and is now private.');
      if (onStatusChange) onStatusChange(false);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error delisting squad.');
    } finally {
      setIsDelisting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-left space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-charcoal-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-brand-400 mb-1 font-bold">
              <Rocket className="w-3.5 h-3.5" />
              <span>Campus Teammate Recruitment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isPublished ? 'Manage Explore Listing' : 'List Squad on Explore'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              Publish your hackathon squad to <strong>Explore Projects</strong> so students across campus can apply to join.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/explore">
                <Button variant="primary" size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-bold" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  View on Explore
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-300 hover:text-white">
                Back to Workshop
              </Button>
            </div>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handlePublish} className="space-y-5">
            {/* Project Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Project / Squad Title <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. EcoRoute or team union"
                required
                className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
              />
            </div>

            {/* Quick Pitch / Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Short Pitch &amp; Concept <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. AI-powered transit navigator for collegiate commuters..."
                required
                className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
              />
              <span className="text-[11px] text-slate-400 block">
                Displayed directly on your Explore card to catch student attention.
              </span>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Category / Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Required Technologies */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Tech Stack &amp; Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <Input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="React, Next.js, Node.js, Python, PostgreSQL"
                className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
              />
            </div>

            {/* Roles Needed */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Open Roles Needed in Your Squad <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 font-bold'
                          : 'bg-charcoal-800 text-slate-300 border-charcoal-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {role}
                    </button>
                  );
                })}
              </div>

              {/* Custom Role Input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRole();
                    }
                  }}
                  placeholder="Add custom role (e.g. Smart Contract Auditor)..."
                  className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomRole}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="border-charcoal-700 text-slate-300 hover:text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">Detailed Project Mission</label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem you are solving, your architectural plan, and what you expect from new teammates..."
                className="bg-charcoal-850 border-charcoal-700 text-white text-xs leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-charcoal-800">
              {isPublished ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelist}
                  isLoading={isDelisting}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-500/10 w-full sm:w-auto"
                >
                  Delist from Explore (Make Private)
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span>
                    Current squad: <strong>{team.members?.length || 1}</strong> / {hackathon.max_team_size || 4} members
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting || isDelisting}
                  className="text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-5"
                >
                  {isPublished ? 'Update Explore Listing' : 'Publish to Explore'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
