import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { DEFAULT_ARENA_QUESTIONS, DuelQuestion } from '@/types/arenaDuel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Fetch questions filtered by arena & tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const arena = searchParams.get('arena');
    const tagsParam = searchParams.get('tags');
    const requestedTags = tagsParam ? tagsParam.split(',').map((t) => t.trim().toLowerCase()) : [];

    const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>(
      'arena_duel_questions',
      DEFAULT_ARENA_QUESTIONS
    );

    let filtered = Array.isArray(storedQuestions) ? storedQuestions : DEFAULT_ARENA_QUESTIONS;

    if (arena) {
      filtered = filtered.filter((q) => q.arena === arena);
    }

    if (requestedTags.length > 0) {
      filtered = filtered.filter((q) => requestedTags.some((t) => q.tags.includes(t)));
    }

    return NextResponse.json(
      {
        success: true,
        questions: filtered,
        total: filtered.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, questions: DEFAULT_ARENA_QUESTIONS },
      { status: 200 }
    );
  }
}

// POST: Admin adds or edits questions
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>(
      'arena_duel_questions',
      DEFAULT_ARENA_QUESTIONS
    );

    const newQuestion: DuelQuestion = {
      id: body.id || `q-${Date.now()}`,
      arena: body.arena || 'web_dev',
      title: (body.title || 'Untitled Duel').trim(),
      description: (body.description || '').trim(),
      tags: Array.isArray(body.tags) ? body.tags : ['html', 'css'],
      difficulty: body.difficulty || 'medium',
      timeLimitSeconds: Number(body.timeLimitSeconds || 300),
      targetPreviewTitle: body.targetPreviewTitle,
      targetComponentHtml: body.targetComponentHtml,
      starterHtml: body.starterHtml,
      starterCss: body.starterCss,
      starterJs: body.starterJs,
      starterJava: body.starterJava,
      starterPython: body.starterPython,
      testCases: Array.isArray(body.testCases) ? body.testCases : [],
      validationCriteria: Array.isArray(body.validationCriteria) ? body.validationCriteria : [],
    };

    const currentList = Array.isArray(storedQuestions) ? [...storedQuestions] : [...DEFAULT_ARENA_QUESTIONS];
    const existingIndex = currentList.findIndex((q) => q.id === newQuestion.id);

    if (existingIndex >= 0) {
      currentList[existingIndex] = newQuestion;
    } else {
      currentList.unshift(newQuestion);
    }

    await updateMasterControlSubkey('arena_duel_questions', currentList);

    return NextResponse.json({
      success: true,
      message: 'Arena question saved successfully to server',
      question: newQuestion,
      totalQuestions: currentList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
