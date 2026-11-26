import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { consumeKaChatQuota } from '@/lib/spark/plans';
import { fetchDeepGitHubContext } from '@/lib/spark/githubScanner';

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
      pitchText = '',
      track = 'open',
      hackathonId = '',
      hackathonTitle = '',
      blueprint,
      previousScore,
      previousCommitSha = '',
      isReaudit = false,
    } = body;

    if (!repoUrl.trim() && !pitchText.trim() && !blueprint) {
      return NextResponse.json(
        { error: 'Please paste a GitHub repository URL or project pitch to audit.' },
        { status: 400 }
      );
    }

    // 1. Inspect GitHub repo deeply BEFORE consuming paid quota so identical Re-Audits are caught cleanly
    const repoSnap = repoUrl.trim() ? await fetchDeepGitHubContext(repoUrl.trim()) : null;

    if (
      isReaudit &&
      repoSnap?.found &&
      previousCommitSha &&
      repoSnap.lastCommitSha &&
      previousCommitSha === repoSnap.lastCommitSha &&
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
        error: `No new GitHub commit detected since commit ${repoSnap.lastCommitSha}. Push real fixes to your repository (or add fix notes above) before re-auditing.`,
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

    // 2. Fetch live target hackathon themes & judging requirements from Supabase if selected
    let hackathonCtx = hackathonTitle ? `Target Hackathon: ${hackathonTitle}` : `Track Rubric: ${track.toUpperCase()}`;
    const client = getServiceClient();
    if (client && hackathonId) {
      try {
        const { data: h } = await client
          .from('hackathons')
          .select('title, organizer, themes, prize_pool, description')
          .eq('id', hackathonId)
          .maybeSingle();
        if (h) {
          hackathonCtx = `Target Hackathon: ${h.title}
Organizer: ${h.organizer || 'Kollabrix'}
Required Themes / Focus: ${Array.isArray(h.themes) && h.themes.length ? h.themes.join(', ') : 'Open Innovation'}
Description: ${String(h.description || '').slice(0, 700)}`;
        }
      } catch {}
    }

    const githubContext = repoSnap?.found ? repoSnap.summaryText : '';

    const systemPrompt = `You are a strict, realistic Grand-Prize Hackathon Judge auditing an actual repository submission.
Score ONLY based on concrete evidence observed in the source files, dependencies, signals, and target hackathon requirements below — NEVER flatter or inflate scores!

STRICT SCORING CALIBRATION RULES:
1. Theme & Track Alignment (CRITICAL): Compare the repository's actual dependencies and source code against the Target Hackathon's themes (e.g., if the hackathon is "Agentic AI / LLMs / Web3 / Robotics" and the repo contains ZERO AI/LLM/Agent SDK or backend orchestration, Problem-Solution Fit & Tech Depth MUST be heavily penalized to <= 12/25 each and explicitly call out the theme mismatch).
2. Real Backend vs Frontend Mock Check: Look at Detected Engineering Signals & Source File Excerpts. If data is hardcoded/mocked in frontend arrays or localStorage with no real backend API or database persistence, Technical Depth MUST be <= 14/25 and Execution <= 16/25 (never score a frontend-only mock above ~60/100 overall).
3. Evidence-Based Feedback: Reference exact filenames/paths observed in the repository (e.g. src/..., package.json, Vitest, etc.) so the builder knows you actually read their codebase.

Return ONLY valid JSON matching:
{
  "totalScore": number (sum of the 4 criteria scores, 0 to 100),
  "judgeVerdict": "2-3 sentence blunt, honest judge verdict comparing their actual codebase against the target hackathon rubric",
  "breakdown": [
    { "criterion": "Problem-Solution Fit & Theme Match", "score": number (0-25), "maxScore": 25, "feedback": "concrete critique citing repo evidence and target hackathon themes" },
    { "criterion": "Technical Depth & Real Architecture", "score": number (0-25), "maxScore": 25, "feedback": "critique citing detected backend, DB, AI/SDK, and source files" },
    { "criterion": "Execution, Security & Demo Readiness", "score": number (0-25), "maxScore": 25, "feedback": "critique citing real runtime, tests, and failure risks" },
    { "criterion": "Documentation, Clarity & Impact", "score": number (0-25), "maxScore": 25, "feedback": "critique citing README, setup, and measurable impact" }
  ],
  "top3Fixes": [
    "Specific engineering fix #1 referencing exact gap or file in repo",
    "Specific engineering fix #2 referencing exact gap or file in repo",
    "Specific engineering fix #3 referencing exact gap or file in repo"
  ]
}`;

    const userPrompt = `${hackathonCtx}

${repoUrl ? `Repository URL: ${repoUrl}` : ''}
${githubContext ? `\nLive Deep GitHub Code Inspection:\n${githubContext}` : '\n(No public GitHub repo detected — penalize Execution & Technical Depth accordingly)'}
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

    if (llmRes?.text) {
      try {
        const cleaned = llmRes.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        // Ensure totalScore strictly equals the sum of the 4 criteria
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
          entitlements: quota.entitlements,
          engine: llmRes.engine,
          githubDetected: Boolean(githubContext),
        });
      } catch {}
    }

    // Strict fallback aligned with real detected signals
    const s = repoSnap?.signals;
    const fitScore = repoSnap?.found ? 12 : 8;
    const techScore = (s?.hasBackendApi ? 8 : 3) + (s?.hasDatabase ? 7 : 2) + (s?.hasAiIntegration ? 6 : 2);
    const execScore = (repoSnap?.found ? 8 : 4) + (s?.hasTests ? 6 : 2) + (pitchText.trim().length > 40 ? 4 : 1);
    const docScore = repoSnap?.readmeExcerpt ? 14 : 7;
    const score = Math.min(100, fitScore + techScore + execScore + docScore);

    return NextResponse.json({
      success: true,
      engine: 'Kollabrix Strict Rubric Engine',
      githubDetected: Boolean(githubContext),
      repoScanned,
      entitlements: quota.entitlements,
      scoreDelta: typeof previousScore === 'number' ? score - previousScore : null,
      audit: {
        totalScore: score,
        judgeVerdict: repoSnap?.found
          ? `Scanned ${repoSnap.repoName} (${repoSnap.lastCommitSha}). Backend API=${s?.hasBackendApi}, DB=${s?.hasDatabase}, AI SDK=${s?.hasAiIntegration}, Tests=${s?.hasTests}. Add real persistence and theme-aligned backend workflows before final judging.`
          : 'No readable GitHub codebase detected; real hackathon judges score prototype ideas significantly lower without working code.',
        breakdown: [
          { criterion: 'Problem-Solution Fit & Theme Match', score: fitScore, maxScore: 25, feedback: 'Align core product architecture directly to target hackathon themes.' },
          { criterion: 'Technical Depth & Real Architecture', score: techScore, maxScore: 25, feedback: `Backend API: ${s?.hasBackendApi}, DB: ${s?.hasDatabase}, AI SDK: ${s?.hasAiIntegration}.` },
          { criterion: 'Execution, Security & Demo Readiness', score: execScore, maxScore: 25, feedback: `Automated tests detected: ${s?.hasTests}. Ensure real end-to-end persistence.` },
          { criterion: 'Documentation, Clarity & Impact', score: docScore, maxScore: 25, feedback: repoSnap?.readmeExcerpt ? 'README found — verify setup steps and architecture diagrams.' : 'Add a concrete README.md with setup commands.' },
        ],
        top3Fixes: [
          'Replace mocked/client state with real backend API routes and database persistence.',
          'Implement core theme functionality (e.g., actual LLM/agent workflow if competing in an AI track).',
          'Document architecture flow, local setup, and benchmark evidence in README.md.',
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Judge audit failed.' }, { status: 500 });
  }
}
