import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const problemId = url.searchParams.get('problem_id');
    const authorId = url.searchParams.get('author_id');
    const applicantId = url.searchParams.get('applicant_id');

    let allApps: any[] = [];

    if (isSupabaseConfigured()) {
      // 1. Fetch from platform_settings registry
      try {
        const { data: settingRow } = await defaultClient
          .from('platform_settings')
          .select('value')
          .eq('key', 'problem_applications_registry')
          .maybeSingle();

        if (settingRow?.value && Array.isArray(settingRow.value)) {
          allApps = settingRow.value;
        }
      } catch (err) {
        console.warn('Could not read problem_applications_registry:', err);
      }

      // 2. Fetch from DB table if it exists
      try {
        let query = defaultClient.from('problem_applications').select(`
          *,
          applicant:profiles!problem_applications_applicant_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course,
            skills
          )
        `);

        if (problemId) query = query.eq('problem_statement_id', problemId);
        if (applicantId) query = query.eq('applicant_id', applicantId);

        const { data: dbData } = await query;
        if (dbData && dbData.length > 0) {
          const existingIds = new Set(allApps.map((a) => a.id));
          for (const item of dbData) {
            if (!existingIds.has(item.id)) {
              allApps.push(item);
            }
          }
        }
      } catch {}
    }

    // Filter by requested parameters
    let filtered = allApps;

    if (problemId) {
      filtered = filtered.filter(
        (a) => (a.problem_statement_id || '').toLowerCase() === problemId.toLowerCase()
      );
    }

    if (authorId) {
      filtered = filtered.filter(
        (a) => (a.author_id || '').toLowerCase() === authorId.toLowerCase()
      );
    }

    if (applicantId) {
      filtered = filtered.filter(
        (a) => (a.applicant_id || '').toLowerCase() === applicantId.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      applications: filtered,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to retrieve applications.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const client = token
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        })
      : defaultClient;

    const body = await request.json();
    const { application_id, status } = body;

    if (!application_id || !status) {
      return NextResponse.json(
        { error: 'Application ID and target status are required.' },
        { status: 400 }
      );
    }

    if (!['Accepted', 'Rejected', 'Withdrawn', 'Pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid application status.' }, { status: 400 });
    }

    let currentApps: any[] = [];
    try {
      const { data: settingRow } = await defaultClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'problem_applications_registry')
        .maybeSingle();

      if (settingRow?.value && Array.isArray(settingRow.value)) {
        currentApps = settingRow.value;
      }
    } catch {}

    let matchedApp: any = null;
    const updatedApps = currentApps.map((a) => {
      if (a.id === application_id) {
        matchedApp = { ...a, status, updated_at: new Date().toISOString() };
        return matchedApp;
      }
      return a;
    });

    if (matchedApp) {
      await defaultClient.from('platform_settings').upsert({
        key: 'problem_applications_registry',
        value: updatedApps,
        updated_at: new Date().toISOString(),
        updated_by: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
      });
    }

    // Try updating DB table if exists
    try {
      await client
        .from('problem_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', application_id);
    } catch {}

    // Send in-app notification to the student applicant if Accepted or Rejected
    if (matchedApp && (status === 'Accepted' || status === 'Rejected')) {
      try {
        await defaultClient.from('notifications').insert({
          recipient_id: matchedApp.applicant_id,
          sender_id: matchedApp.author_id,
          type: 'application_reviewed',
          title: `Application ${status}`,
          message: `Your application on challenge "${matchedApp.problem_title || 'Faculty Problem'}" was ${status.toLowerCase()} by the faculty author.`,
          link: `/problems/${matchedApp.problem_statement_id}`,
        });
      } catch (notifErr) {
        console.warn('Notice sending review notification:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application marked as ${status}.`,
      application: matchedApp || { id: application_id, status },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update application.' },
      { status: 500 }
    );
  }
}
