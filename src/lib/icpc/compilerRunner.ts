/**
 * Shared ICPC / Practice IDE Judge0 Execution Runner
 * - Enforces an in-memory concurrency queue for the private VPS compiler (127.0.0.1:2358)
 * - Supports examMode to strictly block fallback to public ce.judge0.com during proctored exams
 */

export const LANGUAGE_CONFIG: Record<string, { id: number; name: string }> = {
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  c: { id: 50, name: 'C (GCC 9.2.0)' },
  java: { id: 91, name: 'Java (JDK 17.0.6)' },
  python: { id: 92, name: 'Python (3.11.2)' },
  py: { id: 92, name: 'Python (3.11.2)' },
};

const MAX_CONCURRENT_PRIVATE = 8;
const QUEUE_WAIT_TIMEOUT_MS = 15000;
const PRIVATE_COMPILER_URL = 'http://127.0.0.1:2358/submissions?base64_encoded=true&wait=true';
const PUBLIC_FALLBACK_URL = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';

let activeJobs = 0;
const waitQueue: Array<() => void> = [];

async function acquireCompilerSlot(): Promise<boolean> {
  if (activeJobs < MAX_CONCURRENT_PRIVATE) {
    activeJobs++;
    return true;
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        const idx = waitQueue.indexOf(grant);
        if (idx >= 0) waitQueue.splice(idx, 1);
        resolve(false);
      }
    }, QUEUE_WAIT_TIMEOUT_MS);

    const grant = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        activeJobs++;
        resolve(true);
      }
    };

    waitQueue.push(grant);
  });
}

function releaseCompilerSlot() {
  activeJobs = Math.max(0, activeJobs - 1);
  const next = waitQueue.shift();
  if (next) next();
}

export function normalizeJavaCode(code: string): string {
  if (/public\s+class\s+([A-Za-z0-9_$]+)/.test(code)) {
    return code.replace(/public\s+class\s+([A-Za-z0-9_$]+)/, (match, className) => {
      if (className === 'Main') return match;
      return 'public class Main';
    });
  }
  return code;
}

export function cleanOutput(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export interface ExecuteJudgeParams {
  sourceCode: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimit?: number;
  memoryLimitMb?: number;
  examMode?: boolean;
}

export interface ExecuteJudgeResult {
  success: boolean;
  verdict: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Time Limit Exceeded' | 'Runtime Error' | 'Judge Busy';
  status: string;
  passed: boolean;
  language: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  compile_output: string;
  compilerOutput: string;
  message: string;
  statusDescription: string;
  time: string;
  timeMs: number;
  memory: string;
  memoryKb: number;
  expectedOutput: string | null;
  yourOutput: string | null;
  error?: string;
  httpStatus?: number;
}

/**
 * Executes a single testcase against the private multi-core Judge0 compiler with queue control.
 */
export async function executeWithJudge0(params: ExecuteJudgeParams): Promise<ExecuteJudgeResult> {
  const {
    sourceCode,
    language,
    stdin = '',
    expectedOutput = '',
    cpuTimeLimit = 2.0,
    memoryLimitMb = 256,
    examMode = false,
  } = params;

  const langKey = (language || 'cpp').toLowerCase().trim();
  const langConfig = LANGUAGE_CONFIG[langKey] || LANGUAGE_CONFIG.cpp;
  const finalSource = langKey === 'java' ? normalizeJavaCode(sourceCode) : sourceCode;

  const b64Source = Buffer.from(finalSource).toString('base64');
  const b64Stdin = Buffer.from(stdin || '').toString('base64');
  const b64Expected = expectedOutput ? Buffer.from(cleanOutput(expectedOutput)).toString('base64') : null;

  const payloadBody = JSON.stringify({
    source_code: b64Source,
    language_id: langConfig.id,
    stdin: b64Stdin,
    ...(b64Expected ? { expected_output: b64Expected } : {}),
    cpu_time_limit: Math.min(Math.max(cpuTimeLimit || 2.0, 0.5), 10.0),
    memory_limit: Math.min(Math.max(memoryLimitMb || 256, 64), 512) * 1000,
  });

  let judge0Res: Response | null = null;
  const gotSlot = await acquireCompilerSlot();

  if (gotSlot) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      judge0Res = await fetch(PRIVATE_COMPILER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadBody,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!judge0Res.ok) judge0Res = null;
    } catch {
      judge0Res = null;
    } finally {
      releaseCompilerSlot();
    }
  }

  // Exam-Mode Guard: never send proctored exam code to public ce.judge0.com
  if (!judge0Res) {
    if (examMode) {
      return {
        success: false,
        verdict: 'Judge Busy',
        status: 'Judge Busy',
        passed: false,
        language: langConfig.name,
        stdout: '',
        stderr: '',
        compileOutput: '',
        compile_output: '',
        compilerOutput: '',
        message: 'Private exam compiler is temporarily busy. Please retry in a few seconds.',
        statusDescription: 'Private Exam Compiler Busy',
        time: '0ms',
        timeMs: 0,
        memory: '0MB',
        memoryKb: 0,
        expectedOutput: null,
        yourOutput: null,
        error: 'Private exam compiler is temporarily busy. Please retry in a few seconds.',
        httpStatus: 503,
      };
    }

    // Non-exam casual practice fallback
    try {
      judge0Res = await fetch(PUBLIC_FALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadBody,
      });
    } catch {
      judge0Res = null;
    }
  }

  if (!judge0Res || !judge0Res.ok) {
    return {
      success: false,
      verdict: 'Runtime Error',
      status: 'Runtime Error',
      passed: false,
      language: langConfig.name,
      stdout: '',
      stderr: '',
      compileOutput: '',
      compile_output: '',
      compilerOutput: '',
      message: 'Online compiler service temporarily busy. Please try again.',
      statusDescription: 'Compiler Unavailable',
      time: '0ms',
      timeMs: 0,
      memory: '0MB',
      memoryKb: 0,
      expectedOutput: null,
      yourOutput: null,
      error: 'Online compiler service temporarily busy. Please try again.',
      httpStatus: 502,
    };
  }

  const result = await judge0Res.json();

  const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '';
  const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '';
  const compileOutput = result.compile_output
    ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
    : '';
  const message = result.message ? Buffer.from(result.message, 'base64').toString('utf-8') : '';

  const statusId = result.status?.id;
  let statusDesc = result.status?.description || 'Unknown';
  let verdict: ExecuteJudgeResult['verdict'] = 'Runtime Error';
  let passed = false;

  const isPythonSyntaxError = Boolean(
    stderr &&
      (stderr.includes('SyntaxError') ||
        stderr.includes('IndentationError') ||
        stderr.includes('TabError'))
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
    const hasExpected = expectedOutput !== undefined && expectedOutput !== null && expectedOutput !== '';
    if (hasExpected) {
      if (cleanOutput(stdout) === cleanOutput(expectedOutput)) {
        verdict = 'Accepted';
        statusDesc = 'Accepted';
        passed = true;
      } else {
        verdict = 'Wrong Answer';
        statusDesc = 'Wrong Answer (Outputs did not match)';
        passed = false;
      }
    } else {
      verdict = 'Accepted';
      statusDesc = 'Accepted';
      passed = true;
    }
  }

  const timeMs = result.time ? Math.round(parseFloat(result.time) * 1000) : 0;
  const memoryKb = result.memory ? Number(result.memory) : 0;

  return {
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
    time: `${timeMs}ms`,
    timeMs,
    memory: `${(memoryKb / 1024).toFixed(1)}MB`,
    memoryKb,
    expectedOutput: expectedOutput || null,
    yourOutput: stdout || null,
  };
}
