import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export interface SparkModelSettings {
  engine: 'auto' | 'gemini' | 'openai' | 'neural';
  geminiApiKey?: string;
  openaiApiKey?: string;
  temperature: number;
  customSystemPrompt?: string;
  lastUpdated?: string;
}

const DEFAULT_SETTINGS: SparkModelSettings = {
  engine: 'auto',
  geminiApiKey: '',
  openaiApiKey: '',
  temperature: 0.7,
  customSystemPrompt: '',
};

function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••' + key.slice(-4);
}

// GET: Fetch AI Spark model settings for admin desk
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const settings = await getMasterControlSubkey<SparkModelSettings>('sparkSettings', DEFAULT_SETTINGS);

    const hasEnvGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasEnvOpenAI = Boolean(process.env.OPENAI_API_KEY);

    return NextResponse.json({
      success: true,
      settings: {
        engine: settings.engine || 'auto',
        geminiApiKey: maskKey(settings.geminiApiKey),
        openaiApiKey: maskKey(settings.openaiApiKey),
        hasCustomGeminiKey: Boolean(settings.geminiApiKey),
        hasCustomOpenAiKey: Boolean(settings.openaiApiKey),
        hasEnvGemini,
        hasEnvOpenAI,
        temperature: typeof settings.temperature === 'number' ? settings.temperature : 0.7,
        customSystemPrompt: settings.customSystemPrompt || '',
        lastUpdated: settings.lastUpdated || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST: Save updated AI Spark model settings
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const current = await getMasterControlSubkey<SparkModelSettings>('sparkSettings', DEFAULT_SETTINGS);

    const updated: SparkModelSettings = {
      engine: body.engine || current.engine || 'auto',
      geminiApiKey: body.geminiApiKey !== undefined
        ? (body.geminiApiKey.includes('••••') ? current.geminiApiKey : body.geminiApiKey.trim())
        : current.geminiApiKey,
      openaiApiKey: body.openaiApiKey !== undefined
        ? (body.openaiApiKey.includes('••••') ? current.openaiApiKey : body.openaiApiKey.trim())
        : current.openaiApiKey,
      temperature: typeof body.temperature === 'number' ? Math.max(0.1, Math.min(1.0, body.temperature)) : current.temperature,
      customSystemPrompt: typeof body.customSystemPrompt === 'string' ? body.customSystemPrompt.trim() : current.customSystemPrompt,
      lastUpdated: new Date().toISOString(),
    };

    const result = await updateMasterControlSubkey('sparkSettings', updated);
    if (!result.success) {
      throw new Error(result.error || 'Failed to persist settings in Supabase');
    }

    return NextResponse.json({
      success: true,
      message: 'AI Spark Model Settings updated successfully',
      settings: {
        engine: updated.engine,
        geminiApiKey: maskKey(updated.geminiApiKey),
        openaiApiKey: maskKey(updated.openaiApiKey),
        hasCustomGeminiKey: Boolean(updated.geminiApiKey),
        hasCustomOpenAiKey: Boolean(updated.openaiApiKey),
        temperature: updated.temperature,
        customSystemPrompt: updated.customSystemPrompt,
        lastUpdated: updated.lastUpdated,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
