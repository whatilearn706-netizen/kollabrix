export interface ScreeningSlide {
  slideNumber: number;
  type: 'cover' | 'problem' | 'solution' | 'architecture' | 'stack' | 'feasibility' | 'impact';
  layoutVariant?:
    | 'cover_hero'
    | 'split_problem_stats'
    | 'solution_workflow'
    | 'architecture_diagram'
    | 'bento_stack'
    | 'risk_matrix'
    | 'impact_roadmap';
  title: string;
  headline: string;
  bullets: string[];
  speakerNotes: string;
  recommendedVisual?: string;
  kpis?: Array<{ value: string; label: string }>;
  chartData?: {
    title: string;
    labels: string[];
    values: number[];
  };
  stackGrid?: Array<{ category: string; items: string[] }>;
  riskPairs?: Array<{ risk: string; mitigation: string }>;
  redFlagFix?: { weakClaim: string; improvedClaim: string };
}

export type PptxThemePalette =
  | 'obsidian_amber'
  | 'medical_teal'
  | 'emerald_civic'
  | 'violet_agentic'
  | 'royal_indigo'
  | 'cyber_crimson'
  | 'arctic_obsidian'
  | 'aurora_graphite';

export type PptxLayoutStyle =
  | 'bento_dark'
  | 'editorial_split'
  | 'cyber_grid'
  | 'orbital_flow'
  | 'minimal_swiss';

export interface ScreeningDeck {
  deckTitle: string;
  hackathonName: string;
  themePalette?: PptxThemePalette;
  layoutStyle?: PptxLayoutStyle;
  deckStyleNote?: string;
  variationSeed?: number;
  repoUrl?: string;
  liveDemoUrl?: string;
  shortlistScoreForecast: number;
  juryObjectionShield?: string;
  slides: ScreeningSlide[];
  architectureNodes?: Array<{ id: string; label: string; layer: string; detail: string }>;
  architectureEdges?: Array<{ from: string; to: string; label: string }>;
  mermaidCode?: string;
}

export interface ExportedPptxFile {
  url: string;
  fileName: string;
  sizeBytes: number;
}

export async function downloadScreeningPptx(deck: ScreeningDeck): Promise<ExportedPptxFile> {
  const res = await fetch('/api/spark/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Could not export .pptx deck (HTTP ${res.status}).`);
  }

  const buf = await res.arrayBuffer();
  if (!buf || buf.byteLength < 100) {
    throw new Error('Exported .pptx file was empty.');
  }

  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  const slug =
    (deck.deckTitle || 'kollabrix-deck')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'kollabrix-deck';
  const fileName = `${slug}-screening-deck.pptx`;
  const url = URL.createObjectURL(blob);

  // Trigger download without synchronous revoke/remove so macOS Safari completes handoff
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      a.remove();
    } catch {}
  }, 5000);

  return { url, fileName, sizeBytes: buf.byteLength };
}

/**
 * Fallback direct POST form download (runs natively via browser download manager cleanly in Safari).
 */
export function triggerNativeFormPptxDownload(deck: ScreeningDeck): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/spark/export-pptx';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'deckJson';
  input.value = JSON.stringify(deck);

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    try {
      form.remove();
    } catch {}
  }, 3000);
}
