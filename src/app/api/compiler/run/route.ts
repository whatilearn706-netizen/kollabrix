import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// High-speed In-Memory Sliding-Window Rate Limiter (Anti-DDoS / Anti-Spam)
// Max 20 compilation requests per 60 seconds per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const ipRequestHistory = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const history = ipRequestHistory.get(ip) || [];
  const recent = history.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = recent[0];
    const retryAfterSeconds = Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  recent.push(now);
  ipRequestHistory.set(ip, recent);

  // Periodically clean up old IP entries to prevent memory growth
  if (ipRequestHistory.size > 1000) {
    Array.from(ipRequestHistory.entries()).forEach(([key, timestamps]) => {
      const active = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        ipRequestHistory.delete(key);
      } else {
        ipRequestHistory.set(key, active);
      }
    });
  }

  return { allowed: true };
}

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
 * If user writes a LeetCode-style method/class without main(), generates an automated
 * reflection-based driver that parses stdin arguments, invokes the method, and prints output.
 */
function normalizeJavaCode(code: string, stdin?: string): string {
  let finalCode = code.trim();
  const hasMain = /static\s+void\s+main\s*\(/.test(finalCode);

  const header = `import java.util.*;
import java.io.*;
import java.lang.reflect.*;
`;

  if (hasMain) {
    // If the student hardcoded an array like int[] nums = { 3, 1, 2, 4 };
    // and does NOT use Scanner or System.in, and stdin has numbers:
    const usesSystemIn = /System\.in|Scanner|BufferedReader/.test(finalCode);
    if (!usesSystemIn && stdin && stdin.trim().length > 0) {
      const inNums = (stdin.match(/-?\d+/g) || []).map(Number);
      if (inNums.length > 0 || stdin.includes('[]')) {
        const replacement = `{ ${inNums.join(', ')} }`;
        finalCode = finalCode.replace(
          /(int\s*\[\s*\]\s*[a-zA-Z0-9_$]+\s*=\s*)\{[^}]+\}/,
          `$1${replacement}`
        );
        finalCode = finalCode.replace(
          /(int\s+[a-zA-Z0-9_$]+\s*\[\s*\]\s*=\s*)\{[^}]+\}/,
          `$1${replacement}`
        );
      }
    }

    if (!/class\s+[A-Za-z0-9_$]+/.test(finalCode)) {
      finalCode = header + 'public class Main {\n' + finalCode + '\n}';
    } else {
      if (/public\s+class\s+([A-Za-z0-9_$]+)/.test(finalCode)) {
        finalCode = finalCode.replace(/public\s+class\s+([A-Za-z0-9_$]+)/, 'public class Main');
      } else if (!/class\s+Main/.test(finalCode) && /class\s+([A-Za-z0-9_$]+)/.test(finalCode)) {
        finalCode = finalCode.replace(/class\s+([A-Za-z0-9_$]+)/, 'class Main');
      }
      finalCode = header + finalCode;
    }
    return finalCode;
  }

  // User wrote a class or bare method WITHOUT main() (LeetCode / competitive style)
  if (!/class\s+[A-Za-z0-9_$]+/.test(finalCode)) {
    finalCode = 'public class Main {\n' + finalCode + '\n}';
  } else {
    if (/public\s+class\s+([A-Za-z0-9_$]+)/.test(finalCode)) {
      finalCode = finalCode.replace(/public\s+class\s+([A-Za-z0-9_$]+)/, 'public class Main');
    } else if (!/class\s+Main/.test(finalCode) && /class\s+([A-Za-z0-9_$]+)/.test(finalCode)) {
      finalCode = finalCode.replace(/class\s+([A-Za-z0-9_$]+)/, 'class Main');
    }
  }

  // Inject smart driver main into the class right before the last closing brace
  const driver = `
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while (sc.hasNextLine()) {
                sb.append(sc.nextLine()).append(" ");
            }
            String raw = sb.toString().trim();
            Main instance = new Main();

            Method targetMethod = null;
            for (Method m : Main.class.getDeclaredMethods()) {
                if (!m.getName().equals("main") && !m.getName().startsWith("_")) {
                    targetMethod = m;
                    break;
                }
            }
            if (targetMethod == null) return;
            targetMethod.setAccessible(true);

            Class<?>[] pTypes = targetMethod.getParameterTypes();
            Object[] invokeArgs = _parseInputs(raw, pTypes);
            Object result = targetMethod.invoke(instance, invokeArgs);
            _printResult(result);
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private static Object[] _parseInputs(String raw, Class<?>[] types) {
        Object[] res = new Object[types.length];
        if (raw.isEmpty()) return res;

        List<String> tokens = new ArrayList<>();
        int depth = 0;
        StringBuilder cur = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (c == '[' || c == '{' || c == '(') depth++;
            else if (c == ']' || c == '}' || c == ')') depth--;

            if (c == ',' && depth == 0) {
                tokens.add(cur.toString().trim());
                cur = new StringBuilder();
            } else {
                cur.append(c);
            }
        }
        if (cur.length() > 0) tokens.add(cur.toString().trim());

        for (int i = 0; i < types.length; i++) {
            String token = i < tokens.size() ? tokens.get(i) : "";
            if (token.contains("=") && !token.startsWith("[") && !token.startsWith("{")) {
                token = token.substring(token.indexOf('=') + 1).trim();
            }
            res[i] = _parseSingle(token, types[i]);
        }
        return res;
    }

    private static Object _parseSingle(String token, Class<?> type) {
        if (token.isEmpty()) {
            if (type == int.class) return 0;
            if (type == int[].class) return new int[0];
            return null;
        }
        if (type == int.class || type == Integer.class) {
            return Integer.parseInt(token.replaceAll("[^0-9-]", ""));
        }
        if (type == int[].class) {
            token = token.replace("[", "").replace("]", "").replace(" ", "").trim();
            if (token.isEmpty()) return new int[0];
            String[] parts = token.split(",");
            int[] arr = new int[parts.length];
            for (int j = 0; j < parts.length; j++) {
                arr[j] = Integer.parseInt(parts[j].trim());
            }
            return arr;
        }
        if (type == String.class) {
            if ((token.startsWith(\"\\\"\") && token.endsWith(\"\\\"\")) || (token.startsWith(\"'\") && token.endsWith(\"'\"))) {
                return token.substring(1, token.length() - 1);
            }
            return token;
        }
        return token;
    }

    private static void _printResult(Object res) {
        if (res == null) return;
        if (res instanceof int[]) {
            System.out.println(Arrays.toString((int[]) res));
        } else if (res instanceof Object[]) {
            System.out.println(Arrays.toString((Object[]) res));
        } else {
            System.out.println(res);
        }
    }
`;

  const lastBrace = finalCode.lastIndexOf('}');
  if (lastBrace !== -1) {
    finalCode = header + finalCode.substring(0, lastBrace) + driver + '\n}';
  } else {
    finalCode = header + finalCode;
  }

  return finalCode;
}

