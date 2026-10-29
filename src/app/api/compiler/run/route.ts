import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CompileRequest {
  language: 'java' | 'cpp' | 'python' | 'javascript' | 'c';
  code: string;
  stdin?: string;
}

// Judge0 Language IDs (high-speed container execution)
const JUDGE0_LANGUAGES: Record<string, number> = {
  cpp: 54, // GCC 9.2.0
  c: 50,   // GCC 9.2.0
  java: 91, // JDK 17.0.6
  python: 92, // Python 3.11.2
  py: 92,
  javascript: 93, // Node.js 18.15.0
  js: 93,
};

const WANDBOX_COMPILERS: Record<string, string> = {
  java: 'openjdk-jdk-21+35',
  cpp: 'gcc-13.2.0',
  c: 'gcc-13.2.0-c',
  python: 'cpython-3.12.7',
  javascript: 'nodejs-20.17.0',
};

/**
 * Normalizes Java code to match Judge0 entry-point conventions.
 * If user creates a custom class name or non-public Main, ensures public class Main exists.
 */
function normalizeJavaCode(code: string): string {
  if (/public\s+class\s+([A-Za-z0-9_$]+)/.test(code)) {
    return code.replace(/public\s+class\s+([A-Za-z0-9_$]+)/, 'public class Main');
  }
  if (!/class\s+Main/.test(code) && /class\s+([A-Za-z0-9_$]+)/.test(code)) {
    return code.replace(/class\s+([A-Za-z0-9_$]+)/, 'class Main');
  }
  return code;
}

/**
 * Fast-path in-process execution for JavaScript when no stdin is required.
 * Returns in < 5ms with full standard library support.
 */
function executeJavaScriptInVm(code: string, startTime: number) {
  const logs: string[] = [];
  const errLogs: string[] = [];

  const sandbox = {
    console: {
      log: (...args: any[]) =>
        logs.push(args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ')),
      info: (...args: any[]) =>
        logs.push(args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ')),
      warn: (...args: any[]) =>
        logs.push(args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args: any[]) =>
        errLogs.push(args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ')),
    },
    Math,
    Date,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    String,
    Number,
    Array,
    Object,
    JSON,
    Boolean,
    RegExp,
    Map,
    Set,
    Promise,
    BigInt,
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(code, context, { timeout: 2500 });

  const stdout = logs.join('\n');
  const stderr = errLogs.join('\n');

  return {
    success: errLogs.length === 0,
    exitCode: errLogs.length === 0 ? 0 : 1,
    stdout,
    stderr: stderr || undefined,
    executionTimeMs: Date.now() - startTime,
    engine: 'instant-vm',
  };
}

/**
 * Execute code using Judge0 CE high-speed compiler engine (~1-2s latency).
 */
async function executeWithJudge0(language: string, code: string, stdin: string, startTime: number) {
  const langKey = language.toLowerCase().trim();
  const langId = JUDGE0_LANGUAGES[langKey] || JUDGE0_LANGUAGES.cpp;

  let finalCode = code;
  if (langKey === 'java') {
    finalCode = normalizeJavaCode(code);
  }

  const b64Source = Buffer.from(finalCode).toString('base64');
  const b64Stdin = Buffer.from(stdin || '').toString('base64');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: b64Source,
      language_id: langId,
      stdin: b64Stdin,
      cpu_time_limit: 3.0,
      memory_limit: 256000,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Judge0 returned HTTP ${res.status}`);
  }

  const result = await res.json();
  const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim() : '';
  const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8').trim() : '';
  const compileOutput = result.compile_output
    ? Buffer.from(result.compile_output, 'base64').toString('utf-8').trim()
    : '';

  const exitCode = result.status?.id === 3 ? 0 : 1;
  const errorMsg = compileOutput || stderr || (exitCode !== 0 ? result.status?.description : undefined);

  return {
    success: exitCode === 0,
    exitCode,
    stdout,
    stderr: errorMsg,
    executionTimeMs: Date.now() - startTime,
    engine: 'judge0-fast',
  };
}

/**
 * Fallback execution via Wandbox in case Judge0 is temporarily unavailable.
 */
async function executeWithWandbox(language: string, code: string, stdin: string, startTime: number) {
  const compiler = WANDBOX_COMPILERS[language] || WANDBOX_COMPILERS.python;
  let processedCode = code;
  if (language === 'java') {
    processedCode = processedCode.replace(/public\s+class\s+([A-Za-z0-9_$]+)/g, 'class $1');
  }

  const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler,
      code: processedCode,
      stdin,
      'compiler-option-raw': language === 'cpp' ? '-std=c++20' : undefined,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!wandboxRes.ok) {
    const errText = await wandboxRes.text().catch(() => '');
    throw new Error(`Wandbox HTTP ${wandboxRes.status}: ${errText}`);
  }

  const result = await wandboxRes.json();
  const stdout = (result.program_output || result.program_message || '').trim();
  const stderr = (result.compiler_error || result.compiler_message || result.program_error || '').trim();
  const exitCode = result.status === '0' || result.status === 0 ? 0 : 1;

  return {
    success: exitCode === 0,
    exitCode,
    stdout,
    stderr: exitCode === 0 && !stderr ? undefined : stderr,
    executionTimeMs: Date.now() - startTime,
    engine: 'wandbox-fallback',
  };
}

/**
 * POST /api/compiler/run
 * High-speed multi-tiered code compilation and execution endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CompileRequest = await req.json();
    const { language, code, stdin = '' } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // 1. Fast path for JavaScript (Instant execution)
    if (language === 'javascript' && !stdin) {
      try {
        const vmResult = executeJavaScriptInVm(code, startTime);
        return NextResponse.json(vmResult);
      } catch (e: any) {
        // Syntax or runtime exception in VM
        if (e && e.message && !e.message.includes('timed out')) {
          return NextResponse.json({
            success: false,
            exitCode: 1,
            stdout: '',
            stderr: e.message,
            executionTimeMs: Date.now() - startTime,
          });
        }
      }
    }

    // 2. High-speed compilation via Judge0 CE (~1-2s)
    try {
      const judge0Result = await executeWithJudge0(language, code, stdin, startTime);
      return NextResponse.json(judge0Result);
    } catch (j0Error) {
      console.warn('Judge0 compilation failed, falling back to Wandbox:', j0Error);
    }

    // 3. Fallback to Wandbox
    try {
      const wandboxResult = await executeWithWandbox(language, code, stdin, startTime);
      return NextResponse.json(wandboxResult);
    } catch (wbError: any) {
      console.error('All compiler engines failed:', wbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Compiler servers are currently busy. Please try running again in a moment.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Compiler run error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Execution error occurred.',
      },
      { status: 500 }
    );
  }
}
