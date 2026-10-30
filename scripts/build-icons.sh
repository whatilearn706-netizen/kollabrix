#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC="$DIR/public"
BRAND="$PUBLIC/brand"
TMP="/tmp/kollabrix_build"
mkdir -p "$TMP"

echo "1. Generating 1024x1024 master from SVG..."
qlmanage -t -s 1024 -o "$TMP" "$BRAND/kollabrix-logo.svg" > /dev/null 2>&1
MASTER="$TMP/kollabrix-logo.svg.png"

# Verify master exists
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

echo "3. Generating PWA & Favicon sizes..."
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

echo "✓ All icon assets successfully built!"
