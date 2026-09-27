#!/bin/sh
# make-dash.sh: the Ink Sprint dash trial -> gifs/dash.gif (wide strip) + gifs/dash.webp (for the reader app)
set -e
RENDER=${RENDER:-./r.sh}; FPS=${FPS:-12}
rm -rf out/loop_dash
$RENDER --loop=dash --png --fps="$FPS" --workers=2 --out=out/loop_dash
mkdir -p gifs
VF="crop=1600:640:160:340,scale=800:320:flags=lanczos,hqdn3d=6:6:6:6"
ffmpeg -y -loglevel error -framerate "$FPS" -i out/loop_dash/f%04d.png -vf "$VF,split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" -loop 0 gifs/dash.gif
ffmpeg -y -loglevel error -framerate "$FPS" -i out/loop_dash/f%04d.png -vf "$VF" -c:v libwebp -lossless 0 -q:v 80 -loop 0 gifs/dash.webp
ls -lh gifs/dash.gif gifs/dash.webp
