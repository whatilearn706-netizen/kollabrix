export type KaSubdomain = 'ai' | 'folio' | null;

export const KOLLABRIX_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kollabrix.in';
export const KA_AI_ORIGIN =
  process.env.NEXT_PUBLIC_KA_AI_URL || 'https://ai.kollabrix.in';
export const KA_FOLIO_ORIGIN =
  process.env.NEXT_PUBLIC_KA_FOLIO_URL || 'https://folio.kollabrix.in';

/**
 * Resolves which standalone KΛ brand subdomain a hostname corresponds to.
 */
export function getKaSubdomainFromHost(rawHost?: string | null): KaSubdomain {
  if (!rawHost) return null;
  const host = rawHost.toLowerCase().split(':')[0].trim();
  if (host === 'ai.kollabrix.in' || host.startsWith('ai.')) return 'ai';
  if (
    host === 'folio.kollabrix.in' ||
    host === 'codex.kollabrix.in' ||
    host.startsWith('folio.') ||
    host.startsWith('codex.')
  ) {
    return 'folio';
  }
  return null;
}

/**
 * Returns true if the hostname belongs to kollabrix.in (root or any subdomain),
 * enabling shared cross-subdomain authentication cookies on `.kollabrix.in`.
 */
export function isKollabrixProdDomain(rawHost?: string | null): boolean {
  if (!rawHost) return false;
  const host = rawHost.toLowerCase().split(':')[0].trim();
  return host === 'kollabrix.in' || host.endsWith('.kollabrix.in');
}

/**
 * Client-safe check for whether the browser is currently on a standalone KΛ host.
 */
export function getClientKaSubdomain(): KaSubdomain {
  if (typeof window === 'undefined') return null;
  return getKaSubdomainFromHost(window.location.hostname);
}

/**
 * Returns the Kollabrix homepage URL: uses the canonical main origin when
 * clicked from a standalone KΛ subdomain so "Built by Kollabrix" never loops.
 */
export function getKollabrixHomeUrl(): string {
  if (typeof window !== 'undefined' && getClientKaSubdomain()) {
    return `${KOLLABRIX_ORIGIN}/`;
  }
  return '/';
}

/**
 * Returns the route path for KΛ ΛI home ('/' on ai.kollabrix.in, '/ka-ai' elsewhere).
 */
export function getKaAiHomePath(): string {
  return getClientKaSubdomain() === 'ai' ? '/' : '/ka-ai';
}

/**
 * Returns the route path for KΛ FOLIO home ('/' on folio.kollabrix.in, '/ka-codex' elsewhere).
 */
export function getKaFolioHomePath(): string {
  return getClientKaSubdomain() === 'folio' ? '/' : '/ka-codex';
}

/**
 * Shared KΛ icon descriptor list used across KΛ ΛI & KΛ FOLIO route metadata
 * so Google Search displays the KΛ emblem whenever indexed on standalone hosts.
 */
export const KA_METADATA_ICONS = {
  icon: [
    { url: '/ka-favicon.ico', sizes: 'any' },
    { url: '/ka-icon-48.png', sizes: '48x48', type: 'image/png' },
    { url: '/ka-icon-96.png', sizes: '96x96', type: 'image/png' },
    { url: '/ka-icon-144.png', sizes: '144x144', type: 'image/png' },
    { url: '/ka-icon-192.png', sizes: '192x192', type: 'image/png' },
    { url: '/ka-icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  shortcut: '/ka-favicon.ico',
  apple: [{ url: '/ka-apple-icon.png', sizes: '180x180', type: 'image/png' }],
};
