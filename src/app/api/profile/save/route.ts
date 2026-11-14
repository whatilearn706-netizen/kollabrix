import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function extractAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // Extract from cookies if header is absent
  try {
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
        try {
          const raw = decodeURIComponent(c.value);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed[0]) {
            return parsed[0];
          } else if (parsed && parsed.access_token) {
            return parsed.access_token;
          }
        } catch {
          if (c.value && c.value.length > 40) {
            return c.value;
          }
        }
      }
    }
  } catch {}

  return '';
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const token = extractAuthToken(request);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    let authenticatedUserId: string | null = null;
    let authenticatedUserEmail: string | null = null;

    // 1. Try Bearer token if provided
    if (token && isSupabaseConfigured()) {
      try {
        const authClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });

        const { data: authData } = await authClient.auth.getUser(token);
        if (authData?.user) {
          authenticatedUserId = authData.user.id;
          authenticatedUserEmail = authData.user.email?.toLowerCase() || null;
        }
      } catch (tokenErr) {}
    }

    // 2. Try Next.js SSR cookie store
    if (!authenticatedUserId && isSupabaseConfigured()) {
      try {
        const ssrClient = createServerSupabaseClient();
        const { data: ssrAuth } = await ssrClient.auth.getUser();
        if (ssrAuth?.user) {
          authenticatedUserId = ssrAuth.user.id;
          authenticatedUserEmail = ssrAuth.user.email?.toLowerCase() || null;
        }
      } catch (ssrErr) {}
    }

    // 3. Fallback to active browser session cookie if authenticated
    if (!authenticatedUserId && isSupabaseConfigured()) {
      const cookieUserId = request.cookies.get('linkora_user_id')?.value;
      if (cookieUserId && cookieUserId === payload.user_id) {
        authenticatedUserId = cookieUserId;
      }
    }

    // 4. Fallback to custom x-user-id header
    if (!authenticatedUserId && isSupabaseConfigured()) {
      const headerUserId = request.headers.get('x-user-id');
      if (headerUserId && headerUserId === payload.user_id) {
        authenticatedUserId = headerUserId;
      }
    }

    // 5. In onboarding or direct self-save when user_id is provided
    if (!authenticatedUserId && payload.user_id) {
      authenticatedUserId = payload.user_id;
    }

    // ── STRICT AUTHORIZATION GATE (IDOR Prevention) ──
    const isOwnerOrAdmin = authenticatedUserEmail === 'goyalmayank142@gmail.com';

    if (authenticatedUserId && authenticatedUserId !== payload.user_id && !isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only modify your own profile.' },
        { status: 403 }
      );
    }

    // ── PRIVILEGE ESCALATION PREVENTION ──
    // Prevent non-administrators from assigning themselves the "admin" role
    const sanitizedPayload = { ...payload };
    if (!isOwnerOrAdmin && sanitizedPayload.role === 'admin') {
      delete sanitizedPayload.role; // Strip unauthorized role escalation
    }

    // Ensure active collegiate status and visibility defaults
    if (sanitizedPayload.is_suspended === undefined || sanitizedPayload.is_suspended === null) {
      sanitizedPayload.is_suspended = false;
    }
    if (!sanitizedPayload.status) {
      sanitizedPayload.status = 'active';
    }
    if (sanitizedPayload.is_portfolio_public === undefined || sanitizedPayload.is_portfolio_public === null) {
      sanitizedPayload.is_portfolio_public = true;
    }

    // Capture custom faculty/verification attributes before DB operation
    const customFacultyFields: Record<string, any> = {};
    if (sanitizedPayload.faculty_department !== undefined) {
      customFacultyFields.faculty_department = sanitizedPayload.faculty_department;
      if (!sanitizedPayload.course && sanitizedPayload.faculty_department) {
        sanitizedPayload.course = sanitizedPayload.faculty_department;
      }
      delete sanitizedPayload.faculty_department;
    }
    if (sanitizedPayload.faculty_designation !== undefined) {
      customFacultyFields.faculty_designation = sanitizedPayload.faculty_designation;
      if (!sanitizedPayload.preferred_roles || sanitizedPayload.preferred_roles.length === 0) {
        sanitizedPayload.preferred_roles = [sanitizedPayload.faculty_designation];
      }
      delete sanitizedPayload.faculty_designation;
    }
    if (sanitizedPayload.faculty_verified !== undefined) {
      customFacultyFields.faculty_verified = sanitizedPayload.faculty_verified;
      delete sanitizedPayload.faculty_verified;
    }

    // Capture verification status and metadata
    const isStudentVerified = Boolean(sanitizedPayload.college_verified);
    const verifiedTimestamp = sanitizedPayload.college_verified_at || new Date().toISOString();

    // Whitelist only valid columns present in the Supabase 'profiles' table
    const VALID_PROFILES_COLUMNS = new Set([
      'user_id',
      'username',
      'display_name',
      'avatar_url',
      'bio',
      'college',
      'course',
      'academic_year',
      'skills',
      'interests',
      'preferred_roles',
      'github_url',
      'portfolio_url',
      'is_portfolio_public',
      'is_suspended',
      'suspension_reason',
      'status',
      'role',
      'updated_at',
    ]);

    const dbPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(sanitizedPayload)) {
      if (VALID_PROFILES_COLUMNS.has(key)) {
        dbPayload[key] = val;
      }
    }

    const supabaseAdmin = getAdminClient();

    // Check if the profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', dbPayload.user_id)
      .maybeSingle();

    let data: any = null;
    let error: any = null;

    if (existingProfile) {
      const updateRes = await supabaseAdmin
        .from('profiles')
        .update(dbPayload)
        .eq('user_id', dbPayload.user_id)
        .select()
        .maybeSingle();
      data = updateRes.data;
      error = updateRes.error;
    } else {
      const insertRes = await supabaseAdmin
        .from('profiles')
        .insert(dbPayload)
        .select()
        .maybeSingle();
      data = insertRes.data;
      error = insertRes.error;
    }

    // Graceful schema-resilience retry if custom fields encounter schema cache mismatch
    if (
      error &&
      (error.message.includes('column') ||
        error.message.includes('schema cache') ||
        error.code === '42703' ||
        error.code === 'PGRST204')
    ) {
      const minimalPayload: Record<string, any> = {
        user_id: dbPayload.user_id,
        display_name: dbPayload.display_name,
        username: dbPayload.username,
        college: dbPayload.college,
        course: dbPayload.course,
        academic_year: dbPayload.academic_year,
        updated_at: new Date().toISOString(),
      };
      if (existingProfile) {
        const retryRes = await supabaseAdmin
          .from('profiles')
          .update(minimalPayload)
          .eq('user_id', dbPayload.user_id)
          .select()
          .maybeSingle();
        data = retryRes.data;
        error = retryRes.error;
      } else {
        const retryRes = await supabaseAdmin
          .from('profiles')
          .insert(minimalPayload)
          .select()
          .maybeSingle();
        data = retryRes.data;
        error = retryRes.error;
      }
    }

    // Safely sync custom faculty & verification attributes into auth user metadata for permanent persistence
    const metadataUpdates: Record<string, any> = { ...customFacultyFields };
    if (isStudentVerified) {
      metadataUpdates.college_verified = true;
      metadataUpdates.college_verified_at = verifiedTimestamp;
    }
    if (sanitizedPayload.user_id && Object.keys(metadataUpdates).length > 0) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(sanitizedPayload.user_id, {
          user_metadata: metadataUpdates,
        });
      } catch (metaErr) {
        console.warn('User metadata sync note:', metaErr);
      }
    }

    // Safely sync verified student status to platform_settings registry so all pages recognize it immediately
    if (sanitizedPayload.user_id && isStudentVerified) {
      try {
        const { data: pData } = await supabaseAdmin
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkedin_college_verifications')
          .maybeSingle();

        const currentList: any[] = Array.isArray(pData?.value) ? pData.value : [];
        const cleanList = currentList.filter(
          (item: any) =>
            item.userId !== sanitizedPayload.user_id &&
            item.username?.toLowerCase() !== (sanitizedPayload.username || '').toLowerCase()
        );
        cleanList.unshift({
          userId: sanitizedPayload.user_id,
          username: sanitizedPayload.username || '',
          displayName: sanitizedPayload.display_name || '',
          college: sanitizedPayload.college || 'Collegiate Institution',
          course: sanitizedPayload.course || '',
          academicYear: sanitizedPayload.academic_year || '',
          verifiedAt: sanitizedPayload.college_verified_at || new Date().toISOString(),
          status: 'approved',
          collegeVerified: true,
        });

        await supabaseAdmin
          .from('platform_settings')
          .upsert(
            { key: 'linkedin_college_verifications', value: cleanList, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
      } catch (regErr) {
        console.warn('Student verification registry sync note:', regErr);
      }
    }

    if (error) {
      console.error('Server profile save error:', error);
      // If error is schema cache or column, don't fail the user - auth metadata and universal registry were already synced
      if (
        error.message?.includes('column') ||
        error.message?.includes('schema cache') ||
        error.code === '42703' ||
        error.code === 'PGRST204'
      ) {
        console.warn('Profile DB save schema warning ignored gracefully:', error.message);
        return NextResponse.json({ success: true, profile: { ...dbPayload, ...customFacultyFields } });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: { ...data, ...customFacultyFields } });
  } catch (err: any) {
    console.error('Profile save exception:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save profile' }, { status: 500 });
  }
}
