export interface LiveDemoSnapshot {
  checked: boolean;
  url: string;
  reachable: boolean;
  statusCode: number;
  latencyMs: number;
  title: string;
  description: string;
  detectedFramework: string;
  detectedRoutes: string[];
  headings: string[];
  visibleTextExcerpt: string;
  isBoilerplateOrError: boolean;
  errorReason?: string;
  summaryText: string;
}

export interface ExternalHackathonSnapshot {
  found: boolean;
  sourceUrl: string;
  title: string;
  summaryText: string;
}

const PRIVATE_HOST_RE =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fe80:|fd)/i;

export function isSafePublicHttpUrl(rawUrl: string): URL | null {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname || !u.hostname.includes('.') || PRIVATE_HOST_RE.test(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Fetches and inspects a deployed live demo URL (Vercel, Netlify, Render, Railway, custom domain)
 * so KΛ-Pro / Gemini 4 Hydrogen can verify real deployment health, framework, routes, and visible UI.
 */
export async function fetchLiveDemoContext(rawUrl: string): Promise<LiveDemoSnapshot> {
  const parsed = isSafePublicHttpUrl(rawUrl);
  const empty: LiveDemoSnapshot = {
    checked: Boolean(rawUrl.trim()),
    url: rawUrl.trim(),
    reachable: false,
    statusCode: 0,
    latencyMs: 0,
    title: '',
    description: '',
    detectedFramework: 'Unknown',
    detectedRoutes: [],
    headings: [],
    visibleTextExcerpt: '',
    isBoilerplateOrError: false,
    summaryText: '',
  };

  if (!parsed) {
    if (rawUrl.trim()) {
      return {
        ...empty,
        errorReason: 'Invalid or private Live Demo URL',
        summaryText: `Live Demo Check: URL "${rawUrl}" is invalid or blocked.`,
      };
    }
    return empty;
  }

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Kollabrix-KA-Verifier/2.0 (Hackathon Demo Inspector)',
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - start;
    const html = (await res.text()).slice(0, 120000);

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, ' ').trim()) : '';

    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i);
    const description = metaDescMatch ? decodeHtmlEntities(metaDescMatch[1].trim()) : '';

    const headings: string[] = [];
    const headingRe = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
    let hm: RegExpExecArray | null;
    while ((hm = headingRe.exec(html)) !== null && headings.length < 12) {
      const txt = stripTags(hm[1]);
      if (txt && txt.length >= 2 && !headings.includes(txt)) headings.push(txt.slice(0, 120));
    }

    const detectedRoutes: string[] = [];
    const hrefRe = /href=["'](\/[a-zA-Z0-9_\-\/]{1,50})["']/g;
    let rm: RegExpExecArray | null;
    while ((rm = hrefRe.exec(html)) !== null && detectedRoutes.length < 15) {
      const route = rm[1];
      if (!route.startsWith('/_next') && !route.startsWith('/assets') && !detectedRoutes.includes(route)) {
        detectedRoutes.push(route);
      }
    }

    let detectedFramework = 'Static / Custom Web App';
    if (html.includes('__NEXT_DATA__') || html.includes('/_next/static')) detectedFramework = 'Next.js';
    else if (html.includes('streamlit') || html.includes('stApp')) detectedFramework = 'Streamlit';
    else if (html.includes('gradio')) detectedFramework = 'Gradio';
    else if (html.includes('/assets/index-') || html.includes('vite')) detectedFramework = 'Vite / React SPA';
    else if (html.includes('root') && html.length < 4000) detectedFramework = 'Client-Side React SPA';

    const visibleText = stripTags(html).slice(0, 2200);
    const lowerCombined = `${title} ${visibleText}`.toLowerCase();
    const isBoilerplateOrError =
      res.status >= 400 ||
      /create next app|deployment_not_found|404: this page could not be found|application error: a client-side exception|502 bad gateway/i.test(
        lowerCombined
      );

    const summaryLines = [
      `LIVE DEMO URL CHECK (${parsed.toString()}):`,
      `- HTTP Status: ${res.status} (${res.ok ? 'REACHABLE' : 'ERROR'}) · Latency: ${latencyMs}ms · Framework: ${detectedFramework}`,
      title ? `- Page Title: ${title}` : '',
      description ? `- Meta Description: ${description}` : '',
      headings.length ? `- Rendered UI Headings: ${headings.join(' | ')}` : '',
      detectedRoutes.length ? `- Detected App Routes/Links: ${detectedRoutes.join(', ')}` : '',
      isBoilerplateOrError
        ? '- WARNING: Live demo appears to show an error page, 404, or uncustomized starter boilerplate!'
        : '',
      visibleText ? `- Live Rendered Text Excerpt: ${visibleText.slice(0, 1400)}` : '',
    ].filter(Boolean);

    return {
      checked: true,
      url: parsed.toString(),
      reachable: res.ok && !isBoilerplateOrError,
      statusCode: res.status,
      latencyMs,
      title,
      description,
      detectedFramework,
      detectedRoutes,
      headings,
      visibleTextExcerpt: visibleText,
      isBoilerplateOrError,
      summaryText: summaryLines.join('\n'),
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      ...empty,
      latencyMs: Date.now() - start,
      errorReason: err?.name === 'AbortError' ? 'Timed out (>7s)' : err?.message || 'Connection failed',
      summaryText: `LIVE DEMO URL CHECK (${parsed.toString()}): FAILED TO CONNECT (${
        err?.name === 'AbortError' ? 'Timed out after 7s' : err?.message || 'Unreachable'
      }).`,
    };
  }
}

/**
 * Fetches an external hackathon webpage (Devfolio, Unstop, DoraHacks, SIH, MLH, college site)
 * so KΛ-Pro aligns slides, judge scoring, and Q&A with that specific hackathon's criteria & themes.
 */
export async function fetchExternalHackathonContext(rawUrl: string): Promise<ExternalHackathonSnapshot> {
  const parsed = isSafePublicHttpUrl(rawUrl);
  if (!parsed) {
    return { found: false, sourceUrl: rawUrl, title: '', summaryText: '' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Kollabrix-KA-HackathonReader/2.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return { found: false, sourceUrl: parsed.toString(), title: '', summaryText: '' };

    const html = (await res.text()).slice(0, 100000);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, ' ').trim()) : parsed.hostname;
    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i);
    const desc = metaDescMatch ? decodeHtmlEntities(metaDescMatch[1].trim()) : '';
    const bodyText = stripTags(html).slice(0, 1800);

    return {
      found: true,
      sourceUrl: parsed.toString(),
      title,
      summaryText: `External Hackathon Page (${parsed.toString()}):\nTitle: ${title}\n${
        desc ? `Summary: ${desc}\n` : ''
      }Page Details / Tracks / Criteria Excerpt: ${bodyText}`,
    };
  } catch {
    clearTimeout(timer);
    return { found: false, sourceUrl: parsed.toString(), title: '', summaryText: '' };
  }
}
