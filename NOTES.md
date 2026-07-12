# Space Archive — build notes

Working log for the 3D archive flight (`/archive`). Decisions, bends in the plan, surprises.

## Decisions (from the AIRPORT taxi, 2026-07-11)

- **Movement:** rail — the page is genuinely tall (`.flight-track` sets its height) and scroll
  progress maps onto the flight path. Lenis smoothing gives the drift for free. No pointer lock,
  no WASD.
- **Portal click:** camera glides in + DOM preview card (title/date/description/Read). No warp.
- **Black hole:** stylised — swirl-shader accretion disc, opaque black core, photon rim,
  spiral of captured stars. No gravitational lensing.
- **Extras in v1:** visor HUD (CSS overlay), entry gate ("Launch"), synthesised ambient audio
  (brown noise + 48Hz drone + portal chime — no audio files, Web Audio only).
- **Eligibility:** desktop ≥900px, no `prefers-reduced-motion`, WebGL available. Everyone else
  (and no-JS, and SEO crawlers) gets the flat list, which is the real page content.
- **Category colours:** AI & Teaching gold `#d9a94f` · PKM blue `#7f9bff` · Second Mountain rose
  `#e0899b` · LHTL teal `#6fd3c7` · Languages violet `#b48ae0`.
- Newest post nearest the launch point; oldest deepest — falling back in time toward the hole.

## Architecture

- `src/pages/archive.astro` — flat list (year-grouped, PostCardList) + passes post JSON to the
  flight component. Flat list is always rendered server-side.
- `src/components/SpaceArchive.astro` — gate, canvas, HUD, focus card, end card, all the Three.js.
  Follows the Universe.astro house style: vanilla three, JSON data island, DPR cap,
  visibility pause.
- Flight mode = `body.flying` class: hides flat section + footer, shows canvas/track/HUD.

## Bugs found in first build session (2026-07-11)

- **`Object3D.lookAt` faces +Z, cameras face −Z.** Using a plain Object3D dummy to compute
  camera quaternions flew the whole flight backward — black screen, everything frustum-culled.
  Fix: the dummy must be a `THREE.PerspectiveCamera`. Symptom to remember: 1 draw call,
  0 triangles, camera quaternion ≈ (0, ±1, 0, small).
- **Init order:** `init()` must be called at the END of the module — calling it above the
  `const` declarations it uses (CATEGORY_COLORS) threw a silent TDZ ReferenceError.
- **Browser-pane screenshots scroll the page** (full-page stitching), which flies the ship.
  Progress is now frozen while a focus card is open, so stray scrolls can't yank the camera —
  good for real users too (scrollbar drags, keyboard).
- Mouse-look is eased (`lookX/lookY`, 0.06 lerp) so portals don't dodge the cursor when you
  point at them.

## Gotchas / to watch

- Verification: preview browser runs hidden → rAF paused → screenshots of the 3D lie.
  Verify via build + DOM, then on the live deploy (established blog gotcha).
- Plaques are canvas-drawn text; fonts must be loaded first (`document.fonts.load` before
  arming the Launch button).
- Additive shader materials ignore scene fog — rings deliberately act as far-off beacons;
  image discs + plaques (MeshBasicMaterial) do take fog and fade in with distance.
- Flight-feel tuning knobs: `SPACING` (portal gap), track height multiplier (55vh/post),
  progress easing (0.07), fog density (0.0028), path amplitude in `pathX`/`pathY`.

## Painted Descent build (2026-07-12, from FABLE-BUILD-HANDOVER.md)

Full conversion of v2 to the locked handover design. What changed:

- **Helmet entry:** `/archive/helmet-entry.mp4` (5s trim of the Higgsfield shot,
  silent, 1.4MB, poster jpg). Plays over the already-running scene on Launch,
  crossfades out as the visor resolves (~3.9s). Skip button + Escape skip,
  3s stall guard, `error` fallback — all paths land in the live scene.
  `sessionStorage['sa-helmet-seen']` skips it on relaunch within a session.
