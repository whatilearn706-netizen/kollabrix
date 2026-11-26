export interface ScreeningSlide {
  slideNumber: number;
  type: string;
  title: string;
  headline: string;
  bullets: string[];
  speakerNotes: string;
  redFlagFix?: {
    weakClaim: string;
    improvedClaim: string;
  };
}

export interface ScreeningDeck {
  deckTitle: string;
  hackathonName: string;
  shortlistScoreForecast: number;
  slides: ScreeningSlide[];
  architectureNodes?: Array<{ id: string; label: string; layer: string; detail: string }>;
  architectureEdges?: Array<{ from: string; to: string; label: string }>;
  mermaidCode?: string;
}

/**
 * Exports a generated screening deck to a real widescreen .pptx PowerPoint file
 * via the Node.js export route so client bundles stay fast and node-free.
 */
export async function downloadScreeningPptx(deck: ScreeningDeck): Promise<void> {
  const res = await fetch('/api/spark/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  if (!res.ok) {
    throw new Error('Could not export .pptx deck');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const slug = (deck.deckTitle || 'kollabrix-deck').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-screening-deck.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}
