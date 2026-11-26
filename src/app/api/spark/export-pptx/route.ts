import { NextRequest, NextResponse } from 'next/server';
import type { PptxThemePalette, ScreeningDeck, ScreeningSlide } from '@/lib/spark/pptxExport';

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
}

const PALETTES: Record<PptxThemePalette, PaletteColors> = {
  obsidian_amber: {
    bg: '0B0D14',
    cardBg: '141824',
    cardAltBg: '1B2132',
    primary: 'FBBF24',
    accent: '22D3EE',
    text: 'F8FAFC',
    muted: '94A3B8',
  },
  medical_teal: {
    bg: '071318',
    cardBg: '0E2028',
    cardAltBg: '132C36',
    primary: '2DD4BF',
    accent: '38BDF8',
    text: 'F0FDFA',
    muted: '99C2CC',
  },
  emerald_civic: {
    bg: '081410',
    cardBg: '10231C',
    cardAltBg: '173026',
    primary: '34D399',
    accent: 'FBBF24',
    text: 'ECFDF5',
    muted: '9BB5A8',
  },
  violet_agentic: {
    bg: '0B0A16',
    cardBg: '151329',
    cardAltBg: '1E1B3A',
    primary: 'A78BFA',
    accent: '22D3EE',
    text: 'F5F3FF',
    muted: 'A5A1C2',
  },
  royal_indigo: {
    bg: '0A1120',
    cardBg: '131E36',
    cardAltBg: '1A2947',
    primary: '60A5FA',
    accent: 'F59E0B',
    text: 'EFF6FF',
    muted: '93A8C7',
  },
};

