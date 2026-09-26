# Cliffhanger English: mini GIFs

Small looping GIFs of **Blot** (the ink-blot page turner) for Cliffhanger English, hand-painted in p5.brush with
[ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT, vendored here with its LICENSE).

| GIF | loop | what happens | fits |
|---|---|---|---|
| `gifs/drip.gif` | 3 s | Blot breathes, blinks, grows a drip; it falls, splats, soaks back into the page | the logo, alive: nav, favicon moments, email sign-off |
| `gifs/page.gif` | 3.5 s | Blot grabs the corner of a page, rides it over the spine, hops back for the next | "TURN THE PAGE." beside the waitlist form |
| `gifs/cliff.gif` | 3.5 s | Blot hangs off a book over the blank white page; one grip slips, swing, re-grab, relief | the hero / "Every choice is a cliffhanger." |
| `gifs/fork.gif` | 4 s | Blot sits where the ink thread forks: a lit door or running footprints? Looks at you: "?" | the story-thread fork / "Your choice moves the story." |

All are 480 × 480, 12 fps, ~0.6–0.9 MB, no lettering (so they work for every level and language).

## Make or change one

```bash
npm install
./make-gif.sh drip            # -> gifs/drip.gif   (drip | page | cliff | fork)
./make-gif.sh cliff 720       # bigger
FPS=24 ./make-gif.sh fork     # smoother, ~2x the size
```

On a desktop with Chrome and a GPU, add `RENDER="node render.mjs"` in front (much faster than the cloud's
software GL). ffmpeg must be on PATH. To check frames without making a GIF:

```bash
./r.sh --loop=cliff --sheet=0,.5,1,1.5,2,2.5,3 --cols=7 --w=300 --crop=420,0,1080,1080 --out=out/check/cliff.jpg
```

Open `studio.html?loop=cliff` in Chrome to scrub a loop (`?loop=blotSheet` shows Blot's poses).

## Files

- `src/blot.js`: Blot. A symmetric Rorschach blot with four eye holes (two upper slits, two lower gaps) and no mouth,
  per the locked logo. Options: look, blink, wide/narrow eyes, squash, lean, a drip, tendril arms, emotes.
- `src/scenes/cliffhanger.js`: the four loops. Each is framed for the centre square (x 420–1500 of the 1920 × 1080 canvas)
  and ends on its first frame.
- `ANIMATION_GUIDE.md`: the kit's rules (read it before asking Claude for a new loop).

**New loop ideas:** Mai picking a lock with a fish scaler, Kenji's glasses fogging at the edge, Vera's page burning,
Rafa leaping at the wrong moment, the blank page erasing a line of story while Blot pulls a character out.

Changes from upstream: `studio.html` loads Blot and these scenes instead of the demo (and drops the Google Fonts link,
which isn't needed without lettering and stalls headless loads behind a proxy); `render.mjs` waits up to 3 minutes for
the page to load; `r.sh` and `make-gif.sh` are new.
