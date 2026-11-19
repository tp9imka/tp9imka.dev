#!/usr/bin/env bash
# Prints the CV source (kept outside this public repo) to public/cv.pdf with headless Chrome.
# Usage: scripts/build-cv.sh /path/to/cv.html
set -euo pipefail
SRC="${1:?usage: build-cv.sh /path/to/cv.html}"
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/public/cv.pdf" "file://$SRC" 2>/dev/null
echo "wrote public/cv.pdf"
