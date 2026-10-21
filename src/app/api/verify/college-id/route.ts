import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { StudentIdVerification, StudentIdVerificationStats } from '@/types/verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getTelegramConfig(): Promise<{ botToken: string; chatId: string; configured: boolean }> {
  try {
    const icpcTg = await getMasterControlSubkey<{ botToken?: string; chatId?: string }>('icpc_telegram_config', {});
    if (icpcTg?.botToken && icpcTg?.chatId) {
      return { botToken: icpcTg.botToken.trim(), chatId: icpcTg.chatId.trim(), configured: true };
    }
    const watchdog = await getMasterControlSubkey<{ telegramBotToken?: string; telegramChatId?: string }>('security_watchdog_v1', {});
    if (watchdog?.telegramBotToken && watchdog?.telegramChatId) {
      return { botToken: watchdog.telegramBotToken.trim(), chatId: watchdog.telegramChatId.trim(), configured: true };
    }
  } catch (err) {
    console.warn('Error reading telegram config:', err);
  }
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const envChat = process.env.TELEGRAM_CHAT_ID?.trim() || '';
  return {
    botToken: envToken,
    chatId: envChat,
    configured: Boolean(envToken && envChat),
  };
}

async function sendTelegramVerificationAlert(verification: StudentIdVerification) {
  try {
    const tg = await getTelegramConfig();
    if (!tg.configured) return;

    const time = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
    const text = 
`🎓 *NEW STUDENT COLLEGE ID VERIFICATION*

👤 *Student:* ${verification.displayName || verification.username}
🏫 *College:* ${verification.collegeName}
🔢 *Roll / Student ID:* \`${verification.studentRollNumber}\`
📧 *Email:* ${verification.email || 'N/A'}
🕒 *Submitted:* ${time} IST

👉 *Review & Approve in Admin Control Center:*
https://linkora-link.online/control-center-7x9?tab=users`;

    await fetch(`https://api.telegram.org/bot${tg.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tg.chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.warn('Failed to send telegram verification alert:', err);
  }
}

// ── GET: Read current user's request OR all requests for Admin Queue ──
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let authUser: any = null;
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      authUser = data?.user;
    }

    const { searchParams } = new URL(request.url);
    const isAdminView = searchParams.get('admin') === 'true';

    const allRequests = await getMasterControlSubkey<StudentIdVerification[]>('student_id_verifications', []);

    // If Admin requested full queue
    if (isAdminView) {
      // Check admin privileges
      const isOwner = authUser && authUser.email?.toLowerCase() === 'goyalmayank142@gmail.com';
      const role = authUser?.user_metadata?.role || authUser?.app_metadata?.role;
      const hasAdminRole = role === 'admin' || role === 'moderator' || isOwner;

      // Calculate stats
      const stats: StudentIdVerificationStats = {
        total: allRequests.length,
        pending: allRequests.filter((r) => r.status === 'pending').length,
        approved: allRequests.filter((r) => r.status === 'approved').length,
        rejected: allRequests.filter((r) => r.status === 'rejected').length,
      };

      // Sort: Pending first, then newest
      const sorted = [...allRequests].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      return NextResponse.json({
        success: true,
        requests: sorted,
        stats,
        isAdmin: hasAdminRole,
      });
    }

    // Regular Student: Return their personal verification request status
    if (!authUser) {
      return NextResponse.json({ success: true, myRequest: null, isVerified: false });
    }

    const myRequest = allRequests.find((r) => r.userId === authUser.id) || null;

    // Also check profiles table for college name
    let profileCollege: string | null = null;
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('college')
        .eq('user_id', authUser.id)
        .maybeSingle();
      profileCollege = profile?.college || null;
    } catch (e) {}

    const isVerified = myRequest?.status === 'approved';

    return NextResponse.json({
      success: true,
      myRequest,
      isVerified,
      verifiedCollege: isVerified ? (myRequest?.collegeName || profileCollege) : null,
    });
  } catch (err: any) {
    console.warn('Error reading college verification status:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── POST: Student Submits College ID Card for Verification ──
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required to submit ID verification.' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const authUser = authData?.user;

    if (authError || !authUser) {
      return NextResponse.json({ success: false, error: 'Invalid or expired authentication session.' }, { status: 401 });
    }

    const body = await request.json();
    const { collegeName, studentRollNumber, idCardImage } = body;

    const cleanCollege = (collegeName || '').trim();
    const cleanRoll = (studentRollNumber || '').trim();
    const cleanImage = (idCardImage || '').trim();

    if (!cleanCollege) {
      return NextResponse.json({ success: false, error: 'Please enter your official College or University name.' }, { status: 400 });
    }

    if (!cleanRoll) {
      return NextResponse.json({ success: false, error: 'Please provide your Student Roll Number or University ID code.' }, { status: 400 });
    }

    if (!cleanImage || (!cleanImage.startsWith('data:image/') && !cleanImage.startsWith('http'))) {
      return NextResponse.json({ success: false, error: 'Please upload a clear photograph of your physical or digital College ID Card.' }, { status: 400 });
    }

    // Fetch user profile for username & display name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('user_id', authUser.id)
      .maybeSingle();

    const username = profile?.username || authUser.email?.split('@')[0] || 'student';
    const displayName = profile?.display_name || username;

    const currentRequests = await getMasterControlSubkey<StudentIdVerification[]>('student_id_verifications', []);

    // Create or update request for this user
    const existingIndex = currentRequests.findIndex((r) => r.userId === authUser.id);

    const newRequest: StudentIdVerification = {
      id: existingIndex >= 0 ? currentRequests[existingIndex].id : `sid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: authUser.id,
      username,
      displayName,
      email: authUser.email || '',
      collegeName: cleanCollege,
      studentRollNumber: cleanRoll,
      idCardImage: cleanImage,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    let updatedList: StudentIdVerification[];
    if (existingIndex >= 0) {
      updatedList = [...currentRequests];
      updatedList[existingIndex] = newRequest;
    } else {
      updatedList = [newRequest, ...currentRequests];
    }

    await updateMasterControlSubkey('student_id_verifications', updatedList);

    // Send instant Telegram ping to Admin
    sendTelegramVerificationAlert(newRequest).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Student ID card submitted successfully! Our administrative team will review your credentials within 24 hours.',
      request: newRequest,
    });
  } catch (err: any) {
    console.warn('Failed to submit student ID verification:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error submitting ID verification.' }, { status: 500 });
  }
}

