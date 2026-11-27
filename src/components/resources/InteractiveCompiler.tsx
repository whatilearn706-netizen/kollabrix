'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  CornerDownRight,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InteractiveCompilerProps {
  language: 'java' | 'cpp' | 'python' | 'javascript';
  compilerDisplayName: string;
  initialCode: string;
  expectedOutput?: string;
  initialStdin?: string;
  onCodeChange?: (code: string) => void;
  className?: string;
}

/**
 * Checks whether user code uses interactive console input mechanisms.
 */
function checkCodeExpectsInput(sourceCode: string): boolean {
  if (!sourceCode) return false;
  return (
    /Scanner|System\.in|BufferedReader|InputStreamReader|readLine|readInt|nextInt|nextLong|nextDouble|nextFloat|nextLine|next\(\s*\)/.test(
      sourceCode
    ) ||
    /cin\s*>>|getline\s*\(\s*cin/.test(sourceCode) ||
    /input\s*\(|sys\.stdin/.test(sourceCode) ||
    /scanf\s*\(|getchar\s*\(|fgets\s*\(/.test(sourceCode) ||
    /readline\s*\(|prompt\s*\(/.test(sourceCode)
  );
}

export function InteractiveCompiler({
  language,
  compilerDisplayName,
  initialCode,
  expectedOutput,
  initialStdin = '',
  onCodeChange,
  className = '',
}: InteractiveCompilerProps) {
  const [code, setCode] = useState<string>(initialCode);
  const [currentInput, setCurrentInput] = useState<string>(initialStdin || '');
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [lastRanInput, setLastRanInput] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'passed' | 'failed' | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live timer tick during code compilation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      setElapsedSeconds(0);
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds((Date.now() - start) / 1000);
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Sync when initialCode changes (e.g. step changed)
  useEffect(() => {
    setCode(initialCode);
    setStdout('');
    setStderr('');
    setTestResult(null);
    setExecutionTime(null);
    setWaitingForInput(false);
    setLastRanInput(null);
  }, [initialCode]);

  useEffect(() => {
    if (initialStdin) {
      setCurrentInput(initialStdin);
    }
  }, [initialStdin]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
    if (testResult) setTestResult(null);
    if (waitingForInput) setWaitingForInput(false);
  };

  // Enable Tab key indent in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const nextCode = code.substring(0, start) + '    ' + code.substring(end);
      handleCodeChange(nextCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunClick();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setCurrentInput(initialStdin || '');
    setStdout('');
    setStderr('');
    setTestResult(null);
    setWaitingForInput(false);
    setLastRanInput(null);
  };

  /**
   * Primary entry point when user clicks "Run Code".
   * If code needs input and none has been typed yet, halts and prompts in the console.
   */
  const handleRunClick = () => {
    if (isRunning) return;

    if (checkCodeExpectsInput(code) && !currentInput.trim()) {
      if (waitingForInput) {
        // If already prompted and user clicks again, allow running directly
        executeProgram('');
        return;
      }
      setWaitingForInput(true);
      setStdout('');
      setStderr('');
      setTestResult(null);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 60);
      return;
    }

    executeProgram(currentInput);
  };

  /**
   * Executes the code against the server with the given standard input.
   */
  const executeProgram = async (inputToSend: string) => {
    if (isRunning) return;
    setWaitingForInput(false);
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setTestResult(null);
    setLastRanInput(inputToSend.trim() ? inputToSend : null);

    try {
      const res = await fetch('/api/compiler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stdin: inputToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setStderr(data.error || 'Server compilation failed.');
        setExecutionTime(data.executionTimeMs || null);
        return;
      }

      const returnedStdout = data.stdout || '';
      const returnedStderr = data.stderr || '';
      setStdout(returnedStdout);
      setStderr(returnedStderr);
      setExecutionTime(data.executionTimeMs || null);

      if (expectedOutput && returnedStdout) {
        const cleanOut = returnedStdout.trim().replace(/\r\n/g, '\n');
        const cleanExpected = expectedOutput.trim().replace(/\r\n/g, '\n');
        if (cleanOut === cleanExpected) {
          setTestResult('passed');
        } else {
          setTestResult('failed');
        }
      }
    } catch (err: any) {
      setStderr(err.message || 'Execution connection error.');
    } finally {
      setIsRunning(false);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className={`rounded-2xl border border-white/10 bg-[#07090E] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.65)] ${className}`}>
      {/* Top Bar / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0B0F18] border-b border-white/[0.08] text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-1.5 opacity-75">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15 inline-block" />
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-200 font-medium border border-white/10 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-sky-300" />
            {compilerDisplayName}
          </span>
          <span className="text-zinc-500 hidden sm:inline text-[11px]">⌘ + Enter</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-full bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <Button
            size="sm"
            onClick={handleRunClick}
            disabled={isRunning}
            className={`font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              waitingForInput
                ? 'bg-sky-200 hover:bg-white text-[#07090E] ring-2 ring-sky-400/40 animate-pulse'
                : 'bg-[#FAF8F5] hover:bg-sky-100 text-[#07090E] shadow-[0_8px_24px_rgba(255,255,255,0.12)]'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running ({elapsedSeconds.toFixed(1)}s)...
              </>
            ) : waitingForInput ? (
              <>
                <CornerDownRight className="w-3.5 h-3.5" />
                Enter Stdin Below
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor & Line Numbers */}
      <div className="relative flex min-h-[300px] max-h-[480px] overflow-auto font-mono text-sm bg-[#06080D]">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3.5 px-3 bg-[#080B11] border-r border-white/[0.06] text-zinc-600 text-right font-mono text-xs leading-6 min-w-[46px]">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Editor */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className="w-full h-full min-h-[300px] bg-transparent text-slate-100 p-3.5 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-sky-500/25 whitespace-pre overflow-x-auto"
            placeholder="Write your code here..."
          />
        </div>
      </div>

      {/* Test Result Banner (if testing against question) */}
      {testResult && (
        <div
          className={`px-4 py-2.5 border-t text-xs font-medium flex items-center justify-between ${
            testResult === 'passed'
              ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-400/25 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult === 'passed' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Output matches expected result.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Output does not match expected output yet.</span>
              </>
            )}
          </div>
          {executionTime !== null && (
            <span className="text-[11px] opacity-80 font-mono">{executionTime}ms</span>
          )}
        </div>
      )}

      {/* Terminal Output Window */}
      <div className="bg-[#04060A] border-t border-white/[0.08] p-4 font-mono text-xs flex flex-col min-h-[156px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between text-zinc-400 mb-2 pb-2 border-b border-white/[0.06] select-none">
          <div className="flex items-center gap-2 text-zinc-300 font-medium">
            <Terminal className="w-3.5 h-3.5 text-sky-300" />
            <span>Output</span>
            {waitingForInput && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
                Waiting for stdin
              </span>
            )}
          </div>
          {executionTime !== null && (
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {executionTime < 1000 ? `${executionTime}ms` : `${(executionTime / 1000).toFixed(2)}s`}
            </span>
          )}
        </div>

        {/* Output Body */}
        <div className="flex-1 space-y-2 py-1">
          {isRunning ? (
            <div className="flex items-center gap-2 text-sky-300 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-sky-300 shrink-0" />
              <span>Executing in sandbox ({elapsedSeconds.toFixed(1)}s)...</span>
            </div>
          ) : waitingForInput ? (
            <div className="py-2.5 px-3 rounded-xl bg-sky-500/[0.08] border border-sky-400/25 text-sky-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Program expects standard input (stdin).</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Type input below and press Enter, or{' '}
                <button
                  type="button"
                  onClick={() => executeProgram('')}
                  className="text-sky-300 hover:underline cursor-pointer"
                >
                  run with empty input
                </button>
                .
              </p>
            </div>
          ) : stdout || stderr ? (
            <div className="space-y-2">
              {lastRanInput && (
                <div className="text-[11px] text-sky-300 font-mono bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                  <span className="text-zinc-500">stdin:</span>
                  <span className="text-slate-200">{lastRanInput}</span>
                </div>
              )}
              {stdout && (
                <pre className="text-slate-100 whitespace-pre-wrap leading-5 font-mono selection:bg-sky-500/25">
                  {stdout}
                </pre>
              )}
              {stderr && (
                <pre className="text-rose-300 whitespace-pre-wrap leading-5 font-mono bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  {stderr}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-zinc-500 py-2">
              Click Run Code or press ⌘ + Enter to execute.
            </div>
          )}
        </div>

        {/* Expected output comparison if failed */}
        {testResult === 'failed' && expectedOutput && (
          <div className="mt-2 p-3 bg-white/[0.03] rounded-xl border border-white/10">
            <div className="text-zinc-400 text-[11px] mb-1">Expected Output</div>
            <pre className="text-emerald-300 whitespace-pre-wrap font-mono">{expectedOutput}</pre>
          </div>
        )}

        {/* Interactive Terminal Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeProgram(currentInput);
          }}
          className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2"
        >
          <span className="font-mono text-zinc-500 text-xs shrink-0">stdin &gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Optional standard input (e.g. 2024)..."
            className={`flex-1 bg-white/[0.03] text-slate-100 placeholder-zinc-600 px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
              waitingForInput
                ? 'border-sky-400/60 ring-1 ring-sky-400/30'
                : 'border-white/10 focus:border-sky-400/40'
            }`}
          />
          <button
            type="submit"
            disabled={isRunning}
            className="px-4 py-2 rounded-xl font-mono font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 bg-white/[0.07] hover:bg-white/[0.14] text-white border border-white/10 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-sky-300" />
            <span>{waitingForInput ? 'Send ↵' : 'Run Stdin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
