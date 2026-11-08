'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Hackathon } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { normalizeHackathonDeadlines } from '@/lib/hackathons/hackathonStatus';

export default function JoinHackathonPage() {
  const params = useParams();
  const router = useRouter();
  const joinCode = params?.code as string;
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load hackathon by join code and redirect immediately to the rich detail view
  useEffect(() => {
    async function loadHackathon() {
      if (!joinCode) return;
      setIsLoading(true);
      setError(null);

      const cleanCode = joinCode.trim().toLowerCase();
      let foundHackathon: Hackathon | null = null;
      let deletedSet = new Set<string>();
      if (typeof window !== 'undefined') {
        try {
          const localDel = JSON.parse(localStorage.getItem('teamforge_deleted_hackathons') || '[]');
          deletedSet = new Set(localDel.map((s: string) => String(s).toLowerCase()));
        } catch {}
      }

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

        if (
          foundHackathon &&
          (deletedSet.has((foundHackathon.id || '').toLowerCase()) ||
            deletedSet.has((foundHackathon.join_code || '').toLowerCase()) ||
            deletedSet.has((foundHackathon.title || '').trim().toLowerCase()))
        ) {
          setError('This hackathon has been removed.');
          setHackathon(null);
          setIsLoading(false);
          return;
        }

        if (!foundHackathon) {
          setError('This hackathon join link is invalid, expired, or has been removed.');
          setHackathon(null);
        } else {
          foundHackathon = normalizeHackathonDeadlines(foundHackathon);
          setHackathon(foundHackathon);

          // Check if current user is enrolled
          if (user) {
            try {
              if (typeof window !== 'undefined') {
                const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
                if (enrolled.includes(foundHackathon.id) || (foundHackathon.join_code && enrolled.includes(foundHackathon.join_code))) {
                  // already enrolled
                }
              }

              if (isSupabaseConfigured() && foundHackathon.id) {
                await supabase
                  .from('hackathon_participants')
                  .select('id, role')
                  .eq('hackathon_id', foundHackathon.id)
                  .eq('user_id', user.id)
                  .maybeSingle();
              }
            } catch {
              // non-critical
            }
          }

          // Immediately redirect to the full-featured widescreen detail page (Image 2)
          router.replace(`/hackathons/${foundHackathon.id}`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching hackathon details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHackathon();
  }, [joinCode, user, router]);

  if (isLoading || hackathon) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 px-4 py-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Opening Hackathon Protocol &amp; Registration...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-24">
      <div className="max-w-md w-full p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Join Link Expired</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {error || 'This hackathon join link is invalid, expired, or has been removed.'}
        </p>
        <div className="pt-2">
          <Link href="/hackathons">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Explore Open Hackathons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
