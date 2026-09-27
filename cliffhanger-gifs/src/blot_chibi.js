// blot_chibi.js: Blot as drawn on the 2026-09 reference sheets (docs/blot-reference in cliffhanger-reader).
// A small bone-white body scribbled with tiny marks, under a big living-ink head: flame curl on top, splatter
// around it, two sly off-white eyes with pupils and a white crescent smirk. Always playful, never a blank face.
//
// The body is posed from joints (world px), so a shot can blend between key poses:
//   const j = blendPose(poseA, poseB, k);   drawBlot(j, u, face)
// A pose: { hip, neck, kneeN, footN, kneeF, footF, elbowN, handN, elbowF, handF, head: [x, y], R, lean,
//           sx, sy (head stretch), curl (flame-tip direction, -1 back .. 1 forward) }
// N = near side (drawn in front), F = far side (behind, a touch darker). Everything faces screen-right.
const BINK = '#1B1A1F', BINK2 = '#34313A', BONE = '#EEE8DA', BONE_DK = '#D8D0C0', WHITE = '#F7F3EA';

const rot2 = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
// two-bone IK: the middle joint for a limb from A to B, bent toward side s (+1 = bends forward/right of travel)
function ik(A, B, L1, L2, s = 1) {
  const dx = B[0] - A[0], dy = B[1] - A[1], d = Math.min(Math.hypot(dx, dy) || 1, (L1 + L2) * .999);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / (Math.hypot(dx, dy) || 1), uy = dy / (Math.hypot(dx, dy) || 1);
  return [A[0] + ux * a - s * uy * h, A[1] + uy * a + s * ux * h];
}
function blendPose(A, B, k) {
  const o = {};
  for (const key in A) {
    const a = A[key], b = B[key] ?? a;
    o[key] = Array.isArray(a) ? [lerp(a[0], b[0], k), lerp(a[1], b[1], k)] : typeof a === 'number' ? lerp(a, b, k) : (k < .5 ? a : b);
  }
  return o;
}
// build a full joint set from a few targets: hip, lean, feet and hands (knees/elbows solved by IK)
function pose(u, p) {
  const lean = p.lean || 0, hip = p.hip;
  const neck = add2(hip, rot2([0, -2.5 * u], lean));
  const sh = add2(neck, rot2([0, .35 * u], lean));
  const R = p.R || 2.5 * u;
  const head = p.head || add2(neck, rot2([.3 * u, -R * .72], lean * .6));
  const L = 1.2 * u, A = 1.1 * u;
  return {
    hip, neck, head, R, lean, sx: p.sx ?? 1, sy: p.sy ?? 1, curl: p.curl ?? -.4,
    footN: p.footN, kneeN: ik(hip, p.footN, L, L, 1), footF: p.footF, kneeF: ik(hip, p.footF, L, L, 1),
    handN: p.handN, elbowN: ik(sh, p.handN, A, A, -1), handF: p.handF, elbowF: ik(sh, p.handF, A, A, -1), sh,
  };
}

function blotHeadPts(cx, cy, R, sx, sy, ph, rotA = 0) {
  const P = [];
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * TAU;
    const r = R * (1 + .07 * Math.sin(5 * a + 1) + .05 * Math.sin(7 * a + 2.3) + .035 * Math.sin(11 * a + ph) + .025 * Math.sin(3 * a - ph));
    P.push(add2([cx, cy], rot2([Math.cos(a) * r * sx, Math.sin(a) * r * .92 * sy], rotA)));
  }
  return P;
}

