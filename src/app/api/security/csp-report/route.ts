import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CSP Violation Report Receiver
 * Ingests and logs Content Security Policy violation reports for security auditing.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let reportData = null;

    if (contentType.includes('application/csp-report') || contentType.includes('application/json')) {
      reportData = await request.json();
    } else {
      const raw = await request.text();
      try {
        reportData = JSON.parse(raw);
      } catch {
        reportData = { rawText: raw };
      }
    }

    const report = reportData?.['csp-report'] || reportData;

    // Log structured CSP violation
    console.warn('🛡️ [CSP Violation Detected]:', {
      blockedUri: report?.['blocked-uri'] || report?.blockedURI,
      violatedDirective: report?.['violated-directive'] || report?.violatedDirective,
      originalPolicy: report?.['original-policy'],
      documentUri: report?.['document-uri'] || report?.documentURI,
      sourceFile: report?.['source-file'],
      lineNumber: report?.['line-number'],
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process CSP report' }, { status: 400 });
  }
}
