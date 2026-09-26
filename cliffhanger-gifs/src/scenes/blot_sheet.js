// Blot's model sheet (reference only): poses and faces.
(() => {
  LOOPS.blotSheet = t => {
    const row = [
      {}, { lookX: -1 }, { blink: 1 }, { wide: 1, emote: '!' }, { narrow: 1, lookX: .8 },
      { drip: 1, lookY: 1 }, { sq: .18 }, { sq: -.16, arms: [[1520, 330], [1880, 330]] },
    ];
    row.forEach((o, i) => {
      const x = 240 + (i % 4) * 480, y = 300 + Math.floor(i / 4) * 480;
      blot(x - (i === 7 ? -450 + 1700 - 1700 : 0), y, 140, { ...o, boilKey: i, ph: t * TAU / 2 });
    });
  };
  LOOPS.blotSheet.len = 2;
})();
