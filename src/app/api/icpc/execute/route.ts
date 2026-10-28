import { NextRequest, NextResponse } from 'next/server';

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
  return str.replace(/\r\n/g, '\n').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      sourceCode,
      language = 'cpp',
      stdin = '',
      expectedOutput = '',
    } = body;

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

    const langKey = language.toLowerCase().trim();
    const langConfig = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG['cpp'];

    let finalSource = rawCode;
    if (langKey === 'java') {
      finalSource = normalizeJavaCode(code);
    }

    const b64Source = Buffer.from(finalSource).toString('base64');
    const b64Stdin = Buffer.from(stdin || '').toString('base64');
    const b64Expected = expectedOutput ? Buffer.from(cleanOutput(expectedOutput)).toString('base64') : null;

    // Call Judge0 CE public engine with base64 encoding enabled
    const judge0Res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
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
    const statusDesc = result.status?.description || 'Unknown';

    let verdict: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Time Limit Exceeded' | 'Runtime Error' = 'Runtime Error';
    let passed = false;

    if (statusId === 6) {
      verdict = 'Compilation Error';
    } else if (statusId === 5) {
      verdict = 'Time Limit Exceeded';
    } else if (statusId >= 7 && statusId <= 12) {
      verdict = 'Runtime Error';
    } else if (statusId === 3) {
      // Judge0 accepted (or outputs matched)
      verdict = 'Accepted';
      passed = true;
    } else if (statusId === 4) {
      verdict = 'Wrong Answer';
    } else {
      // If no expected output was supplied, determine based on presence of stderr
      if (!expectedOutput) {
        if (!stderr && !compileOutput) {
          verdict = 'Accepted';
          passed = true;
        } else {
          verdict = stderr ? 'Runtime Error' : 'Compilation Error';
        }
      } else {
        // Compare outputs manually
        const cleanGot = cleanOutput(stdout);
        const cleanExp = cleanOutput(expectedOutput);
        if (cleanGot === cleanExp) {
          verdict = 'Accepted';
          passed = true;
        } else {
          verdict = 'Wrong Answer';
        }
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
