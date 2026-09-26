#!/bin/sh
# make-gif.sh <loop> [size]: render one loop from src/scenes/cliffhanger.js to gifs/<loop>.gif
#   square centre crop, default 480px, 12 fps (hand-drawn "on twos", matches the 12/s line boil), ~0.5-1 MB.
#   FPS=24 ./make-gif.sh drip      smoother, roughly double the size
#   RENDER="node render.mjs" ...   on a desktop with Chrome + a GPU (skips the cloud container's software-GL flags)
# Needs ffmpeg on PATH.
set -e
L=$1; SIZE=${2:-480}; FPS=${FPS:-12}
[ -z "$L" ] && { echo "usage: ./make-gif.sh <drip|page|cliff|fork> [size]"; exit 1; }
RENDER=${RENDER:-./r.sh}
rm -rf "out/loop_$L"
$RENDER --loop="$L" --png --fps="$FPS" --workers=2 --out="out/loop_$L"
mkdir -p gifs
# crop -> resize -> denoise the paper grain (keeps still areas identical between frames, so the GIF stays small)
# -> one palette for the whole loop
ffmpeg -y -loglevel error -framerate "$FPS" -i "out/loop_$L/f%04d.png" \
  -vf "crop=1080:1080:420:0,scale=$SIZE:$SIZE:flags=lanczos,hqdn3d=6:6:6:6,split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 "gifs/$L.gif"
ls -lh "gifs/$L.gif"
