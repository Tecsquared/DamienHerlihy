#!/bin/sh
# render helper: finds the Playwright Chromium in the cloud container and uses software GL there
C=${CHROME_PATH:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}
exec node render.mjs --chrome="$C" --soft-gl "$@"
