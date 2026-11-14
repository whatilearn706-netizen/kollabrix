import { NextRequest, NextResponse } from 'next/server';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { inspectCodeSafety } from '@/lib/security/codeSandboxGuard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Judge0 Language IDs
const LANGUAGE_CONFIG: Record<string, { id: number; name: string }> = {
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  c: { id: 50, name: 'C (GCC 9.2.0)' },
  java: { id: 91, name: 'Java (JDK 17.0.6)' },
  python: { id: 92, name: 'Python (3.11.2)' },
  py: { id: 92, name: 'Python (3.11.2)' },
};

function normalizeJavaCode(code: string): string {
  // If user declared a public class with a name other than Main, change it to Main for Judge0
  if (/public\s+class\s+([A-Za-z0-9_$]+)/.test(code)) {
    return code.replace(/public\s+class\s+([A-Za-z0-9_$]+)/, (match, className) => {
      if (className === 'Main') return match;
      return 'public class Main';
    });
  }
  // If there is a class with main method but not public, ensure Main is accessible
  return code;
}

function cleanOutput(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

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
      userId,
      studentId,
    } = body;

    // User-ID rate limit allows 1000+ students on campus Wi-Fi without blocking each other
    const targetUserId = userId || studentId || null;
    const rateCheck = checkUserOrCampusRateLimit(
      targetUserId,
      ip,
      30, // 30 runs per minute per student
      60 * 1000,
      5000, // Campus NAT ceiling
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

    const langKey = language.toLowerCase().trim();
    const langConfig = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG['cpp'];

    let finalSource = rawCode;
    if (langKey === 'java') {
      finalSource = normalizeJavaCode(rawCode);
    }

    const b64Source = Buffer.from(finalSource).toString('base64');
    const b64Stdin = Buffer.from(stdin || '').toString('base64');
    const b64Expected = expectedOutput ? Buffer.from(cleanOutput(expectedOutput)).toString('base64') : null;

    // 1. Try dedicated AIC Cloud private compiler first (0ms queue, dedicated resources)
    let judge0Res: Response | null = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);
      judge0Res = await fetch('https://api.kollabrix.in/submissions?base64_encoded=true&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: b64Source,
          language_id: langConfig.id,
          stdin: b64Stdin,
          ...(b64Expected ? { expected_output: b64Expected } : {}),
          cpu_time_limit: 2.0,
          memory_limit: 256000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!judge0Res.ok) judge0Res = null;
    } catch {
      judge0Res = null;
    }

    // 2. Fallback to public Judge0 if private server is temporarily unreachable
    if (!judge0Res) {
      judge0Res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: b64Source,
          language_id: langConfig.id,
          stdin: b64Stdin,
          ...(b64Expected ? { expected_output: b64Expected } : {}),
          cpu_time_limit: 2.0,
          memory_limit: 256000,
        }),
      });
    }

    if (!judge0Res.ok) {
      const errText = await judge0Res.text();
      console.warn('Judge0 execution request failed:', judge0Res.status, errText);
      return NextResponse.json({
        success: false,
        error: 'Online compiler service temporarily busy. Please try again.',
        verdict: 'Runtime Error',
        details: errText,
      }, { status: 502 });
    }

    const result = await judge0Res.json();

    // Decode base64 outputs
    const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';
    const compileOutput = result.compile_output
      ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
      : '';
    const message = result.message ? Buffer.from(result.message, 'base64').toString('utf-8') : '';

    const statusId = result.status?.id;
    let statusDesc = result.status?.description || 'Unknown';

    let verdict: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Time Limit Exceeded' | 'Runtime Error' = 'Runtime Error';
    let passed = false;

    // Check compilation & syntax errors first
    const isPythonSyntaxError = stderr && (
      stderr.includes('SyntaxError') ||
      stderr.includes('IndentationError') ||
      stderr.includes('TabError')
    );

    if (statusId === 6 || isPythonSyntaxError || (compileOutput && !stdout && !stderr && statusId !== 3)) {
      verdict = 'Compilation Error';
      statusDesc = isPythonSyntaxError ? 'Syntax Error' : (statusDesc.includes('Compilation') ? statusDesc : 'Compilation Error');
      passed = false;
    } else if (statusId === 5) {
      verdict = 'Time Limit Exceeded';
      statusDesc = 'Time Limit Exceeded';
      passed = false;
    } else if ((statusId >= 7 && statusId <= 12) || (stderr && stderr.trim().length > 0)) {
      verdict = 'Runtime Error';
      statusDesc = statusDesc.includes('Runtime') ? statusDesc : 'Runtime Error (Exception / Non-zero Exit)';
      passed = false;
    } else if (statusId === 4) {
      verdict = 'Wrong Answer';
      statusDesc = 'Wrong Answer';
      passed = false;
    } else {
      // Process ran cleanly with exit code 0 (statusId === 3 or runner OK)
      const hasExpected = expectedOutput !== undefined && expectedOutput !== null && expectedOutput !== '';
      if (hasExpected) {
        const cleanGot = cleanOutput(stdout);
        const cleanExp = cleanOutput(expectedOutput);
        if (cleanGot === cleanExp) {
          verdict = 'Accepted';
          statusDesc = 'Accepted';
          passed = true;
        } else {
          verdict = 'Wrong Answer';
          statusDesc = 'Wrong Answer (Outputs did not match)';
          passed = false;
        }
      } else {
        // No expected output provided (e.g. ad-hoc run without expected)
        verdict = 'Accepted';
        statusDesc = 'Accepted';
        passed = true;
      }
    }

    // Format runtime & memory
    const execTime = result.time ? `${Math.round(parseFloat(result.time) * 1000)}ms` : '0ms';
    const memoryUsed = result.memory ? `${(result.memory / 1024).toFixed(1)}MB` : '0MB';

    return NextResponse.json({
      success: true,
      verdict,
      status: verdict,
      passed,
      language: langConfig.name,
      stdout,
      stderr,
      compileOutput,
      compile_output: compileOutput,
      compilerOutput: compileOutput,
      message,
      statusDescription: statusDesc,
      time: execTime,
      memory: memoryUsed,
      expectedOutput: expectedOutput || null,
      yourOutput: stdout || null,
    });
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
