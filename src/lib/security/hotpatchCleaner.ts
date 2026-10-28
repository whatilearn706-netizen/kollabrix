/**
 * Kollabrix Hot-Patch Code Cleaner & Sanitizer
 * Automatically strips markdown code fences (```css, ```javascript),
 * HTML wrapper tags (<style>, <script>), and conversational AI headers/footers
 * so code copied directly from Claude, ChatGPT, or Gemini applies instantly
 * without syntax errors or CSS parser rejections.
 */

export function cleanHotPatchCode(raw: string, type: 'css' | 'js'): string {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();

  // 1. Detect and extract markdown code blocks (e.g. from Claude or ChatGPT)
  const blockRegex =
    type === 'css'
      ? /```(?:css|style|scss)?\s*\n?([\s\S]*?)\n?```/i
      : /```(?:javascript|js|typescript|ts)?\s*\n?([\s\S]*?)\n?```/i;

  const match = cleaned.match(blockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    // Strip loose markdown code fences at beginning or end
    cleaned = cleaned
      .replace(/^```[a-zA-Z]*\n?/gm, '')
      .replace(/```\s*$/gm, '')
      .trim();
  }

  // 2. Strip wrapping or stray HTML tags (<style>, </style>, <script>, </script>)
  cleaned = cleaned
    .replace(/^<style[^>]*>\s*/i, '')
    .replace(/\s*<\/style>$/i, '')
    .replace(/^<script[^>]*>\s*/i, '')
    .replace(/\s*<\/script>$/i, '')
    .replace(/<\/?style[^>]*>/gi, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .trim();

  return cleaned;
}
