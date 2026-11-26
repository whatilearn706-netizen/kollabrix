import { NextRequest, NextResponse } from 'next/server';
import type { ScreeningDeck } from '@/lib/spark/pptxExport';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    pptx.author = 'Kollabrix KΛ ΛI';

    const bg = '0B0D14';
    const cardBg = '141824';
    const amber = 'FBBF24';
    const cyan = '22D3EE';
    const white = 'F8FAFC';
    const muted = '94A3B8';

    for (const s of deck.slides) {
      const slide = pptx.addSlide();
      slide.background = { color: bg };

      slide.addText(
        `SLIDE ${s.slideNumber} · ${(s.type || 'PITCH').toUpperCase()}  |  ${deck.hackathonName || 'KOLLABRIX'}`,
        { x: 0.6, y: 0.35, w: 12.1, h: 0.3, fontSize: 10, bold: true, color: cyan }
      );

      slide.addText(s.title || 'Slide', {
        x: 0.6,
        y: 0.72,
        w: 12.1,
        h: 0.65,
        fontSize: 28,
        bold: true,
        color: white,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.5,
        w: 12.1,
        h: 0.72,
        fill: { color: cardBg },
        line: { color: amber, width: 1 },
      });
      slide.addText(s.headline || '', {
        x: 0.85,
        y: 1.58,
        w: 11.6,
        h: 0.56,
        fontSize: 14,
        bold: true,
        color: amber,
        valign: 'middle',
      });

      const bulletItems = (s.bullets || []).map((b) => ({
        text: b,
        options: { bullet: { indent: 14 }, color: white, fontSize: 15, breakLine: true },
      }));

      const archNodes = Array.isArray(deck.architectureNodes) ? deck.architectureNodes.slice(0, 4) : [];
      if (s.type === 'architecture' && archNodes.length > 0) {
        archNodes.forEach((node, idx) => {
          const xPos = 0.6 + idx * 3.1;
          slide.addShape(pptx.ShapeType.roundRect, {
            x: xPos,
            y: 2.5,
            w: 2.85,
            h: 1.9,
            fill: { color: cardBg },
            line: { color: cyan, width: 1.5 },
          });
          slide.addText((node.layer || 'LAYER').toUpperCase(), {
            x: xPos + 0.15,
            y: 2.65,
            w: 2.55,
            h: 0.25,
            fontSize: 9,
            bold: true,
            color: cyan,
          });
          slide.addText(node.label || '', {
            x: xPos + 0.15,
            y: 2.95,
            w: 2.55,
            h: 0.45,
            fontSize: 14,
            bold: true,
            color: white,
          });
          slide.addText(node.detail || '', {
            x: xPos + 0.15,
            y: 3.45,
            w: 2.55,
            h: 0.8,
            fontSize: 11,
            color: muted,
          });
        });

        if (bulletItems.length > 0) {
          slide.addText(bulletItems, {
            x: 0.7,
            y: 4.65,
            w: 11.9,
            h: 1.95,
            valign: 'top',
            paraSpaceAfter: 6,
          });
        }
      } else if (bulletItems.length > 0) {
        slide.addText(bulletItems, {
          x: 0.7,
          y: 2.5,
          w: 11.9,
          h: 3.4,
          valign: 'top',
          paraSpaceAfter: 12,
        });
      }

      slide.addText(`${deck.deckTitle}  ·  Generated with Kollabrix KΛ ΛI Hackathon Sprint Pass`, {
        x: 0.6,
        y: 6.85,
        w: 12.1,
        h: 0.3,
        fontSize: 9,
        color: muted,
      });

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