// The head: blob + flame curl + mottled wash + splatter, then the face.
// face: { look: [-1..1, -1..1], eyes: 'sly' | 'wide' | 'closed', mouth: 'smirk' | 'grin' | 'o', turn: 0 (profile-ish) .. 1 (to camera) }
function blotHead(j, u, face = {}, key = 'bh', ph = 0) {
  const [cx, cy] = j.head, R = j.R, sx = j.sx, sy = j.sy, tilt = j.lean * .35;
  // flame curl: a tapered ribbon off the crown, swept by `curl` (negative = streams back)
  boilSeed(key + 'curl');
  const c = j.curl, top = add2([cx, cy], rot2([-.1 * R * sx, -.78 * R * sy], tilt)), w = .06 * R * Math.sin(ph * 2);
  const P1 = [top[0] - .12 * R, top[1] + .3 * R], P2 = [top[0] + c * .15 * R, top[1] - .2 * R];
  const P3 = [top[0] + c * .45 * R + w, top[1] - .45 * R], P4 = [top[0] + c * .7 * R + w, top[1] - .38 * R], P5 = [top[0] + c * .72 * R, top[1] - .22 * R];
  paint(ribbon([P1, P2, P3, P4, P5], .62 * R, .04 * R), { wash: BINK, ink: BINK, sw: .6, br: 'dry' });
  // blob
  boilSeed(key + 'blob');
  paint(blotHeadPts(cx, cy, R, sx, sy, ph, tilt), { wash: BINK, ink: BINK, sw: 1.1, br: 'dry', curv: .4 });
  // mottled wash: a few paler pools inside, like wet ink drying unevenly
  boilSeed(key + 'mottle');
  for (let i = 0; i < 4; i++) {
    const a = hash(i * 4.1) * TAU, d = .35 * R * hash(i * 2.7);
    const mx = cx + Math.cos(a) * d * sx - .2 * R, my = cy + Math.sin(a) * d * sy - .3 * R;
    paint(ellPts(mx, my, R * (.3 + .15 * hash(i)) * sx, R * (.2 + .12 * hash(i + 5)) * sy, 14, R * .05), { wash: BINK2, washOp: 38, ink: null });
  }
  // splatter around the head (stable per drop, drifting a little with ph)
  boilSeed(key + 'splat');
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI * .95 + hash(i * 3.3) * Math.PI * 1.5, d = R * (1.12 + .38 * hash(i * 1.9));
    const r = R * (.025 + .05 * hash(i * 7.1) * hash(i * 2.2));
    const px = cx + Math.cos(a) * d * sx - (sx - 1) * R * .6, py = cy + Math.sin(a) * d * sy * .95 + .03 * R * Math.sin(ph + i);
    paint(ellPts(px, py, r, r * .85, 8), { wash: BINK, ink: null });
  }
  blotFace(j, face, key);
}

function blotFace(j, f, key) {
  const [cx, cy] = j.head, R = j.R, sx = j.sx, sy = j.sy;
  const turn = f.turn ?? 0, look = f.look || [1, 0];
  // face centre slides toward the front (right) in profile, toward the middle when turned to camera
  const fx = cx + lerp(.36, .06, turn) * R * sx, fy = cy + .12 * R * sy;
  const gap = lerp(.56, .72, turn) * R, eyeY = fy - .06 * R;
  boilSeed(key + 'face');
  for (const side of [-1, 1]) {
    const near = side > 0;
    const scale = near ? 1 : lerp(.78, 1, turn);                  // far eye a little smaller in 3/4
    const ex = fx + side * gap / 2 * sx, ew = .25 * R * scale * sx, eh = .21 * R * scale;
    if (f.eyes === 'closed') {                                   // happy closed eyes: upturned white arcs
      inkLine([[ex - ew, eyeY + .02 * R], [ex, eyeY - .08 * R], [ex + ew, eyeY + .02 * R]], .9 * R / 60, WHITE, 'ink', .6);
      continue;
    }
    const wide = f.eyes === 'wide';
    // sly: the top edge slopes down toward the nose (inner corner low), the classic smirk look
    const slope = wide ? 0 : .09 * R, inner = -side;               // inner corner is toward the other eye
    const P = [];
    for (let i = 0; i <= 12; i++) {                               // lower arc, outer -> inner
      const a = Math.PI * i / 12, x = ex + Math.cos(a) * ew * side * -1 * -1, y = eyeY + Math.sin(a) * eh * (wide ? 1.25 : 1);
      P.push([ex + Math.cos(a) * ew * (side), y]);
    }
    // top edge from inner back to outer: straight-ish, lower on the inner side unless wide (then a dome)
    for (let i = 0; i <= 8; i++) {
      const k = i / 8, x = lerp(ex - side * ew, ex + side * ew, k);
      const y = wide ? eyeY - Math.sin(Math.PI * k) * eh * 1.25 : eyeY - eh * .15 + lerp(0, -slope, k) + (inner < 0 ? 0 : 0);
      P.push([x, y]);
    }
    paint(P, { wash: WHITE, ink: null });
    // pupil, riding the look direction, kept inside the white
    const pr = eh * (wide ? .62 : .58);
    const px = ex + clamp(look[0], -1, 1) * (ew - pr) * .8, py = eyeY + eh * (wide ? .1 : .35) + look[1] * eh * .25;
    paint(ellPts(px, py, pr * .8, pr, 10), { wash: BINK, ink: null });
  }
  // mouth
  const mw = lerp(.62, .7, turn) * R * sx, mx = fx + .04 * R, my = fy + .36 * R;
  if (f.mouth === 'o') { paint(ellPts(mx, my, .09 * R, .11 * R, 12), { wash: WHITE, ink: null }); return; }
  const grin = f.mouth === 'grin' ? 1.6 : 1;
  const outer = [], innerA = [];
  for (let i = 0; i <= 12; i++) {                                  // a lopsided crescent: right end rides higher
    const k = i / 12, x = mx - mw / 2 + k * mw, lift = lerp(.02, -.1, k) * R;
    outer.push([x, my + lift + Math.sin(Math.PI * k) * .19 * R * grin]);
    innerA.push([x, my + lift + Math.sin(Math.PI * k) * .06 * R * grin]);
  }
  paint(outer.concat(innerA.reverse()), { wash: WHITE, ink: null });
}

