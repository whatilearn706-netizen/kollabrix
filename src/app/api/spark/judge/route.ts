import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { consumeKaChatQuota } from '@/lib/spark/plans';
import { fetchDeepGitHubContext } from '@/lib/spark/githubScanner';
import { fetchExternalHackathonContext, fetchLiveDemoContext } from '@/lib/spark/liveDemoScanner';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-judge:${ip}`, 20, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    let userId: string | null = null;
    try {
      const serverClient = createServerSupabaseClient();
      const { data: { user } } = await serverClient.auth.getUser();
      userId = user?.id || null;
    } catch {}

    const body = await request.json();
    const {
      repoUrl = '',
      liveDemoUrl = '',
      pitchText = '',
      track = 'open',
      hackathonId = '',
      hackathonTitle = '',
      hackathonUrl = '',
      blueprint,
      previousScore,
      previousCommitSha = '',
      previousLiveDemoUrl = '',
      isReaudit = false,
    } = body;

    if (!repoUrl.trim() && !liveDemoUrl.trim() && !pitchText.trim() && !blueprint) {
      return NextResponse.json(
        { error: 'Please paste a GitHub repository URL, Live Demo URL, or project pitch to audit.' },
        { status: 400 }
      );
    }

    const client = getServiceClient();

    // 1. Inspect GitHub repo, Live Demo deployment, and Hackathon details in parallel BEFORE consuming quota
    const [repoSnap, liveDemoSnap, dbHackathon, extHackathon] = await Promise.all([
      repoUrl.trim() ? fetchDeepGitHubContext(repoUrl.trim()) : Promise.resolve(null),
      liveDemoUrl.trim() ? fetchLiveDemoContext(liveDemoUrl.trim()) : Promise.resolve(null),
      (async () => {
        if (!client || !hackathonId) return null;
        try {
          const { data } = await client
            .from('hackathons')
            .select('title, organizer, themes, prize_pool, description')
            .eq('id', hackathonId)
            .maybeSingle();
          return data;
        } catch {
          return null;
        }
      })(),
      hackathonUrl.trim() ? fetchExternalHackathonContext(hackathonUrl.trim()) : Promise.resolve(null),
    ]);

    // Same-SHA & Same-Live-URL Re-Audit Guard
    if (
      isReaudit &&
      repoSnap?.found &&
      previousCommitSha &&
      repoSnap.lastCommitSha &&
      previousCommitSha === repoSnap.lastCommitSha &&
      liveDemoUrl.trim() === (previousLiveDemoUrl || '').trim() &&
      !pitchText.trim()
    ) {
      return NextResponse.json({
        success: false,
        unchanged: true,
        repoScanned: {
          repoName: repoSnap.repoName,
          sha: repoSnap.lastCommitSha,
          lastCommitMessage: repoSnap.lastCommitMessage,
          signals: repoSnap.signals,
        },
        liveDemoStatus: liveDemoSnap?.checked
          ? {
              url: liveDemoSnap.url,
              reachable: liveDemoSnap.reachable,
              statusCode: liveDemoSnap.statusCode,
              latencyMs: liveDemoSnap.latencyMs,
              title: liveDemoSnap.title,
              detectedFramework: liveDemoSnap.detectedFramework,
              isBoilerplateOrError: liveDemoSnap.isBoilerplateOrError,
            }
          : null,
        error: `No new GitHub commit or Live Demo update detected since commit ${repoSnap.lastCommitSha}. Push real fixes to GitHub, update your Live Demo URL, or add fix notes before re-auditing.`,
      });
    }

    const quota = await consumeKaChatQuota(userId || ip, 'deep', userId, 'hackathon');
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.error ||
            (userId
              ? 'Judge Audit requires Hackathon Pass (₹49 / 7 days) or KΛ Pro Builder (₹149/mo).'
              : 'Sign in and unlock Hackathon Pass (₹49) or KΛ Pro Builder to run AI Judge Audits.'),
          requireAuth: Boolean(quota.requireAuth),
          upgradeRequired: Boolean(quota.upgradeRequired || !userId),
          entitlements: quota.entitlements,
        },
        { status: quota.requireAuth ? 401 : 402 }
      );
    }

    const hackathonParts: string[] = [];
    if (dbHackathon) {
      hackathonParts.push(
        `Target Hackathon: ${dbHackathon.title}\nOrganizer: ${dbHackathon.organizer || 'Kollabrix'}\nRequired Themes / Focus: ${
          Array.isArray(dbHackathon.themes) && dbHackathon.themes.length ? dbHackathon.themes.join(', ') : 'Open Innovation'
        }\nDescription: ${String(dbHackathon.description || '').slice(0, 700)}`
      );
    } else if (hackathonTitle) {
      hackathonParts.push(`Target Hackathon: ${hackathonTitle}`);
    } else {
      hackathonParts.push(`Track Rubric: ${track.toUpperCase()}`);
    }
    if (extHackathon?.found) hackathonParts.push(extHackathon.summaryText);
    else if (hackathonUrl.trim()) hackathonParts.push(`External Hackathon Theme / Link: ${hackathonUrl.trim()}`);

    const hackathonCtx = hackathonParts.join('\n\n');
    const githubContext = repoSnap?.found ? repoSnap.summaryText : '';
    const liveDemoContext = liveDemoSnap?.checked ? liveDemoSnap.summaryText : '';

    const systemPrompt = `You are a strict, realistic Grand-Prize Hackathon Judge powered by Gemini 4 Hydrogen auditing a live submission.
