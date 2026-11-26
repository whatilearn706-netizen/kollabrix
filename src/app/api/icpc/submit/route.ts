import { NextRequest, NextResponse } from 'next/server';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { inspectCodeSafety } from '@/lib/security/codeSandboxGuard';
import { executeWithJudge0 } from '@/lib/icpc/compilerRunner';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { IcpcContest, IcpcTestCase } from '@/types/icpc';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function resolveAuthoritativeTestCases(
  contestId?: string,
  problemId?: string,
  fallbackCases?: IcpcTestCase[]
): Promise<{ testCases: IcpcTestCase[]; cpuTimeLimit: number; memoryLimitMb: number; isExam: boolean }> {
  if (contestId && problemId) {
    try {
      const masterData = await getMasterControlSubkey<any>('icpc', { contests: [] });
      const masterContests: IcpcContest[] = Array.isArray(masterData?.contests) ? masterData.contests : [];
      const allContests = [...masterContests, ...CURATED_ICPC_CONTESTS];
      const contest = allContests.find((c) => c.id === contestId);
      const problem = contest?.problems?.find((p) => p.id === problemId);

      if (problem) {
        const cases =
          Array.isArray(problem.testCases) && problem.testCases.length > 0
            ? problem.testCases
            : [{ input: problem.sampleInput || '', output: problem.sampleOutput || '', isHidden: false }];

        const isExam = Boolean(
          contest &&
            contest.contestType !== 'practice' &&
            !(contest.endTime && new Date() >= new Date(contest.endTime))
        );

        return {
          testCases: cases,
          cpuTimeLimit: problem.timeLimit ? parseFloat(problem.timeLimit) || 2 : 2,
          memoryLimitMb: problem.memoryLimit ? parseInt(problem.memoryLimit, 10) || 256 : 256,
          isExam,
        };
      }
    } catch {
      // Fall back below if master config lookup fails
    }
  }

  return {
    testCases: Array.isArray(fallbackCases) ? fallbackCases : [],
    cpuTimeLimit: 2,
    memoryLimitMb: 256,
    isExam: false,
  };
}

/**
 * POST: Batch-evaluate all testcases for a problem in one request.
 * Runs Case #1 first to fail-fast on Compilation/Syntax errors, then evaluates
 * remaining cases concurrently with bounded worker pool (max 4 per submission).
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const {
      contestId,
      problemId,
      sourceCode,
      code,
      language = 'cpp',
      testCases: clientCases,
      examMode: clientExamMode,
      userId,
      studentId,
    } = body;

    const targetUserId = userId || studentId || null;
    const rateCheck = checkUserOrCampusRateLimit(
      targetUserId,
      ip,
      30, // 30 full submissions per minute per student
      60 * 1000,
      10000,
      60 * 1000
    );

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit reached: Please wait a few seconds before submitting again.',
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
        },
        { status: 400 }
      );
    }

    const safety = inspectCodeSafety(rawCode, language);
    if (!safety.isSafe) {
      return NextResponse.json(
        {
          success: false,
          error: safety.reason,
          verdict: 'Runtime Error',
          status: 'Security Violation',
          compileOutput: safety.reason,
          stderr: safety.reason,
        },
        { status: 400 }
      );
    }

    const resolved = await resolveAuthoritativeTestCases(contestId, problemId, clientCases);
    const testCases = resolved.testCases;
    const examMode = typeof clientExamMode === 'boolean' ? clientExamMode : resolved.isExam;

    if (!testCases || testCases.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No testcases found for this problem.' },
        { status: 400 }
      );
    }

    // 1. Run Testcase #1 first to fail fast on Compilation / Syntax errors
    const firstCase = testCases[0];
    const firstRes = await executeWithJudge0({
      sourceCode: rawCode,
      language,
      stdin: firstCase.input,
      expectedOutput: firstCase.output,
      cpuTimeLimit: resolved.cpuTimeLimit,
      memoryLimitMb: resolved.memoryLimitMb,
      examMode,
    });

    if (!firstRes.success) {
      return NextResponse.json(firstRes, { status: firstRes.httpStatus || 502 });
    }

    if (!firstRes.passed) {
      const isHidden = Boolean(firstCase.isHidden);
      return NextResponse.json({
        success: true,
        passed: false,
        verdict: firstRes.verdict,
        status: firstRes.status,
        statusDescription: firstRes.statusDescription,
        passedCount: 0,
        totalCount: testCases.length,
        failedCaseIndex: 1,
        failedIsHidden: isHidden,
        maxTime: firstRes.time,
        maxMemory: firstRes.memory,
        stdout: isHidden ? null : firstRes.stdout,
        stderr: firstRes.stderr,
        compileOutput: firstRes.compileOutput,
        failedInput: isHidden ? null : firstCase.input,
        failedExpected: isHidden ? null : firstCase.output,
      });
    }

    // 2. Run remaining testcases in parallel with bounded concurrency (4)
    const remaining = testCases.slice(1);
    const allResults = [firstRes];
    const BATCH_CONCURRENCY = 4;

    for (let offset = 0; offset < remaining.length; offset += BATCH_CONCURRENCY) {
      const slice = remaining.slice(offset, offset + BATCH_CONCURRENCY);
      const batchRes = await Promise.all(
        slice.map((tc) =>
          executeWithJudge0({
            sourceCode: rawCode,
            language,
            stdin: tc.input,
            expectedOutput: tc.output,
            cpuTimeLimit: resolved.cpuTimeLimit,
            memoryLimitMb: resolved.memoryLimitMb,
            examMode,
          })
        )
      );

      for (let j = 0; j < batchRes.length; j++) {
        const res = batchRes[j];
        const caseIdx = offset + j + 1;
        const tc = testCases[caseIdx];

        if (!res.success) {
          return NextResponse.json(res, { status: res.httpStatus || 502 });
        }

        allResults.push(res);

        if (!res.passed) {
          const isHidden = Boolean(tc.isHidden);
          return NextResponse.json({
            success: true,
            passed: false,
            verdict: res.verdict,
            status: res.status,
            statusDescription: res.statusDescription,
            passedCount: caseIdx,
            totalCount: testCases.length,
            failedCaseIndex: caseIdx + 1,
            failedIsHidden: isHidden,
            maxTime: res.time,
            maxMemory: res.memory,
            stdout: isHidden ? null : res.stdout,
            stderr: res.stderr,
            compileOutput: res.compileOutput,
            failedInput: isHidden ? null : tc.input,
            failedExpected: isHidden ? null : tc.output,
          });
        }
      }
    }

    const maxTimeMs = Math.max(...allResults.map((r) => r.timeMs || 0));
    const maxMemKb = Math.max(...allResults.map((r) => r.memoryKb || 0));

    return NextResponse.json({
      success: true,
      passed: true,
      verdict: 'Accepted',
      status: 'Accepted',
      statusDescription: 'All testcases passed',
      passedCount: testCases.length,
      totalCount: testCases.length,
      failedCaseIndex: null,
      failedIsHidden: false,
      maxTime: `${maxTimeMs}ms`,
      maxMemory: `${(maxMemKb / 1024).toFixed(1)}MB`,
      stdout: null,
      stderr: '',
      compileOutput: '',
    });
  } catch (err: any) {
    console.error('Error in batch /api/icpc/submit:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Batch submission judge encountered an unexpected error.',
        verdict: 'Runtime Error',
        status: 'Runtime Error',
      },
      { status: 500 }
    );
  }
}