// ribbon limb with a bone wash + ink edge, ending in a mitten (hand) or a soft foot
function blotLimb(a, b, c, w0, w1, col, key, end) {
  boilSeed(key);
  paint(ribbon([a, b, c], w0, w1), { wash: col, ink: BINK, sw: .7, curv: .3 });
  if (end) paint(ellPts(c[0] + end[0], c[1] + end[1], end[2], end[3], 12), { wash: col, ink: BINK, sw: .6 });
}

function drawBlot(j, u, face = {}, key = 'blot', ph = 0) {
  // far limbs first, a shade darker
  blotLimb(j.sh, j.elbowF, j.handF, .72 * u, .6 * u, BONE_DK, key + 'aF', [0, 0, .42 * u, .38 * u]);
  blotLimb(j.hip, j.kneeF, j.footF, 1.0 * u, .78 * u, BONE_DK, key + 'lF', [.3 * u, -.14 * u, .55 * u, .3 * u]);
  // torso: a soft sack from hip to neck
  boilSeed(key + 'torso');
  const mid = [lerp(j.hip[0], j.neck[0], .5), lerp(j.hip[1], j.neck[1], .5)], half = Math.hypot(j.neck[0] - j.hip[0], j.neck[1] - j.hip[1]) / 2;
  const egg = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, bulge = Math.sin(a) > 0 ? 1.08 : .9;   // wider at the belly
    egg.push(add2(mid, rot2([Math.cos(a) * 1.25 * u * bulge, Math.sin(a) * (half + .35 * u)], j.lean))); }
  paint(egg, { wash: BONE, ink: BINK, sw: .8, curv: .5 });
  // graffiti scribbles: tiny marks, not words
  boilSeed(key + 'scrib');
  for (let i = 0; i < 5; i++) {
    const k = .2 + .15 * i, p = [lerp(j.hip[0], j.neck[0], k) + (hash(i) - .5) * u * 1.1, lerp(j.hip[1], j.neck[1], k) + (hash(i * 3) - .5) * u * .3];
    inkLine([[p[0], p[1]], [p[0] + .18 * u, p[1] - .08 * u], [p[0] + .3 * u, p[1] + .04 * u], [p[0] + .45 * u, p[1] - .05 * u]], .35, '#8E877C', 'inkfine', .6);
  }
  blotLimb(j.hip, j.kneeN, j.footN, 1.05 * u, .8 * u, BONE, key + 'lN', [.32 * u, -.14 * u, .58 * u, .32 * u]);
  blotHead(j, u, face, key + 'h', ph);
  blotLimb(j.sh, j.elbowN, j.handN, .75 * u, .62 * u, BONE, key + 'aN', [0, 0, .45 * u, .4 * u]);
}