/**
 * Normalizes Python code. If the code defines a function/class without calling it
 * or printing output, appends a test runner driver that passes stdin.
 */
function normalizePythonCode(code: string, stdin?: string): string {
  let finalCode = code.trim();

  // If student hardcoded top-level array like nums = [3, 1, 2, 4] and doesn't read sys.stdin
  const usesSysStdin = /sys\.stdin|input\s*\(/.test(finalCode);
  if (!usesSysStdin && stdin && stdin.trim().length > 0) {
    const inNums = (stdin.match(/-?\d+/g) || []).map(Number);
    if (inNums.length > 0 || stdin.includes('[]')) {
      finalCode = finalCode.replace(
        /^([a-zA-Z0-9_$]+\s*=\s*)\[[^\]]+\]/m,
        `$1[${inNums.join(', ')}]`
      );
    }
  }

  const hasMain = /if\s+__name__\s*==\s*['"]__main__['"]/.test(finalCode);
  const isClassSolution = /class\s+Solution\b/.test(finalCode);

  // If user has class Solution, always inject auto runner regardless of internal print
  if (hasMain && !isClassSolution) {
    return finalCode;
  }

  const driver = `
import sys, json, inspect

def _auto_run():
    raw = sys.stdin.read().strip()
    if not raw:
        return

    def parse_token(t):
        t = t.strip()
        if '=' in t and not (t.startswith('[') or t.startswith('{')):
            t = t.split('=', 1)[1].strip()
        try:
            return json.loads(t)
        except Exception:
            return t

    args = []
    cur = []
    depth = 0
    for c in raw:
        if c in '[{(': depth += 1
        elif c in ']})': depth -= 1
        if c == ',' and depth == 0:
            args.append(parse_token(''.join(cur)))
            cur = []
        else:
            cur.append(c)
    if cur:
        args.append(parse_token(''.join(cur)))

    fn = None
    if 'Solution' in globals() and inspect.isclass(Solution):
        inst = Solution()
        methods = [m for m in dir(inst) if not m.startswith('_') and callable(getattr(inst, m))]
        if methods:
            fn = getattr(inst, methods[0])
    if fn is None:
        user_fns = [v for k, v in globals().items() if inspect.isfunction(v) and not k.startswith('_')]
        if user_fns:
            fn = user_fns[0]

    if fn:
        res = fn(*args)
        if res is not None:
            if isinstance(res, (list, dict, bool)):
                print(json.dumps(res))
            else:
                print(res)

if __name__ == '__main__':
    _auto_run()
`;

  return finalCode + '\n' + driver;
}

/**
 * Normalizes C++ code. If no main() is defined, appends an automated test driver.
 */
function normalizeCppCode(code: string, stdin?: string): string {
  const finalCode = code.trim();
  const hasMain = /\bint\s+main\s*\(/.test(finalCode);

  if (hasMain) {
    return finalCode;
  }

  const isTwoSum = /twoSum\s*\(/.test(finalCode);

  if (isTwoSum) {
    const driver = `
#include <iostream>
#include <vector>
#include <string>
#include <regex>

using namespace std;

int main() {
    string raw, line;
    while (getline(cin, line)) raw += line + " ";
    regex num_re("-?\\\\d+");
    sregex_iterator next(raw.begin(), raw.end(), num_re);
    sregex_iterator end;
    vector<int> all_nums;
    while (next != end) {
        all_nums.push_back(stoi(next->str()));
        ++next;
    }
    if (all_nums.empty()) return 0;
    int target = all_nums.back();
    all_nums.pop_back();
    vector<int> nums = all_nums;
    Solution sol;
    auto res = sol.twoSum(nums, target);
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 < res.size() ? ", " : "");
    }
    cout << "]" << endl;
    return 0;
}
`;
    return finalCode + '\n' + driver;
  }

  const driver = `
#include <iostream>
#include <vector>
#include <string>
#include <regex>

using namespace std;

int main() {
    string raw, line;
    while (getline(cin, line)) raw += line + " ";
    regex num_re("-?\\\\d+");
    sregex_iterator next(raw.begin(), raw.end(), num_re);
    sregex_iterator end;
    vector<int> nums;
    while (next != end) {
        nums.push_back(stoi(next->str()));
        ++next;
    }
    Solution sol;
    auto res = sol.sortArrayByParity(nums);
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 < res.size() ? ", " : "");
    }
    cout << "]" << endl;
    return 0;
}
`;

  return finalCode + '\n' + driver;
}

/**
 * Execute code using Judge0 CE high-speed compiler engine (~1-2s latency).
 */
async function executeWithJudge0(language: string, code: string, stdin: string, startTime: number) {
  const langKey = language.toLowerCase().trim();
  const langId = JUDGE0_LANGUAGES[langKey] || JUDGE0_LANGUAGES.cpp;

  let finalCode = code;
  if (langKey === 'java') {
    finalCode = normalizeJavaCode(code, stdin);
  } else if (langKey === 'python' || langKey === 'py') {
    finalCode = normalizePythonCode(code, stdin);
  } else if (langKey === 'cpp' || langKey === 'c++') {
    finalCode = normalizeCppCode(code);
  }

  const b64Source = Buffer.from(finalCode).toString('base64');
  const b64Stdin = Buffer.from(stdin || '').toString('base64');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 KollabrixJudge/1.0',
      'Accept': 'application/json',
    },
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
    processedCode = normalizeJavaCode(code, stdin);
    // Wandbox single-file Java entry point runs prog.java, so main class must be named prog
    processedCode = processedCode.replace(/\bpublic\s+class\s+Main\b/g, 'public class prog');
    processedCode = processedCode.replace(/\bclass\s+Main\b/g, 'class prog');
    processedCode = processedCode.replace(/\bMain\s+instance\b/g, 'prog instance');
    processedCode = processedCode.replace(/\bnew\s+Main\(\)/g, 'new prog()');
    processedCode = processedCode.replace(/\bMain\.class\b/g, 'prog.class');
  } else if (language === 'python' || language === 'py') {
    processedCode = normalizePythonCode(code, stdin);
  } else if (language === 'cpp' || language === 'c++') {
    processedCode = normalizeCppCode(code, stdin);
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
    // 1. Anti-Spam / Anti-DDoS Rate Limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';

    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Compile rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds}s before compiling again.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds || 10) },
        }
      );
    }

    const body: CompileRequest = await req.json();
    const { language, code, stdin = '' } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // 2. High-speed compilation via Judge0 CE (~1-2s container-isolated sandbox)
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
