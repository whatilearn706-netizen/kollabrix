import { NextRequest, NextResponse } from 'next/server';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { IcpcContest } from '@/types/icpc';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// In-memory fallback cache for teacher-created contests
let memoryContests: IcpcContest[] = [];

export async function GET(request: NextRequest) {
  try {
    let dbContests: IcpcContest[] = [];

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });

      try {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'icpc_contests_v1')
          .maybeSingle();

        if (settingRow?.value && Array.isArray(settingRow.value)) {
          dbContests = settingRow.value;
        }
      } catch (err) {
        console.warn('Could not read icpc_contests_v1 from platform_settings:', err);
      }
    }

    // Merge: custom teacher contests first, followed by curated contests
    const allContests = [...dbContests, ...memoryContests, ...CURATED_ICPC_CONTESTS];
    
    // Deduplicate by ID
    const seen = new Set<string>();
    const uniqueContests: IcpcContest[] = [];
    for (const c of allContests) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        uniqueContests.push(c);
      }
    }

    return NextResponse.json({
      success: true,
      contests: uniqueContests,
      count: uniqueContests.length,
    });
  } catch (error: any) {
    console.error('Error fetching ICPC contests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load contests', contests: CURATED_ICPC_CONTESTS },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, durationMinutes, problems, rules, visibility, passcode, college } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Contest title is required.' }, { status: 400 });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ success: false, error: 'Please add at least one problem to the contest.' }, { status: 400 });
    }

    const newContest: IcpcContest = {
      id: `icpc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle?.trim() || 'Collegiate Programming Challenge • LeetCode Style',
      organizer: body.organizer || 'Verified Faculty Member',
      organizerRole: body.organizerRole || 'Faculty Mentor & Contest Director',
      college: college || 'Partner Collegiate Network',
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime || new Date(Date.now() + (durationMinutes || 180) * 60000).toISOString(),
      durationMinutes: Number(durationMinutes) || 180,
      status: 'live',
      visibility: visibility === 'passcode' ? 'passcode' : 'public',
      passcode: passcode?.trim() || undefined,
      bannerGradient: body.bannerGradient || 'from-cyan-600 via-indigo-600 to-violet-600',
      participantCount: 1,
      scoringType: 'leetcode',
      rules: Array.isArray(rules) && rules.length > 0 ? rules : [
        'Standard LeetCode / ICPC time limits apply.',
        'Submissions evaluated against hidden and sample testcases.',
        'Instant AST analysis for code verification.',
      ],
      problems: problems.map((p: any, idx: number) => ({
        id: `prob-${Date.now()}-${idx + 1}`,
        title: p.title?.trim() || `Problem ${String.fromCharCode(65 + idx)}`,
        difficulty: (p.difficulty === 'Easy' || p.difficulty === 'Hard') ? p.difficulty : 'Medium',
        points: Number(p.points) || (p.difficulty === 'Easy' ? 100 : p.difficulty === 'Hard' ? 500 : 250),
        timeLimit: p.timeLimit || '1.0s',
        memoryLimit: p.memoryLimit || '256MB',
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Algorithms', 'Data Structures'],
        description: p.description?.trim() || 'Solve the given problem efficiently.',
        inputFormat: p.inputFormat?.trim() || 'Standard input format.',
        outputFormat: p.outputFormat?.trim() || 'Standard output format.',
        constraints: p.constraints?.trim() || '1 <= N <= 10^5',
        sampleInput: p.sampleInput?.trim() || '1\n5',
        sampleOutput: p.sampleOutput?.trim() || '5',
        explanation: p.explanation?.trim() || undefined,
      })),
    };

    // Save to memory cache
    memoryContests.unshift(newContest);

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });

        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'icpc_contests_v1')
          .maybeSingle();

        const currentList: IcpcContest[] = Array.isArray(settingRow?.value) ? settingRow.value : [];
        const updatedList = [newContest, ...currentList];

        await client.from('platform_settings').upsert({
          key: 'icpc_contests_v1',
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not persist contest to platform_settings:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      contest: newContest,
      message: 'ICPC contest uploaded and published successfully!',
    });
  } catch (error: any) {
    console.error('Error creating ICPC contest:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload contest' },
      { status: 500 }
    );
  }
}
