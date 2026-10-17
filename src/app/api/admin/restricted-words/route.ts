import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_RESTRICTED_WORDS,
  DEFAULT_RESTRICTED_CATEGORIES,
} from '@/lib/moderation/restrictedWords';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let words = DEFAULT_RESTRICTED_WORDS;
  let enabled = true;
  let customWords: string[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'restricted_words')
        .maybeSingle();

      if (data?.value) {
        const val = data.value;
        if (typeof val.enabled === 'boolean') enabled = val.enabled;
        if (Array.isArray(val.words)) words = val.words;
        if (Array.isArray(val.customWords)) customWords = val.customWords;
      }
    } catch (err) {
      console.warn('Error reading admin restricted_words:', err);
    }
  }

  return NextResponse.json({
    enabled,
    words,
    customWords,
    categories: DEFAULT_RESTRICTED_CATEGORIES,
    count: words.length,
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  const body = await request.json().catch(() => ({}));
  const { action, word, words: newWordList, enabled } = body;

  let currentWords = DEFAULT_RESTRICTED_WORDS;
  let currentEnabled = true;
  let currentCustomWords: string[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'restricted_words')
        .maybeSingle();

      if (data?.value) {
        if (typeof data.value.enabled === 'boolean') currentEnabled = data.value.enabled;
        if (Array.isArray(data.value.words)) currentWords = data.value.words;
        if (Array.isArray(data.value.customWords)) currentCustomWords = data.value.customWords;
      }
    } catch (e) {}
  }

  let updatedWords = [...currentWords];
  let updatedCustomWords = [...currentCustomWords];
  let updatedEnabled = currentEnabled;
  let actionSummary = '';

  if (action === 'add') {
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'Word to add is required' }, { status: 400 });
    }
    // Support comma-separated words
    const toAdd = word
      .split(',')
      .map((w: string) => w.toLowerCase().trim())
      .filter((w: string) => w.length > 0);

    for (const item of toAdd) {
      if (!updatedWords.includes(item)) {
        updatedWords.push(item);
      }
      if (!updatedCustomWords.includes(item)) {
        updatedCustomWords.push(item);
      }
    }
    actionSummary = `Added restricted word(s): "${toAdd.join(', ')}"`;
  } else if (action === 'remove') {
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'Word to remove is required' }, { status: 400 });
    }
    const target = word.toLowerCase().trim();
    updatedWords = updatedWords.filter((w) => w !== target);
    updatedCustomWords = updatedCustomWords.filter((w) => w !== target);
    actionSummary = `Removed restricted word: "${target}"`;
  } else if (action === 'toggle') {
    updatedEnabled = typeof enabled === 'boolean' ? enabled : !currentEnabled;
    actionSummary = `Toggled restricted words enforcement to ${updatedEnabled ? 'Enabled' : 'Disabled'}`;
  } else if (action === 'reset') {
    updatedWords = DEFAULT_RESTRICTED_WORDS;
    updatedCustomWords = [];
    updatedEnabled = true;
    actionSummary = 'Reset restricted words list to platform defaults';
  } else if (action === 'set_all') {
    if (!Array.isArray(newWordList)) {
      return NextResponse.json({ error: 'words must be an array' }, { status: 400 });
    }
    updatedWords = Array.from(new Set(newWordList.map((w: string) => String(w).toLowerCase().trim()).filter(Boolean)));
    actionSummary = `Updated full restricted words list (${updatedWords.length} terms)`;
  } else {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const adminEmail = auth.user?.email || auth.profile?.username || 'admin@linkora.in';
  const adminId = auth.user?.id || 'admin';

  const payload = {
    enabled: updatedEnabled,
    words: updatedWords,
    customWords: updatedCustomWords,
    updated_at: new Date().toISOString(),
    updated_by: adminEmail,
  };

  if (isSupabaseConfigured()) {
    try {
      await client.from('platform_settings').upsert({
        key: 'restricted_words',
        value: payload,
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Could not persist restricted_words to platform_settings:', err);
    }
  }

  // Record audit log
  await recordAdminAuditLog({
    actorId: adminId,
    actorEmail: adminEmail,
    action: 'restricted_words_update',
    targetId: 'restricted_words',
    targetType: 'platform_settings',
    details: {
      action,
      summary: actionSummary,
      count: updatedWords.length,
      enabled: updatedEnabled,
    },
  });

  return NextResponse.json({
    success: true,
    message: actionSummary,
    enabled: updatedEnabled,
    words: updatedWords,
    customWords: updatedCustomWords,
    count: updatedWords.length,
  });
}