function addHeaderFooter(
  pptx: any,
  slide: any,
  s: ScreeningSlide,
  deck: ScreeningDeck,
  c: PaletteColors
) {
  // Subtle top accent strip
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.08,
    fill: { color: c.primary },
  });

  slide.addText(
    `SLIDE ${s.slideNumber} · ${(s.type || 'PITCH').toUpperCase()}  |  ${(deck.hackathonName || 'HACKATHON DECK').toUpperCase()}`,
    { x: 0.6, y: 0.3, w: 12.1, h: 0.28, fontSize: 9.5, bold: true, color: c.accent }
  );

  slide.addText(s.title || 'Slide', {
    x: 0.6,
    y: 0.62,
    w: 12.1,
    h: 0.6,
    fontSize: 26,
    bold: true,
    color: c.text,
  });

  slide.addText(`${deck.deckTitle || 'Project Deck'}  ·  ${deck.hackathonName || 'Hackathon Submission'}  ·  Built with Kollabrix KΛ-Pro`, {
    x: 0.6,
    y: 6.95,
    w: 12.1,
    h: 0.28,
    fontSize: 8.5,
    color: c.muted,
  });
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
    pptx.author = 'Kollabrix KΛ-Pro (Gemini 4 Hydrogen)';

    const paletteKey = (deck.themePalette && PALETTES[deck.themePalette] ? deck.themePalette : 'obsidian_amber') as PptxThemePalette;
    const c = PALETTES[paletteKey];

    for (const s of deck.slides) {
      const slide = pptx.addSlide();
      slide.background = { color: c.bg };
      const layout = s.layoutVariant || (s.type === 'cover' ? 'cover_hero' : s.type === 'architecture' ? 'architecture_diagram' : s.type === 'stack' ? 'bento_stack' : s.type === 'feasibility' ? 'risk_matrix' : 'split_problem_stats');

      // 1. COVER HERO LAYOUT
      if (layout === 'cover_hero' || s.type === 'cover') {
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: c.primary } });
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 1.0,
          w: 5.5,
          h: 0.42,
          fill: { color: c.cardAltBg },
          line: { color: c.accent, width: 1 },
        });
        slide.addText((deck.hackathonName || 'HACKATHON SCREENING DECK').toUpperCase(), {
          x: 0.95,
          y: 1.04,
          w: 5.2,
          h: 0.34,
          fontSize: 10,
          bold: true,
          color: c.accent,
        });

        slide.addText(deck.deckTitle || s.title, {
          x: 0.8,
          y: 1.65,
          w: 11.5,
          h: 1.25,
          fontSize: 38,
          bold: true,
          color: c.text,
        });

        slide.addText(s.headline || '', {
          x: 0.8,
          y: 3.0,
          w: 11.2,
          h: 0.85,
          fontSize: 17,
          color: c.primary,
          bold: true,
        });

        // Summary pills from bullets on cover
        const coverBullets = (s.bullets || []).slice(0, 3);
        coverBullets.forEach((b, idx) => {
          const xPos = 0.8 + idx * 3.95;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos,
            y: 4.25,
            w: 3.7,
            h: 1.65,
            fill: { color: c.cardBg },
            line: { color: c.primary, width: 1 },
          });
          slide.addText(b, {
            x: xPos + 0.2,
            y: 4.4,
            w: 3.3,
            h: 1.35,
            fontSize: 12,
            color: c.text,
            valign: 'top',
          });
        });

        const footerLinks = [deck.repoUrl ? `Repo: ${deck.repoUrl}` : '', deck.liveDemoUrl ? `Live: ${deck.liveDemoUrl}` : ''].filter(Boolean).join('   |   ');
        if (footerLinks) {
          slide.addText(footerLinks, { x: 0.8, y: 6.45, w: 11.5, h: 0.35, fontSize: 10, color: c.muted });
        }
        if (s.speakerNotes) slide.addNotes(s.speakerNotes);
        continue;
      }

      addHeaderFooter(pptx, slide, s, deck, c);

      // Headline callout strip
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.32,
        w: 12.1,
        h: 0.62,
        fill: { color: c.cardBg },
        line: { color: c.primary, width: 1 },
      });
      slide.addText(s.headline || '', {
        x: 0.85,
        y: 1.36,
        w: 11.6,
        h: 0.54,
        fontSize: 13.5,
        bold: true,
        color: c.primary,
        valign: 'middle',
      });

      const bullets = s.bullets || [];

      // 2. ARCHITECTURE FLOW LAYOUT
      if (layout === 'architecture_diagram' || s.type === 'architecture') {
        const archNodes = Array.isArray(deck.architectureNodes) ? deck.architectureNodes.slice(0, 4) : [];
        if (archNodes.length > 0) {
          archNodes.forEach((node, idx) => {
            const xPos = 0.6 + idx * 3.12;
            slide.addShape(pptx.ShapeType.roundRect, {
              x: xPos,
              y: 2.2,
              w: 2.75,
              h: 2.15,
              fill: { color: c.cardAltBg },
              line: { color: c.accent, width: 1.5 },
            });
            slide.addText((node.layer || 'LAYER').toUpperCase(), {
              x: xPos + 0.15,
              y: 2.32,
              w: 2.45,
              h: 0.25,
              fontSize: 9,
              bold: true,
              color: c.accent,
            });
            slide.addText(node.label || '', {
              x: xPos + 0.15,
              y: 2.65,
              w: 2.45,
              h: 0.45,
              fontSize: 13.5,
              bold: true,
              color: c.text,
            });
            slide.addText(node.detail || '', {
              x: xPos + 0.15,
              y: 3.18,
              w: 2.45,
              h: 1.0,
              fontSize: 10.5,
              color: c.muted,
            });
            if (idx < archNodes.length - 1) {
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
            y: 4.6,
            w: 12.1,
            h: 2.1,
            fill: { color: c.cardBg },
            line: { color: c.cardAltBg, width: 1 },
          });
          slide.addText(
            bullets.map((b) => ({ text: b, options: { bullet: { indent: 12 }, color: c.text, fontSize: 13, breakLine: true } })),
            { x: 0.85, y: 4.75, w: 11.6, h: 1.85, valign: 'top', paraSpaceAfter: 6 }
          );
        }
      }
      // 3. BENTO TECH STACK GRID (2x2)
      else if (layout === 'bento_stack' || s.type === 'stack') {
        const grid = Array.isArray(s.stackGrid) && s.stackGrid.length > 0
          ? s.stackGrid.slice(0, 4)
          : bullets.slice(0, 4).map((b, idx) => ({
              category: ['Frontend & UX', 'Backend & APIs', 'Data & Storage', 'AI / Infra'][idx] || `Layer ${idx + 1}`,
              items: [b],
            }));

        grid.forEach((cell, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const xPos = 0.6 + col * 6.2;
          const yPos = 2.2 + row * 2.3;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos,
            y: yPos,
            w: 5.9,
            h: 2.1,
            fill: { color: c.cardBg },
            line: { color: idx % 2 === 0 ? c.accent : c.primary, width: 1.2 },
          });
          slide.addText((cell.category || 'STACK').toUpperCase(), {
            x: xPos + 0.25,
            y: yPos + 0.18,
            w: 5.4,
            h: 0.3,
            fontSize: 11,
            bold: true,
            color: idx % 2 === 0 ? c.accent : c.primary,
          });
          slide.addText(
            (cell.items || []).map((it) => ({
              text: it,
              options: { bullet: { indent: 12 }, color: c.text, fontSize: 13, breakLine: true },
            })),
            { x: xPos + 0.25, y: yPos + 0.58, w: 5.4, h: 1.35, valign: 'top', paraSpaceAfter: 5 }
          );
        });
      }
      // 4. RISK & MITIGATION MATRIX
      else if (layout === 'risk_matrix' || s.type === 'feasibility') {
        const pairs = Array.isArray(s.riskPairs) && s.riskPairs.length > 0
          ? s.riskPairs.slice(0, 3)
          : bullets.slice(0, 3).map((b, idx) => ({
              risk: `Execution Challenge #${idx + 1}`,
              mitigation: b,
            }));

        pairs.forEach((pair, idx) => {
          const yPos = 2.2 + idx * 1.5;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: yPos,
            w: 5.2,
            h: 1.3,
            fill: { color: c.cardAltBg },
            line: { color: 'F43F5E', width: 1 },
          });
          slide.addText(`RISK: ${pair.risk}`, {
            x: 0.8,
            y: yPos + 0.15,
            w: 4.8,
            h: 1.0,
            fontSize: 12.5,
            bold: true,
            color: 'FDA4AF',
            valign: 'middle',
          });

          slide.addText('➔', { x: 5.85, y: yPos + 0.42, w: 0.5, h: 0.4, fontSize: 16, color: c.primary, align: 'center' });

          slide.addShape(pptx.ShapeType.roundRect, {
            x: 6.4,
            y: yPos,
            w: 6.3,
            h: 1.3,
            fill: { color: c.cardBg },
            line: { color: c.accent, width: 1 },
          });
          slide.addText(`MITIGATION: ${pair.mitigation}`, {
            x: 6.6,
            y: yPos + 0.15,
            w: 5.9,
            h: 1.0,
            fontSize: 12.5,
            color: c.text,
            valign: 'middle',
          });
        });
      }
      // 5. SPLIT PROBLEM / SOLUTION / IMPACT KPIs + CARDS
      else {
        const kpis = Array.isArray(s.kpis) && s.kpis.length > 0 ? s.kpis.slice(0, 3) : [];
        if (kpis.length > 0) {
          // Left: Bullet cards (7.5w), Right: Stacked KPI metric cards (4.2w)
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.6,
            y: 2.2,
            w: 7.7,
            h: 4.45,
            fill: { color: c.cardBg },
            line: { color: c.cardAltBg, width: 1 },
          });
          slide.addText(
            bullets.map((b) => ({ text: b, options: { bullet: { indent: 14 }, color: c.text, fontSize: 14, breakLine: true } })),
            { x: 0.85, y: 2.45, w: 7.2, h: 4.0, valign: 'top', paraSpaceAfter: 12 }
          );

          kpis.forEach((k, idx) => {
            const yPos = 2.2 + idx * 1.52;
            slide.addShape(pptx.ShapeType.roundRect, {
              x: 8.55,
              y: yPos,
              w: 4.15,
              h: 1.35,
              fill: { color: c.cardAltBg },
              line: { color: idx === 0 ? c.primary : c.accent, width: 1.3 },
            });
            slide.addText(k.value || '', {
              x: 8.75,
              y: yPos + 0.15,
              w: 3.75,
              h: 0.55,
              fontSize: 22,
              bold: true,
              color: idx === 0 ? c.primary : c.accent,
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
          // Distinct multi-card horizontal split instead of plain text block
          bullets.slice(0, 4).forEach((b, idx) => {
            const yPos = 2.2 + idx * 1.12;
            slide.addShape(pptx.ShapeType.roundRect, {
              x: 0.6,
              y: yPos,
              w: 12.1,
              h: 0.96,
              fill: { color: idx % 2 === 0 ? c.cardBg : c.cardAltBg },
              line: { color: idx === 0 ? c.primary : c.cardAltBg, width: 1 },
            });
            slide.addText(`0${idx + 1}`, {
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
              h: 0.72,
              fontSize: 13.5,
              color: c.text,
              valign: 'middle',
            });
          });
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
