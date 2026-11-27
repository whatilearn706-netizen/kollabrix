import { NextRequest, NextResponse } from 'next/server';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { inspectCodeSafety } from '@/lib/security/codeSandboxGuard';
import { executeWithJudge0 } from '@/lib/icpc/compilerRunner';
import { callSparkLLM } from '@/lib/spark/aiClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface AutoHealAttempt {
  attempt: number;
  status: string;
  passed: boolean;
  output: string;
  time?: string;
  fixNote?: string;
}

function isRunSuccessful(res: any): boolean {
  if (!res || !res.success) return false;
  const st = String(res.status || res.verdict || '').toLowerCase();
  if (st.includes('error') || st.includes('wrong') || st.includes('exceeded') || st.includes('violation')) {
    return false;
  }
  if (res.compileOutput || res.compile_output) return false;
  if (res.stderr && String(res.stderr).trim().length > 0 && st !== 'accepted') return false;
  return st === 'accepted' || Boolean(res.stdout !== undefined && !res.stderr);
}

function extractPatchedCode(rawText: string, fallback: string): string {
  const blockMatch = rawText.match(/```[\w+-]*\n([\s\S]*?)```/);
  if (blockMatch && blockMatch[1]?.trim()) {
    return blockMatch[1].trim();
  }
  const cleaned = rawText.replace(/^```[\w+-]*\n?/i, '').replace(/```\s*$/i, '').trim();
  return cleaned.length > 5 ? cleaned : fallback;
}

/**
 * Auto-Verify & Auto-Heal Sandbox Runner:
 * Executes code in Judge0 -> if compilation/runtime fails, feeds exact stderr/output
 * back into KΛ AI to patch the bug -> re-runs in Judge0 until verified or max attempts reached.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkUserOrCampusRateLimit(null, ip, 20, 60 * 1000, 3000, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait a few seconds.' }, { status: 429 });
    }

    const body = await request.json();
    const {
      code = '',
      language = 'python',
      stdin = '',
      expectedOutput = '',
      problemHint = '',
    } = body as {
      code: string;
      language: string;
      stdin?: string;
      expectedOutput?: string;
      problemHint?: string;
    };

    if (!code.trim()) {
      return NextResponse.json({ error: 'Code cannot be empty.' }, { status: 400 });
    }

    let currentCode = code;
    const attempts: AutoHealAttempt[] = [];
    let lastResult: any = null;

    for (let i = 1; i <= 3; i++) {
      const safety = inspectCodeSafety(currentCode, language);
      if (!safety.isSafe) {
        return NextResponse.json(
          {
            verified: false,
            error: safety.reason,
            finalCode: currentCode,
            attempts,
          },
          { status: 400 }
        );
      }

      const execRes = await executeWithJudge0({
        sourceCode: currentCode,
        language,
        stdin,
        expectedOutput,
        cpuTimeLimit: 2.0,
        memoryLimitMb: 256,
        examMode: false,
      });
      lastResult = execRes;

      const outText = String(
        execRes.stdout || execRes.compileOutput || execRes.compile_output || execRes.stderr || execRes.error || '(no output)'
      ).trim();

      const passed = isRunSuccessful(execRes);
      attempts.push({
        attempt: i,
        status: execRes.status || execRes.verdict || (passed ? 'Accepted' : 'Error'),
        passed,
        output: outText,
        time: execRes.time,
      });

      if (passed) {
        return NextResponse.json({
          success: true,
          verified: true,
          healed: i > 1,
          finalCode: currentCode,
          stdout: execRes.stdout || outText,
          time: execRes.time,
          status: execRes.status || 'Accepted',
          attempts,
        });
      }

      if (i === 3) break;

      // Feed real compiler/runtime error back to KΛ AI to auto-patch
      const fixPrompt = `You are KΛ Auto-Heal Sandbox Debugger.
The following ${language} code failed execution inside Kollabrix's Judge0 compiler.
${problemHint ? `Goal/Context: ${problemHint}\n` : ''}${stdin ? `Stdin:\n${stdin}\n` : ''}${
        expectedOutput ? `Expected Output:\n${expectedOutput}\n` : ''
      }
Compiler / Runtime Status: ${execRes.status || execRes.verdict}
Error / Output:
${outText.slice(0, 1200)}

Broken Code:
\`\`\`${language}
${currentCode}
\`\`\`

Fix the bug cleanly so it compiles and passes cleanly with valid output. Return ONLY JSON:
{
  "fixNote": "1 crisp sentence explaining what was fixed",
  "patchedCode": "complete fixed runnable source code"
}`;

      const llmFix = await callSparkLLM({
        systemPrompt: 'Fix the failing source code cleanly and return valid JSON with fixNote and patchedCode.',
        userPrompt: fixPrompt,
        jsonMode: true,
        temperature: 0.2,
        tier: 'fast',
      });

      let patched = '';
      let fixNote = 'Patched syntax/runtime bug and re-verified.';
      if (llmFix?.text) {
        try {
          const cleaned = llmFix.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed?.patchedCode) patched = String(parsed.patchedCode).trim();
          if (parsed?.fixNote) fixNote = String(parsed.fixNote).trim();
        } catch {
          patched = extractPatchedCode(llmFix.text, currentCode);
        }
      }

      if (!patched || patched === currentCode) {
        break;
      }

      attempts[attempts.length - 1].fixNote = fixNote;
      currentCode = patched;
    }

    return NextResponse.json({
      success: true,
      verified: false,
      healed: false,
      finalCode: currentCode,
      stdout: lastResult?.stdout || '',
      stderr: lastResult?.compileOutput || lastResult?.stderr || lastResult?.error || 'Execution failed.',
      status: lastResult?.status || 'Error',
      attempts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Auto-heal verification failed.' }, { status: 500 });
  }
}
