const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Generates crisp KΛ square/squircle icons (48, 96, 144, 180, 192, 512 + favicon.ico)
 * matching Kollabrix's obsidian + platinum-silver & gunmetal-graphite KΛ emblem.
 */
async function main() {
  const publicDir = path.join(__dirname, '../public');

  const kaSvgStandalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="kaBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0C101B" />
      <stop offset="55%" stop-color="#06080E" />
      <stop offset="100%" stop-color="#020306" />
    </linearGradient>
    <radialGradient id="kaGlow" cx="50%" cy="22%" r="65%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.24" />
      <stop offset="65%" stop-color="#020617" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="kaPlatinumK" x1="18" y1="14" x2="18" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="55%" stop-color="#E2E8F0" />
      <stop offset="100%" stop-color="#94A3B8" />
    </linearGradient>
    <linearGradient id="kaKollabrixLambda" x1="44" y1="14" x2="44" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#CBD5E1" />
      <stop offset="50%" stop-color="#64748B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <linearGradient id="kaSilverBevel" x1="30" y1="14" x2="58" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#94A3B8" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#64748B" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#kaBg)" />
  <rect width="64" height="64" rx="14" fill="url(#kaGlow)" />
  <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.25" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" />
  <g transform="translate(5.5, 13.5) scale(1.16)">
    <path d="M3 4H8.4V12.2L16.8 4H22.8L13.1 13.8L23 24H16.9L8.4 15.1V24H3V4Z" fill="url(#kaPlatinumK)" />
    <path d="M28.6 4H33.8L43.2 24H37.4L31.2 10.4L26.2 21.4L22.6 17.6L28.6 4Z" fill="url(#kaKollabrixLambda)" stroke="url(#kaSilverBevel)" stroke-width="0.95" stroke-linejoin="round" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'ka-logo.svg'), kaSvgStandalone, 'utf-8');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:transparent;width:512px;height:512px;display:flex;align-items:center;justify-content:center;">${kaSvgStandalone.replace('viewBox="0 0 64 64"', 'width="512" height="512" viewBox="0 0 64 64"')}</body></html>`);
    await page.screenshot({ path: path.join(publicDir, 'ka-icon-512.png'), omitBackground: true });
  } finally {
    await browser.close();
  }

  // Downscale cleanly with PIL & generate multi-resolution .ico for crisp SERP favicons
  const pyScript = `
from PIL import Image
import os

pub = ${JSON.stringify(publicDir)}
base = Image.open(os.path.join(pub, 'ka-icon-512.png')).convert('RGBA')

for size, name in [
    (192, 'ka-icon-192.png'),
    (180, 'ka-apple-icon.png'),
    (144, 'ka-icon-144.png'),
    (96, 'ka-icon-96.png'),
    (48, 'ka-icon-48.png'),
]:
    resized = base.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(os.path.join(pub, name), 'PNG')

base.save(
    os.path.join(pub, 'ka-favicon.ico'),
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)],
)
print('Generated all KA brand icons + ka-favicon.ico cleanly.')
`;

  execSync('python3', { input: pyScript, stdio: ['pipe', 'inherit', 'inherit'] });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
