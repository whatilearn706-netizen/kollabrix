import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_RESTRICTED_WORDS,
  DEFAULT_RESTRICTED_CATEGORIES,
} from '@/lib/moderation/restrictedWords';

export const runtime = 'nodejs';
export const revalidate = 300; // 5-minute edge cache to protect database egress

export async function GET(request: Request) {
  let words = DEFAULT_RESTRICTED_WORDS;
  let enabled = true;
  let customWords: string[] = [];
  const categories = DEFAULT_RESTRICTED_CATEGORIES;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'restricted_words')
        .maybeSingle();

      if (data?.value) {
        const val = data.value;
        if (typeof val.enabled === 'boolean') {
          enabled = val.enabled;
        }
        if (Array.isArray(val.words) && val.words.length > 0) {
          words = val.words;
        }
        if (Array.isArray(val.customWords)) {
          customWords = val.customWords;
        }
      }
    } catch (err) {
      console.warn('Could not read restricted words from platform_settings:', err);
    }
  }

  return NextResponse.json(
    {
      enabled,
      words,
      customWords,
      categories,
      count: words.length,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
