import type { CodingBook } from '@/data/kaCodexBooks';

export interface MonographThemeSpec {
  seriesCode: string;
  editionLabel: string;
  conceptTag: string;
  /** SVG inner elements on a 0 0 160 120 coordinate space */
  svgPaths: string;
}

const MONOGRAPH_SPECS: Record<string, MonographThemeSpec> = {
  ddia: {
    seriesCode: 'SYS-01',
    editionLabel: 'DISTRIBUTED SYSTEMS',
    conceptTag: 'QUORUM · LSM · RAFT',
    svgPaths: `
      <circle cx="80" cy="60" r="42" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.45"/>
      <circle cx="80" cy="60" r="24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="80" y1="18" x2="118" y2="44" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <line x1="118" y1="44" x2="104" y2="92" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <line x1="104" y1="92" x2="56" y2="92" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <line x1="56" y1="92" x2="42" y2="44" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <line x1="42" y1="44" x2="80" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
      <line x1="80" y1="60" x2="80" y2="18" stroke="currentColor" stroke-width="1" opacity="0.85"/>
      <line x1="80" y1="60" x2="118" y2="44" stroke="currentColor" stroke-width="1" opacity="0.85"/>
      <line x1="80" y1="60" x2="56" y2="92" stroke="currentColor" stroke-width="1" opacity="0.85"/>
      <circle cx="80" cy="60" r="7" fill="currentColor" opacity="0.95"/>
      <circle cx="80" cy="18" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="118" cy="44" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="104" cy="92" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="56" cy="92" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="42" cy="44" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
    `,
  },
  'clean-code': {
    seriesCode: 'CRF-02',
    editionLabel: 'SOFTWARE CRAFT',
    conceptTag: 'CLARITY · COHESION · NAMING',
    svgPaths: `
      <rect x="28" y="20" width="104" height="80" rx="6" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.35"/>
      <rect x="38" y="30" width="38" height="26" rx="3" fill="currentColor" opacity="0.16" stroke="currentColor" stroke-width="1.3"/>
      <rect x="84" y="30" width="38" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <rect x="38" y="64" width="84" height="26" rx="3" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.9"/>
      <line x1="48" y1="77" x2="88" y2="77" stroke="currentColor" stroke-width="1.8" opacity="0.9"/>
      <line x1="96" y1="77" x2="112" y2="77" stroke="currentColor" stroke-width="1.8" opacity="0.45"/>
      <circle cx="48" cy="43" r="3" fill="currentColor"/>
    `,
  },
  'pragmatic-programmer': {
    seriesCode: 'CRF-03',
    editionLabel: 'ENGINEERING DISCIPLINE',
    conceptTag: 'TRACER BULLETS · DRY · ORTHOGONAL',
    svgPaths: `
      <circle cx="80" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.3"/>
      <circle cx="80" cy="60" r="28" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.55"/>
      <circle cx="80" cy="60" r="12" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.85"/>
      <line x1="22" y1="96" x2="134" y2="24" stroke="currentColor" stroke-width="2" opacity="0.95"/>
      <polygon points="138,21 124,23 131,34" fill="currentColor"/>
      <line x1="36" y1="22" x2="124" y2="98" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.45"/>
    `,
  },
  clrs: {
    seriesCode: 'ALG-04',
    editionLabel: 'ALGORITHMS CANON',
    conceptTag: 'O(N LOG N) · DP · GRAPHS',
    svgPaths: `
      <line x1="80" y1="20" x2="48" y2="52" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <line x1="80" y1="20" x2="112" y2="52" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <line x1="48" y1="52" x2="32" y2="88" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
      <line x1="48" y1="52" x2="64" y2="88" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
      <line x1="112" y1="52" x2="96" y2="88" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
      <line x1="112" y1="52" x2="128" y2="88" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
      <path d="M 24 102 Q 66 96 136 26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.65"/>
      <circle cx="80" cy="20" r="5.5" fill="currentColor"/>
      <circle cx="48" cy="52" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="112" cy="52" r="4.5" fill="#121110" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="32" cy="88" r="3.8" fill="#121110" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="64" cy="88" r="3.8" fill="#121110" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="96" cy="88" r="3.8" fill="#121110" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="128" cy="88" r="3.8" fill="currentColor"/>
    `,
  },
  'grokking-algorithms': {
    seriesCode: 'ALG-05',
    editionLabel: 'VISUAL ALGORITHMS',
    conceptTag: 'BFS · DIJKSTRA · GREEDY',
    svgPaths: `
      <circle cx="34" cy="60" r="18" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.28"/>
      <circle cx="34" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.35"/>
      <path d="M 34 60 L 72 34 L 116 48 L 134 84" fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.95"/>
      <path d="M 34 60 L 74 86 L 134 84" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
      <line x1="72" y1="34" x2="74" y2="86" stroke="currentColor" stroke-width="1" opacity="0.35"/>
      <circle cx="34" cy="60" r="5" fill="currentColor"/>
      <circle cx="72" cy="34" r="4.5" fill="currentColor"/>
      <circle cx="116" cy="48" r="4.5" fill="currentColor"/>
      <circle cx="74" cy="86" r="4" fill="#121110" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="134" cy="84" r="5.5" fill="#121110" stroke="currentColor" stroke-width="2"/>
    `,
  },
  refactoring: {
    seriesCode: 'CRF-06',
    editionLabel: 'CODE EVOLUTION',
    conceptTag: 'AST TRANSFORMS · SMELLS',
    svgPaths: `
      <path d="M 22 40 C 40 18, 52 78, 70 52" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
      <path d="M 22 68 C 44 92, 54 32, 70 58" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
      <polygon points="80,24 98,60 80,96 68,60" fill="currentColor" opacity="0.18" stroke="currentColor" stroke-width="1.4"/>
      <line x1="98" y1="42" x2="138" y2="42" stroke="currentColor" stroke-width="1.8" opacity="0.92"/>
      <line x1="98" y1="60" x2="138" y2="60" stroke="currentColor" stroke-width="1.8" opacity="0.92"/>
      <line x1="98" y1="78" x2="138" y2="78" stroke="currentColor" stroke-width="1.8" opacity="0.92"/>
    `,
  },
  'effective-java': {
    seriesCode: 'CRF-07',
    editionLabel: 'API & TYPE SAFETY',
    conceptTag: 'BUILDERS · PECS · IMMUTABILITY',
    svgPaths: `
      <polygon points="80,16 118,38 118,82 80,104 42,82 42,38" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="80,30 105,45 105,75 80,90 55,75 55,45" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.8"/>
      <polygon points="80,44 93,52 93,68 80,76 67,68 67,52" fill="currentColor" opacity="0.85"/>
      <line x1="80" y1="16" x2="80" y2="30" stroke="currentColor" stroke-width="1.2"/>
      <line x1="118" y1="82" x2="105" y2="75" stroke="currentColor" stroke-width="1.2"/>
      <line x1="42" y1="82" x2="55" y2="75" stroke="currentColor" stroke-width="1.2"/>
    `,
  },
  'design-patterns': {
    seriesCode: 'ARC-08',
    editionLabel: 'OBJECT PATTERNS',
    conceptTag: 'STRATEGY · OBSERVER · FACADE',
    svgPaths: `
      <rect x="64" y="44" width="32" height="32" rx="4" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.6"/>
      <rect x="24" y="22" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <rect x="114" y="22" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <rect x="24" y="76" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <rect x="114" y="76" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
      <line x1="46" y1="33" x2="64" y2="52" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <line x1="114" y1="33" x2="96" y2="52" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <line x1="46" y1="87" x2="64" y2="68" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <line x1="114" y1="87" x2="96" y2="68" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
      <circle cx="80" cy="60" r="4" fill="currentColor"/>
    `,
  },
  'clean-architecture': {
    seriesCode: 'ARC-09',
    editionLabel: 'STRUCTURAL BOUNDARIES',
    conceptTag: 'DEPENDENCY RULE · SOLID',
    svgPaths: `
      <circle cx="80" cy="60" r="46" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3" opacity="0.45"/>
      <circle cx="80" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.65"/>
      <circle cx="80" cy="60" r="22" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.85"/>
      <circle cx="80" cy="60" r="10" fill="currentColor" opacity="0.9"/>
      <line x1="28" y1="60" x2="54" y2="60" stroke="currentColor" stroke-width="1.6"/>
      <polygon points="58,60 51,56 51,64" fill="currentColor"/>
      <line x1="132" y1="60" x2="106" y2="60" stroke="currentColor" stroke-width="1.6"/>
      <polygon points="102,60 109,56 109,64" fill="currentColor"/>
    `,
  },
  ctci: {
    seriesCode: 'INT-10',
    editionLabel: 'INTERVIEW PLAYBOOK',
    conceptTag: '189 DRILLS · BUD · BIG-O',
    svgPaths: `
      <rect x="22" y="46" width="16" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.45"/>
      <rect x="42" y="46" width="16" height="28" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.4"/>
      <rect x="62" y="46" width="16" height="28" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.4"/>
      <rect x="82" y="46" width="16" height="28" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.4"/>
      <rect x="102" y="46" width="16" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.45"/>
      <rect x="122" y="46" width="16" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.45"/>
      <path d="M 50 24 L 50 39" stroke="currentColor" stroke-width="1.6"/>
      <polygon points="50,42 46,36 54,36" fill="currentColor"/>
      <path d="M 90 96 L 90 81" stroke="currentColor" stroke-width="1.6"/>
      <polygon points="90,78 86,84 94,84" fill="currentColor"/>
      <rect x="39" y="43" width="62" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2"/>
    `,
  },
  'code-complete': {
    seriesCode: 'CRF-11',
    editionLabel: 'SYSTEMS CONSTRUCTION',
    conceptTag: 'BARRICADES · TABLE-DRIVEN',
    svgPaths: `
      <rect x="28" y="22" width="104" height="76" rx="4" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>
      <line x1="28" y1="42" x2="132" y2="42" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="28" y1="62" x2="132" y2="62" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="28" y1="82" x2="132" y2="82" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="62" y1="22" x2="62" y2="98" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="98" y1="22" x2="98" y2="98" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <rect x="62" y="42" width="36" height="20" fill="currentColor" opacity="0.8"/>
      <circle cx="45" cy="32" r="2.5" fill="currentColor"/>
      <circle cx="115" cy="72" r="2.5" fill="currentColor"/>
    `,
  },
  sicp: {
    seriesCode: 'SYS-12',
    editionLabel: 'LAMBDA ABSTRACTION',
    conceptTag: 'EVAL / APPLY · STREAMS',
    svgPaths: `
      <ellipse cx="80" cy="60" rx="44" ry="18" transform="rotate(-28 80 60)" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.6"/>
      <ellipse cx="80" cy="60" rx="44" ry="18" transform="rotate(28 80 60)" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.6"/>
      <circle cx="80" cy="60" r="28" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.45"/>
      <path d="M 68 80 L 82 40 L 94 80 M 76 62 L 66 80" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="80" cy="22" r="3" fill="currentColor"/>
    `,
  },
};

