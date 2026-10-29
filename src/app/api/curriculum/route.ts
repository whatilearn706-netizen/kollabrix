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
        const dbData = data.value as Record<string, LanguageCurriculum>;
        const merged: Record<string, LanguageCurriculum> = { ...DEFAULT_CURRICULA };
        for (const [key, curr] of Object.entries(dbData)) {
          if (!merged[key]) {
            merged[key] = curr;
          } else {
            const defCurr = merged[key];
            const defSteps = defCurr.steps || [];
            const dbSteps = curr.steps || [];
            // Preserve full comprehensive steps from defaults if DB only has a truncated subset
            const stepsToUse = dbSteps.length >= defSteps.length ? dbSteps : defSteps;
            merged[key] = {
              ...defCurr,
              ...curr,
              steps: stepsToUse,
              stepsCount: stepsToUse.length,
            };
          }
        }
        memoryCurricula = merged;
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

    // Action: Create brand new Curriculum / Skill
    if (action === 'create_curriculum' && body.newCurriculum) {
      const c = body.newCurriculum;
      const baseId = c.id || `${c.language || 'skill'}-${c.track || 'beginner'}`;
      let newId = baseId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      if (memoryCurricula[newId]) {
        newId = `${newId}-${Date.now().toString().slice(-4)}`;
      }

      const initialStepTitle = c.initialStepTitle?.trim() || 'Step 1: Syntax & Environment Setup';
      const newCurriculumObj: LanguageCurriculum = {
        id: newId,
        language: c.language || 'custom',
        track: c.track || 'beginner',
        title: c.title || 'New Skill Curriculum',
        tagline: c.tagline || 'Master core programming fundamentals and practical coding',
        icon: c.icon || '💻',
        color: c.color || 'text-indigo-400',
        badgeBg: c.badgeBg || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        borderColor: c.borderColor || 'border-indigo-500/30 hover:border-indigo-500',
        description: c.description || 'Comprehensive step-by-step collegiate skill pathway.',
        compilerLanguage: c.compilerLanguage || 'python',
        compilerDisplayName: c.compilerDisplayName || 'CPython 3.12 (Python)',
        stepsCount: 1,
        estimatedTotalHours: c.estimatedTotalHours || '8 Hours',
        prerequisites: c.prerequisites && c.prerequisites.length > 0 ? c.prerequisites : ['Basic computer knowledge'],
        outcomes: c.outcomes && c.outcomes.length > 0 ? c.outcomes : ['Build real applications and pass technical interviews'],
        isLive: typeof c.isLive === 'boolean' ? c.isLive : true,
        steps: [
          {
            stepNumber: 1,
            title: initialStepTitle,
            topic: c.initialStepTopic || 'Fundamentals & Setup',
            estimatedTime: c.initialStepTime || '2 Hours',
            summary: c.initialStepSummary || `In this first step, learners master ${initialStepTitle}.`,
            studyMaterial: {
              overview: `Welcome to ${c.title || 'this course'}! In this step, you will set up your workspace and write your first program.`,
              keyPoints: [
                'Understand system runtime and compilation lifecycle',
                'Learn standard naming conventions, syntax structure, and data types',
                'Execute interactive code and solve hands-on practice problems',
              ],
              codeExamples: [
                {
                  title: 'Hello World Starter',
                  code: c.compilerStarterCode || '// Start writing code here\nconsole.log("Hello from Kollabrix!");',
                  explanation: 'Initial starter code demonstrating standard program execution.',
                },
              ],
              cheatsheet: ['Always test edge cases and verify runtime output.'],
              officialDocUrl: c.docUrl || '',
            },
            video: {
              id: `v-${Date.now()}`,
              title: c.initialVideoTitle || `${initialStepTitle} Masterclass`,
              instructor: c.initialInstructor || 'Campus Tech Mentor',
              youtubeId: c.initialYoutubeId || '',
              videoUrl: c.initialVideoUrl || '',
              duration: c.initialVideoDuration || '35m',
              notes: 'Follow along with the guided video tutorial.',
            },
            videos: [
              {
                id: `v-${Date.now()}`,
                title: c.initialVideoTitle || `${initialStepTitle} Masterclass`,
                instructor: c.initialInstructor || 'Campus Tech Mentor',
                youtubeId: c.initialYoutubeId || '',
                videoUrl: c.initialVideoUrl || '',
                duration: c.initialVideoDuration || '35m',
                notes: 'Follow along with the guided video tutorial.',
              },
            ],
            practiceQuestions: [
              {
                id: `q-${newId}-1`,
                title: 'First Output Verification',
                difficulty: 'Easy',
                description: `Write a program that outputs "Kollabrix Skill Master: ${c.title || 'Ready'}".`,
                starterCode: c.compilerStarterCode || '// Write code here\n',
                expectedOutput: `Kollabrix Skill Master: ${c.title || 'Ready'}`,
                hints: ['Print the exact verification message.'],
              },
            ],
            compilerStarterCode: c.compilerStarterCode || '// Kollabrix Coding Sandbox\n',
          },
        ],
      };

      memoryCurricula[newId] = newCurriculumObj;

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        curriculum: newCurriculumObj,
        curricula: memoryCurricula,
        createdId: newId,
      });
    }

    // Action: Delete Curriculum / Skill
    if (action === 'delete_curriculum' && curriculumId) {
      if (!memoryCurricula[curriculumId]) {
        return NextResponse.json({ success: false, error: 'Curriculum not found' }, { status: 404 });
      }
      delete memoryCurricula[curriculumId];

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        curricula: memoryCurricula,
        deletedId: curriculumId,
      });
    }

    // Action: Toggle Live / Draft Status
    if (action === 'toggle_live' && curriculumId) {
      if (!memoryCurricula[curriculumId]) {
        return NextResponse.json({ success: false, error: 'Curriculum not found' }, { status: 404 });
      }
      const targetCurr = { ...memoryCurricula[curriculumId] };
      const currentLive = targetCurr.isLive !== false; // default true if undefined
      targetCurr.isLive = typeof body.isLive === 'boolean' ? body.isLive : !currentLive;
      memoryCurricula[curriculumId] = targetCurr;

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_curricula_registry',
          value: memoryCurricula,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        isLive: targetCurr.isLive,
        curriculum: targetCurr,
        curricula: memoryCurricula,
      });
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
