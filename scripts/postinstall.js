const fs = require('fs');
const path = require('path');

const swcIndexPath = path.join(__dirname, '../node_modules/next/dist/build/swc/index.js');

if (fs.existsSync(swcIndexPath)) {
  let content = fs.readFileSync(swcIndexPath, 'utf8');
  if (!content.includes('let fallbackBindings = await tryLoadWasmWithFallback(attempts);')) {
    content = content.replace(
      'attempts = attempts.concat(a);',
      `attempts = attempts.concat(a);
            let fallbackBindings = await tryLoadWasmWithFallback(attempts);
            if (fallbackBindings) {
                return resolve(fallbackBindings);
            }`
    );
    fs.writeFileSync(swcIndexPath, content, 'utf8');
    console.log('✓ Applied WASM SWC fallback patch to Next.js for macOS compatibility');
  }
}
