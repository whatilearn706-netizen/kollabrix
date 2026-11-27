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

export async function downloadScreeningPptx(deck: ScreeningDeck): Promise<void> {
  const res = await fetch('/api/spark/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || 'Could not export .pptx deck.');
  }

  const blob = await res.blob();
  const slug = (deck.deckTitle || 'kollabrix-deck').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-screening-deck.pptx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
