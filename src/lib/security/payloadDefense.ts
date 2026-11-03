/**
 * Kollabrix Defensive Payload Protection & Input Sanitizer
 * Safeguards against Stored/Reflected XSS, SQL-injection attempts,
 * and malformed control characters in user payloads.
 */

// Escape HTML entities to neutralize XSS
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;');
}

// Strip unsafe control characters and invisible unicode bidirectionality overrides
export function sanitizeTextContent(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '') // strip unicode bidi overrides
    .trim();
}

/**
 * Heuristic detector for obvious SQL injection attempts in string parameters.
 * Note: Supabase Postgres query builder uses parameterized queries by default,
 * but this adds defense-in-depth at the API boundary.
 */
const SQLI_PATTERNS = [
  /(\b(union(\s+all)?)\b\s+select)/i,
  /(\bselect\b.+\bfrom\b)/i,
  /(\binsert\b\s+into\b)/i,
  /(\bdrop\b\s+(table|database|trigger|procedure)\b)/i,
  /(\bupdate\b.+\bset\b)/i,
  /(\bdelete\b\s+from\b)/i,
  /(--|#|\/\*|\*\/)/,
  /\b(or|and)\b\s+['"]?[0-9a-zA-Z]+['"]?\s*=\s*['"]?[0-9a-zA-Z]+['"]?/i,
  /(\bexec(ute)?\b\s*\()/i,
  /(\bwaitfor\b\s+delay\b)/i,
];

export function hasSqlInjectionPattern(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return SQLI_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Validates that an identifier strictly conforms to UUID format or alphanumeric slug
 */
export function isValidIdentifier(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const slugRegex = /^[a-zA-Z0-9_\-]+$/;
  return uuidRegex.test(id) || (slugRegex.test(id) && id.length <= 64);
}
