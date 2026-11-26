'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Layers } from 'lucide-react';

interface ArchNode {
  id: string;
  label: string;
  layer: string;
  detail: string;
}

interface ArchEdge {
  from: string;
  to: string;
  label: string;
}

interface Props {
  nodes?: ArchNode[];
  edges?: ArchEdge[];
  mermaidCode?: string;
}

const LAYER_COLORS: Record<string, string> = {
  Client: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
  API: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  Engine: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  Data: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
};

/**
 * Clean visual layered system architecture diagram with 1-click Mermaid source copy.
 */
export function KaArchitectureDiagram({ nodes = [], edges = [], mermaidCode = '' }: Props) {
  const [copied, setCopied] = useState(false);

  if (nodes.length === 0 && !mermaidCode) return null;

  const nodeMap = new Map(nodes.map((n) => [n.id, n.label]));

  return (
    <div className="p-4 rounded-2xl bg-[#090C12] border border-white/12 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live System Architecture Diagram</span>
        </span>
        {mermaidCode && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(mermaidCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Mermaid Copied' : 'Copy Mermaid'}</span>
          </button>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`p-3 rounded-xl border space-y-1 ${
                LAYER_COLORS[node.layer] || 'border-white/15 bg-white/5 text-white'
              }`}
            >
              <div className="text-[10px] font-mono uppercase opacity-75">{node.layer}</div>
              <div className="text-xs font-bold text-white">{node.label}</div>
              <div className="text-[11px] opacity-80 leading-snug">{node.detail}</div>
            </div>
          ))}
        </div>
      )}

      {edges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {edges.map((e, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] text-zinc-300 font-mono"
            >
              <span className="text-white font-semibold">{nodeMap.get(e.from) || e.from}</span>
              <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
              <span className="text-cyan-300">{e.label}</span>
              <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
              <span className="text-white font-semibold">{nodeMap.get(e.to) || e.to}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
