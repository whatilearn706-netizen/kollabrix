import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, targetUserId, reason = '', projectId, teamId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Moderation action is required.' }, { status: 400 });
    }

    // 1. Critical Self-Lockout Protection
    if (targetUserId === auth.user?.id) {
      return NextResponse.json(
        { error: 'Action denied: Administrators cannot suspend, demote, or moderate their own account.' },
        { status: 400 }
      );
    }

    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: `Action "${action}" successfully executed (Demo Mode).`,
        targetUserId,
      });
    }

    // Fetch target user profile for audit details
    const { data: targetProfile } = await client
      .from('profiles')
      .select('username, display_name, role, is_suspended')
      .eq('user_id', targetUserId)
      .maybeSingle();

    // -------------------------------------------------------------
    // ACTION: SUSPEND USER
    // -------------------------------------------------------------
    if (action === 'suspend') {
      const trimmedReason = reason.trim() || 'Violating collegiate collaboration guidelines.';

      // 1. Try atomic PostgreSQL RPC first
      let rpcHandled = false;
      try {
        const { data: rpcData, error: rpcErr } = await client.rpc('admin_moderate_user', {
          p_action: 'suspend',
          p_target_user_id: targetUserId,
          p_reason: trimmedReason,
        });
        if (!rpcErr && rpcData?.success) {
          rpcHandled = true;
        }
      } catch {
        // Fallback to direct mutations
      }

      // 2. Direct database updates fallback
      if (!rpcHandled) {
        // Update profile
        try {
          await client
            .from('profiles')
            .update({
              is_suspended: true,
              status: 'suspended',
              suspension_reason: trimmedReason,
              is_portfolio_public: false,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', targetUserId);
        } catch {}

        // Remove from all active project teams
        try {
          const { data: mems } = await client
            .from('project_members')
            .select('project_id')
            .eq('user_id', targetUserId);

          await client.from('project_members').delete().eq('user_id', targetUserId);
          await client.from('hackathon_team_members').delete().eq('user_id', targetUserId);

          if (mems && mems.length > 0) {
            for (const m of mems) {
              const { count } = await client
                .from('project_members')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', m.project_id);
              await client
                .from('projects')
                .update({ current_team_size: Math.max(1, (count || 0) + 1) })
                .eq('id', m.project_id);
            }
          }

          // Cancel pending applications & invitations
          await client
            .from('project_applications')
            .update({ status: 'Rejected' })
            .eq('applicant_id', targetUserId)
            .eq('status', 'Pending');
          await client
            .from('project_invitations')
            .delete()
            .eq('invitee_id', targetUserId);
        } catch {}
      }

      // 3. Persist suspended user ID to platform_settings so all teammate views exclude them instantly
      try {
        const { data: existingSetting } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();

        const currentVal = existingSetting?.value || {};
        const existingSuspendedIds: string[] = Array.isArray(currentVal.suspended_user_ids)
          ? currentVal.suspended_user_ids
          : [];
        const updatedSuspendedIds = Array.from(new Set([...existingSuspendedIds, targetUserId]));

        const currentSuspendedMap = currentVal.suspended_users || {};
        currentSuspendedMap[targetUserId] = {
          suspended: true,
          reason: trimmedReason,
          timestamp: new Date().toISOString(),
        };

        await client
          .from('platform_settings')
          .update({
            value: {
              ...currentVal,
              suspended_user_ids: updatedSuspendedIds,
              suspended_users: currentSuspendedMap,
            },
            updated_at: new Date().toISOString(),
            updated_by: auth.user?.id,
          })
          .eq('key', 'match_scoring_config');
      } catch (syncErr) {
        console.warn('Could not sync suspended user to platform_settings:', syncErr);
      }

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'USER_SUSPENDED',
        targetType: 'user',
        targetId: targetUserId,
        details: {
          target_username: targetProfile?.username,
          target_display_name: targetProfile?.display_name,
          reason: trimmedReason,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `User @${targetProfile?.username || targetUserId} has been suspended and removed from all teammate lists and project teams.`,
      });
    }

    // -------------------------------------------------------------
    // ACTION: RESTORE USER
    // -------------------------------------------------------------
    if (action === 'restore') {
      // 1. Try atomic PostgreSQL RPC first
      let rpcHandled = false;
      try {
        const { data: rpcData, error: rpcErr } = await client.rpc('admin_moderate_user', {
          p_action: 'restore',
          p_target_user_id: targetUserId,
        });
        if (!rpcErr && rpcData?.success) {
          rpcHandled = true;
        }
      } catch {
        // Fallback to direct mutations
      }

      // 2. Direct database updates fallback
      if (!rpcHandled) {
        try {
          await client
            .from('profiles')
            .update({
              is_suspended: false,
              status: 'active',
              suspension_reason: null,
              is_portfolio_public: true,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', targetUserId);
        } catch {}
      }

      // 3. Remove user ID from platform_settings suspended list
      try {
        const { data: existingSetting } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();

        if (existingSetting?.value) {
          const currentVal = existingSetting.value;
          const updatedSuspendedIds = (currentVal.suspended_user_ids || []).filter(
            (id: string) => id !== targetUserId
          );
          const currentSuspendedMap = { ...(currentVal.suspended_users || {}) };
          delete currentSuspendedMap[targetUserId];

          await client
            .from('platform_settings')
            .update({
              value: {
                ...currentVal,
                suspended_user_ids: updatedSuspendedIds,
                suspended_users: currentSuspendedMap,
              },
              updated_at: new Date().toISOString(),
              updated_by: auth.user?.id,
            })
            .eq('key', 'match_scoring_config');
        }
      } catch (syncErr) {
        console.warn('Could not remove suspended user from platform_settings:', syncErr);
      }

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'USER_RESTORED',
        targetType: 'user',
        targetId: targetUserId,
        details: {
          target_username: targetProfile?.username,
          target_display_name: targetProfile?.display_name,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `User @${targetProfile?.username || targetUserId} account has been restored to active status.`,
      });
    }

    // -------------------------------------------------------------
    // ACTION: REMOVE FROM SPECIFIC PROJECT
    // -------------------------------------------------------------
    if (action === 'remove_from_project') {
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
      }

      // Check if user is the project owner
      const { data: proj } = await client
        .from('projects')
        .select('id, title, owner_id, current_team_size')
        .eq('id', projectId)
        .maybeSingle();

      if (proj && proj.owner_id === targetUserId) {
        return NextResponse.json(
          {
            error:
              'Cannot remove user as member: this user is the project creator/owner. To preserve project data and other students\' work, reassign ownership or archive the project rather than deleting ownership.',
          },
          { status: 400 }
        );
      }

      const { error: delErr } = await client
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', targetUserId);

      if (delErr) {
        throw new Error(delErr.message);
      }

      // Decrement current_team_size safely
      if (proj && proj.current_team_size > 1) {
        await client
          .from('projects')
          .update({ current_team_size: Math.max(1, proj.current_team_size - 1) })
          .eq('id', projectId);
      }

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'USER_REMOVED_FROM_PROJECT',
        targetType: 'project',
        targetId: projectId,
        details: {
          target_user_id: targetUserId,
          target_username: targetProfile?.username,
          project_title: proj?.title,
          reason,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `Removed user from project "${proj?.title || projectId}".`,
      });
    }

    // -------------------------------------------------------------
    // ACTION: REMOVE FROM HACKATHON TEAM
    // -------------------------------------------------------------
    if (action === 'remove_from_hackathon_team') {
      if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required.' }, { status: 400 });
      }

      const { error: delErr } = await client
        .from('hackathon_team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', targetUserId);

      if (delErr) {
        throw new Error(delErr.message);
      }

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'USER_REMOVED_FROM_HACKATHON_TEAM',
        targetType: 'hackathon_team',
        targetId: teamId,
        details: {
          target_user_id: targetUserId,
          target_username: targetProfile?.username,
          reason,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: 'User removed from hackathon team.',
      });
    }

    // -------------------------------------------------------------
    // ACTION: REMOVE FROM ALL TEAMS & PROJECTS (EXPLICIT CONFIRMATION)
    // -------------------------------------------------------------
    if (action === 'remove_from_all_teams') {
      // 1. Fetch current project memberships to update team counts
      const { data: mems } = await client
        .from('project_members')
        .select('project_id')
        .eq('user_id', targetUserId);

      // 2. Delete all project memberships
      const { error: memErr } = await client
        .from('project_members')
        .delete()
        .eq('user_id', targetUserId);

      if (memErr) throw new Error(memErr.message);

      // 3. Delete all hackathon team memberships
      const { error: hErr } = await client
        .from('hackathon_team_members')
        .delete()
        .eq('user_id', targetUserId);

      if (hErr) throw new Error(hErr.message);

      // 4. Update project team sizes
      if (mems && mems.length > 0) {
        for (const m of mems) {
          try {
            const { count } = await client
              .from('project_members')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', m.project_id);
            await client
              .from('projects')
              .update({ current_team_size: Math.max(1, (count || 0) + 1) })
              .eq('id', m.project_id);
          } catch {}
        }
      }

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'USER_REMOVED_FROM_ALL_PROJECTS',
        targetType: 'user',
        targetId: targetUserId,
        details: {
          target_username: targetProfile?.username,
          removed_from_projects_count: mems?.length || 0,
          reason,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `User @${targetProfile?.username || targetUserId} has been removed from all project and hackathon team rosters. Shared projects and history were preserved.`,
      });
    }

    return NextResponse.json({ error: `Unsupported moderation action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error executing moderation action.' },
      { status: 500 }
    );
  }
}
