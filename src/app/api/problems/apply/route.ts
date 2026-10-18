import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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
    const {
      problem_statement_id,
      proposed_role = 'Contributor',
      message,
      applicant_id,
      team_size,
      team_status,
    } = body;

    if (!problem_statement_id) {
      return NextResponse.json({ error: 'Problem statement ID is required.' }, { status: 400 });
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide at least 10 characters explaining your interest and qualifications.' },
        { status: 400 }
      );
    }

    let resolvedApplicantId = applicant_id;
    if (token) {
      const { data: authUser } = await client.auth.getUser(token);
      if (authUser?.user?.id) {
        resolvedApplicantId = authUser.user.id;
      }
    }

    if (!resolvedApplicantId) {
      return NextResponse.json(
        { error: 'You must be signed in to apply to this problem statement.' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      const mockApp = {
        id: `app-mock-${Date.now()}`,
        problem_statement_id,
        applicant_id: resolvedApplicantId,
        proposed_role,
        message: message.trim(),
        status: 'Pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, application: mockApp });
    }

    // 1. Fetch applicant profile
    let applicantProfile: any = null;
    try {
      const { data: prof } = await client
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, college, course, skills')
        .eq('user_id', resolvedApplicantId)
        .maybeSingle();
      applicantProfile = prof;
    } catch (e) {
      console.warn('Could not fetch applicant profile:', e);
    }

    // 2. Resolve problem details and author ID
    let problemTitle = 'Academic Problem Challenge';
    let authorId: string | null = null;

    try {
      const { data: dbProb } = await client
        .from('problem_statements')
        .select('id, title, author_id')
        .eq('id', problem_statement_id)
        .maybeSingle();

      if (dbProb) {
        problemTitle = dbProb.title || problemTitle;
        authorId = dbProb.author_id;
      } else {
        // Check community problem statements registry
        const { data: commRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'community_problem_statements')
          .maybeSingle();

        if (commRow?.value && Array.isArray(commRow.value)) {
          const match = commRow.value.find((p: any) => p.id === problem_statement_id);
          if (match) {
            problemTitle = match.title || problemTitle;
            authorId = match.author_id;
          }
        }
      }
    } catch (e) {
      console.warn('Could not lookup problem author:', e);
    }

    if (authorId && authorId === resolvedApplicantId) {
      return NextResponse.json(
        { error: 'You are the faculty author of this problem statement and cannot apply to your own challenge.' },
        { status: 400 }
      );
    }

    // 3. Load applications registry from platform_settings
    let currentApps: any[] = [];
    try {
      const { data: appsRow } = await defaultClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'problem_applications_registry')
        .maybeSingle();

      if (appsRow?.value && Array.isArray(appsRow.value)) {
        currentApps = appsRow.value;
      }
    } catch (e) {
      console.warn('Notice loading problem applications registry:', e);
    }

    // Check for existing pending application
    const existing = currentApps.find(
      (a) =>
        a.problem_statement_id === problem_statement_id &&
        a.applicant_id === resolvedApplicantId &&
        a.status === 'Pending'
    );

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active pending application for this problem statement.' },
        { status: 400 }
      );
    }

    const newApp = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      problem_statement_id,
      problem_title: problemTitle,
      author_id: authorId,
      applicant_id: resolvedApplicantId,
      proposed_role,
      team_size: team_size || 'Solo Applicant',
      team_status: team_status || 'solo',
      message: message.trim(),
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      applicant: {
        user_id: resolvedApplicantId,
        display_name: applicantProfile?.display_name || applicantProfile?.username || 'Student Applicant',
        username: applicantProfile?.username || 'student',
        avatar_url: applicantProfile?.avatar_url || null,
        college: applicantProfile?.college || 'College of Engineering',
        course: applicantProfile?.course || 'Computer Science',
        skills: Array.isArray(applicantProfile?.skills) ? applicantProfile.skills : [],
      },
    };

    const updatedApps = [newApp, ...currentApps];

    try {
      await defaultClient.from('platform_settings').upsert({
        key: 'problem_applications_registry',
        value: updatedApps,
        description: 'Registry of student applications to faculty problem statements',
        updated_at: new Date().toISOString(),
        updated_by: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
      });
    } catch (saveErr) {
      console.warn('Could not save to problem_applications_registry in platform_settings:', saveErr);
    }

    // 4. Send In-App Notification to Problem Faculty Author
    if (authorId && authorId !== resolvedApplicantId) {
      try {
        await defaultClient.from('notifications').insert({
          recipient_id: authorId,
          sender_id: resolvedApplicantId,
          type: 'application_received',
          title: 'New Student Application',
          message: `${newApp.applicant.display_name} applied for role "${proposed_role}" on your problem challenge "${problemTitle}".`,
          link: `/problems/${problem_statement_id}`,
        });
      } catch (notifErr) {
        console.warn('Notification send notice:', notifErr);
      }
    }

    // 5. Try inserting into DB table problem_applications if exists
    try {
      await client.from('problem_applications').insert({
        problem_statement_id,
        applicant_id: resolvedApplicantId,
        proposed_role,
        message: message.trim(),
        status: 'Pending',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted to the faculty author successfully!',
      application: newApp,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to submit problem application.' },
      { status: 500 }
    );
  }
}
