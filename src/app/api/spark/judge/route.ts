import { NextRequest, NextResponse } from 'next/server';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchGitHubContext(repoUrl: string): Promise<string> {
  const match = repoUrl.match(/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/i);
  if (!match) return '';

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '');

  try {
    const [metaRes, readmeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { Accept: 'application/vnd.github+json' },
      }),
    ]);

    let summary = '';
    if (metaRes.ok) {
      const meta = await metaRes.json();
      summary += `GitHub Repo: ${meta.full_name} | Language: ${meta.language || 'Unknown'} | Stars: ${meta.stargazers_count || 0} | Description: ${meta.description || 'None'}\n`;
    }
    if (readmeRes.ok) {
      const readmeJson = await readmeRes.json();
      if (readmeJson?.content) {
        const decoded = Buffer.from(readmeJson.content, 'base64').toString('utf-8').slice(0, 3500);
        summary += `\nREADME.md Excerpt:\n${decoded}`;
      }
    }
    return summary;
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-judge:${ip}`, 15, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { repoUrl = '', pitchText = '', track = 'open', blueprint } = body;

    if (!repoUrl.trim() && !pitchText.trim() && !blueprint) {
      return NextResponse.json(
        { error: 'Please paste a GitHub repository URL or project pitch to audit.' },
        { status: 400 }
      );
    }

    const githubContext = repoUrl.trim() ? await fetchGitHubContext(repoUrl.trim()) : '';

    const systemPrompt = `You are a strict Grand-Prize Hackathon Judge auditing a student team's submission before final judging.
Track Rubric: ${track.toUpperCase()} (SIH 2026 / ETHIndia / Google Solution Challenge / Open Hackathon).
Return ONLY valid JSON matching:
{
  "totalScore": number (0 to 100),
  "judgeVerdict": "2-sentence blunt, constructive judge verdict on readiness",
  "breakdown": [
    { "criterion": "Problem-Solution Fit & Innovation", "score": number (0-25), "maxScore": 25, "feedback": "specific feedback" },
    { "criterion": "Technical Depth & Architecture", "score": number (0-25), "maxScore": 25, "feedback": "specific feedback" },
    { "criterion": "Execution & Demo Readiness", "score": number (0-25), "maxScore": 25, "feedback": "specific feedback" },
    { "criterion": "Documentation, Pitch & Impact", "score": number (0-25), "maxScore": 25, "feedback": "specific feedback" }
  ],
  "top3Fixes": [
    "Concrete high-impact fix #1 before submitting",
    "Concrete high-impact fix #2 before submitting",
    "Concrete high-impact fix #3 before submitting"
  ]
}`;

    const userPrompt = `Audit this submission:
${repoUrl ? `Repository URL: ${repoUrl}` : ''}
${githubContext ? `\nLive GitHub Inspection:\n${githubContext}` : ''}
${pitchText ? `\nSubmitted Pitch / Notes:\n${pitchText}` : ''}
${blueprint ? `\nBlueprint Context: ${blueprint.title} — ${blueprint.summary}` : ''}`;

    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.4,
      tier: 'deep',
    });

    if (llmRes?.text) {
      try {
        const parsed = JSON.parse(llmRes.text);
        return NextResponse.json({ success: true, audit: parsed, engine: llmRes.engine, githubDetected: Boolean(githubContext) });
      } catch {}
    }

    // Deterministic fallback
    const hasRepo = Boolean(repoUrl.trim());
    const hasPitch = pitchText.trim().length > 40;
    const score = (hasRepo ? 42 : 25) + (hasPitch ? 34 : 20);
    return NextResponse.json({
      success: true,
      engine: 'Kollabrix Rubric Engine',
      githubDetected: Boolean(githubContext),
      audit: {
        totalScore: score,
        judgeVerdict: hasRepo
          ? 'Solid foundation with a linked repository. Strengthen your README architecture diagram and live demo flow to push above 85/100.'
          : 'Your concept has promise, but judges need a live GitHub repository with setup steps and demo screenshots to score Execution high.',
        breakdown: [
          { criterion: 'Problem-Solution Fit & Innovation', score: 19, maxScore: 25, feedback: 'Clearly state why existing tools fail and show your unique twist.' },
          { criterion: 'Technical Depth & Architecture', score: hasRepo ? 20 : 12, maxScore: 25, feedback: hasRepo ? 'Repository detected — highlight your core API/database flow.' : 'Link a public GitHub repo with modular backend/frontend code.' },
          { criterion: 'Execution & Demo Readiness', score: 17, maxScore: 25, feedback: 'Include a 60-second working demo video or live deployment URL.' },
          { criterion: 'Documentation, Pitch & Impact', score: hasPitch ? 19 : 14, maxScore: 25, feedback: 'Add measurable impact metrics (latency, users helped, cost saved).' },
        ],
        top3Fixes: [
          'Add an Architecture Diagram + 3-step local setup guide in README.md.',
          'Deploy a live clickable demo URL and record a 60-second fallback demo video.',
          'Quantify your impact in the first slide (who benefits, how fast, how scalable).',
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Judge audit failed.' }, { status: 500 });
  }
}
