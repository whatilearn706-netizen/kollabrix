import { NextRequest, NextResponse } from 'next/server';

interface CompileRequest {
  language: 'java' | 'cpp' | 'python' | 'javascript' | 'c';
  code: string;
  stdin?: string;
}

const WANDBOX_COMPILERS: Record<string, string> = {
  java: 'openjdk-jdk-21+35',
  cpp: 'gcc-13.2.0',
  c: 'gcc-13.2.0-c',
  python: 'cpython-3.12.7',
  javascript: 'nodejs-20.17.0',
};

export async function POST(req: NextRequest) {
  try {
    const body: CompileRequest = await req.json();
    const { language, code, stdin = '' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const compiler = WANDBOX_COMPILERS[language] || WANDBOX_COMPILERS.python;

    // Sanitize code for specific compilers
    let processedCode = code;
    if (language === 'java') {
      // Wandbox compiles as prog.java; replace "public class <AnyName>" with "class <AnyName>"
      processedCode = processedCode.replace(/public\s+class\s+([A-Za-z0-9_$]+)/g, 'class $1');
    }

    const startTime = Date.now();

    const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler,
        code: processedCode,
        stdin,
        'compiler-option-raw': language === 'cpp' ? '-std=c++20' : undefined,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const elapsed = Date.now() - startTime;

    if (!wandboxRes.ok) {
      const errText = await wandboxRes.text().catch(() => '');
      return NextResponse.json({
        success: false,
        error: `Compiler service returned HTTP ${wandboxRes.status}: ${errText}`,
      });
    }

    const result = await wandboxRes.json();

    const stdout = (result.program_output || result.program_message || '').trim();
    const stderr = (result.compiler_error || result.compiler_message || result.program_error || '').trim();
    const exitCode = result.status === '0' || result.status === 0 ? 0 : 1;

    return NextResponse.json({
      success: exitCode === 0,
      exitCode,
      stdout,
      stderr: exitCode === 0 && !stderr ? undefined : stderr,
      executionTimeMs: elapsed,
    });
  } catch (error: any) {
    console.error('Compiler run error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Execution timed out or compiler server was unreachable.',
      },
      { status: 500 }
    );
  }
}
