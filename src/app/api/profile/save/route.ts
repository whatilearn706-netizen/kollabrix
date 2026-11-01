import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Upsert directly using the service role key to safely bypass client RLS restrictions
    let { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    // Schema resilience: if custom columns are not yet in the DB schema, strip them and retry
    if (
      error &&
      (error.message.includes('column') ||
        error.message.includes('schema cache') ||
        error.code === '42703' ||
        error.code === 'PGRST204')
    ) {
      const safePayload = { ...payload };
      delete safePayload.linkedin_url;
      delete safePayload.verification_doc_type;
      delete safePayload.college_verified;

      const retryRes = await supabaseAdmin
        .from('profiles')
        .upsert(safePayload, { onConflict: 'user_id' })
        .select()
        .single();

      error = retryRes.error;
      data = retryRes.data;
    }

    if (error) {
      console.error('Server profile save error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Profile save exception:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save profile' }, { status: 500 });
  }
}