// ── PATCH: Admin 1-Click Approve or Reject ──
export async function PATCH(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    let adminEmail = 'faculty-admin@linkora.in';
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      if (data?.user?.email) {
        adminEmail = data.user.email;
      }
    }

    const body = await request.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ success: false, error: 'requestId and action ("approve" | "reject") are required.' }, { status: 400 });
    }

    const currentRequests = await getMasterControlSubkey<StudentIdVerification[]>('student_id_verifications', []);
    const targetIndex = currentRequests.findIndex((r) => r.id === requestId);

    if (targetIndex < 0) {
      return NextResponse.json({ success: false, error: 'Verification request not found.' }, { status: 404 });
    }

    const target = { ...currentRequests[targetIndex] };
    const now = new Date().toISOString();

    if (action === 'approve') {
      target.status = 'approved';
      target.reviewedAt = now;
      target.reviewedBy = adminEmail;
      target.rejectionReason = undefined;

      // 1. Update profiles table in Supabase
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            college: target.collegeName,
            updated_at: now,
          })
          .eq('user_id', target.userId);
      } catch (e) {
        console.warn('Could not update profile college column:', e);
      }

      // 2. Add to universal verified registry (so all badges reflect immediately)
      try {
        const { data: pData } = await supabaseAdmin
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkedin_college_verifications')
          .maybeSingle();

        const currentRegistry: any[] = Array.isArray(pData?.value) ? pData.value : [];
        const cleanList = currentRegistry.filter((item: any) => item.userId !== target.userId && item.username !== target.username);
        const newRecord = {
          userId: target.userId,
          username: target.username,
          college: target.collegeName,
          verifiedAt: now,
          method: 'student_id_card',
        };

        await supabaseAdmin.from('platform_settings').upsert({
          key: 'linkedin_college_verifications',
          value: [newRecord, ...cleanList],
          description: 'Universal registry of verified college credentials.',
          updated_at: now,
        });
      } catch (e) {
        console.warn('Could not update universal verified registry:', e);
      }
    } else if (action === 'reject') {
      target.status = 'rejected';
      target.reviewedAt = now;
      target.reviewedBy = adminEmail;
      target.rejectionReason = (rejectionReason || '').trim() || 'College ID card was unreadable or details did not match.';

      // 1. Update profiles table to refresh timestamp
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            updated_at: now,
          })
          .eq('user_id', target.userId);
      } catch (e) {}

      // 2. Remove from universal verified registry
      try {
        const { data: pData } = await supabaseAdmin
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkedin_college_verifications')
          .maybeSingle();

        const currentRegistry: any[] = Array.isArray(pData?.value) ? pData.value : [];
        const cleanList = currentRegistry.filter((item: any) => item.userId !== target.userId && item.username !== target.username);

        await supabaseAdmin.from('platform_settings').upsert({
          key: 'linkedin_college_verifications',
          value: cleanList,
          description: 'Universal registry of verified college credentials.',
          updated_at: now,
        });
      } catch (e) {
        console.warn('Could not update universal verified registry:', e);
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    const updatedList = [...currentRequests];
    updatedList[targetIndex] = target;
    await updateMasterControlSubkey('student_id_verifications', updatedList);

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? `Verification approved for ${target.displayName}!` : `Verification rejected for ${target.displayName}.`,
      request: target,
    });
  } catch (err: any) {
    console.warn('Failed to moderate college verification:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error processing verification moderation.' }, { status: 500 });
  }
}
