import { NextRequest, NextResponse } from 'next/server';
import { callSparkLLM } from '@/lib/spark/aiClient';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`spark-explain:${ip}`, 30, 5 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      code = '',
      language = 'python',
      problemTitle = 'Coding Challenge',
      problemDescription = '',
      verdict = 'Wrong Answer',
      errorOutput = '',
      stdin = '',
      expectedOutput = '',
      yourOutput = '',
    } = body;

    if (!code.trim() && !errorOutput.trim()) {
      return NextResponse.json({ error: 'No code or error output provided.' }, { status: 400 });
    }

    const systemPrompt = `You are KΛ ΛI Tutor inside Kollabrix's coding compiler.
A student just ran their ${language} code and got "${verdict}".
Your job is to act like a Socratic coding coach — DO NOT dump the full solution code!
Instead, return ONLY valid JSON matching:
{
  "rootCause": "1-2 clear sentences explaining the exact bug, syntax error, or logic mismatch causing this failure.",
  "hint": "A crisp 2-line actionable hint telling them what line/condition to inspect or fix.",
  "complexityTip": "1 sentence on time/space complexity or edge cases (e.g. empty input, overflow, O(n^2) vs O(n))."
}`;

    const userPrompt = `Problem: ${problemTitle}
${problemDescription ? `Description: ${problemDescription.slice(0, 800)}` : ''}
Verdict: ${verdict}
${stdin ? `Input:\n${stdin.slice(0, 300)}` : ''}
${expectedOutput ? `Expected Output:\n${expectedOutput.slice(0, 300)}` : ''}
${yourOutput ? `Student Output:\n${yourOutput.slice(0, 300)}` : ''}
${errorOutput ? `Compiler / Console Diagnostics:\n${errorOutput.slice(0, 1000)}` : ''}

Student Code (${language}):
\`\`\`${language}
${code.slice(0, 3500)}
\`\`\``;

    const llmRes = await callSparkLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.35,
      timeoutMs: 15000,
    });

    if (llmRes?.text) {
      try {
        const parsed = JSON.parse(llmRes.text);
        return NextResponse.json({ success: true, explanation: parsed, engine: llmRes.engine });
      } catch {}
    }

    // Deterministic helpful fallback
    const isTle = verdict.toLowerCase().includes('time limit');
    const isCompile = verdict.toLowerCase().includes('compilation') || verdict.toLowerCase().includes('syntax');
    return NextResponse.json({
      success: true,
      engine: 'Kollabrix Diagnostics',
      explanation: {
        rootCause: isCompile
          ? 'Your code failed to compile or has a syntax/indentation issue before execution.'
          : isTle
          ? 'Your algorithm exceeded the time limit, usually caused by nested loops or an infinite loop.'
          : 'Your program exited cleanly, but the printed output format or edge-case logic did not match the expected output.',
        hint: isCompile
          ? 'Check the first line number mentioned in the compiler error for missing semicolons, brackets, or indentation.'
          : isTle
          ? 'Look for nested loops over N or a while loop whose condition never terminates; aim for O(N) or O(N log N) using a HashMap/Set.'
          : 'Compare your output whitespace, newline formatting, and boundary cases (0, negative numbers, single-element arrays) against the sample.',
        complexityTip: 'Always test with minimum bounds (N=0/1) and maximum constraints before submitting.',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error explanation failed.' }, { status: 500 });
  }
}
