/**
 * Kollabrix Code Execution Anti-Exploit Guard
 * Blocks process spawning (fork bombs), shell execution, file system tampering,
 * and raw socket scraping before code is dispatched to compiler containers.
 */

export interface CodeSafetyCheck {
  isSafe: boolean;
  reason?: string;
}

export function inspectCodeSafety(code: string, language: string): CodeSafetyCheck {
  if (!code || typeof code !== 'string') return { isSafe: true };

  const lang = (language || '').toLowerCase().trim();
  const lower = code.toLowerCase();

  // 1. Common dangerous process/shell operations
  if (lower.includes(':(){ :|:& };:') || lower.includes('fork bomb')) {
    return { isSafe: false, reason: 'Fork bomb signature detected and blocked.' };
  }

  // 2. C / C++ Inspection
  if (lang === 'cpp' || lang === 'c' || lang === 'c++') {
    if (/\bfork\s*\(\s*\)/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: fork() is not permitted in competitive programming.' };
    }
    if (/\bsystem\s*\(\s*["']/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: system() calls are not permitted in competitive programming.' };
    }
    if (/\b(popen|execl|execv|execle|execvp|execvpe)\s*\(/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Process execution functions are forbidden.' };
    }
    if (/#include\s*<sys\/socket\.h>/i.test(code) || /#include\s*<winsock2?\.h>/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Raw network socket access is not permitted.' };
    }
  }

  // 3. Python Inspection
  if (lang === 'python' || lang === 'py') {
    const forbiddenImports = [
      'subprocess',
      'shutil',
      'pty',
      'posix',
      'fcntl',
      'multiprocessing',
    ];

    for (const mod of forbiddenImports) {
      const importRegex = new RegExp(`(^|\\n|;)\\s*(import\\s+${mod}\\b|from\\s+${mod}\\b)`, 'i');
      if (importRegex.test(code)) {
        return { isSafe: false, reason: `Security Violation: Importing '${mod}' is prohibited in competitive coding.` };
      }
    }

    if (/\bos\.(system|popen|spawn|fork|kill|exec|remove|unlink|rmdir)\b/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: os system and execution calls are prohibited.' };
    }

    if (/__import__\s*\(\s*['"](os|subprocess|sys|socket)['"]\s*\)/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Dynamic module imports are prohibited.' };
    }

    if (/(^|\n|;)\s*(import\s+socket\b|from\s+socket\b)/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Socket network access is prohibited.' };
    }
  }

  // 4. Java Inspection
  if (lang === 'java') {
    if (/Runtime\.getRuntime\(\)\.exec/i.test(code) || /ProcessBuilder/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Process execution is prohibited in Java submissions.' };
    }
    if (/java\.net\.Socket/i.test(code) || /java\.net\.ServerSocket/i.test(code)) {
      return { isSafe: false, reason: 'Security Violation: Network sockets are prohibited in Java submissions.' };
    }
  }

  return { isSafe: true };
}
