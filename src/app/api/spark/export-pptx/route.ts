import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import type {
  PptxLayoutStyle,
  PptxThemePalette,
  ScreeningDeck,
  ScreeningSlide,
} from '@/lib/spark/pptxExport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PaletteColors {
  bg: string;
  cardBg: string;
  cardAltBg: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  glow: string;
}

const PALETTES: Record<PptxThemePalette, PaletteColors> = {
  obsidian_amber: {
    bg: '090B11',
    cardBg: '131724',
    cardAltBg: '1B2133',
    primary: 'FBBF24',
    accent: '22D3EE',
    text: 'F8FAFC',
    muted: '94A3B8',
    glow: '291F0B',
  },
  medical_teal: {
    bg: '061318',
    cardBg: '0D2028',
    cardAltBg: '132D38',
    primary: '2DD4BF',
    accent: '38BDF8',
    text: 'F0FDFA',
    muted: '99C2CC',
    glow: '0A292E',
  },
  emerald_civic: {
    bg: '07140F',
    cardBg: '10231C',
    cardAltBg: '173228',
    primary: '34D399',
    accent: 'FBBF24',
    text: 'ECFDF5',
    muted: '9BB5A8',
    glow: '0B2B1E',
  },
  violet_agentic: {
    bg: '0B0917',
    cardBg: '16132B',
    cardAltBg: '201B3F',
    primary: 'A78BFA',
    accent: '22D3EE',
    text: 'F5F3FF',
    muted: 'A5A1C2',
    glow: '20163E',
  },
  royal_indigo: {
    bg: '091121',
    cardBg: '121F38',
    cardAltBg: '1B2D50',
    primary: '60A5FA',
    accent: 'F59E0B',
    text: 'EFF6FF',
    muted: '93A8C7',
    glow: '13254A',
  },
  cyber_crimson: {
    bg: '11070C',
    cardBg: '1D0E16',
    cardAltBg: '291420',
    primary: 'FB7185',
    accent: '38BDF8',
    text: 'FFF1F2',
    muted: 'B89AA4',
    glow: '33101D',
  },
  arctic_obsidian: {
    bg: '070B12',
    cardBg: '101826',
    cardAltBg: '172236',
    primary: '38BDF8',
    accent: 'A3E635',
    text: 'F8FAFC',
    muted: '94A3B8',
    glow: '0D2238',
  },
  aurora_graphite: {
    bg: '0B0D10',
    cardBg: '151920',
    cardAltBg: '1E242E',
    primary: 'E2E8F0',
    accent: '34D399',
    text: 'FFFFFF',
    muted: '9CA3AF',
    glow: '172622',
  },
};

function addCreativeBackdrop(
  pptx: any,
  slide: any,
  c: PaletteColors,
  layoutStyle: PptxLayoutStyle,
  slideIndex: number
) {
  slide.background = { color: c.bg };

  if (layoutStyle === 'editorial_split') {
    // Bold vertical architectural ribbon + subtle corner block
    slide.addShape(pptx.ShapeType.rect, {
      x: slideIndex % 2 === 0 ? 12.95 : 0,
      y: 0,
      w: 0.38,
      h: 7.5,
      fill: { color: c.primary },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 10.6,
      y: -1.2,
      w: 3.8,
      h: 3.8,
      fill: { color: c.glow, transparency: 35 },
      line: { color: c.accent, width: 0.5, transparency: 65 },
    });
  } else if (layoutStyle === 'cyber_grid') {
    // Corner telemetry frame bars + glowing radar ring
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.06, fill: { color: c.accent } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.44, w: 13.33, h: 0.06, fill: { color: c.primary } });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 9.8,
      y: 4.9,
      w: 4.5,
      h: 4.5,
      fill: { color: c.glow, transparency: 40 },
      line: { color: c.primary, width: 0.75, transparency: 60 },
    });
  } else if (layoutStyle === 'orbital_flow') {
    // Dual orbital translucent circles
    slide.addShape(pptx.ShapeType.ellipse, {
      x: -1.5,
      y: 4.8,
      w: 4.2,
      h: 4.2,
      fill: { color: c.glow, transparency: 35 },
      line: { color: c.accent, width: 0.6, transparency: 70 },
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 10.8,
      y: -1.4,
      w: 4.0,
      h: 4.0,
      fill: { color: c.glow, transparency: 40 },
      line: { color: c.primary, width: 0.6, transparency: 70 },
    });
  } else if (layoutStyle === 'minimal_swiss') {
    // Crisp hairline top accent + subtle side marker
    slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.2, w: 1.4, h: 0.08, fill: { color: c.primary } });
    slide.addShape(pptx.ShapeType.rect, { x: 2.1, y: 0.2, w: 0.5, h: 0.08, fill: { color: c.accent } });
  } else {
    // bento_dark default
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: c.primary } });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 10.4,
      y: 5.2,
      w: 4.0,
      h: 4.0,
      fill: { color: c.glow, transparency: 45 },
    });
  }
}

