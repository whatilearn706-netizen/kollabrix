'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Play, Check, Copy, ExternalLink, Code2 } from 'lucide-react';

interface CodeSnippet {
  fileName: string;
  language: string;
  badge: string;
  lines: string[];
  output: {
    command: string;
    success: string;
    details: string;
    repo: string;
    ram: string;
  };
}

const SNIPPETS: Record<string, CodeSnippet> = {
  python: {
    fileName: 'solution.py',
    language: 'Python 3.12 (Sandboxed)',
    badge: 'Python 3.12',
    lines: [
      'import linkora as lk',
      '# 1. Match teammates for College Capstone / Hackathon',
      'squad = lk.match_teammates(',
      '    skills=["Next.js", "PyTorch", "Solidity"],',
      '    campus="Pan-India Top Tier",',
      '    verified_only=True',
      ')',
      '# 2. Output instant team squad readiness',
      'print(f"Team Formed: {squad.name} | Ready for SIH 2026")',
    ],
    output: {
      command: '$ python solution.py',
      success: '✔ Found 3 matching developers in 0.04s',
      details: 'Team Formed: NeuralSprint | Ready for SIH 2026',
      repo: 'repo.git (Auto-Cloned)',
      ram: '14.2 MB',
    },
  },
  cpp: {
    fileName: 'main.cpp',
    language: 'C++20 (GCC 14)',
    badge: 'C++20 GCC',
    lines: [
      '#include <iostream>',
      '#include <vector>',
      '#include "linkora_graph.hpp"',
      '',
      'int main() {',
      '    // Graph traversal across 12,000+ student profiles',
      '    auto team = lk::find_optimal_squad({ "AI", "Rust" });',
      '    std::cout << "Optimal team synergy: 98.4%\\n";',
      '    return 0;',
      '}',
    ],
    output: {
      command: '$ g++ -O3 -std=c++20 main.cpp && ./a.out',
      success: '✔ Compiled with 0 warnings in 18ms',
      details: 'Optimal team synergy: 98.4% | Matched with IITB & BITS',
      repo: 'synergy_graph.cpp (Linked)',
      ram: '3.1 MB',
    },
  },
  rust: {
    fileName: 'lib.rs',
    language: 'Rust 1.82 (Edition 2024)',
    badge: 'Rust Cargo',
    lines: [
      'use linkora_protocol::prelude::*;',
      '',
      'pub async fn verify_capstone_commit(proof: ProofOfWork) -> Result<Badge> {',
      '    // Cryptographic validation of student git push',
      '    let endorsement = proof.sign_with_edu_key().await?;',
      '    Ok(Badge::FacultyEndorsed(endorsement))',
      '}',
    ],
    output: {
      command: '$ cargo test --release',
      success: '✔ test verify_capstone_commit ... ok (2ms)',
      details: 'Verified Proof-of-Work: 0x8F4A...3B verified by Dean',
      repo: 'rust_bridge.rs (Linked)',
      ram: '6.4 MB',
    },
  },
  typescript: {
    fileName: 'index.ts',
    language: 'TypeScript 5.6 (Node 22)',
    badge: 'TypeScript / Node',
    lines: [
      'import { TeamHuddle } from "@linkora/collab";',
      '',
      '// Establish real-time peer audio/code sync for hackathon',
      'const room = new TeamHuddle({ squadId: "squad-sih-2026" });',
      'room.on("code_sync", (patch) => {',
      '    console.log(`[Synced] 120fps diff applied from IIT D`);',
      '});',
    ],
    output: {
      command: '$ npx tsx index.ts',
      success: '✔ WebRTC peer mesh active across 4 nodes',
      details: '[Synced] 120fps diff applied from IIT D in 11ms',
      repo: 'collab_mesh.ts (Linked)',
      ram: '28.6 MB',
    },
  },
};

export function InteractiveCodeTerminal() {
  const [activeLang, setActiveLang] = useState<string>('python');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const snippet = SNIPPETS[activeLang] || SNIPPETS.python;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 400);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(snippet.lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Collegiate Sandbox Terminal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white site-heading-white tracking-tight">
            Interactive Code Playground & Compiler
          </h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: '#A8A29E' }}>
            Brushed titanium macOS execution console with tabs, syntax highlighting, and instantaneous live sandbox execution.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Zero-Install Sandbox Ready</span>
        </div>
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl overflow-hidden border border-stone-800 bg-[#141210] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
        
        {/* Window Chrome Header */}
        <div className="bg-[#181614] border-b border-stone-800/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 ml-3 text-xs font-mono">
              {Object.keys(SNIPPETS).map((key) => {
                const s = SNIPPETS[key];
                const isActive = activeLang === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLang(key);
                      setHasRun(false);
                    }}
                    className={`px-3 py-1 rounded-md transition-all ${
                      isActive
                        ? 'bg-stone-800 text-amber-400 font-bold border border-stone-700 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                    }`}
                  >
                    {s.fileName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <span className="text-xs font-mono text-stone-500 hidden md:inline">
              {snippet.language}
            </span>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#EA580C] to-[#F59E0B] hover:opacity-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Editor + Terminal Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-stone-800/90">
          
          {/* Editor Body (2 cols) */}
          <div className="lg:col-span-2 p-5 font-mono text-xs sm:text-sm text-stone-200 leading-relaxed bg-[#110F0D] overflow-x-auto min-h-[220px]">
            <div className="flex gap-4">
              <div className="text-stone-600 select-none text-right font-mono text-xs space-y-1">
                {snippet.lines.map((_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                ))}
              </div>
              <div className="space-y-1">
                {snippet.lines.map((line, idx) => {
                  let formatted = line;
                  return (
                    <div key={idx} className="whitespace-pre">
                      {line.startsWith('#') || line.startsWith('//') ? (
                        <span className="text-stone-500 italic">{line}</span>
                      ) : (
                        <span>
                          {line.includes('import') || line.includes('from') || line.includes('use') || line.includes('pub async fn') ? (
                            <span className="text-orange-400">{line}</span>
                          ) : line.includes('print') || line.includes('std::cout') || line.includes('console.log') ? (
                            <span className="text-blue-400">{line}</span>
                          ) : (
                            <span className="text-stone-200">{line}</span>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Terminal Drawer (1 col) */}
          <div className="p-5 font-mono text-xs bg-[#151311] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-400 text-[11px] mb-3 border-b border-stone-800 pb-2">
                <span className="uppercase tracking-wider font-bold">Terminal Output</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0 Errors
                </span>
              </div>

              <div className="space-y-2 text-stone-300">
                <div className="text-stone-500">{snippet.output.command}</div>
                <div className="text-emerald-400 font-semibold">{snippet.output.success}</div>
                <div className="text-stone-200 bg-stone-900/60 p-2 rounded border border-stone-800/80">
                  {snippet.output.details}
                </div>
                <div className="text-stone-400 text-[11px]">
                  Bridge: <span className="text-amber-400 underline">{snippet.output.repo}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <span>RAM: {snippet.output.ram}</span>
              <Link
                href="/resources"
                className="text-orange-500 hover:text-amber-400 font-bold flex items-center gap-1"
              >
                Full Arena <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
