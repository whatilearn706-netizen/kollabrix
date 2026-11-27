import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBuilderMemoryWithArena, saveBuilderMemory } from '@/lib/spark/builderMemory';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const serverClient = createServerSupabaseClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ success: true, memory: null, arenaStats: null });
    }

    const data = await getBuilderMemoryWithArena(user.id);
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: true, memory: null, arenaStats: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const serverClient = createServerSupabaseClient();
    const {
      data: { user },
    } = await serverClient.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Sign in to save your Personal Builder Memory.' }, { status: 401 });
    }

    const body = await request.json();
    const saved = await saveBuilderMemory(user.id, {
      preferredStack: body.preferredStack,
      weakTopics: body.weakTopics,
      targetGoal: body.targetGoal,
      experienceLevel: body.experienceLevel,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, memory: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save Builder Memory.' }, { status: 500 });
  }
}
