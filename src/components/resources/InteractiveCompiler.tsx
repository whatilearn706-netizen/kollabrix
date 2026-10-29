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
    <div className={`rounded-2xl border border-slate-700/60 bg-slate-950/95 overflow-hidden shadow-2xl ${className}`}>
      {/* Top Bar / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/30 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            {compilerDisplayName}
          </span>
          <span className="text-slate-500 hidden sm:inline">⌘ + Enter to Run</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <Button
            size="sm"
            onClick={handleRunClick}
            disabled={isRunning}
            className={`font-medium px-4 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              waitingForInput
                ? 'bg-amber-500 hover:bg-amber-400 text-black font-bold ring-2 ring-amber-400/40 shadow-amber-500/20 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compiling ({elapsedSeconds.toFixed(1)}s)...
              </>
            ) : waitingForInput ? (
              <>
                <CornerDownRight className="w-3.5 h-3.5" />
                Provide Input Below
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
      <div className="relative flex min-h-[300px] max-h-[500px] overflow-auto font-mono text-sm">
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-3 bg-slate-950/80 border-r border-slate-800/80 text-slate-600 text-right font-mono text-xs leading-6 min-w-[45px]">
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
            className="w-full h-full min-h-[300px] bg-transparent text-emerald-200 dark:text-emerald-100 p-3 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-indigo-500/30 whitespace-pre overflow-x-auto"
            placeholder="Write your code here..."
          />
        </div>
      </div>

      {/* Test Result Banner (if testing against question) */}
      {testResult && (
        <div
          className={`px-4 py-2.5 border-t text-xs font-medium flex items-center justify-between ${
            testResult === 'passed'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult === 'passed' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Test Passed! Output matches expected result perfectly.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Output does not match expected output yet. Compare below and try again!</span>
              </>
            )}
          </div>
          {executionTime !== null && (
            <span className="text-[11px] opacity-80 font-mono">Time: {executionTime}ms</span>
          )}
        </div>
      )}

      {/* Terminal Output Window */}
      <div className="bg-black/95 border-t border-slate-800/90 p-4 font-mono text-xs flex flex-col min-h-[170px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between text-slate-400 mb-2 pb-1.5 border-b border-slate-800/60 select-none">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Console</span>
            {waitingForInput && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                Waiting for Input...
              </span>
            )}
          </div>
          {executionTime !== null && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ⚡ Completed in {executionTime < 1000 ? `${executionTime}ms` : `${(executionTime / 1000).toFixed(2)}s`}
            </span>
          )}
        </div>

        {/* Output Body */}
        <div className="flex-1 space-y-2 py-1">
          {isRunning ? (
            <div className="flex items-center gap-2 text-emerald-400 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <span>Executing code in high-speed sandbox ({elapsedSeconds.toFixed(1)}s)...</span>
            </div>
          ) : waitingForInput ? (
            <div className="py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Program is waiting for user input (stdin)...</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Type your input in the box below and press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/40 text-amber-200 font-mono">Enter ↵</kbd> to see the answer.
              </p>
            </div>
          ) : stdout || stderr ? (
            <div className="space-y-2">
              {lastRanInput && (
                <div className="text-[11px] text-cyan-300 font-mono bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/50 flex items-center gap-2">
                  <span className="text-slate-500">$ stdin:</span>
                  <span className="font-bold text-cyan-200">{lastRanInput}</span>
                </div>
              )}
              {stdout && (
                <pre className="text-slate-100 whitespace-pre-wrap leading-5 font-mono selection:bg-emerald-500/20">
                  {stdout}
                </pre>
              )}
              {stderr && (
                <pre className="text-rose-400 whitespace-pre-wrap leading-5 font-mono bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
                  {stderr}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-slate-500 italic py-2">
              Click &quot;Run Code&quot; or press ⌘ + Enter to execute. Type any input below like a real terminal.
            </div>
          )}
        </div>

        {/* Expected output comparison if failed */}
        {testResult === 'failed' && expectedOutput && (
          <div className="mt-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="text-amber-400 font-semibold mb-1">Expected Output:</div>
            <pre className="text-emerald-400 whitespace-pre-wrap font-mono">{expectedOutput}</pre>
          </div>
        )}

        {/* Interactive Terminal Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeProgram(currentInput);
          }}
          className={`mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 transition-all ${
            waitingForInput ? 'bg-amber-950/30 -mx-4 -mb-4 p-3 rounded-b-2xl border-amber-500/40' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold shrink-0">
            <span>&gt;_</span>
            <span className="text-slate-400 text-xs">Input:</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder={
              waitingForInput
                ? 'Type input (e.g. 2024) and press Enter ↵'
                : 'Enter standard input (stdin) for your program (e.g. 2024)...'
            }
            className={`flex-1 bg-slate-900/90 text-slate-100 placeholder-slate-500 px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
              waitingForInput
                ? 'border-amber-400 ring-2 ring-amber-400/40 bg-black text-amber-200 shadow-md'
                : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40'
            }`}
          />
          <button
            type="submit"
            disabled={isRunning}
            className={`px-4 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md active:scale-95 disabled:opacity-50 ${
              waitingForInput
                ? 'bg-amber-500 hover:bg-amber-400 text-black ring-2 ring-amber-400/40 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{waitingForInput ? 'Send Input ↵' : 'Run with Input'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
