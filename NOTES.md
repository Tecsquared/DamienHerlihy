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

## Open / next

- Flight feel needs Damien's eyes on the live deploy (speed, portal proximity, glow).
- Possible later: fast-travel ticks on the HUD gauge; warp-through transition on "Read".
