#!/usr/bin/env bash
# Prints cv/cv.html to public/cv.pdf with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/public/cv.pdf" "file://$PWD/cv/cv.html" 2>/dev/null
echo "pages: $(mdls -raw -name kMDItemNumberOfPages public/cv.pdf 2>/dev/null || echo '?')"