- **Proximity encounters (Memory Dissolve):** plaques are no longer always-on.
  Far = warm star only → entering range = image card materialises (noise-eroded
  pigment edges, soft oval "memory fragment" mask) → near = image dissolves +
  desaturates while title/meta resolve in the same plane. Only the nearest two
  encounters may show cards. Image textures lazy-load on first approach; a
  failed image quietly falls back to the title-only state.
- **Editorial Aperture:** focus card gained a painterly image header that opens
  tall then contracts (`settled` class, 700ms). Proper dialog: `role="dialog"`,
  aria-modal, focus moves to close button, Tab loops inside, Escape/click-away
  closes, focus returns to the opener.
- **Keyboard path:** `.star-index` nav (server-rendered, visually hidden until
  focused) lists all 15 transmissions; Enter opens the aperture card.
- **Pacing:** star spacing by type — Galaxy 200, Constellation 150, Star/Library
  116 world units. Essays also get bigger stars with chalk rays.
- **Poetic Visor:** status line cycles the handover language ("Archive awake",
  "A signal is resolving", "Memory held in range", "Light is beginning to
  bend"…). HUD fades in only after the helmet blackout and recedes while a
  card is open. Hint reduced to "SCROLL TO DRIFT".
- **Finale:** camera stays near-level while sinking (gaze tilts a few degrees,
  not 50); auroras and year type rotate around the well as you descend;
  constellation thread + gold line fade; audio bed pitches down (48→31Hz) and
  thins to near-silence via a descent gain.

### Soundscape (wired 2026-07-12 from the Soundly Inbox drop)

Source: `AI-Second-Brain/01-ideas/codex-inbox/2026-07-12_1537-unassigned-new-drop/sound-search/`
(34 wavs, curated per SOUNDLY-SEARCH-LIST). Twenty picks converted to 160k MP3
in `public/archive/sfx/` (6.3MB, fetched only after Launch on eligible desktops).
Gains + URLs live in the `SFX` manifest at the top of the SpaceArchive script —
tune there. Every cue degrades to silence if its file fails.

- **Helmet timeline** (50ms poller against video time): hands 0.05s → lift
  1.05s → cross 2.2s → seal 2.85s → visor 3.45s → breath 3.95s → wake 4.4s.
- **Beds**: elevator hum + low subs, crossfade-looped (two overlapping sources,
  2s equal-power overlap — no seam clicks), routed through duck → descent, so
  they dip while a card is open and thin to near-silence at the horizon.
  Synth foundation (brown noise + 48Hz drone) kept underneath.
- **Aurora swell**: bottle whistle every 18–44s (randomised).
- **Encounters** (once per pass, hysteresis-reset): chime at reveal>0.5,
  ice-debris at dissolve>0.4, soft servo at title>0.65; select on card open,
  book-slide on dismiss (not on instant/exit closes).
- **Journey** (once per flight, reset on relaunch/return): gravity 78% →
  funnel 88% → starlight 93% → geyser approach 96.2% → arrival bell 98.5%.
  These route straight to master so they survive the descent fade.
- **Rejected picks** (anti-goals): energy sword + plasma shield (weapons),
  magic-evil-spell pad (creepy), horror stingers (alarm), riser (tension),
  handbrake (mechanical), wah-wah chime (novelty). Alternates stay in the
  Inbox drop if a swap is wanted.

## Open / next

- Flight feel + Memory Dissolve tuning need Damien's eyes on the live deploy
  (dissolve distances are `revealT/dissolveT/titleT` ramps in the encounter
  loop; helmet crossfade timing is the `3.9` in `runHelmet`).
- Production handoff polish: regenerate/grade the helmet video's last frame
  against a screenshot of the real scene so the cut is invisible.
- Possible later: fast-travel ticks on the HUD gauge; warp-through transition on "Read".
