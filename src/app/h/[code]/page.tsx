'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Hackathon } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Trophy,
  Lock,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';

export default function JoinHackathonPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = params?.code as string;
  const { user, openAuthModal } = useAuth();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [password, setPassword] = useState('');
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load hackathon by join code
  useEffect(() => {
    async function loadHackathon() {
      if (!joinCode) return;
      setIsLoading(true);
      setError(null);

      const cleanCode = joinCode.trim().toLowerCase();
      let foundHackathon: Hackathon | null = null;

      try {
        if (isSupabaseConfigured()) {
          // Attempt 1: Query by join_code column
          try {
            const { data: byCode } = await supabase
              .from('hackathons')
              .select('*')
              .eq('join_code', cleanCode)
              .maybeSingle();

            if (byCode) {
              foundHackathon = byCode as Hackathon;
            }
          } catch {
            // column might be missing before migration
          }

          // Attempt 2: Query by website_url containing this join code
          if (!foundHackathon) {
            try {
              const { data: byUrl } = await supabase
                .from('hackathons')
                .select('*')
                .ilike('website_url', `%/h/${cleanCode}%`)
                .limit(1)
                .maybeSingle();

              if (byUrl) {
                foundHackathon = {
                  ...byUrl,
                  access_type: byUrl.access_type || 'private',
                  join_code: cleanCode,
                } as Hackathon;
              }
            } catch {
              // ignore
            }
          }

          // Attempt 2.5: Query by description containing this join code
          if (!foundHackathon) {
            try {
              const { data: byDesc } = await supabase
                .from('hackathons')
                .select('*')
                .ilike('description', `%"join_code":"${cleanCode}"%`)
                .limit(1)
                .maybeSingle();

              if (byDesc) {
                foundHackathon = byDesc as Hackathon;
              }
            } catch {
              // ignore
            }
          }

          // Attempt 3: If cleanCode is a valid UUID, query by ID
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);
          if (!foundHackathon && isUuid) {
            try {
              const { data: byId } = await supabase
                .from('hackathons')
                .select('*')
                .eq('id', cleanCode)
                .maybeSingle();

              if (byId) {
                foundHackathon = byId as Hackathon;
              }
            } catch {
              // ignore
            }
          }
        }

        // Attempt 4: Check local storage for created hackathons
        if (!foundHackathon && typeof window !== 'undefined') {
          try {
            const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
            const match = localHacks.find(
              (h: any) =>
                h.join_code?.toLowerCase() === cleanCode ||
                h.id?.toLowerCase() === cleanCode ||
                h.website_url?.toLowerCase().includes(`/h/${cleanCode}`) ||
                h.description?.includes(`"join_code":"${cleanCode}"`)
            );
            if (match) {
              foundHackathon = match as Hackathon;
            }
          } catch {}
        }

        // Attempt 5: Check curated catalog
        if (!foundHackathon) {
          const curatedMatch = CURATED_HACKATHONS.find(
            (ch) =>
              ch.join_code?.toLowerCase() === cleanCode ||
              ch.id?.toLowerCase() === cleanCode
          );
          if (curatedMatch) {
            foundHackathon = curatedMatch as Hackathon;
          }
        }

        if (foundHackathon && foundHackathon.description?.includes('<!-- HACKATHON_META:')) {
          try {
            const metaStr = foundHackathon.description.split('<!-- HACKATHON_META:')[1].split('-->')[0];
            const meta = JSON.parse(metaStr);
            foundHackathon = {
              ...foundHackathon,
              access_type: meta.access_type || foundHackathon.access_type || 'private',
              join_code: meta.join_code || cleanCode,
              description: foundHackathon.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
            };
          } catch {}
        }

        if (!foundHackathon) {
          setError('This hackathon join link is invalid, expired, or has been removed.');
          setHackathon(null);
        } else {
          setHackathon(foundHackathon);

          // Check if current user is enrolled
          if (user) {
            try {
              if (typeof window !== 'undefined') {
                const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
                if (enrolled.includes(foundHackathon.id) || (foundHackathon.join_code && enrolled.includes(foundHackathon.join_code))) {
                  setIsAlreadyEnrolled(true);
                }
              }

              if (isSupabaseConfigured() && foundHackathon.id) {
                const { data: member } = await supabase
                  .from('hackathon_participants')
                  .select('id, role')
                  .eq('hackathon_id', foundHackathon.id)
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (member) {
                  setIsAlreadyEnrolled(true);
                }
              }
            } catch {
              // non-critical
            }
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching hackathon details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHackathon();
  }, [joinCode, user]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      openAuthModal('signup');
      return;
    }

    if (!hackathon) return;

    if (hackathon.access_type === 'private' && !password.trim()) {
      setError('Please enter the hackathon access password.');
      return;
    }

    setIsJoining(true);

    try {
      // Forward Supabase auth token to backend so RLS can identify the student
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const res = await fetch('/api/hackathons/join', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          joinCode: hackathon.join_code,
          password: password.trim(),
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join hackathon');
      }

      // Record enrollment in localStorage for instant seamless workspace access
      try {
        const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
        if (!enrolled.includes(hackathon.id)) {
          enrolled.push(hackathon.id);
        }
        if (hackathon.join_code && !enrolled.includes(hackathon.join_code)) {
          enrolled.push(hackathon.join_code);
        }
        localStorage.setItem('teamforge_enrolled_hackathons', JSON.stringify(enrolled));
      } catch {}

      // Dual fallback: Attempt direct browser insert into hackathon_participants with user's authenticated client
      try {
        await supabase.from('hackathon_participants').insert({
          hackathon_id: hackathon.id,
          user_id: user.id,
          role: 'student',
        });
      } catch {
        // Non-blocking
      }

      setSuccess('Access granted! Redirecting to the hackathon workspace...');
      setTimeout(() => {
        router.push(`/hackathons/${hackathon.id}/workspace`);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error validating access');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-charcoal-800 rounded-full mx-auto" />
        <div className="h-6 w-64 bg-charcoal-800 rounded mx-auto" />
        <div className="h-4 w-96 bg-charcoal-800 rounded mx-auto" />
      </div>
    );
  }

  if (error && !hackathon) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Join Link Expired</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <div className="pt-2">
          <Link href="/hackathons">
            <Button variant="outline" size="sm">
              Explore Open Hackathons
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!hackathon) return null;

  const isClosed = !hackathon.is_join_active || hackathon.status === 'Archived';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-gradient-to-b from-charcoal-850 via-charcoal-900 to-charcoal-950 border border-charcoal-750 p-6 sm:p-10 shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Private College Hackathon</span>
              </span>

              {hackathon.access_type === 'private' && (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Password Protected</span>
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-slate-400">
              Join Code: <strong className="text-white">{hackathon.join_code}</strong>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {hackathon.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              {hackathon.description}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Organized by: <strong className="text-white">{hackathon.organizer}</strong>
            </p>
          </div>

          {/* Quick Schedule Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Event Start</span>
              <span className="text-xs font-bold text-white block truncate">
                {new Date(hackathon.start_date).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Registration Due</span>
              <span className="text-xs font-bold text-rose-300 block truncate">
                {new Date(hackathon.registration_deadline).toLocaleDateString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Team Size</span>
              <span className="text-xs font-bold text-indigo-300 block">
                {hackathon.min_team_size || 1} - {hackathon.max_team_size || 4} Members
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Format</span>
              <span className="text-xs font-bold text-emerald-300 block">
                {hackathon.mode}
              </span>
            </div>
          </div>

          {/* Rules & Eligibility summary */}
          {hackathon.rules && (
            <div className="p-4 rounded-2xl bg-charcoal-800/50 border border-charcoal-700/70 space-y-1.5 text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>Rules & Requirements:</span>
              </span>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {hackathon.rules}
              </p>
            </div>
          )}

          {/* Action / Join Area */}
          <div className="pt-4 border-t border-charcoal-800">
            {isAlreadyEnrolled ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">You Are Registered!</h4>
                    <p className="text-xs text-slate-300">
                      Access the team registration, challenges, and submission portal inside the workspace.
                    </p>
                  </div>
                </div>

                <Link href={`/hackathons/${hackathon.id}/workspace`} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Enter Workspace
                  </Button>
                </Link>
              </div>
            ) : isClosed ? (
              <div className="p-4 rounded-2xl bg-charcoal-800 text-center text-xs text-slate-400">
                Registration for this hackathon has been closed by the organizer.
              </div>
            ) : !user ? (
              <div className="p-6 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 text-center space-y-3">
                <p className="text-sm text-slate-200 font-semibold">
                  Sign in with your college account to join this hackathon.
                </p>
                <Button
                  variant="primary"
                  onClick={() => openAuthModal('signup')}
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Sign In to Join
                </Button>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4 max-w-md mx-auto">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {hackathon.access_type === 'private' && (
                  <Input
                    label="College Access Password *"
                    type="password"
                    required
                    placeholder="Enter event access password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Obtain this password from your professor or college event announcement."
                  />
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
                  isLoading={isJoining}
                  leftIcon={<Trophy className="w-4 h-4" />}
                >
                  Join College Hackathon
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
