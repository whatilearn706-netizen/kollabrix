import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { FacultyPasscode, parseFacultySettings } from '@/lib/admin/facultyPasscodes';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'faculty_access_passcodes';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let passcodes: FacultyPasscode[] = [];
  let facultyUsers: any[] = [];
  let revokedUsers: any[] = [];

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch faculty settings from platform_settings
      const { data: settingData } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      const parsed = parseFacultySettings(settingData?.value);
      passcodes = parsed.passcodes;
      const revokedIds = parsed.revokedUserIds || [];

      // 2. Fetch all profiles with role = 'teacher'
      const { data: teachersData } = await client
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, college, course, role, created_at, updated_at')
        .eq('role', 'teacher')
        .order('updated_at', { ascending: false });

      if (teachersData) {
        // Active faculty: role is teacher AND user_id is NOT in revoked list
        facultyUsers = teachersData.filter((u: any) => !revokedIds.includes(u.user_id));
      }

      // 3. Fetch details of revoked faculty members
      if (revokedIds.length > 0) {
        const { data: revokedProfiles } = await client
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, college, course, role, created_at, updated_at')
          .in('user_id', revokedIds);

        if (revokedProfiles) {
          revokedUsers = revokedProfiles;
        } else {
          revokedUsers = revokedIds.map((id) => ({
            user_id: id,
            username: 'revoked_user',
            display_name: 'Revoked Faculty',
            role: 'student',
          }));
        }
      }
    } catch (err) {
      console.warn('Error fetching faculty passcodes or users:', err);
    }
  }

  return NextResponse.json({
    success: true,
    passcodes,
    facultyUsers,
    revokedUsers,
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, passcodeData, passcodeId, targetUserId } = body;
    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Action simulated successfully (Demo Mode).',
      });
    }

    // 1. Load current faculty settings
    const { data: settingData } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    const parsed = parseFacultySettings(settingData?.value);
    let currentPasscodes = parsed.passcodes;
    let revokedUserIds = parsed.revokedUserIds;

    const safeUpdatedBy =
      (auth.user?.id && auth.user.id !== '9343b52f-f7e8-4ed8-a8a1-476829811b53')
        ? auth.user.id
        : 'c86ce05f-24de-4a1a-a45f-944d4180b508';

    // ACTION A: CREATE NEW PASSCODE
    if (action === 'create') {
      const code = (passcodeData?.code || '').trim().toUpperCase();
      if (!code || code.length < 4) {
        return NextResponse.json({ error: 'Valid passcode is required (min 4 characters).' }, { status: 400 });
      }

      // Check for duplicates
      if (currentPasscodes.some((p) => p.code.toUpperCase() === code)) {
        return NextResponse.json({ error: `Passcode "${code}" already exists.` }, { status: 400 });
      }

      const newPasscode: FacultyPasscode = {
        id: crypto.randomUUID(),
        code,
        department: passcodeData.department?.trim() || 'General Academic Department',
        notes: passcodeData.notes?.trim() || '',
        created_at: new Date().toISOString(),
        created_by: auth.user?.email || auth.user?.id || 'admin',
        is_active: true,
        max_uses: passcodeData.max_uses ? Number(passcodeData.max_uses) : null,
        used_count: 0,
      };

      currentPasscodes = [newPasscode, ...currentPasscodes];

      const { error: saveErr } = await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: { passcodes: currentPasscodes, revokedUserIds },
          description: 'Registry of active institutional faculty access passcodes and revoked access list.',
          updated_at: new Date().toISOString(),
          updated_by: safeUpdatedBy,
        });

      if (saveErr) throw new Error(saveErr.message);

      try {
        await recordAdminAuditLog({
          actorId: safeUpdatedBy,
          actorEmail: auth.user?.email,
          action: 'GENERATE_FACULTY_PASSCODE',
          targetType: 'platform_settings',
          targetId: newPasscode.id,
          details: {
            code: newPasscode.code,
            department: newPasscode.department,
            notes: newPasscode.notes,
          },
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr);
      }

      return NextResponse.json({
        success: true,
        message: `Passcode ${newPasscode.code} generated successfully.`,
        passcode: newPasscode,
        passcodes: currentPasscodes,
      });
    }

    // ACTION B: TOGGLE ACTIVE / INACTIVE
    if (action === 'toggle') {
      if (!passcodeId) {
        return NextResponse.json({ error: 'Passcode ID is required.' }, { status: 400 });
      }

      let toggledCode = '';
      currentPasscodes = currentPasscodes.map((p) => {
        if (p.id === passcodeId) {
          toggledCode = p.code;
          return { ...p, is_active: !p.is_active };
        }
        return p;
      });

      const { error: saveErr } = await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: { passcodes: currentPasscodes, revokedUserIds },
          updated_at: new Date().toISOString(),
          updated_by: safeUpdatedBy,
        });

      if (saveErr) throw new Error(saveErr.message);

      try {
        await recordAdminAuditLog({
          actorId: safeUpdatedBy,
          actorEmail: auth.user?.email,
          action: 'TOGGLE_FACULTY_PASSCODE',
          targetType: 'platform_settings',
          targetId: passcodeId,
          details: { code: toggledCode },
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr);
      }

      return NextResponse.json({
        success: true,
        message: `Passcode status updated.`,
        passcodes: currentPasscodes,
      });
    }

    // ACTION C: DELETE PASSCODE
    if (action === 'delete') {
      if (!passcodeId) {
        return NextResponse.json({ error: 'Passcode ID is required.' }, { status: 400 });
      }

      const deletedItem = currentPasscodes.find((p) => p.id === passcodeId);
      currentPasscodes = currentPasscodes.filter((p) => p.id !== passcodeId);

      const { error: saveErr } = await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: { passcodes: currentPasscodes, revokedUserIds },
          updated_at: new Date().toISOString(),
          updated_by: safeUpdatedBy,
        });

      if (saveErr) throw new Error(saveErr.message);

      try {
        await recordAdminAuditLog({
          actorId: safeUpdatedBy,
          actorEmail: auth.user?.email,
          action: 'DELETE_FACULTY_PASSCODE',
          targetType: 'platform_settings',
          targetId: passcodeId,
          details: { code: deletedItem?.code },
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr);
      }

      return NextResponse.json({
        success: true,
        message: `Passcode ${deletedItem?.code || ''} removed.`,
        passcodes: currentPasscodes,
      });
    }

    // ACTION D: REVOKE FACULTY ROLE (PERMANENTLY REMOVE FACULTY ACCESS)
    if (action === 'revoke') {
      if (!targetUserId) {
        return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
      }

      // 1. Add user ID to revoked list in platform_settings (immutable & authoritative)
      if (!revokedUserIds.includes(targetUserId)) {
        revokedUserIds = [...revokedUserIds, targetUserId];
      }

      const { error: saveErr } = await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: { passcodes: currentPasscodes, revokedUserIds },
          description: 'Registry of active institutional faculty access passcodes and revoked access list.',
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (saveErr) {
        console.warn('Could not save revokedUserIds to platform_settings:', saveErr);
      }

      // 2. Demote role to 'student' in public.profiles
      try {
        await client
          .from('profiles')
          .update({
            role: 'student',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', targetUserId);
      } catch (err) {
        console.warn('Direct profile role update warning:', err);
      }

      // 3. Try atomic RPC if installed
      try {
        await client.rpc('admin_revoke_faculty_access', {
          p_target_user_id: targetUserId,
        });
      } catch {
        // RPC might not exist yet; platform_settings revocation enforces the lock
      }

      try {
        await recordAdminAuditLog({
          actorId: safeUpdatedBy,
          actorEmail: auth.user?.email,
          action: 'REVOKE_FACULTY_ACCESS',
          targetType: 'user',
          targetId: targetUserId,
          details: { newRole: 'student' },
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Faculty access revoked. User has been removed from faculty registry and locked out of the Faculty Portal.',
      });
    }

    // ACTION E: RESTORE FACULTY ACCESS
    if (action === 'restore') {
      if (!targetUserId) {
        return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
      }

      // Remove from revokedUserIds
      revokedUserIds = revokedUserIds.filter((id) => id !== targetUserId);

      await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: { passcodes: currentPasscodes, revokedUserIds },
          updated_at: new Date().toISOString(),
          updated_by: safeUpdatedBy,
        });

      // Restore role in profiles
      try {
        await client
          .from('profiles')
          .update({
            role: 'teacher',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', targetUserId);
      } catch {}

      try {
        await client.rpc('admin_restore_faculty_access', {
          p_target_user_id: targetUserId,
        });
      } catch {}

      try {
        await recordAdminAuditLog({
          actorId: safeUpdatedBy,
          actorEmail: auth.user?.email,
          action: 'RESTORE_FACULTY_ACCESS',
          targetType: 'user',
          targetId: targetUserId,
          details: { restoredRole: 'teacher' },
        });
      } catch (auditErr) {
        console.warn('Audit log notice:', auditErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Faculty access restored successfully.',
      });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error executing faculty action.' },
      { status: 500 }
    );
  }
}
