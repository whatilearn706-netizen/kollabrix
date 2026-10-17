/**
 * Linkora Security - URL Sanitizer
 * Defends against Stored XSS and malicious protocol injection (javascript:, data:, vbscript:)
 * in user-supplied profile links, project repositories, demo URLs, and documentation links.
 */
export function safeExternalUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';

  // Explicitly neutralize dangerous executable pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '#';
  }

  // Valid http:// or https:// URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Domain without scheme (e.g. github.com/username, my-portfolio.dev)
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/i.test(trimmed) && !trimmed.includes(':')) {
    return `https://${trimmed}`;
  }

  return '#';
}
