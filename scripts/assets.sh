#!/bin/sh
# Regenerates the icon PNGs and Chrome Web Store images from their sources (macOS: needs sips and Chrome).
set -e
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
for s in 16 32 48 128; do sips -s format png -z $s $s icons/icon.svg --out icons/icon-$s.png >/dev/null; done
shot() { "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size="$2" --screenshot="$3" "file://$PWD/$1" 2>/dev/null; }
shot store/screenshot.html 1280,800 store/screenshot-1280x800.png
shot store/promo.html 440,280 store/promo-440x280.png
