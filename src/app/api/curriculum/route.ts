import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';
import { LanguageCurriculum, LearningStep } from '@/types/curriculum';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let memoryCurricula: Record<string, LanguageCurriculum> = { ...DEFAULT_CURRICULA };

function getServiceSupabase() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const sClient = getServiceSupabase();
    if (sClient) {
      const { data, error } = await sClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'campus_curricula_registry')
        .maybeSingle();

      if (!error && data?.value && typeof data.value === 'object') {
        memoryCurricula = { ...DEFAULT_CURRICULA, ...data.value };
        return NextResponse.json({ success: true, curricula: memoryCurricula, source: 'database' });
      }
    }

    return NextResponse.json({ success: true, curricula: memoryCurricula, source: 'default' });
  } catch (err: any) {
    return NextResponse.json({ success: true, curricula: memoryCurricula, source: 'memory_fallback' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, curriculumId, stepNumber, video, videoId, question, questionId, studyMaterial, curricula } = body;

    const sClient = getServiceSupabase();

    // Action: Reset defaults
    if (action === 'reset_defaults') {
      memoryCurricula = { ...DEFAULT_CURRICULA };
      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true, curricula: memoryCurricula });
    }

    // Action: Save full curricula
    if (action === 'set_all' && curricula) {
      memoryCurricula = { ...curricula };
      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true, curricula: memoryCurricula });
    }

    if (!curriculumId || !memoryCurricula[curriculumId]) {
      return NextResponse.json({ success: false, error: 'Curriculum not found' }, { status: 404 });
    }

    const curr = { ...memoryCurricula[curriculumId] };

    // Action: Add new Step (e.g. Step 6)
    if (action === 'add_step') {
      const nextNum = curr.steps.length + 1;
      const stepInput = body.newStep || {};
      const newStepObj: LearningStep = {
        stepNumber: nextNum,
        title: stepInput.title || `Step ${nextNum}: New Advanced Topic`,
        topic: stepInput.topic || 'Advanced Concepts & Practice',
        estimatedTime: stepInput.estimatedTime || '2 Hours',
        summary: stepInput.summary || `Comprehensive deep dive into Step ${nextNum}.`,
        studyMaterial: stepInput.studyMaterial || {
          overview: stepInput.summary || `Overview and architecture for Step ${nextNum}.`,
          keyPoints: ['Core syntax and implementation rules', 'Common errors and interview questions'],
          codeExamples: [],
          cheatsheet: [],
          officialDocUrl: '',
        },
        video: stepInput.video || {
          id: `v-${Date.now()}`,
          title: stepInput.videoTitle || `${stepInput.title || `Step ${nextNum}`} Lecture`,
          instructor: stepInput.videoInstructor || 'Campus Mentor',
          duration: stepInput.videoDuration || '30m',
          videoUrl: stepInput.videoUrl || '',
          youtubeId: stepInput.youtubeId || '',
        },
        videos: [
          stepInput.video || {
            id: `v-${Date.now()}`,
            title: stepInput.videoTitle || `${stepInput.title || `Step ${nextNum}`} Lecture`,
            instructor: stepInput.videoInstructor || 'Campus Mentor',
            duration: stepInput.videoDuration || '30m',
            videoUrl: stepInput.videoUrl || '',
            youtubeId: stepInput.youtubeId || '',
          },
        ],
        practiceQuestions: stepInput.practiceQuestions || [],
        compilerStarterCode: stepInput.compilerStarterCode || curr.steps[0]?.compilerStarterCode || '',
      };

      curr.steps.push(newStepObj);
      curr.stepsCount = curr.steps.length;
      memoryCurricula[curriculumId] = curr;

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        curriculum: curr,
        curricula: memoryCurricula,
        newStepNumber: nextNum,
      });
    }

    // Action: Delete Step
    if (action === 'delete_step' && typeof stepNumber === 'number') {
      if (curr.steps.length <= 1) {
        return NextResponse.json({ success: false, error: 'Cannot delete the only step in curriculum.' }, { status: 400 });
      }
      curr.steps = curr.steps
        .filter((s) => s.stepNumber !== stepNumber)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 })); // renumber sequentially
      curr.stepsCount = curr.steps.length;
      memoryCurricula[curriculumId] = curr;

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        curriculum: curr,
        curricula: memoryCurricula,
      });
    }

    const stepIdx = curr.steps.findIndex((s) => s.stepNumber === stepNumber);
    if (stepIdx === -1) {
      return NextResponse.json({ success: false, error: 'Step not found' }, { status: 404 });
    }

    const step = { ...curr.steps[stepIdx] };

    // Action: Add / Update Video in step
    if (action === 'save_video' && video) {
      const existingVideos = step.videos ? [...step.videos] : step.video ? [{ ...step.video, id: 'v-default' }] : [];
      const vIdx = existingVideos.findIndex((v) => v.id === video.id);
      if (vIdx >= 0) {
        existingVideos[vIdx] = video;
      } else {
        existingVideos.push({
          ...video,
          id: video.id || `v-${Date.now()}`,
        });
      }
      step.videos = existingVideos;
      step.video = existingVideos[0];
    }

    // Action: Delete Video from step
    if (action === 'delete_video' && videoId) {
      const existingVideos = step.videos ? [...step.videos] : step.video ? [{ ...step.video, id: 'v-default' }] : [];
      const updated = existingVideos.filter((v) => v.id !== videoId);
      step.videos = updated;
      if (updated.length > 0) step.video = updated[0];
    }

    // Action: Add / Update Practice Question
    if (action === 'save_question' && question) {
      const existingQuestions = [...step.practiceQuestions];
      const qIdx = existingQuestions.findIndex((q) => q.id === question.id);
      if (qIdx >= 0) {
        existingQuestions[qIdx] = question;
      } else {
        existingQuestions.push({
          ...question,
          id: question.id || `q-${Date.now()}`,
        });
      }
      step.practiceQuestions = existingQuestions;
    }

    // Action: Delete Practice Question
    if (action === 'delete_question' && questionId) {
      step.practiceQuestions = step.practiceQuestions.filter((q) => q.id !== questionId);
    }

    // Action: Save Study Material
    if (action === 'save_study_material' && studyMaterial) {
      step.studyMaterial = studyMaterial;
    }

    // Update step in curriculum
    curr.steps[stepIdx] = step;
    memoryCurricula[curriculumId] = curr;

    if (sClient) {
      await sClient.from('platform_settings').upsert({
        key: 'campus_curricula_registry',
        value: memoryCurricula,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      curriculum: curr,
      curricula: memoryCurricula,
    });
  } catch (error: any) {
    console.error('Curriculum API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
