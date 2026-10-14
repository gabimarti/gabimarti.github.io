// Famous MS-DOS viruses, defanged: only the on-screen show. Loaded on demand by dos.js (C:\VIRUSES, or their real trigger dates).
// GM.virus.run(file, io) -> Promise; io = { print, sleep, sfx, anyKey, lines() -> last lines of the screen as plain text }.
"use strict";
(() => {
  const W = 56, H = 14;
  const e = c => c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c;
  // a text-mode screen: grid of chars (seeded with what was on screen) + colour classes per cell (pc1..pc6, see style.css)
  function screen(io, seedText = true) {
    const pre = document.createElement("pre"); pre.className = "dos-party dos-vx"; io.print("").append(pre);
    const lines = seedText ? io.lines().slice(-H) : [];
    const g = Array.from({ length: H }, (_, y) => [...(lines[y - (H - lines.length)] || "").slice(0, W).padEnd(W)]);
    const draw = (col = {}) => { pre.innerHTML = g.map((r, y) => r.map((c, x) => col[y * W + x] ? `<span class="pc${col[y * W + x]}">${e(c)}</span>` : e(c)).join("")).join("\n"); };
    return { g, draw };
  }
  const blit = (g, art, x0, y0, col, colour) => art.forEach((row, dy) => [...row].forEach((ch, dx) => {
    const x = x0 + dx, y = y0 + dy;
    if (ch !== " " && x >= 0 && x < W && y >= 0 && y < H) { g[y][x] = ch; if (colour?.(ch)) col[y * W + x] = colour(ch); }
  }));

  const RUN = {
    // Cascade (1701): the letters let go and pile up at the bottom
    async "CASCADE.COM"(io) {
      const { g, draw } = screen(io), falling = new Set(), end = performance.now() + 9000;
      let quiet = 0;
      while (performance.now() < end && quiet < 15) {
        let moved = 0; const next = new Set();
        for (let y = H - 2; y >= 0; y--) for (let x = 0; x < W; x++) {
          if (g[y][x] === " " || g[y + 1][x] !== " " || !(falling.has(y * W + x) || Math.random() < .02)) continue;
          g[y + 1][x] = g[y][x]; g[y][x] = " "; next.add((y + 1) * W + x); moved++;
        }
        falling.clear(); next.forEach(k => falling.add(k));
        quiet = moved ? 0 : quiet + 1; if (moved && Math.random() < .3) io.sfx.tick();
        draw(); await io.sleep(70);
      }
    },
    // Ping Pong (Italian): a ball bounces off the edges and off the text
    async "PINGPONG.COM"(io) {
      const { g, draw } = screen(io), end = performance.now() + 9000;
      let x = 3, y = 2, dx = 1, dy = 1;
      while (performance.now() < end) {
        if (x + dx < 0 || x + dx >= W || g[y][x + dx] !== " ") { dx = -dx; io.sfx.tick(); }
        if (y + dy < 0 || y + dy >= H || g[y + dy][x] !== " ") { dy = -dy; io.sfx.tick(); }
        if (g[y + dy]?.[x + dx] === " ") { x += dx; y += dy; }
        const c = g[y][x]; g[y][x] = "\u2022"; draw({ [y * W + x]: 4 }); g[y][x] = c;
        await io.sleep(60);
      }
    },
    // Ambulance Car (RedX): an ambulance crosses the bottom of the screen with its siren on
    async "AMBULANC.COM"(io) {
      const { g, draw } = screen(io), base = g.map(r => [...r]);
      const ART = ["      _____________", "  ___/ [_]   [_]  |", " |    AMBULANCE + |", " '--(O)-------(O)-'"];
      for (let x = W, i = 0; x > -ART[0].length; x--, i++) {
        g.forEach((r, y) => r.splice(0, W, ...base[y])); const col = {};
        blit(g, ART, x, H - 4, col, ch => ch === "+" ? 1 : 0);
        if (x + 8 < W && x + 8 >= 0) { g[H - 5][x + 8] = "\u25cf"; col[(H - 5) * W + x + 8] = i % 4 < 2 ? 1 : 3; }   // the flashing light
        if (i % 3 === 0) io.sfx.tone(i % 6 ? 770 : 960, .12, "square", .02);
        draw(col); await io.sleep(80);
      }
    },
    // Walker: a little man strolls along the bottom line
    async "WALKER.COM"(io) {
      const { g, draw } = screen(io), base = g.map(r => [...r]);
      const STEP = [[" o ", "/|\\", "/ \\"], [" o ", "/|\\", " | "]];
      for (let x = -3, i = 0; x < W; x++, i++) {
        g.forEach((r, y) => r.splice(0, W, ...base[y]));
        blit(g, STEP[i % 2], x, H - 3, {}); if (i % 2) io.sfx.tick();
        draw(); await io.sleep(120);
      }
    },
    // Barrotes (Spain): bars come down over the screen, a jail for your text
    async "BARROTES.COM"(io) {
      const { g, draw } = screen(io), col = {};
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x += 4) { g[y][x] = "\u2588"; col[y * W + x] = 3; }
        io.sfx.tone(200 + y * 30, .05, "square", .02); draw(col); await io.sleep(150);
      }
      await io.sleep(3500);
    },
    // Yankee Doodle (TP-44): at five in the afternoon it plays the tune
    async "YANKEE.COM"(io) {
      const { g, draw } = screen(io, false), msg = "\u266a Yankee Doodle \u266a";
      const TUNE = ["Yankee Doodle", "", .16, "G4 G4 A4 B4 G4 B4 A4 D4 G4 G4 A4 B4 G4:2 F#4:2 G4 G4 A4 B4 C5 B4 A4 G4 F#4 D4 E4 F#4 G4:2 G4:2"];
      const [stop, secs] = GM.tunes ? GM.tunes.play(TUNE) : [() => {}, 5];
      const end = performance.now() + secs * 1000 + 300, notes = [];
      while (performance.now() < end) {
        if (Math.random() < .4) notes.push([Math.random() * W | 0, H - 1, Math.random() < .5 ? "\u266a" : "\u266b", 1 + (Math.random() * 6 | 0)]);
        g.forEach(r => r.fill(" ")); const col = {};
        for (const n of notes) { n[1]--; if (n[1] >= 0) { g[n[1]][n[0]] = n[2]; col[n[1] * W + n[0]] = n[3]; } }
        [...msg].forEach((c, i) => { g[6][((W - msg.length) >> 1) + i] = c; });
        draw(col); await io.sleep(120);
      }
      stop();
    },
    // Casino (Disk Destroyer, Malta): your FAT on a jackpot. Here the FAT is safe whatever happens.
    async "CASINO.COM"(io) {
      const R = ["\u00a3", "?", "\u2663"], spin = () => R[Math.random() * R.length | 0];
      io.print(`<pre class="dos-casino">     DISK DESTROYER \u2022 A SOUVENIR OF MALTA

I have just DESTROYED the FAT on your Disk !!
However, I have a copy in RAM, and I'm giving you a last chance
to restore your precious data.
WARNING: IF YOU RESET NOW, ALL YOUR DATA WILL BE LOST - FOREVER !!
Your Data depends on a game of JACKPOT</pre>`);
      const pre = document.createElement("pre"); pre.className = "dos-casino"; io.print("").append(pre);
      const show = (r, credits, msg) => { pre.textContent = `     CASINO DE MALTE JACKPOT\n\n          \u2550\u2550\u2550 ${r.join(" ")} \u2550\u2550\u2550\n\n          CREDITS : ${credits}\n\n${msg}`; };
      let r = ["\u00a3", "\u00a3", "\u00a3"];
      for (let credits = 5; credits > 0; credits--) {
        show(r, credits, "     ANY KEY TO PLAY"); await io.anyKey();
        for (let i = 0; i < 12; i++) { r = [spin(), spin(), spin()]; show(r, credits, ""); io.sfx.tick(); await io.sleep(70); }
        if (r.every(s => s === "\u00a3")) {
          io.sfx.ok(); show(r, credits, "LUCKY! You won this time - but for your own sake, now\nSWITCH OFF your computer and don't turn it on until tomorrow!!!");
          return;
        }
      }
      io.sfx.err(); show(r, 0, "HA HA !! You loose ... Bye Bye, FAT.");
      await io.sleep(1200);
    },
  };
  GM.virus = { run: (file, io) => RUN[file](io) };
})();
