'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  CornerDownRight,
  Maximize2,
  Minimize2,
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
  const [stdin, setStdin] = useState<string>(initialStdin);
  const [showStdin, setShowStdin] = useState<boolean>(Boolean(initialStdin));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'passed' | 'failed' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when initialCode changes (e.g. step changed)
  useEffect(() => {
    setCode(initialCode);
    setStdout('');
    setStderr('');
    setTestResult(null);
    setExecutionTime(null);
  }, [initialCode]);

  useEffect(() => {
    if (initialStdin) {
      setStdin(initialStdin);
      setShowStdin(true);
    }
  }, [initialStdin]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
    if (testResult) setTestResult(null);
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
      runCode();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setStdout('');
    setStderr('');
    setTestResult(null);
  };

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setTestResult(null);

    try {
      const res = await fetch('/api/compiler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stdin: showStdin ? stdin : '',
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

      // Check against expectedOutput if question has one
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
            onClick={() => setShowStdin(!showStdin)}
            className={`px-2.5 py-1 rounded-md transition-colors border ${
              showStdin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Custom Input (stdin)"
          >
            Custom Input {showStdin ? '(On)' : ''}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium px-4 py-1.5 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Compiling...
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

      {/* Stdin Drawer (if enabled) */}
      {showStdin && (
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-amber-400">
              <CornerDownRight className="w-3.5 h-3.5" />
              Standard Input (stdin):
            </span>
            <span className="text-slate-500">Provide input values separated by spaces or newlines</span>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter standard input for Scanner / cin / input() here..."
            className="w-full h-16 bg-slate-950 text-slate-200 font-mono text-xs p-2.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>
      )}

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
      <div className="bg-black/90 border-t border-slate-800/90 p-4 font-mono text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-2 pb-1.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Output Console</span>
          </div>
          {executionTime !== null && (
            <span className="text-[11px] text-slate-500">Execution: {executionTime}ms</span>
          )}
        </div>

        {isRunning ? (
          <div className="flex items-center gap-2 text-emerald-400/90 py-4 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Executing code in secure collegiate sandbox...</span>
          </div>
        ) : stdout || stderr ? (
          <div className="space-y-2">
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
          <div className="text-slate-600 italic py-2">
            Click &quot;Run Code&quot; or press ⌘ + Enter to execute. Output will appear here.
          </div>
        )}

        {/* Expected output comparison if failed */}
        {testResult === 'failed' && expectedOutput && (
          <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
            <div className="text-amber-400 font-semibold mb-1">Expected Output:</div>
            <pre className="text-emerald-400 whitespace-pre-wrap font-mono">{expectedOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