export function getMonographSpec(book: Pick<CodingBook, 'id' | 'index' | 'category'>): MonographThemeSpec {
  return (
    MONOGRAPH_SPECS[book.id] || {
      seriesCode: `VOL-${String(book.index).padStart(2, '0')}`,
      editionLabel: book.category.toUpperCase(),
      conceptTag: 'KΛ FOLIO SYNTHESIS',
      svgPaths: MONOGRAPH_SPECS.ddia.svgPaths,
    }
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

/**
 * Builds a 100% original, copyright-free SVG dark monograph cover for WebGL & <img> endpoints.
 */
export function buildMonographCoverSvg(book: CodingBook): string {
  const spec = getMonographSpec(book);
  const titleLines = wrapLines(book.title, 16);
  const volNum = String(book.index).padStart(2, '0');
  const titleStartY = 396;
  const titleTspans = titleLines
    .map(
      (line, idx) =>
        `<tspan x="56" dy="${idx === 0 ? 0 : 42}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 768" width="512" height="768">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#191715"/>
      <stop offset="55%" stop-color="#11100E"/>
      <stop offset="100%" stop-color="#090807"/>
    </linearGradient>
    <radialGradient id="glow" cx="56%" cy="32%" r="54%">
      <stop offset="0%" stop-color="${book.accentHex}" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="${book.spineColor}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#090807" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${book.spineColor}"/>
      <stop offset="68%" stop-color="#0B0A09"/>
      <stop offset="100%" stop-color="#292522"/>
    </linearGradient>
    <pattern id="microgrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff" stroke-width="0.6" stroke-opacity="0.04"/>
    </pattern>
  </defs>

  <rect width="512" height="768" fill="url(#bg)"/>
  <rect width="512" height="768" fill="url(#microgrid)"/>
  <rect width="512" height="768" fill="url(#glow)"/>

  <!-- Tactile left book spine & metallic foil hinge -->
  <rect x="0" y="0" width="26" height="768" fill="url(#spine)"/>
  <line x1="27" y1="0" x2="27" y2="768" stroke="#000000" stroke-opacity="0.85" stroke-width="2"/>
  <line x1="29" y1="0" x2="29" y2="768" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>

  <!-- Outer Foil Border Frame -->
  <rect x="44" y="28" width="440" height="712" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.2"/>
  <rect x="44" y="28" width="440" height="5" rx="2" fill="${book.accentHex}" fill-opacity="0.9"/>

  <!-- Top Series Badge -->
  <text x="58" y="68" fill="${book.accentHex}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="15" font-weight="700" letter-spacing="3">
    KΛ FOLIO · ${escapeXml(spec.seriesCode)}
  </text>
  <text x="466" y="68" text-anchor="end" fill="#A8A196" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14" font-weight="600" letter-spacing="2">
    VOL. ${volNum}
  </text>

  <!-- Central Geometric Wireframe Plate -->
  <rect x="64" y="102" width="396" height="224" rx="14" fill="#0B0A09" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  <g transform="translate(102, 118) scale(2)" color="${book.accentHex}">
    ${spec.svgPaths}
  </g>
  <text x="262" y="312" text-anchor="middle" fill="#A8A196" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" letter-spacing="2.5">
    ${escapeXml(spec.conceptTag)}
  </text>

  <!-- Crisp Editorial Title -->
  <text x="56" y="${titleStartY}" fill="#F8F7F4" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-size="36" font-weight="700" letter-spacing="-0.8">
    ${titleTspans}
  </text>

  <!-- Legal Fair-Use Synthesis Attribution -->
  <line x1="56" y1="622" x2="466" y2="622" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1"/>
  <text x="56" y="654" fill="${book.accentHex}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" font-weight="700" letter-spacing="2">
    NOTES &amp; SYNTHESIS EDITION
  </text>
  <text x="56" y="682" fill="#E5E0D7" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="600">
    Inspired by ${escapeXml(book.author)}
  </text>
  <text x="56" y="714" fill="#8C867E" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" letter-spacing="1.5">
    ${book.pages} PAGES · ${book.chapters.length} CHAPTERS · KΛ FOLIO ARCHIVE
  </text>
</svg>`;
}
