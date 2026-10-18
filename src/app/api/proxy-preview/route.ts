import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Preview</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#94a3b8;font-family:system-ui,sans-serif;">
          <div style="text-align:center;padding:24px;">
            <p style="font-size:14px;">Please provide a valid preview URL.</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Ensure valid HTTP/HTTPS protocol
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    const parsedTarget = new URL(normalizedUrl);
    const host = parsedTarget.hostname.toLowerCase();

    // Security Defense: Block private IPs, cloud metadata endpoints, loopback, and internal network scans
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '169.254.169.254' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="background:#0f172a;color:#ef4444;font-family:sans-serif;padding:32px;text-align:center;">
          <h3 style="margin-bottom:8px;">⚠️ Security Protection Notice</h3>
          <p style="color:#94a3b8;font-size:13px;max-width:400px;margin:0 auto;">Embedding internal loopback addresses or private local networks is blocked by the Linkora Security Shield.</p>
        </body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Fetch target URL with browser-like user agent
    const response = await fetch(parsedTarget.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || '';

    // If it's HTML, inject base tag, strip meta CSP/XFO, and apply anti-frame-busting shim
    if (contentType.includes('text/html')) {
      let html = await response.text();

      // 1. Strip meta CSP and X-Frame-Options tags that block embedding from inside the DOM
      html = html.replace(/<meta[^>]*http-equiv=["']?(?:content-security-policy|x-frame-options)["']?[^>]*>/gi, '');

      // 2. Base tag ensures relative scripts, styles, and images load directly from the target domain (using final URL after any redirects)
      const finalUrl = response.url || parsedTarget.href;
      const baseTag = `<base href="${finalUrl}">`;

      // 3. Neutralize frame-busting scripts (e.g. if (top !== self) top.location = self.location)
      const antiBustScript = `
        <script>
          try {
            window.onbeforeunload = null;
            Object.defineProperty(window, 'top', { get: function() { return window; }, configurable: true });
            Object.defineProperty(window, 'parent', { get: function() { return window; }, configurable: true });
          } catch(e) {}
        </script>
      `;

      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, `$&${baseTag}${antiBustScript}`);
      } else {
        html = `<head>${baseTag}${antiBustScript}</head>${html}`;
      }

      return new NextResponse(html, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          // Explicitly omit X-Frame-Options and Content-Security-Policy to allow embedding!
        },
      });
    }

    // Pass through non-HTML content (CSS, JS, images, fonts)
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Preview Offline</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0b0f19;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif;padding:24px;box-sizing:border-box;">
          <div style="max-width:440px;background:#131b2e;border:1px solid #1e293b;border-radius:16px;padding:32px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;color:#ef4444;font-size:20px;">
              🌐
            </div>
            <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#fff;">Live Preview Standby</h3>
            <p style="margin:0 0 20px;font-size:12px;color:#94a3b8;line-height:1.6;">
              Could not embed <strong>${normalizedUrl}</strong> directly inside the frame. The target host may be offline or requiring authentication.
            </p>
            <div style="display:flex;gap:10px;justify-content:center;">
              <a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;font-size:12px;font-weight:600;padding:10px 18px;border-radius:10px;">
                Open in External Tab ↗
              </a>
            </div>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
