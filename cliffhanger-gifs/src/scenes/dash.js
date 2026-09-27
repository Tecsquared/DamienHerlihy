// dash.js: TRIAL. Blot's Ink Sprint dash, from sheet-dash-speed row 1 (crouch at the book edge -> sprint with an
// ink smear -> skid-stop splatter), made into a loop: an ink drop lands and becomes Blot crouched on the page, he
// eyes the track, launches, streaks across, skids, looks at you with the smirk, then shoots off right; the ink he
// left soaks away and the next drop falls.
(() => {
  const G = 800, U = 42;                                   // ground line, body unit (head radius ~2.5u)
  const X0 = 520, X1 = 1330;                               // crouch start, skid stop

  // ---------- key poses (hip x as the anchor) ----------
  const crouch = (x, sink = 0, ph = 0) => pose(U, {
    hip: [x, G - 1.5 * U + sink * .3 * U], lean: .95 + .08 * sink,
    footN: [x + .55 * U, G], footF: [x - 1.35 * U, G - .05 * U],
    handN: [x + 2.9 * U, G - .1 * U], handF: [x + 2.5 * U, G - .05 * U],
    sx: 1 - .03 * Math.sin(ph), sy: 1 + .03 * Math.sin(ph), curl: -.5,
  });
  const run = (x, p, k = 1) => {                           // k scales the stride (0 = standing-ish)
    const s = Math.sin(p), c = Math.cos(p), s2 = Math.sin(p + Math.PI), c2 = Math.cos(p + Math.PI);
    const bob = Math.abs(Math.sin(p)) * .25 * U * k;
    const hip = [x, G - 2.1 * U - bob], lean = .55 * k;
    const foot = (sn, cs) => [x + cs * 1.5 * U * k + .3 * U, G - Math.max(0, sn) * 1.1 * U * k];
    const sh = add2(add2(hip, rot2([0, -2.5 * U], lean)), rot2([0, .35 * U], lean));
    const hand = (sn) => add2(sh, rot2([sn * 1.5 * U * k + .4 * U, 1.3 * U], lean * .3));
    return pose(U, { hip, lean, footN: foot(s, c), footF: foot(s2, c2), handN: hand(-c), handF: hand(c), sx: 1 + .35 * k, sy: 1 - .12 * k, curl: -1 });
  };
  const lunge = (x, rise = 0) => pose(U, {                 // the skid: front leg out, back knee low, a fist forward
    hip: [x, G - 1.6 * U - rise * .55 * U], lean: lerp(.55, .15, rise),
    footN: [x + 1.95 * U - rise * .6 * U, G], footF: [x - 1.7 * U + rise * .7 * U, G],
    handN: [x + 2.6 * U - rise * 1.0 * U, G - 2.6 * U - rise * .8 * U], handF: [x - .4 * U, G - .05 * U - rise * 1.6 * U],
    sx: 1, sy: 1, curl: .6 - rise * .9,
  });

  // the page they run on: a flat book top with ruled lines, its edge at the left
  function page() {
    // drawn in two halves: p5.brush drops the far end of very long single strokes
    boilSeed('pageTopA'); paint([[300, G - 30], [1040, G - 30], [1040, G + 190], [270, G + 190]], { wash: '#F5F0E4', ink: null });
    boilSeed('pageTopB'); paint([[1030, G - 30], [1760, G - 30], [1790, G + 190], [1030, G + 190]], { wash: '#F5F0E4', ink: null });
    for (let r = 0; r < 6; r++) for (const [a, b] of [[330 + r * 4, 1045], [1035, 1740 - r * 3]]) {
      boilSeed('rule' + r + a);
      const y = G + 12 + r * 30;
      inkLine([[a, y], [(a + b) / 2, y + 1], [b, y]], .45, '#B8AE9C', 'inkfine', .3);
    }
    for (const [a, b] of [[285, 1040], [1030, 1775]]) { boilSeed('pageEdge' + a); inkLine([[a, G - 28], [(a + b) / 2, G - 26], [b, G - 28]], .9, '#6E675C', 'ink', .3); }
    boilSeed('spineL'); paint([[270, G - 30], [300, G - 30], [270, G + 190], [240, G + 190]], { wash: '#E4DCCB', ink: BINK, sw: .7 });
  }
  function shadow(x, w, k = 1) {
    boilSeed('shadow');
    paint(ellPts(x, G + 6, w * k, .22 * U * k, 16), { wash: '#CFC6B4', washOp: 200, ink: null });
  }
  // ink left on the page: dots along the sprint line, soaking away (fade) after `t0`
  function trail(t, t0) {
    const k = seg(t, 1.3, 1.6) * (1 - seg(t, t0 + .4, t0 + 1.4));
    if (k <= 0) return;
    for (let i = 0; i < 16; i++) {
      boilSeed('trail' + i);
      const x = lerp(X0 + 60, X1 - 40, hash(i * 2.9));
      if (t < 1.75 && x > lerp(X0, X1, seg(t, 1.25, 1.75))) continue;       // only where he has already run
      const y = G + 4 + (hash(i * 5.3) - .5) * 26, r = (4 + 9 * hash(i * 1.7)) * k;
      if (r > 1) paint(ellPts(x, y, r * 1.4, r * .6, 8), { wash: BINK, washOp: 255 * k, ink: null });
    }
  }
  // the speed smear: dry-brush ink streaming back from the head
  function smear(j, len, k) {
    if (k <= .02) return;
    const [hx, hy] = j.head, R = j.R;
    // a fat wet core that thins into dry-brush streaks, like the head was dragged across the page
    boilSeed('smearcore');
    paint(ribbon([[hx - .3 * R, hy], [hx - len * .35 * k, hy + .1 * R], [hx - len * .6 * k, hy + .2 * R]], R * 1.5, R * .5), { wash: BINK, washOp: 235, ink: null });
    for (let i = 0; i < 9; i++) {
      boilSeed('smear' + i);
      const dy = (i / 8 - .5) * R * 1.7, L = len * (.5 + .5 * hash(i * 3.1)) * k;
      inkLine([[hx - .3 * R, hy + dy * .7], [hx - L * .5, hy + dy + 8 * Math.sin(i * 2)], [hx - L, hy + dy * 1.1]], 3.2 + 2 * hash(i), BINK, 'dry', .3);
      inkLine([[hx - .3 * R, hy + dy * .6], [hx - L * .8, hy + dy * .95]], 2 + hash(i * 7), BINK2, 'dry', .2);
    }
    for (let i = 0; i < 12; i++) {
      boilSeed('smdot' + i);
      const x = hx - len * k * (.3 + .8 * hash(i * 4.4)), y = hy + (hash(i * 6.1) - .5) * R * 2.2, r = 3 + 11 * hash(i) * hash(i * 2);
      paint(ellPts(x, y, r, r * .9, 8), { wash: BINK, ink: null });
    }
  }
  // skid splatter flung forward + up from the front foot
  function skidSplat(x, age) {
    if (age < 0 || age > .9) return;
    const fly = clamp(age / .45);
    for (let i = 0; i < 12; i++) {
      boilSeed('skid' + i);
      const vx = 90 + 320 * hash(i * 2.1), vy = 60 + 260 * hash(i * 3.7);
      const px = x + vx * fly, py = G - vy * 4 * fly * (1 - fly) * .5 - 6;
      const r = (5 + 8 * hash(i * 9.1)) * (1 - seg(age, .5, .9));
      if (r > 1) paint(ellPts(px, py, r, r, 8), { wash: BINK, ink: null });
    }
    boilSeed('skidstreak');
    const k = 1 - seg(age, .4, .9);
    if (k > .02) paint(ribbon([[x - 380 * k, G - 4], [x - 150, G - 6], [x + 30, G - 10]], 3, 22), { wash: BINK, washOp: 230 * k, ink: null });
  }

  LOOPS.dash = t => {
    const len = 3.8, ph = TAU * t / len * 3;
    page();
    let j, face = { look: [1, 0] }, draw = true, splatAt = -1;

    // A · 0 – .5: a drop falls and becomes Blot, crouched
    if (t < .5) {
      const fall = seg(t, 0, .16), grow = backOut(seg(t, .14, .46));
      if (t < .16) {
        boilSeed('drop'); const y = lerp(80, G - 40, easeIn(fall));
        paint(through([[X0 + 60, y - 50], [X0 + 84, y], [X0 + 60, y + 26], [X0 + 36, y], [X0 + 60, y - 50]], 4), { wash: BINK, ink: BINK, sw: .8 });
        draw = false;
      } else {
        boilSeed('puddle'); paint(ellPts(X0 + 60, G + 4, 130 * (1 - grow * .6), 16, 16), { wash: BINK, ink: null });
        j = crouch(X0); face = { look: [.4, 1], eyes: grow < .7 ? 'closed' : 'sly' };
        push(); translate(X0 + 60, G); scale(lerp(1.4, 1, grow), Math.max(.05, grow)); translate(-X0 - 60, -G);
        shadow(X0 + 20, 2.6 * U); drawBlot(j, U, face, 'b', ph); pop();
        draw = false;
      }
    }
    // B · .5 – 1.25: crouch, eyes on the track, a shimmer of ink, then the wind-up (sink)
    else if (t < 1.25) {
      const sink = ease(seg(t, .95, 1.22));
      j = crouch(X0 - 18 * sink, sink, ph);
      face = { look: [1, lerp(.2, -.2, seg(t, .55, .8))], eyes: 'sly' };
    }
    // C · 1.25 – 1.75: launch and sprint (fast, slightly eased in), head stretched into the smear
    else if (t < 1.75) {
      const k = seg(t, 1.25, 1.75), x = lerp(X0, X1, k * k * .35 + k * .65);
      const r = run(x, (t - 1.25) * 38, clamp(k * 5));
      j = k < .12 ? blendPose(crouch(X0 - 18, 1), r, k / .12) : r;
      face = { look: [1, 0], eyes: 'sly', mouth: 'grin' };
      smear(j, 700 * clamp(k * 3), 1);
    }
    // D · 1.75 – 2.05: skid into the lunge, splatter flies forward, the smear snaps off
    else if (t < 2.05) {
      const k = easeOut(seg(t, 1.75, 2.05)), x = lerp(X1 - 30, X1, k);
      j = blendPose(run(X1 - 30, 19, 1), lunge(x), clamp(k * 1.6));
      face = { look: [1, .2], eyes: 'sly', mouth: 'grin' };
      smear(j, 700, 1 - k);
      splatAt = 1.78;
    }
    // E · 2.05 – 3.0: hold the lunge, rise a little, turn the face to you: the smirk
    else if (t < 3.0) {
      const rise = ease(seg(t, 2.2, 2.55)) * .8 * (1 - ease(seg(t, 2.8, 3.0)));
      j = lunge(X1, rise);
      j.head = add2(j.head, [0, -12 * spring(t, 2.05, 7, 20)]);
      const turn = ease(seg(t, 2.35, 2.55)) * (1 - ease(seg(t, 2.8, 2.95)));
      face = { look: [lerp(1, 0, turn), lerp(.2, .1, turn)], eyes: 'sly', mouth: turn > .5 ? 'smirk' : 'grin', turn };
      splatAt = 1.78;
    }
    // F · 3.0 – 3.35: off to the right in a streak
    else if (t < 3.35) {
      const k = seg(t, 3.0, 3.35), x = lerp(X1, 2350, easeIn(k));
      j = blendPose(lunge(X1), run(x, (t - 3) * 40, 1), clamp(k * 4));
      face = { look: [1, 0], eyes: 'sly', mouth: 'grin' };
      smear(j, 800 * k, 1);
    }
    // G · 3.35 – 3.8: the page is empty; the ink soaks away before the next drop
    else draw = false;

    trail(t, 2.3);
    if (splatAt > 0) skidSplat(X1 + 80, t - splatAt);
    if (draw && j) { shadow(j.hip[0] + .3 * U, (t > 1.25 && t < 1.75 ? 1.8 : 2.4) * U); drawBlot(j, U, face, 'b', ph); }
  };
  LOOPS.dash.len = 3.8;

  // still reference: the three key poses side by side, plus the face turned to camera
  LOOPS.dashKeys = t => {
    page();
    drawBlot(crouch(380), U * .9, { look: [1, 0], eyes: 'sly' }, 'k1');
    const r = run(900, 1.2, 1); smear(r, 500, 1); drawBlot(r, U * .9, { look: [1, 0], eyes: 'sly', mouth: 'grin' }, 'k2');
    drawBlot(lunge(1480, .6), U * .9, { look: [0, .1], eyes: 'sly', mouth: 'smirk', turn: 1 }, 'k3');
  };
  LOOPS.dashKeys.len = 1;
})();
