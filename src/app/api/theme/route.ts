import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { DEFAULT_SITE_THEME, SiteThemeConfig } from '@/types/theme';

export const runtime = 'nodejs';

const SETTINGS_KEY = 'site_theme_config';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, theme: DEFAULT_SITE_THEME });
    }

    const { data: settingData } = await defaultClient
      .from('platform_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    let theme: SiteThemeConfig = settingData?.value
      ? { ...DEFAULT_SITE_THEME, ...settingData.value }
      : DEFAULT_SITE_THEME;

    // Gracefully migrate legacy cold defaults to warm palette
    if (theme.backgroundColor === '#fafbfc') theme.backgroundColor = '#FAF7F2';
    if (theme.brandColor === '#6366F1' || theme.brandColor === '#6366f1') theme.brandColor = '#C2410C';
    if (theme.brandHoverColor === '#4F46E5' || theme.brandHoverColor === '#4f46e5') theme.brandHoverColor = '#9A3412';
    if (theme.accentColor === '#EC4899' || theme.accentColor === '#ec4899') theme.accentColor = '#D97706';
    if (theme.borderColor === '#e2e8f0') theme.borderColor = '#E5DFD5';
    if (theme.headingColor === '#0f172a') theme.headingColor = '#1C1917';
    if (theme.bodyTextColor === '#334155') theme.bodyTextColor = '#443E38';
    if (theme.mutedTextColor === '#64748b') theme.mutedTextColor = '#78716C';
    if (theme.announcementBannerBg === '#6366F1' || theme.announcementBannerBg === '#6366f1') {
      theme.announcementBannerBg = '#C2410C';
    }

    return NextResponse.json({
      success: true,
      theme,
    });
  } catch (err: unknown) {
    console.warn('Error reading site theme config:', err);
    return NextResponse.json({ success: true, theme: DEFAULT_SITE_THEME });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, themeConfig } = body;
    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Theme settings updated successfully (Demo Mode).',
        theme: themeConfig || DEFAULT_SITE_THEME,
      });
    }

    if (action === 'reset') {
      const { error: resetErr } = await client
        .from('platform_settings')
        .upsert({
          key: SETTINGS_KEY,
          value: DEFAULT_SITE_THEME,
          description: 'Custom site branding, typography, color scheme, and copy settings.',
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (resetErr) throw new Error(resetErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'RESET_SITE_THEME',
        targetType: 'platform_settings',
        targetId: SETTINGS_KEY,
        details: { resetTo: 'default' },
      });

      return NextResponse.json({
        success: true,
        message: 'Theme and design settings reset to factory defaults.',
        theme: DEFAULT_SITE_THEME,
      });
    }

    if (!themeConfig || typeof themeConfig !== 'object') {
      return NextResponse.json({ error: 'Valid theme configuration is required.' }, { status: 400 });
    }

    const mergedTheme: SiteThemeConfig = {
      ...DEFAULT_SITE_THEME,
      ...themeConfig,
    };

    const { error: saveErr } = await client
      .from('platform_settings')
      .upsert({
        key: SETTINGS_KEY,
        value: mergedTheme,
        description: 'Custom site branding, typography, color scheme, and copy settings.',
        updated_at: new Date().toISOString(),
        updated_by: auth.user?.id,
      });

    if (saveErr) throw new Error(saveErr.message);

    await recordAdminAuditLog({
      actorId: auth.user?.id,
      actorEmail: auth.user?.email,
      action: 'UPDATE_SITE_THEME',
      targetType: 'platform_settings',
      targetId: SETTINGS_KEY,
      details: {
        brandColor: mergedTheme.brandColor,
        backgroundColor: mergedTheme.backgroundColor,
        headingFont: mergedTheme.headingFont,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Theme, colors, fonts, and design updated successfully across Linkora.',
      theme: mergedTheme,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error saving theme configuration.' },
      { status: 500 }
    );
  }
}