Score ONLY based on concrete evidence observed in the source files, engineering signals, Live Demo deployment check, and target hackathon rubric — NEVER flatter or inflate scores!

STRICT SCORING CALIBRATION RULES:
1. Theme & Track Alignment (CRITICAL): Compare the repository's actual dependencies and source code against the Target Hackathon's themes (e.g., if the hackathon is "Agentic AI / LLMs / Web3 / Robotics" and the repo contains ZERO AI/LLM/Agent SDK or backend orchestration, Problem-Solution Fit & Tech Depth MUST be penalized <= 12/25 each and call out the mismatch explicitly).
2. Real Backend vs Frontend Mock Check: Inspect Detected Engineering Signals & Source File Excerpts. If data is hardcoded/mocked in frontend arrays or localStorage with no real backend API or database persistence, Technical Depth MUST be <= 14/25 and Execution <= 16/25 (never score a frontend-only mock above ~60/100 overall).
3. Live Demo Verification: Check the LIVE DEMO URL CHECK results. If a Live Demo URL is unreachable, returns HTTP 404/500, or shows starter boilerplate ("Create Next App"), Execution & Demo Readiness MUST be <= 13/25 and call out the exact failure! If the Live Demo is live (200 OK) with real rendered features matching the codebase, acknowledge what was observed on the live site.
4. Evidence-Based Feedback: Reference exact filenames/paths, commit SHAs, or live URL titles observed so the student sees real analysis, never generic hope.

Return ONLY valid JSON matching:
{
  "totalScore": number (sum of the 4 criteria scores, 0 to 100),
  "judgeVerdict": "2-3 sentence blunt, honest judge verdict citing real code + live demo check + hackathon rubric match",
  "breakdown": [
    { "criterion": "Problem-Solution Fit & Theme Match", "score": number (0-25), "maxScore": 25, "feedback": "concrete critique citing repo evidence and target hackathon themes" },
    { "criterion": "Technical Depth & Real Architecture", "score": number (0-25), "maxScore": 25, "feedback": "critique citing detected backend, DB, AI/SDK, and source files" },
    { "criterion": "Execution, Live Demo & Readiness", "score": number (0-25), "maxScore": 25, "feedback": "critique citing live deployment check, tests, and runtime reliability" },
    { "criterion": "Documentation, Clarity & Impact", "score": number (0-25), "maxScore": 25, "feedback": "critique citing README, setup, and measurable impact" }
  ],
  "top3Fixes": [
    "Specific engineering fix #1 referencing exact gap, file, or live deployment issue",
    "Specific engineering fix #2 referencing exact gap or file in repo",
    "Specific engineering fix #3 referencing exact gap or file in repo"
  ]
}`;

    const userPrompt = `${hackathonCtx}

