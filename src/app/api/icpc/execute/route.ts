import { NextRequest, NextResponse } from 'next/server';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { inspectCodeSafety } from '@/lib/security/codeSandboxGuard';
import { executeWithJudge0 } from '@/lib/icpc/compilerRunner';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const {
      code,
      sourceCode,
      language = 'cpp',
      stdin = '',
      expectedOutput = '',
      cpuTimeLimit,
      memoryLimitMb,
      examMode = false,
      userId,
      studentId,
    } = body;

    // User-ID rate limit allows 1000+ students on campus Wi-Fi without blocking each other
    const targetUserId = userId || studentId || null;
    const rateCheck = checkUserOrCampusRateLimit(
      targetUserId,
      ip,
      50, // 50 runs per minute per student
      60 * 1000,
      10000, // Campus NAT ceiling
      60 * 1000
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit reached: You are submitting code too rapidly. Please wait a few seconds before testing again.',
          verdict: 'Rate Limited',
          status: 'Rate Limited',
        },
        { status: 429 }
      );
    }

    const rawCode = code || sourceCode || '';
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'No source code provided.',
          verdict: 'Compilation Error',
          status: 'Compilation Error',
          compileOutput: 'Empty source code submitted.',
          compile_output: 'Empty source code submitted.',
        },
        { status: 400 }
      );
    }

    // Pre-Execution Code Sandbox Guard
    const safety = inspectCodeSafety(rawCode, language);
    if (!safety.isSafe) {
      return NextResponse.json(
        {
          success: false,
          error: safety.reason,
          verdict: 'Runtime Error',
          status: 'Security Violation',
          compileOutput: safety.reason,
          compile_output: safety.reason,
          stderr: safety.reason,
        },
        { status: 400 }
      );
    }

    const result = await executeWithJudge0({
      sourceCode: rawCode,
      language,
      stdin,
      expectedOutput,
      cpuTimeLimit: Number(cpuTimeLimit) || 2.0,
      memoryLimitMb: Number(memoryLimitMb) || 256,
      examMode: Boolean(examMode),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: result.httpStatus || 502 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error executing code:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Code execution engine encountered an unexpected error.',
        verdict: 'Runtime Error',
        status: 'Runtime Error',
      },
      { status: 500 }
    );
  }
}
