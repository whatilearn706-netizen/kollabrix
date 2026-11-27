import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { DEFAULT_ARENA_QUESTIONS, DuelQuestion } from '@/types/arenaDuel';
import { filterAndRankQuestions } from '@/lib/arena/questionSelector';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Fetch Admin-curated KΛ ARENA questions (empty by default until Admin adds questions)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listAll = searchParams.get('all') === 'true';
    const isSummary = searchParams.get('summary') === 'true';
    const arena = searchParams.get('arena') || undefined;
    const bugDomain = (searchParams.get('bugDomain') as 'web' | 'logic') || undefined;
    const difficultyParam = searchParams.get('difficulty');
    const difficulty =
      difficultyParam && difficultyParam !== 'random'
        ? (difficultyParam as 'easy' | 'medium' | 'hard')
        : undefined;
    const timeLimit = searchParams.get('timeLimit') ? Number(searchParams.get('timeLimit')) : undefined;
    const tagsParam = searchParams.get('tags');
    const requestedTags = tagsParam ? tagsParam.split(',').map((t) => t.trim().toLowerCase()) : [];
    const seenParam = searchParams.get('seenIds');
    const seenQuestionIds = seenParam ? seenParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];

    const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>('arena_duel_questions', []);
    const combined: DuelQuestion[] = Array.isArray(storedQuestions) ? storedQuestions.filter((q) => Boolean(q && q.id)) : [];

    if (isSummary) {
      return NextResponse.json(
        {
          success: true,
          questions: [],
          total: combined.length,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'CDN-Cache-Control': 'no-store',
          },
        }
      );
    }

    const outputList = listAll || !arena
      ? combined
      : filterAndRankQuestions(combined, {
          arena,
          bugDomain,
          selectedTags: requestedTags,
          difficulty,
          timeLimit,
          seenQuestionIds,
        }).slice(0, 40);

    const sanitized = outputList.map((q) => ({
      ...q,
      testCases: (q.testCases || []).map((tc) => {
        if (tc.isHidden && !listAll) {
          return {
            ...tc,
            input: '[Hidden Test Case]',
            expectedOutput: '[Hidden Test Case]',
          };
        }
        return tc;
      }),
    }));

    return NextResponse.json(
      {
        success: true,
        questions: sanitized,
        total: sanitized.length,
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
      { success: false, error: err.message, questions: [] },
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
    const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>('arena_duel_questions', []);

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
      targetComponentCss: body.targetComponentCss,
      targetComponentJs: body.targetComponentJs,
      starterHtml: body.starterHtml,
      starterCss: body.starterCss,
      starterJs: body.starterJs,
      starterJava: body.starterJava,
      starterPython: body.starterPython,
      starterCpp: body.starterCpp,
      bugDomain: body.bugDomain,
      codeWithBug: body.codeWithBug,
      sampleInput: body.sampleInput,
      sampleOutput: body.sampleOutput,
      testCases: Array.isArray(body.testCases) ? body.testCases : [],
      validationCriteria: Array.isArray(body.validationCriteria) ? body.validationCriteria : [],
    };

    const currentList = Array.isArray(storedQuestions) ? [...storedQuestions] : [];
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

// DELETE: Admin deletes a single question by ID or clears all questions (?all=true)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('all') === 'true';
    const questionId = searchParams.get('id');

    if (deleteAll) {
      await updateMasterControlSubkey('arena_duel_questions', []);
      return NextResponse.json({
        success: true,
        message: 'All KΛ ARENA questions removed from server',
        remaining: 0,
      });
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const storedQuestions = await getMasterControlSubkey<DuelQuestion[]>('arena_duel_questions', []);
    const currentList = Array.isArray(storedQuestions) ? [...storedQuestions] : [];
    const updatedList = currentList.filter((q) => q.id !== questionId);

    await updateMasterControlSubkey('arena_duel_questions', updatedList);

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully from server',
      remaining: updatedList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
