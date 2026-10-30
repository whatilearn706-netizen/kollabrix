const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('Launching Chrome to render Option 1 Brand Assets...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // HTML template displaying the Option 1 Bracket Handshake vector with glowing caustics
  const svgContent = fs.readFileSync(path.join(__dirname, '../public/brand/kollabrix-logo.svg'), 'utf-8');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
          }
          .icon-container {
            width: 440px;
            height: 440px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 8px 32px rgba(245, 158, 11, 0.45));
          }
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${svgContent}
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  await page.setViewportSize({ width: 512, height: 512 });

  const publicDir = path.join(__dirname, '../public');
  const brandDir = path.join(publicDir, 'brand');

  const master512 = path.join(brandDir, 'kollabrix-k.png');
  await page.screenshot({ path: master512, omitBackground: true });
  console.log('✓ Rendered:', master512);

  // Copy to icon-512.png, icon.png, kollabrix-logo.png
  fs.copyFileSync(master512, path.join(publicDir, 'icon-512.png'));
  fs.copyFileSync(master512, path.join(publicDir, 'icon.png'));
  fs.copyFileSync(master512, path.join(brandDir, 'kollabrix-icon.png'));
  fs.copyFileSync(master512, path.join(brandDir, 'kollabrix-logo.png'));
  fs.copyFileSync(master512, path.join(brandDir, 'linkora-logo.png'));

  // Also render dark squircle background for PWA icon and apple-touch-icon
  const htmlWithBg = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #090B10;
          }
          .icon-container {
            width: 380px;
            height: 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 12px 36px rgba(245, 158, 11, 0.5));
          }
          svg {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div class="icon-container">
          ${svgContent}
        </div>
      </body>
    </html>
  `;
  await page.setContent(htmlWithBg);
  const masterAppIcon = path.join(publicDir, 'apple-touch-icon.png');
  await page.screenshot({ path: masterAppIcon });
  fs.copyFileSync(masterAppIcon, path.join(publicDir, 'apple-touch-icon-precomposed.png'));

  await browser.close();

  // Resize to all standard favicon sizes using macOS sips tool
  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'icon-32.png', size: 32 },
    { name: 'icon-16.png', size: 16 },
  ];

  for (const s of sizes) {
    const dest = path.join(publicDir, s.name);
    fs.copyFileSync(master512, dest);
    execSync(`sips -z ${s.size} ${s.size} "${dest}" > /dev/null`);
    console.log(`✓ Resized ${s.name} to ${s.size}x${s.size}`);
  }

  // Favicon.ico (use 48px or 32px png copied to ico)
  const icoDest = path.join(publicDir, 'favicon.ico');
  const icoBust = path.join(publicDir, 'favicon-v20261031.ico');
  fs.copyFileSync(path.join(publicDir, 'favicon-48x48.png'), icoDest);
  fs.copyFileSync(path.join(publicDir, 'favicon-48x48.png'), icoBust);
  console.log('✓ Generated favicon.ico and favicon-v20261031.ico');

  console.log('🎉 ALL BRAND ASSETS SUCCESSFULLY GENERATED!');
}

main().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