${repoUrl ? `Repository / Profile URL: ${repoUrl}` : ''}
${githubContext ? `\nLive Deep GitHub Code Inspection:\n${githubContext}` : '\n(No public GitHub repo detected — penalize Execution & Technical Depth accordingly)'}
${liveDemoContext ? `\n${liveDemoContext}` : '\n(No Live Demo URL provided — remind team that working deployed demos earn significantly higher Execution scores)'}
${pitchText ? `\nExtra Pitch / Fix Notes Submitted:\n${pitchText}` : ''}
${blueprint ? `\nBlueprint Context: ${blueprint.title} — ${blueprint.summary}` : ''}`;

    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.15,
      tier: 'deep',
    });

    const repoScanned = repoSnap?.found
      ? {
          repoName: repoSnap.repoName,
          sha: repoSnap.lastCommitSha,
          lastCommitMessage: repoSnap.lastCommitMessage,
          signals: repoSnap.signals,
        }
      : null;

    const liveDemoStatus = liveDemoSnap?.checked
      ? {
          url: liveDemoSnap.url,
          reachable: liveDemoSnap.reachable,
          statusCode: liveDemoSnap.statusCode,
          latencyMs: liveDemoSnap.latencyMs,
          title: liveDemoSnap.title,
          detectedFramework: liveDemoSnap.detectedFramework,
          isBoilerplateOrError: liveDemoSnap.isBoilerplateOrError,
        }
      : null;

    if (llmRes?.text) {
      try {
        const cleaned = llmRes.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed?.breakdown) && parsed.breakdown.length > 0) {
          parsed.totalScore = parsed.breakdown.reduce(
            (acc: number, item: any) => acc + Math.max(0, Math.min(25, Number(item?.score) || 0)),
            0
          );
        }
        const newScore = Number(parsed?.totalScore || 0);
        const scoreDelta = typeof previousScore === 'number' ? newScore - previousScore : null;
        return NextResponse.json({
          success: true,
          audit: parsed,
          scoreDelta,
          repoScanned,
          liveDemoStatus,
          entitlements: quota.entitlements,
          engine: llmRes.engine,
          githubDetected: Boolean(githubContext),
        });
      } catch {}
    }

    // Strict fallback aligned with real detected signals & live demo
    const s = repoSnap?.signals;
    const fitScore = repoSnap?.found ? 12 : 8;
    const techScore = (s?.hasBackendApi ? 8 : 3) + (s?.hasDatabase ? 7 : 2) + (s?.hasAiIntegration ? 6 : 2);
    const execScore =
      (repoSnap?.found ? 6 : 3) +
      (liveDemoSnap?.reachable ? 6 : 1) +
      (s?.hasTests ? 5 : 2) +
      (pitchText.trim().length > 40 ? 3 : 1);
    const docScore = repoSnap?.readmeExcerpt ? 14 : 7;
    const score = Math.min(100, fitScore + techScore + execScore + docScore);

    return NextResponse.json({
      success: true,
      engine: 'Kollabrix Strict Rubric Engine',
      githubDetected: Boolean(githubContext),
      repoScanned,
      liveDemoStatus,
      entitlements: quota.entitlements,
      scoreDelta: typeof previousScore === 'number' ? score - previousScore : null,
      audit: {
        totalScore: score,
        judgeVerdict: repoSnap?.found
          ? `Scanned ${repoSnap.repoName} (${repoSnap.lastCommitSha}). Backend API=${s?.hasBackendApi}, DB=${s?.hasDatabase}, AI SDK=${s?.hasAiIntegration}, Live Demo=${
              liveDemoSnap?.checked ? (liveDemoSnap.reachable ? '200 OK' : `Failed (${liveDemoSnap.statusCode || 'Unreachable'})`) : 'Not Provided'
            }.`
          : 'No readable GitHub codebase detected; real hackathon judges score prototype ideas significantly lower without working code.',
        breakdown: [
          { criterion: 'Problem-Solution Fit & Theme Match', score: fitScore, maxScore: 25, feedback: 'Align core product architecture directly to target hackathon themes.' },
          { criterion: 'Technical Depth & Real Architecture', score: techScore, maxScore: 25, feedback: `Backend API: ${s?.hasBackendApi}, DB: ${s?.hasDatabase}, AI SDK: ${s?.hasAiIntegration}.` },
          {
            criterion: 'Execution, Live Demo & Readiness',
            score: execScore,
            maxScore: 25,
            feedback: liveDemoSnap?.checked
              ? `Live Demo (${liveDemoSnap.url}): HTTP ${liveDemoSnap.statusCode || 'ERR'} (${liveDemoSnap.detectedFramework}).`
              : `Tests detected: ${s?.hasTests}. Add a working Live Demo URL.`,
          },
          { criterion: 'Documentation, Clarity & Impact', score: docScore, maxScore: 25, feedback: repoSnap?.readmeExcerpt ? 'README found — verify setup steps and architecture diagrams.' : 'Add a concrete README.md with setup commands.' },
        ],
        top3Fixes: [
          'Replace mocked/client state with real backend API routes and database persistence.',
          liveDemoSnap?.checked && !liveDemoSnap.reachable
            ? `Fix your broken Live Demo URL (${liveDemoSnap.url}) so judges see a live working app.`
            : 'Deploy a live working demo URL and verify it returns HTTP 200 without errors.',
          'Document architecture flow, local setup, and benchmark evidence in README.md.',
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Judge audit failed.' }, { status: 500 });
  }
}
