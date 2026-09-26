// cliffhanger.js: mini looping GIFs for Cliffhanger English, starring Blot.
// Every loop is framed for a square crop of the centre (x 420..1500) and returns to its first frame at .len.
// Render one:   ./make-gif.sh drip       (or: ./r.sh --loop=drip --sheet=0,.5,1,1.5 --out=out/check/drip.jpg)
(() => {
  const PAPER2 = '#EADFCB', LINE = '#B9A98F', ROSE = PAL.rose, INK = PAL.ink;
  const cycle = (t, len) => TAU * t / len;                 // a phase that wraps with the loop
  const holdKeys = (t, keys) => kf(t, keys, ease);

  // "text" on a page: wavy ink rows, never letters
  function pageLines(x0, y0, w, rows, seed, col = LINE) {
    for (let r = 0; r < rows; r++) {
      const y = y0 + r * 34, len = w * (r === rows - 1 ? .55 : .86 + .14 * hash(seed + r));
      boilSeed('row' + seed + '_' + r);
      inkLine([[x0, y], [x0 + len * .5, y + 2 * Math.sin(r + seed)], [x0 + len, y]], .55, col, 'inkfine', .5);
    }
  }
  function shadow(x, y, rx, k = 1) {
    boilSeed('shadow' + x);
    paint(ellPts(x, y, rx * k, rx * .16 * k, 20), { wash: mixCol(PAL.paper, INK, .18), ink: null });
  }

  // 1 · DRIP (3 s): Blot breathes, blinks, and grows a drip. It lets go, falls, splats. Blot watches it go, flinches
  // at the splat, and the ink soaks back into the page. The logo, alive.
  LOOPS.drip = t => {
    const len = 3, ph = cycle(t, len) * 2;
    const X = 960, Y = 470, S = 250, FLOOR = 900;
    const bob = .02 * Math.sin(cycle(t, len) * 3);
    const drip = t < 1.55 ? easeOut(seg(t, .15, 1.5)) : 0;
    const fallK = seg(t, 1.55, 1.95), dropY = lerp(Y + S * .82 + S * .6, FLOOR - 14, easeIn(fallK));
    const splat = t >= 1.95 ? t - 1.95 : -1;
    const lookY = holdKeys(t, [[0, 0], [1.2, 0], [1.45, .7], [1.9, 1], [2.5, 1], [2.85, 0]]);
    const blink = Math.max(1 - Math.abs(t - .75) / .07, 0);
    const flinch = splat >= 0 ? spring(t, 1.97, 7, 22) * .08 : 0;
    const let_go = spring(t, 1.55, 6, 20) * .06;           // the body springs up when the weight drops off

    shadow(X, FLOOR, 230, 1 - .03 * Math.sin(cycle(t, len) * 3));
    // the splat and its soak
    if (splat >= 0) {
      const k = backOut(clamp(splat / .12)), soak = 1 - easeIn(seg(splat, .35, 1.05));
      boilSeed('splat');
      if (soak > .02) {
        paint(ellPts(X, FLOOR, 95 * k * (1 + .4 * (1 - soak)), 20 * k * soak + 2, 18), { wash: INK, washOp: 255 * soak, ink: null });
        for (let i = 0; i < 6; i++) {                       // droplets thrown out on arcs
          const side = i % 2 ? 1 : -1, a = .3 + hash(i) * .5, fly = clamp(splat / .4);
          const px = X + side * (60 + 120 * a) * easeOut(fly), py = FLOOR - 90 * a * 4 * fly * (1 - fly);
          const r = (9 + 7 * hash(i * 3)) * soak;
          if (r > 1) paint(ellPts(px, py, r, r, 8), { wash: INK, ink: null });
        }
      }
    }
    // the falling drop
    if (fallK > 0 && fallK < 1) {
      boilSeed('drop');
      const st = 1 + fallK * .6;
      paint(through([[X, dropY - 26 * st], [X + 14, dropY], [X, dropY + 15], [X - 14, dropY], [X, dropY - 26 * st]], 4), { wash: INK, ink: INK, sw: .8 });
    }
    blot(X, Y, S, {
      ph, dy: bob - let_go, sq: .03 * Math.sin(cycle(t, len) * 3) + flinch, drip,
      lookY, blink, wide: clamp(flinch * 12) * .7 + (splat >= 0 && splat < .6 ? .4 * (1 - splat / .6) : 0),
    });
  };
  LOOPS.drip.len = 3;

  // 2 · TURN THE PAGE (3.5 s): an open book from above. Blot grabs the corner of the right page, rides it over the
  // spine, lands on the left page, sees the fresh right page and hops back to it, ready for the next one.
  LOOPS.page = t => {
    const len = 3.5, ph = cycle(t, len) * 2;
    const SP = 960, TOP = 250, BOT = 850, LX = 470, RX = 1450;   // spine, page top/bottom, outer edges
    // desk + book
    boilSeed('desk'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#C9B79A', ink: null });
    boilSeed('cover'); paint(rrPts(LX - 26, TOP - 22, RX - LX + 52, BOT - TOP + 48, 18), { wash: '#7B3F4E', ink: INK, sw: 1.2 });
    boilSeed('pL'); paint([[LX, TOP + 8], [SP, TOP], [SP, BOT], [LX, BOT + 8]], { wash: PAL.cream, ink: INK, sw: .9 });
    boilSeed('pR'); paint([[SP, TOP], [RX, TOP + 8], [RX, BOT + 8], [SP, BOT]], { wash: PAL.cream, ink: INK, sw: .9 });
    pageLines(LX + 60, TOP + 70, SP - LX - 120, 13, 1);
    pageLines(SP + 60, TOP + 70, RX - SP - 120, 13, 1);      // every right page carries the same rows: seamless loop
    boilSeed('spine'); inkLine([[SP, TOP], [SP, BOT]], 1.2, mixCol(INK, PAL.cream, .3), 'ink', 0);

    // the turning page: its outer edge travels from the right edge to the left, lifting in the middle (a drawn flip)
    const fp = ease(seg(t, .75, 1.6));
    const ex = lerp(RX, LX, fp), lift = 90 * Math.sin(Math.PI * fp), bend = 30 * Math.sin(Math.PI * fp);
    if (fp > 0 && fp < 1) {
      boilSeed('flip');
      const back = fp > .5, pagePts = [[SP, TOP], [lerp(SP, ex, .5), TOP - lift * .7], [ex, TOP - lift + 8], [ex + (back ? -bend : bend), (TOP + BOT) / 2 - lift * .5], [ex, BOT - lift + 8], [lerp(SP, ex, .5), BOT - lift * .7], [SP, BOT]];
      paint(pagePts, { wash: back ? mixCol(PAPER2, PAL.cream, seg(fp, .75, .98)) : PAL.cream, ink: INK, sw: .9, curv: .4 });
      if (!back && ex - SP > 200) pageLines(SP + 60, TOP + 70 - lift * .3, (ex - SP) - 120, 13, 1);
    }

    // Blot's path: waits on the right page, grabs the corner, rides the edge over, lands left, hops home.
    const S = 110, home = [1270, 700], left = [650, 700];
    let x, y, o = { ph, boilKey: 'b' };
    const look = holdKeys(t, [[0, 0], [.3, 1], [.6, 1], [.7, 0], [1.9, 0], [2.05, 1], [2.4, 1], [2.55, 0]]);
    if (t < .75) {                                             // spot the corner, wind up, reach
      const wind = seg(t, .35, .75);
      x = home[0] - 30 * easeOut(wind); y = home[1];
      o = { ...o, lookX: look, lookY: .6 * look, sq: .12 * ease(wind), arms: t > .5 ? [[lerp(home[0] + 60, RX - 10, easeOut(seg(t, .5, .72))), lerp(home[1], BOT - 5, easeOut(seg(t, .5, .72)))]] : [] };
    } else if (t < 1.6) {                                      // ride the flipping edge (stretched, delighted)
      const k = fp, cx = lerp(RX - 150, LX + 180, k), cy = lerp(home[1], left[1], k) - 260 * Math.sin(Math.PI * k);
      x = cx; y = cy;
      o = { ...o, sq: -.18 * Math.sin(Math.PI * k), rot: lerp(.25, -.25, k), wide: .8, arms: [[ex, BOT - lift + 8]], lookX: -.8 };
    } else if (t < 2.55) {                                     // land, squash, look back at the fresh page
      x = left[0]; y = left[1];
      const land = t - 1.6;
      o = { ...o, sq: .22 * Math.exp(-land * 7) * Math.cos(land * 22), lookX: look, emote: 'spark', emoteK: seg(t, 1.7, 1.9) * (1 - seg(t, 2.3, 2.5)), emoteAge: t - 1.7 };
    } else {                                                   // hop home on an arc, squash on landing
      const k = seg(t, 2.6, 3.15), p = arcPt(left, home, 230, easeOut(k) * .15 + ease(k) * .85);
      x = p[0]; y = p[1];
      const antic = t < 2.6 ? .15 * seg(t, 2.55, 2.6) : 0, landK = t > 3.15 ? t - 3.15 : -1;
      o = { ...o, sq: antic + (k > 0 && k < 1 ? -.15 * Math.sin(Math.PI * k) : 0) + (landK >= 0 ? .18 * Math.exp(-landK * 9) * Math.cos(landK * 20) : 0), rot: k > 0 && k < 1 ? .2 * Math.sin(Math.PI * k) : 0 };
    }
    shadow(x, Math.min(y + S * .95, BOT - 20), S * .8, clamp(1 - (home[1] - y) / 600, .4, 1));
    blot(x, y, S, o);
  };
  LOOPS.page.len = 3.5;

  // 3 · CLIFFHANGER (3.5 s): Blot hangs off the edge of a closed book, over the blank white page that erases stories.
  // One grip slips; Blot drops and swings on one tendril, sweating; flings it back up, grabs, and sags with relief.
  LOOPS.cliff = t => {
    const len = 3.5, ph = cycle(t, len) * 2;
    const EDGE = 470, VOID = '#F8F4EC';
    boilSeed('void'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: VOID, ink: null });
    // faint erased streaks drifting up out of the blank (an updraft of nothing)
    for (let i = 0; i < 7; i++) {
      boilSeed('streak' + i);
      const x = 470 + 1000 * hash(i * 3.3), y = 1150 - frac(hash(i) + t / len) * 1000, l = 90 + 80 * hash(i * 7);
      inkLine([[x, y], [x + 4, y - l * .5], [x, y - l]], .5, mixCol(VOID, '#9C93A8', .45), 'inkfine', .5);
    }
    // the cliff: a fat closed book seen side-on, its page block striped, its cover a dark red lip
    boilSeed('cover'); paint([[-60, EDGE - 170], [1190, EDGE - 170], [1205, EDGE - 150], [1205, EDGE + 22], [1190, EDGE + 40], [-60, EDGE + 40]], { wash: '#7B3F4E', ink: INK, sw: 1.4 });
    boilSeed('block'); paint([[-60, EDGE - 150], [1180, EDGE - 150], [1180, EDGE + 18], [-60, EDGE + 18]], { wash: PAL.cream, ink: INK, sw: 1 });
    for (let r = 0; r < 8; r++) { boilSeed('leaf' + r); inkLine([[420, EDGE - 132 + r * 20], [800, EDGE - 131 + r * 20], [1170, EDGE - 132 + r * 20]], .45, LINE, 'inkfine', .3); }
    boilSeed('top'); paint([[-60, -60], [1190, -60], [1190, EDGE - 170], [-60, EDGE - 170]], { wash: '#C9B79A', ink: null });

    const gL = [1020, EDGE + 36], gR = [1135, EDGE + 36];
    const slip = seg(t, .95, 1.1), regrab = seg(t, 2.1, 2.35);
    const oneArm = t > 1.0 && t < 2.3;
    // two poses, blended so the slip and the re-grab never pop: hanging from both grips, and swinging from one
    const two = [(gL[0] + gR[0]) / 2, EDGE + 36 + 250 + 8 * Math.sin(cycle(t, len) * 2)];
    const ts = Math.max(0, t - 1.0), swing1 = .32 * Math.exp(-ts * .9) * Math.sin(ts * 5.2) + .12;
    const L1 = 250 + 70 * easeOut(slip) * (1 - ease(regrab));
    const one = [gL[0] + Math.sin(swing1) * L1, gL[1] + Math.cos(swing1) * L1];
    const w = easeOut(seg(t, .98, 1.18)) * (1 - ease(seg(t, 2.12, 2.42)));
    const bx = lerp(two[0], one[0], w), by = lerp(two[1], one[1], w), swing = lerp(0, swing1, w);
    const flail = oneArm && t < 2.1;
    const freeArm = flail ? [bx + 190 + 40 * Math.sin(t * 19), by - 90 + 50 * Math.sin(t * 13 + 1)]
      : t >= 2.1 && t < 2.3 ? [lerp(bx + 190, gR[0], easeOut(regrab * 1.25)), lerp(by - 90, gR[1], easeOut(regrab * 1.25))]
      : t > .55 && t <= 1.0 ? [gR[0] + 5 * Math.sin(t * 70) * seg(t, .55, .95), gR[1] + 3 * Math.sin(t * 53)] : gR;   // the grip trembles, then goes
    // scraps of page torn off when the grip goes, falling into the blank
    for (let i = 0; i < 4; i++) {
      const k = seg(t, 1.0 + i * .04, 1.9 + i * .05); if (k <= 0 || k >= 1) continue;
      boilSeed('crumb' + i);
      const px = gR[0] + (hash(i) - .3) * 60 + 40 * k, py = gR[1] + 20 + 700 * k * k;
      paint(rectPts(px, py, 16, 11), { wash: PAL.cream, ink: INK, sw: .5 });
    }
    const relief = seg(t, 2.35, 2.6) * (1 - seg(t, 3.1, 3.45));
    blot(bx, by, 150, {
      ph, rot: -swing * .8, boilKey: 'c',
      arms: [gL, freeArm],
      sq: -.12 * (oneArm ? 1 : .5) + .16 * relief,
      wide: oneArm ? 1 : .15 * (1 - relief) + .5 * seg(t, .6, .95) * (t < 1.0 ? 1 : 0), blink: relief > .6 ? clamp((relief - .6) * 4) : 0,
      lookY: oneArm ? .9 : t > .55 && t < 1.0 ? -.9 : -.4, lookX: oneArm ? .5 * Math.sin(t * 7) : t > .55 && t < 1.0 ? .8 : 0,
      emote: oneArm ? '!' : 'sweat', emoteK: oneArm ? seg(t, 1.0, 1.15) : relief, emoteAge: oneArm ? t - 1.0 : t - 2.35,
      hole: VOID,
    });
  };
  LOOPS.cliff.len = 3.5;

  // 4 · CHOOSE (4 s): Blot sits where the ink thread forks. Left: a door with light behind it. Right: footprints
  // running away. Blot looks left, looks right, dithers, then turns to you with a question: your choice.
  LOOPS.fork = t => {
    const len = 4, ph = cycle(t, len) * 2;
    const F = [960, 640];
    // the thread: from the bottom to the fork, then two branches
    const trunk = [[960, 1120], [930, 900], [975, 760], F];
    const bL = [F, [860, 560], [720, 490], [650, 450]], bR = [F, [1060, 560], [1200, 490], [1290, 450]];
    boilSeed('trunk'); paint(ribbon(through(trunk), 26, 18), { wash: INK, ink: INK, sw: .8 });
    boilSeed('bL'); paint(ribbon(through(bL), 16, 10), { wash: INK, ink: INK, sw: .8 });
    boilSeed('bR'); paint(ribbon(through(bR), 16, 10), { wash: INK, ink: INK, sw: .8 });
    // ink pulses running up the trunk, so the thread is alive
    for (let i = 0; i < 2; i++) {
      const k = frac(t / len * 2 + i * .5), P = through(trunk), q = P[Math.min(P.length - 1, Math.floor(k * (P.length - 1)))];
      boilSeed('pulse' + i); paint(ellPts(q[0], q[1], 17 * Math.sin(Math.PI * k), 17 * Math.sin(Math.PI * k), 12), { wash: '#4A3D5C', ink: null });
    }
    // left: a door, light leaking round it (the light breathes)
    const lookL = seg(t, .45, .7) * (1 - seg(t, 1.25, 1.45)) + seg(t, 2.05, 2.15) * (1 - seg(t, 2.35, 2.45));
    const lookR = seg(t, 1.35, 1.6) * (1 - seg(t, 1.95, 2.1)) + seg(t, 2.4, 2.5) * (1 - seg(t, 2.7, 2.8));
    const doorGlow = .5 + .3 * Math.sin(cycle(t, len) * 3) + .4 * lookL;
    boilSeed('doorlight'); paint(rrPts(540, 210, 180, 250, 20), { wash: mixCol(PAL.paper, PAL.ochre, .35 + .3 * doorGlow), ink: null });
    boilSeed('door'); paint(rrPts(558, 226, 144, 226, 14), { wash: '#5A3A48', ink: INK, sw: 1.1 });
    boilSeed('knob'); paint(ellPts(678, 342, 9, 9, 10), { wash: PAL.ochre, ink: INK, sw: .5 });
    // right: footprints running off (they step on the beat)
    for (let i = 0; i < 5; i++) {
      const k = i / 4, px = lerp(1300, 1420, k) + (i % 2 ? 22 : -22), py = lerp(430, 230, k);
      const on = frac(t / len * 2 - i * .1) < .7 ? 1 : .55;
      boilSeed('foot' + i);
      paint(ellPts(px, py, 16 * on, 24 * on, 12, 0), { wash: mixCol(INK, PAL.paper, .15 + .3 * (1 - on)), ink: null });
      paint(ellPts(px + 3, py - 30 * on, 6 * on, 6 * on, 8), { wash: mixCol(INK, PAL.paper, .15 + .3 * (1 - on)), ink: null });
    }
    // Blot at the fork
    const lookX = -lookL + lookR, toYou = seg(t, 2.85, 3.05) * (1 - seg(t, 3.75, 3.95));
    const dither = t > 2.05 && t < 2.8;
    blot(F[0], F[1] - 20, 130, {
      ph, boilKey: 'f', lookX, lookY: -.5 * (lookL + lookR) + .2 * toYou,
      rot: .16 * lookX + (dither ? .03 * Math.sin(t * 30) : 0),
      sq: .1 * ring(t, [.45, 1.35, 2.05, 2.4, 2.85]) + .03 * Math.sin(cycle(t, len) * 4),
      wide: .6 * toYou,
      emote: dither ? 'sweat' : '?', emoteK: dither ? seg(t, 2.1, 2.2) : toYou, emoteAge: t - 2.85,
    });
  };
  LOOPS.fork.len = 4;
})();
