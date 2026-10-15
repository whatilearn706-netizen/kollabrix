import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { DEFAULT_EXPLORE_CONFIG } from '@/lib/admin/adminDefaults';

export const runtime = 'nodejs';
export const revalidate = 60; // 60s cache

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      config: DEFAULT_EXPLORE_CONFIG,
    });
  }

  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'explore_config')
      .maybeSingle();

    if (data?.value) {
      return NextResponse.json({
        success: true,
        config: { ...DEFAULT_EXPLORE_CONFIG, ...data.value },
      });
    }
  } catch (err) {
    console.warn('Error reading explore settings:', err);
  }

  return NextResponse.json({
    success: true,
    config: DEFAULT_EXPLORE_CONFIG,
  });
}
