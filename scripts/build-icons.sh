#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC="$DIR/public"
BRAND="$PUBLIC/brand"
TMP="/tmp/kollabrix_build"
mkdir -p "$TMP"

echo "1. Generating 1024x1024 master transparent PNG from SVG with native Swift..."
swift - << 'EOF'
import AppKit

let svgPath = "/Users/velith.exe/Downloads/TEAMFORGE/public/brand/kollabrix-logo.svg"
let masterPath = "/tmp/kollabrix_build/kollabrix-master.png"

guard let image = NSImage(contentsOfFile: svgPath) else {
    print("Failed to load SVG: \(svgPath)")
    exit(1)
}

let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: 1024,
    pixelsHigh: 1024,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
let context = NSGraphicsContext(bitmapImageRep: rep)
NSGraphicsContext.current = context

// Guarantee pure 100% alpha transparency (no background box or white canvas)
NSColor.clear.setFill()
NSRect(x: 0, y: 0, width: 1024, height: 1024).fill(using: .copy)

image.draw(in: NSRect(x: 0, y: 0, width: 1024, height: 1024))
NSGraphicsContext.restoreGraphicsState()

guard let pngData = rep.representation(using: .png, properties: [:]) else {
    print("Failed to get PNG representation")
    exit(1)
}

try! pngData.write(to: URL(fileURLWithPath: masterPath))
print("✓ Rendered 1024x1024 master transparent PNG")
EOF

MASTER="$TMP/kollabrix-master.png"

if [ ! -f "$MASTER" ]; then
  echo "Error: master generation failed."
  exit 1
fi

echo "2. Generating transparent brand assets..."
sips -z 512 512 "$MASTER" --out "$BRAND/kollabrix-k.png" > /dev/null
cp "$BRAND/kollabrix-logo.svg" "$BRAND/kollabrix-logo.min.svg"
cp "$BRAND/kollabrix-k.png" "$BRAND/kollabrix-icon.png"
cp "$BRAND/kollabrix-k.png" "$BRAND/kollabrix-logo.png"
cp "$BRAND/kollabrix-k.png" "$BRAND/linkora-logo.png"
cp "$BRAND/kollabrix-k.png" "$PUBLIC/icon-512.png"
cp "$BRAND/kollabrix-k.png" "$PUBLIC/icon.png"

echo "3. Generating PWA & Favicon sizes with full alpha transparency..."
sips -z 192 192 "$MASTER" --out "$PUBLIC/icon-192.png" > /dev/null
sips -z 180 180 "$MASTER" --out "$PUBLIC/apple-touch-icon.png" > /dev/null
cp "$PUBLIC/apple-touch-icon.png" "$PUBLIC/apple-touch-icon-precomposed.png"
sips -z 144 144 "$MASTER" --out "$PUBLIC/favicon-144x144.png" > /dev/null
sips -z 96 96 "$MASTER" --out "$PUBLIC/favicon-96x96.png" > /dev/null
sips -z 48 48 "$MASTER" --out "$PUBLIC/favicon-48x48.png" > /dev/null
sips -z 32 32 "$MASTER" --out "$PUBLIC/icon-32.png" > /dev/null
sips -z 16 16 "$MASTER" --out "$PUBLIC/icon-16.png" > /dev/null

echo "4. Generating Favicon ICO..."
sips -s format ico "$PUBLIC/favicon-48x48.png" --out "$PUBLIC/favicon.ico" > /dev/null 2>&1 || cp "$PUBLIC/favicon-48x48.png" "$PUBLIC/favicon.ico"
cp "$PUBLIC/favicon.ico" "$PUBLIC/favicon-v20261031.ico"

echo "5. Syncing App Router metadata icons..."
cp "$PUBLIC/icon-512.png" "$DIR/src/app/icon.png"
cp "$PUBLIC/favicon.ico" "$DIR/src/app/favicon.ico"

echo "✓ All icon assets successfully built with pure transparency!"
