// blot.js: Blot, the Cliffhanger English page turner. A symmetric Rorschach ink blot with four eye holes
// (two upper slits, two lower gaps) and no mouth, painted in the same wash + boiling ink as everything else.
//
//   blot(x, y, s, o)   (x, y) = centre of the body; s = half-width of the body in px (medium shot ~150-260)
//
// options:
//   sq        squash (+ wider/shorter, - taller/thinner)          rot    lean in radians (pivots at the centre)
//   dx, dy    offset in s units                                     ph     wobble phase in radians (drive it from loop time)
//   lookX/Y   -1..1, slides the eye holes                          blink  0..1 closes the upper slits
//   wide      0..1 bigger, rounder holes (surprise, fear)          narrow 0..1 flatter slits (suspicious, smug)
//   drip      0..1 a drop growing from the bottom                   tint   body colour (default PAL.ink)
//   arms      [[x, y], ...] world points the tendrils reach for (drawn under the body, ending in a little grip blob)
//   hole      colour showing through the eye holes (default: paper)  dots  false hides the splatter droplets
//   emote, emoteK, emoteAge   a painted reaction mark over the head (same kinds as Clawd's)
//   boilKey   stable id for its boil seeds
function blot(x, y, s, o = {}) {
  const col = o.tint || PAL.ink, hole = o.hole || PAL.paper, ph = o.ph || 0, sq = o.sq || 0;
  const sx = 1 + sq, sy = 1 - sq, key = 'blot' + (o.boilKey ?? '');
  const cx = x + (o.dx || 0) * s, cy = y + (o.dy || 0) * s;
  const sw = clamp(s / 110, .6, 2.2);

  push(); translate(cx, cy); rotate(o.rot || 0);

  // tendrils first, so the body sits over their roots
  (o.arms || []).forEach((a, i) => {
    boilSeed(key + 'arm' + i);
    // target back into body-local space (undo translate + rotate)
    const r = -(o.rot || 0), lx = a[0] - cx, ly = a[1] - cy;
    const tx = lx * Math.cos(r) - ly * Math.sin(r), ty = lx * Math.sin(r) + ly * Math.cos(r);
    const side = tx >= 0 ? 1 : -1;
    const root = [side * .55 * s * sx, -.2 * s * sy];
    const mid = [lerp(root[0], tx, .5) + side * .18 * s, lerp(root[1], ty, .5) + .1 * s];
    paint(ribbon([root, mid, [tx, ty]], .3 * s, .09 * s), { wash: col, ink: col, sw: sw * .7 });
    paint(ellPts(tx, ty, .1 * s, .09 * s, 12), { wash: col, ink: col, sw: sw * .6 });
  });

  // body: one symmetric outline, right half mirrored
  boilSeed(key + 'body');
  const R = [], n = 22;
  for (let i = 0; i <= n; i++) {
    const f = i / n * Math.PI;   // 0 = top, PI = bottom
    let r = 1 + .1 * Math.sin(3 * f + .5) + .07 * Math.sin(5 * f + 1.3) + .045 * Math.sin(8 * f + .2)
      + .16 * Math.exp(-Math.pow((f - 1.75) / .28, 2))          // side lobes (the blot's "shoulders")
      + .1 * Math.exp(-Math.pow((f - .55) / .22, 2))            // upper lobes (the "ears")
      + .03 * Math.sin(ph + f * 3) + .02 * Math.sin(ph * 2 + f * 5);
    const px = Math.sin(f) * r * s * sx, py = -Math.cos(f) * r * .82 * s * sy;
    R.push([px, py]);
  }
  // the drip hangs from the bottom centre
  const dk = clamp(o.drip || 0);
  const bot = R[n][1];
  const body = R.concat(R.slice(1, n).reverse().map(([a, b]) => [-a, b]));
  if (dk > .02) {
    const neck = lerp(.02, .09, dk) * s, dl = dk * .55 * s, dr = lerp(.04, .12, dk) * s;
    // the drip replaces the bottom-centre point
    const drip = [[neck * 1.8, bot - .01 * s], [neck, bot + dl * .45], [dr, bot + dl], [0, bot + dl + dr * 1.1], [-dr, bot + dl], [-neck, bot + dl * .45], [-neck * 1.8, bot - .01 * s]];
    body.splice(n, 1, ...drip);
  }
  paint(body, { wash: col, ink: col, sw, curv: .5 });

  // splatter droplets, mirrored
  if (o.dots !== false) {
    boilSeed(key + 'dots');
    for (let i = 0; i < 4; i++) {
      const a = .5 + hash(i * 3.1) * 2.2, d = (1.22 + hash(i * 7.7) * .25) * s, r = (.035 + hash(i * 5.3) * .04) * s;
      for (const side of [-1, 1]) {
        const px = side * Math.sin(a) * d * sx, py = -Math.cos(a) * d * .82 * sy + .02 * s * Math.sin(ph + i);
        paint(ellPts(px, py, r, r * .9, 10), { wash: col, ink: null });
      }
    }
  }

  // four eye holes
  boilSeed(key + 'eyes');
  const lx = (o.lookX || 0) * .11 * s, ly = (o.lookY || 0) * .08 * s, wide = o.wide || 0, nar = o.narrow || 0;
  const blink = clamp(o.blink || 0);
  for (const side of [-1, 1]) {
    // upper slit: a tall almond, tilted so the tops lean outward
    const ury = (.19 + .05 * wide - .1 * nar) * s * Math.max(.06, 1 - blink), urx = (.075 + .03 * wide) * s;
    if (blink > .92) inkLine([[side * .3 * s - urx * 1.3 + lx, -.22 * s + ly], [side * .3 * s + urx * 1.3 + lx, -.22 * s + ly]], sw * .9, hole, 'ink', 0);
    else paint(ellPts(side * .3 * s + lx, -.22 * s + ly, urx, ury, 16, 0, 0).map(([a, b]) => {
      const t = side * .32, ox = side * .3 * s + lx, oy = -.22 * s + ly;   // tilt around the hole centre
      return [ox + (a - ox) * Math.cos(t) - (b - oy) * Math.sin(t), oy + (a - ox) * Math.sin(t) + (b - oy) * Math.cos(t)];
    }), { wash: hole, ink: null });
    // lower gap: a small rounded tear
    const lr = (.065 + .02 * wide) * s;
    paint(ellPts(side * .19 * s + lx * .8, .2 * s + ly * .8, lr, lr * 1.15 * (1 - .3 * nar), 14, 0, side * .5), { wash: hole, ink: null });
  }
  pop();

  if (o.emote && (o.emoteK ?? 1) > 0) {
    boilSeed(key + 'emote');
    emote(o.emote, cx + .95 * s, cy - 1.05 * s, s * .16, o.emoteK ?? 1, o.emoteAge ?? T);
  }
  boilSeed(key + 'after');
}