function addHeaderFooter(
  pptx: any,
  slide: any,
  s: ScreeningSlide,
  deck: ScreeningDeck,
  c: PaletteColors,
  layoutStyle: PptxLayoutStyle
) {
  const headerY = layoutStyle === 'minimal_swiss' ? 0.38 : 0.28;
  slide.addText(
    `0${s.slideNumber} · ${(s.type || 'PITCH').toUpperCase()}  |  ${(deck.hackathonName || 'HACKATHON DECK').toUpperCase()}`,
    { x: 0.6, y: headerY, w: 9.8, h: 0.28, fontSize: 9.5, bold: true, color: c.accent }
  );

  // Subtle badge on right side of header
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 10.75,
    y: headerY - 0.03,
    w: 1.95,
    h: 0.32,
    fill: { color: c.cardAltBg },
    line: { color: c.primary, width: 0.75 },
  });
  slide.addText(`SLIDE ${s.slideNumber} / ${deck.slides.length}`, {
    x: 10.75,
    y: headerY - 0.03,
    w: 1.95,
    h: 0.32,
    fontSize: 8.5,
    bold: true,
    color: c.primary,
    align: 'center',
    valign: 'middle',
  });

  slide.addText(s.title || 'Slide', {
    x: 0.6,
    y: headerY + 0.32,
    w: 12.1,
    h: 0.58,
    fontSize: 25,
    bold: true,
    color: c.text,
  });

  slide.addText(
    `${deck.deckTitle || 'Project Deck'}  ·  ${deck.hackathonName || 'Hackathon Submission'}  ·  Crafted with KΛ-Pro`,
    {
      x: 0.6,
      y: 7.0,
      w: 12.1,
      h: 0.26,
      fontSize: 8.5,
      color: c.muted,
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deck = body?.deck as ScreeningDeck | undefined;

    if (!deck || !Array.isArray(deck.slides) || deck.slides.length === 0) {
      return NextResponse.json({ error: 'Invalid deck payload.' }, { status: 400 });
    }

    const PptxGenJS = (await import('pptxgenjs')).default;
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = deck.deckTitle || 'Kollabrix Screening Deck';
    pptx.author = 'Kollabrix KΛ-Pro';

    const paletteKey = (
      deck.themePalette && PALETTES[deck.themePalette] ? deck.themePalette : 'obsidian_amber'
    ) as PptxThemePalette;
    const c = PALETTES[paletteKey];
    const layoutStyle: PptxLayoutStyle = deck.layoutStyle || 'bento_dark';

    // Generate optional QR code image for live demo or GitHub repo
    const qrTarget = deck.liveDemoUrl || deck.repoUrl || '';
    let qrDataUrl = '';
    if (qrTarget) {
      try {
        qrDataUrl = await QRCode.toDataURL(qrTarget, {
          width: 240,
          margin: 1,
          color: { dark: `#${c.text}`, light: `#${c.cardBg}` },
        });
      } catch {}
    }

    for (let idx = 0; idx < deck.slides.length; idx++) {
      const s = deck.slides[idx];
      const slide = pptx.addSlide();
      addCreativeBackdrop(pptx, slide, c, layoutStyle, idx);

      const layout =
        s.layoutVariant ||
        (s.type === 'cover'
          ? 'cover_hero'
          : s.type === 'architecture'
          ? 'architecture_diagram'
          : s.type === 'stack'
          ? 'bento_stack'
          : s.type === 'feasibility'
          ? 'risk_matrix'
          : s.type === 'impact'
          ? 'impact_roadmap'
          : 'split_problem_stats');

      // 1. COVER HERO LAYOUT
      if (layout === 'cover_hero' || s.type === 'cover') {
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.24, h: 7.5, fill: { color: c.primary } });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 0.9,
          w: 6.2,
          h: 0.42,
          fill: { color: c.cardAltBg },
          line: { color: c.accent, width: 1 },
        });
        slide.addText((deck.hackathonName || 'HACKATHON SCREENING DECK').toUpperCase(), {
          x: 0.95,
          y: 0.94,
          w: 5.9,
          h: 0.34,
          fontSize: 10,
          bold: true,
          color: c.accent,
          valign: 'middle',
        });

        slide.addText(deck.deckTitle || s.title, {
          x: 0.8,
          y: 1.55,
          w: qrDataUrl ? 9.3 : 11.5,
          h: 1.3,
          fontSize: 38,
          bold: true,
          color: c.text,
        });

        slide.addText(s.headline || '', {
          x: 0.8,
          y: 2.95,
          w: qrDataUrl ? 9.2 : 11.2,
          h: 0.85,
          fontSize: 16.5,
          color: c.primary,
          bold: true,
        });

        if (qrDataUrl) {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 10.55,
            y: 1.45,
            w: 2.15,
            h: 2.45,
            fill: { color: c.cardBg },
            line: { color: c.accent, width: 1.2 },
          });
          slide.addImage({ data: qrDataUrl, x: 10.8, y: 1.62, w: 1.65, h: 1.65 });
          slide.addText(deck.liveDemoUrl ? 'SCAN LIVE DEMO' : 'SCAN GITHUB REPO', {
            x: 10.65,
            y: 3.4,
            w: 1.95,
            h: 0.35,
            fontSize: 8.5,
            bold: true,
            color: c.accent,
            align: 'center',
          });
        }

        // Value cards from bullets
        const coverBullets = (s.bullets || []).slice(0, 3);
        coverBullets.forEach((b, bIdx) => {
          const xPos = 0.8 + bIdx * 3.95;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos,
            y: 4.3,
            w: 3.7,
            h: 1.65,
            fill: { color: c.cardBg },
            line: { color: bIdx === 0 ? c.primary : c.cardAltBg, width: 1.2 },
          });
          slide.addText(`0${bIdx + 1}`, {
            x: xPos + 0.2,
            y: 4.42,
            w: 1.0,
            h: 0.28,
            fontSize: 10,
            bold: true,
            color: c.accent,
          });
          slide.addText(b, {
            x: xPos + 0.2,
            y: 4.74,
            w: 3.3,
            h: 1.05,
            fontSize: 12,
            color: c.text,
            valign: 'top',
          });
        });

        const footerLinks = [
          deck.repoUrl ? `Repo: ${deck.repoUrl}` : '',
          deck.liveDemoUrl ? `Live: ${deck.liveDemoUrl}` : '',
        ]
          .filter(Boolean)
          .join('   |   ');
        if (footerLinks) {
          slide.addText(footerLinks, { x: 0.8, y: 6.5, w: 11.5, h: 0.35, fontSize: 10, color: c.muted });
        }
        if (s.speakerNotes) slide.addNotes(s.speakerNotes);
        continue;
      }

      addHeaderFooter(pptx, slide, s, deck, c, layoutStyle);

      // Headline callout strip
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.32,
        w: 12.1,
        h: 0.6,
        fill: { color: c.cardBg },
        line: { color: c.primary, width: 1 },
      });
      slide.addText(s.headline || '', {
        x: 0.85,
        y: 1.35,
        w: 11.6,
        h: 0.54,
        fontSize: 13,
        bold: true,
        color: c.primary,
        valign: 'middle',
      });

      const bullets = s.bullets || [];

      // 2. ARCHITECTURE FLOW LAYOUT
      if (layout === 'architecture_diagram' || s.type === 'architecture') {
        const archNodes = Array.isArray(deck.architectureNodes) ? deck.architectureNodes.slice(0, 4) : [];
        if (archNodes.length > 0) {
          archNodes.forEach((node, nIdx) => {
            const xPos = 0.6 + nIdx * 3.12;
            slide.addShape(pptx.ShapeType.roundRect, {
              x: xPos,
              y: 2.15,
              w: 2.75,
              h: 2.2,
              fill: { color: c.cardAltBg },
              line: { color: nIdx % 2 === 0 ? c.accent : c.primary, width: 1.5 },
            });
            slide.addText((node.layer || 'LAYER').toUpperCase(), {
              x: xPos + 0.15,
              y: 2.27,
              w: 2.45,
              h: 0.25,
              fontSize: 9,
              bold: true,
              color: c.accent,
            });
            slide.addText(node.label || '', {
              x: xPos + 0.15,
              y: 2.6,
              w: 2.45,
              h: 0.45,
              fontSize: 13.5,
              bold: true,
              color: c.text,
            });
            slide.addText(node.detail || '', {
              x: xPos + 0.15,
              y: 3.12,
              w: 2.45,
              h: 1.05,
              fontSize: 10.5,
              color: c.muted,
            });
            if (nIdx < archNodes.length - 1) {
              slide.addText('➔', {
                x: xPos + 2.77,
                y: 3.05,
                w: 0.34,
                h: 0.4,
                fontSize: 16,
                bold: true,
                color: c.primary,
                align: 'center',
              });
            }
          });
        }

        if (bullets.length > 0) {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: 4.58,
            w: 12.1,
            h: 2.15,
            fill: { color: c.cardBg },
            line: { color: c.cardAltBg, width: 1 },
          });
          slide.addText(
            bullets.map((b) => ({
              text: b,
              options: { bullet: { indent: 12 }, color: c.text, fontSize: 13, breakLine: true },
            })),
            { x: 0.85, y: 4.72, w: 11.6, h: 1.85, valign: 'top', paraSpaceAfter: 6 }
          );
        }
      }
      // 3. BENTO TECH STACK GRID (2x2)
      else if (layout === 'bento_stack' || s.type === 'stack') {
        const grid =
          Array.isArray(s.stackGrid) && s.stackGrid.length > 0
            ? s.stackGrid.slice(0, 4)
            : bullets.slice(0, 4).map((b, gIdx) => ({
                category: ['Frontend & UX', 'Backend & APIs', 'Data & Storage', 'AI / Infra'][gIdx] || `Layer ${gIdx + 1}`,
                items: [b],
              }));

        grid.forEach((cell, gIdx) => {
          const col = gIdx % 2;
          const row = Math.floor(gIdx / 2);
          const xPos = 0.6 + col * 6.2;
          const yPos = 2.15 + row * 2.32;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos,
            y: yPos,
            w: 5.9,
            h: 2.12,
            fill: { color: c.cardBg },
            line: { color: gIdx % 2 === 0 ? c.accent : c.primary, width: 1.2 },
          });
          slide.addText((cell.category || 'STACK').toUpperCase(), {
            x: xPos + 0.25,
            y: yPos + 0.18,
            w: 5.4,
            h: 0.3,
            fontSize: 11,
            bold: true,
            color: gIdx % 2 === 0 ? c.accent : c.primary,
          });
          slide.addText(
            (cell.items || []).map((it) => ({
              text: it,
              options: { bullet: { indent: 12 }, color: c.text, fontSize: 13, breakLine: true },
            })),
            { x: xPos + 0.25, y: yPos + 0.56, w: 5.4, h: 1.4, valign: 'top', paraSpaceAfter: 5 }
          );
        });
      }
      // 4. RISK & MITIGATION MATRIX
      else if (layout === 'risk_matrix' || s.type === 'feasibility') {
        const pairs =
          Array.isArray(s.riskPairs) && s.riskPairs.length > 0
            ? s.riskPairs.slice(0, 3)
            : bullets.slice(0, 3).map((b, rIdx) => ({
                risk: `Execution Challenge #${rIdx + 1}`,
                mitigation: b,
              }));

        pairs.forEach((pair, rIdx) => {
          const yPos = 2.15 + rIdx * 1.52;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: yPos,
            w: 5.2,
            h: 1.32,
            fill: { color: c.cardAltBg },
            line: { color: 'F43F5E', width: 1 },
          });
          slide.addText(`RISK: ${pair.risk}`, {
            x: 0.8,
            y: yPos + 0.14,
            w: 4.8,
            h: 1.04,
            fontSize: 12,
            bold: true,
            color: 'FDA4AF',
            valign: 'middle',
          });

          slide.addText('➔', {
            x: 5.85,
            y: yPos + 0.42,
            w: 0.5,
            h: 0.4,
            fontSize: 16,
            color: c.primary,
            align: 'center',
          });

          slide.addShape(pptx.ShapeType.roundRect, {
            x: 6.4,
            y: yPos,
            w: 6.3,
            h: 1.32,
            fill: { color: c.cardBg },
            line: { color: c.accent, width: 1 },
          });
          slide.addText(`MITIGATION: ${pair.mitigation}`, {
            x: 6.6,
            y: yPos + 0.14,
            w: 5.9,
            h: 1.04,
            fontSize: 12,
            color: c.text,
            valign: 'middle',
          });
        });
      }
      // 5. IMPACT / METRICS WITH NATIVE CHART WHEN AVAILABLE
      else if ((layout === 'impact_roadmap' || s.type === 'impact') && s.chartData?.labels?.length && s.chartData?.values?.length) {
        // Left: Roadmap cards (6.6w), Right: Real Editable PowerPoint Bar Chart (5.2w)
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: 2.15,
          w: 6.6,
          h: 4.55,
          fill: { color: c.cardBg },
          line: { color: c.cardAltBg, width: 1 },
        });
        slide.addText('PHASED IMPACT & ROLLOUT', {
          x: 0.85,
          y: 2.32,
          w: 6.1,
          h: 0.3,
          fontSize: 10,
          bold: true,
          color: c.accent,
        });
        slide.addText(
          bullets.map((b) => ({
            text: b,
            options: { bullet: { indent: 14 }, color: c.text, fontSize: 13.5, breakLine: true },
          })),
          { x: 0.85, y: 2.7, w: 6.1, h: 3.8, valign: 'top', paraSpaceAfter: 12 }
        );

        slide.addShape(pptx.ShapeType.roundRect, {
          x: 7.45,
          y: 2.15,
          w: 5.25,
          h: 4.55,
          fill: { color: c.cardAltBg },
          line: { color: c.primary, width: 1.2 },
        });
        try {
          slide.addChart(
            pptx.ChartType.bar,
            [
              {
                name: s.chartData.title || 'Projected Impact',
                labels: s.chartData.labels.slice(0, 5),
                values: s.chartData.values.slice(0, 5).map((v) => Number(v) || 0),
              },
            ],
            {
              x: 7.65,
              y: 2.35,
              w: 4.85,
              h: 4.15,
              barDir: 'col',
              chartColors: [c.primary, c.accent],
              showTitle: true,
              title: s.chartData.title || 'Impact Metrics',
              titleColor: c.text,
              titleFontSize: 12,
              catAxisLabelColor: c.muted,
              valAxisLabelColor: c.muted,
              showLegend: false,
              showValue: true,
              dataLabelColor: c.text,
            }
          );
        } catch {
          // Fallback if chart values fail
          (s.kpis || []).slice(0, 3).forEach((k, kIdx) => {
            const yPos = 2.35 + kIdx * 1.38;
            slide.addText(`${k.value} — ${k.label}`, {
              x: 7.75,
              y: yPos,
              w: 4.6,
              h: 1.0,
              fontSize: 16,
              bold: true,
              color: c.primary,
            });
          });
        }
      }
      // 6. SPLIT PROBLEM / SOLUTION / KPIs + VISUAL CARDS
      else {
        const kpis = Array.isArray(s.kpis) && s.kpis.length > 0 ? s.kpis.slice(0, 3) : [];
        if (kpis.length > 0) {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: 2.15,
            w: 7.7,
            h: 4.55,
            fill: { color: c.cardBg },
            line: { color: c.cardAltBg, width: 1 },
          });
          slide.addText(
            bullets.map((b) => ({
              text: b,
              options: { bullet: { indent: 14 }, color: c.text, fontSize: 14, breakLine: true },
            })),
            { x: 0.85, y: 2.4, w: 7.2, h: 4.05, valign: 'top', paraSpaceAfter: 12 }
          );

          kpis.forEach((k, kIdx) => {
            const yPos = 2.15 + kIdx * 1.54;
            slide.addShape(pptx.ShapeType.roundRect, {
              x: 8.55,
              y: yPos,
              w: 4.15,
              h: 1.36,
              fill: { color: c.cardAltBg },
              line: { color: kIdx === 0 ? c.primary : c.accent, width: 1.3 },
            });
            slide.addText(k.value || '', {
              x: 8.75,
              y: yPos + 0.14,
              w: 3.75,
              h: 0.55,
              fontSize: 22,
              bold: true,
              color: kIdx === 0 ? c.primary : c.accent,
            });
            slide.addText(k.label || '', {
              x: 8.75,
              y: yPos + 0.72,
              w: 3.75,
              h: 0.45,
              fontSize: 11,
              color: c.muted,
            });
          });
        } else {
          // 2-column or horizontal step cards depending on layoutStyle
          if (layoutStyle === 'cyber_grid' || layoutStyle === 'editorial_split') {
            bullets.slice(0, 4).forEach((b, bIdx) => {
              const col = bIdx % 2;
              const row = Math.floor(bIdx / 2);
              const xPos = 0.6 + col * 6.2;
              const yPos = 2.15 + row * 2.3;
              slide.addShape(pptx.ShapeType.roundRect, {
                x: xPos,
                y: yPos,
                w: 5.9,
                h: 2.08,
                fill: { color: bIdx % 2 === 0 ? c.cardBg : c.cardAltBg },
                line: { color: bIdx === 0 ? c.primary : c.accent, width: 1.1 },
              });
              slide.addText(`STEP 0${bIdx + 1}`, {
                x: xPos + 0.25,
                y: yPos + 0.2,
                w: 5.4,
                h: 0.28,
                fontSize: 10,
                bold: true,
                color: c.accent,
              });
              slide.addText(b, {
                x: xPos + 0.25,
                y: yPos + 0.56,
                w: 5.4,
                h: 1.32,
                fontSize: 13.5,
                color: c.text,
                valign: 'top',
              });
            });
          } else {
            bullets.slice(0, 4).forEach((b, bIdx) => {
              const yPos = 2.15 + bIdx * 1.14;
              slide.addShape(pptx.ShapeType.roundRect, {
                x: 0.6,
                y: yPos,
                w: 12.1,
                h: 0.98,
                fill: { color: bIdx % 2 === 0 ? c.cardBg : c.cardAltBg },
                line: { color: bIdx === 0 ? c.primary : c.cardAltBg, width: 1 },
              });
              slide.addText(`0${bIdx + 1}`, {
                x: 0.8,
                y: yPos + 0.18,
                w: 0.6,
                h: 0.6,
                fontSize: 16,
                bold: true,
                color: c.accent,
                valign: 'middle',
              });
              slide.addText(b, {
                x: 1.5,
                y: yPos + 0.12,
                w: 10.9,
                h: 0.74,
                fontSize: 13.5,
                color: c.text,
                valign: 'middle',
              });
            });
          }
        }
      }

      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }
    }

    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    const slug = (deck.deckTitle || 'kollabrix-deck').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${slug}-screening-deck.pptx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to build .pptx file.' }, { status: 500 });
  }
}
