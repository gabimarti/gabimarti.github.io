// Console games for MS-DOS (C:\GAMES) and Linux (/usr/games): SNAKE and TETRIS, drawn as text inside the terminal.
// Loaded on demand. GM.games.run(name, container) -> Promise<score>. Keys: arrows / WASD, P pause, Q or Esc quit;
// on phones, the on-screen pad under the board. TETRIS plays Korobeiniki from tunes.js when it's loaded.
"use strict";
(() => {
  const { sfx, sleep } = GM;
  const SHAPES = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]],
    S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
  const best = { snake: 0, tetris: 0 };                   // best scores, this page load only

  function controls(container, keys) {                      // keyboard + on-screen pad; next() pops the next action
    const queue = [];
    const onKey = e => {
      const k = { ArrowLeft: "L", a: "L", A: "L", ArrowRight: "R", d: "R", D: "R", ArrowUp: "U", w: "U", W: "U", ArrowDown: "D", s: "D", S: "D",
        " ": "SP", p: "P", P: "P", q: "Q", Q: "Q", Escape: "Q" }[e.key];
      if (!k || e.ctrlKey || e.altKey || e.metaKey) return;
      e.preventDefault(); e.stopPropagation(); queue.push(k);
    };
    const pad = document.createElement("div"); pad.className = "pad";
    pad.innerHTML = keys.map(([k, label]) => `<button type="button" data-k="${k}">${label}</button>`).join("");
    pad.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { e.stopPropagation(); queue.push(b.dataset.k); } });
    container.append(pad);
    addEventListener("keydown", onKey, true);
    return { next: () => queue.shift(), stop: () => removeEventListener("keydown", onKey, true) };
  }

  async function snake(screen, container) {
    const W = 28, H = 14, ctl = controls(container, [["L", "◀"], ["U", "▲"], ["D", "▼"], ["R", "▶"], ["P", "II"], ["Q", "✕"]]);
    let body = [[6, 7], [5, 7], [4, 7]], dir = [1, 0], food, score = 0, speed = 140, paused = false, over = false;
    const place = () => { do food = [(Math.random() * W) | 0, (Math.random() * H) | 0]; while (body.some(([x, y]) => x === food[0] && y === food[1])); };
    place();
    const draw = msg => {
      const g = Array.from({ length: H }, () => Array(W).fill(" "));
      g[food[1]][food[0]] = "*"; body.forEach(([x, y], i) => { g[y][x] = i ? "o" : "@"; });
      screen.textContent = `SNAKE   score ${String(score).padStart(4)}   best ${String(Math.max(best.snake, score)).padStart(4)}\n+${"-".repeat(W)}+\n`
        + g.map(r => "|" + r.join("") + "|").join("\n") + `\n+${"-".repeat(W)}+\n${msg || "arrows/WASD move · P pause · Q quit"}`;
    };
    while (!over) {
      for (let k; (k = ctl.next());) {
        if (k === "Q") over = "quit";
        else if (k === "P") paused = !paused;
        else { const d = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[k]; if (d && (d[0] !== -dir[0] || d[1] !== -dir[1])) dir = d; }
      }
      if (over) break;
      if (paused) { draw("PAUSED · P to continue"); await sleep(120); continue; }
      const head = [body[0][0] + dir[0], body[0][1] + dir[1]];
      if (head[0] < 0 || head[1] < 0 || head[0] >= W || head[1] >= H || body.some(([x, y]) => x === head[0] && y === head[1])) { over = "crash"; break; }
      body.unshift(head);
      if (head[0] === food[0] && head[1] === food[1]) { score += 10; sfx.ok(); place(); speed = Math.max(60, speed - 4); } else body.pop();
      draw(); await sleep(speed);
    }
    ctl.stop();
    if (over === "crash") { sfx.err(); draw(`GAME OVER · score ${score}`); await sleep(1200); }
    best.snake = Math.max(best.snake, score); return score;
  }

  async function tetris(screen, container) {
    const W = 10, H = 20, ctl = controls(container, [["L", "◀"], ["U", "⟳"], ["D", "▼"], ["R", "▶"], ["SP", "⤓"], ["P", "II"], ["Q", "✕"]]);
    const board = Array.from({ length: H }, () => Array(W).fill(0)), keys = Object.keys(SHAPES);
    let piece, next = keys[(Math.random() * 7) | 0], score = 0, lines = 0, paused = false, over = false, music = null;
    const cells = (p = piece) => p.cells.map(([x, y]) => [x + p.x, y + p.y]);
    const fits = p => cells(p).every(([x, y]) => x >= 0 && x < W && y < H && (y < 0 || !board[y][x]));
    const spawn = () => { piece = { cells: SHAPES[next].map(c => [...c]), x: 3, y: 0, k: next }; next = keys[(Math.random() * 7) | 0]; if (!fits(piece)) over = "top"; };
    const rotate = () => {
      if (piece.k === "O") return;
      const r = { ...piece, cells: piece.cells.map(([x, y]) => [2 - y, x]) };
      for (const dx of [0, -1, 1, -2, 2]) { const t = { ...r, x: r.x + dx }; if (fits(t)) { piece = t; sfx.key(); return; } }
    };
    const move = (dx, dy) => { const t = { ...piece, x: piece.x + dx, y: piece.y + dy }; if (fits(t)) { piece = t; return true; } return false; };
    const level = () => 1 + (lines / 10 | 0);
    const lock = () => {
      cells().forEach(([x, y]) => { if (y >= 0) board[y][x] = 1; });
      let n = 0;
      for (let y = H - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(W).fill(0)); n++; y++; }
      if (n) { lines += n; score += [0, 100, 300, 500, 800][n] * level(); sfx.ok(); } else sfx.tick();
      spawn();
    };
    const draw = msg => {
      const g = board.map(r => r.map(c => c ? "[]" : " ."));
      if (piece) cells().forEach(([x, y]) => { if (y >= 0) g[y][x] = "[]"; });
      const nx = SHAPES[next], side = ["", `SCORE  ${score}`, `LINES  ${lines}`, `LEVEL  ${level()}`, `BEST   ${Math.max(best.tetris, score)}`, "", "NEXT",
        ...[0, 1].map(y => "  " + [0, 1, 2, 3].map(x => nx.some(([a, b]) => a === x && b === y) ? "[]" : "  ").join(""))];
      screen.textContent = "TETRIS\n" + g.map((r, y) => `<!${r.join("")}!>  ${side[y] || ""}`).join("\n")
        + `\n<!${"=".repeat(W * 2)}!>\n  ${"\\/".repeat(W)}\n${msg || "◀ ▶ move · ▲ rotate · ▼ drop · space hard drop · P · Q"}`;
    };
    const startMusic = () => {                              // Korobeiniki on a loop, if the shared tunes are there
      const t = GM.tunes?.list.find(x => x.file === "KOROBEIN.MID"); if (!t) return;
      const go = () => { const [stop, secs] = GM.tunes.play(t.tune); music = { stop, timer: setTimeout(go, secs * 1000 + 400) }; };
      go();
    };
    const stopMusic = () => { if (music) { clearTimeout(music.timer); music.stop(); music = null; } };
    try { await GM.need("tunes.js"); } catch (e) { /* silent tetris */ }
    spawn(); startMusic();
    let last = performance.now();
    while (!over) {
      for (let k; (k = ctl.next());) {
        if (k === "Q") { over = "quit"; break; }
        if (k === "P") { paused = !paused; if (paused) stopMusic(); else startMusic(); continue; }
        if (paused) continue;
        if (k === "L") move(-1, 0); else if (k === "R") move(1, 0); else if (k === "U") rotate();
        else if (k === "D") { if (!move(0, 1)) lock(); last = performance.now(); }
        else if (k === "SP") { while (move(0, 1)) score += 2; lock(); last = performance.now(); }
      }
      if (over) break;
      if (paused) { draw("PAUSED · P to continue"); await sleep(100); continue; }
      if (performance.now() - last > Math.max(90, 650 - (level() - 1) * 60)) { if (!move(0, 1)) lock(); last = performance.now(); }
      draw(); await sleep(30);
    }
    ctl.stop(); stopMusic();
    if (over === "top") { sfx.err(); draw(`GAME OVER · score ${score}`); await sleep(1500); }
    best.tetris = Math.max(best.tetris, score); return score;
  }

  GM.games = {
    async run(name, container) {
      const box = document.createElement("div"); box.className = "game";
      const screen = document.createElement("pre"); box.append(screen); container.append(box);
      setTimeout(() => box.scrollIntoView({ block: "end" }), 60);   // the whole board in view
      try { return await ({ snake, tetris })[name](screen, box); } finally { box.querySelector(".pad")?.remove(); }
    },
  };
})();
