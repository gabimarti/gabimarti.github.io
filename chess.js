// Chess for Windows 3.1 (win31.js, "Games" group). Loaded on demand.
// Full rules: castling, en passant, promotion, check, checkmate, stalemate and bare-king draws (no 50-move / repetition rule).
// The computer plays Black: alpha-beta 3 plies + captures, material and a few positional bonuses, a little noise so games differ.
// GM.chess.engine (rules + search, no DOM; the tests run perft on it), GM.chess.mount(window, io) wires a Windows 3.1 window.
"use strict";
(() => {
  const START = "rnbqkbnrpppppppp" + ".".repeat(32) + "PPPPPPPPRNBQKBNR";   // index = row * 8 + col, row 0 = rank 8
  const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], ALL = [...ROOK, ...DIAG];
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const col = p => p === "." ? "" : p < "a" ? "w" : "b";
  const foe = t => t === "w" ? "b" : "w";
  const start = () => ({ b: [...START], turn: "w", castle: "KQkq", ep: -1 });

  function attacked(b, sq, by) {                           // is square sq attacked by side `by`?
    const r = sq >> 3, c = sq & 7, P = by === "w" ? "PNBRQK" : "pnbrqk", pr = by === "w" ? r + 1 : r - 1;
    for (const dc of [-1, 1]) if (on(pr, c + dc) && b[pr * 8 + c + dc] === P[0]) return true;
    for (const [dr, dc] of KN) if (on(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === P[1]) return true;
    for (const [dr, dc] of ALL) if (on(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === P[5]) return true;
    for (const [dirs, a] of [[ROOK, P[3]], [DIAG, P[2]]]) for (const [dr, dc] of dirs)
      for (let y = r + dr, x = c + dc; on(y, x); y += dr, x += dc) { const p = b[y * 8 + x]; if (p !== ".") { if (p === a || p === P[4]) return true; break; } }
    return false;
  }
  const inCheck = s => attacked(s.b, s.b.indexOf(s.turn === "w" ? "K" : "k"), foe(s.turn));

  function pseudo(s) {                                     // moves that may still leave the own king in check
    const { b, turn: me } = s, ms = [];
    for (let sq = 0; sq < 64; sq++) {
      const p = b[sq]; if (col(p) !== me) continue;
      const r = sq >> 3, c = sq & 7, k = p.toLowerCase();
      if (k === "p") {
        const d = me === "w" ? -1 : 1, last = me === "w" ? 0 : 7;
        const push = t => { if (t >> 3 === last) for (const q of "qrbn") ms.push({ f: sq, t, promo: me === "w" ? q.toUpperCase() : q }); else ms.push({ f: sq, t }); };
        if (b[(r + d) * 8 + c] === ".") {
          push((r + d) * 8 + c);
          if (r === (me === "w" ? 6 : 1) && b[(r + 2 * d) * 8 + c] === ".") ms.push({ f: sq, t: (r + 2 * d) * 8 + c, dbl: 1 });
        }
        for (const dc of [-1, 1]) if (on(r + d, c + dc)) {
          const t = (r + d) * 8 + c + dc;
          if (col(b[t]) === foe(me)) push(t); else if (t === s.ep) ms.push({ f: sq, t, ep: 1 });
        }
      } else if (k === "n" || k === "k") {
        for (const [dr, dc] of k === "n" ? KN : ALL) if (on(r + dr, c + dc)) { const t = (r + dr) * 8 + c + dc; if (col(b[t]) !== me) ms.push({ f: sq, t }); }
        const base = me === "w" ? 56 : 0, R = me === "w" ? "R" : "r", [K, Q] = me === "w" ? "KQ" : "kq", safe = (...q) => !q.some(x => attacked(b, x, foe(me)));
        if (k === "k" && sq === base + 4) {
          if (s.castle.includes(K) && b[base + 5] === "." && b[base + 6] === "." && b[base + 7] === R && safe(base + 4, base + 5, base + 6)) ms.push({ f: sq, t: base + 6, rook: [base + 7, base + 5] });
          if (s.castle.includes(Q) && b[base + 3] === "." && b[base + 2] === "." && b[base + 1] === "." && b[base] === R && safe(base + 4, base + 3, base + 2)) ms.push({ f: sq, t: base + 2, rook: [base, base + 3] });
        }
      } else {
        for (const [dr, dc] of k === "r" ? ROOK : k === "b" ? DIAG : ALL)
          for (let y = r + dr, x = c + dc; on(y, x); y += dr, x += dc) { const t = y * 8 + x; if (col(b[t]) === me) break; ms.push({ f: sq, t }); if (b[t] !== ".") break; }
      }
    }
    return ms;
  }

  function make(s, m) {                                    // returns the new position; s is left untouched
    const b = s.b.slice();
    b[m.t] = m.promo || b[m.f]; b[m.f] = ".";
    if (m.ep) b[m.t + (s.turn === "w" ? 8 : -8)] = ".";
    if (m.rook) { b[m.rook[1]] = b[m.rook[0]]; b[m.rook[0]] = "."; }
    let castle = s.castle;                                 // a king or rook leaving home (or a rook taken there) ends that castling
    for (const [sq, lost] of [[60, "KQ"], [4, "kq"], [63, "K"], [56, "Q"], [7, "k"], [0, "q"]])
      if (m.f === sq || m.t === sq) for (const x of lost) castle = castle.replace(x, "");
    return { b, turn: foe(s.turn), castle, ep: m.dbl ? (m.f + m.t) / 2 : -1 };
  }
  const legal = s => pseudo(s).filter(m => { const n = make(s, m); return !attacked(n.b, n.b.indexOf(s.turn === "w" ? "K" : "k"), n.turn); });

  function status(s) {                                     // play | check | mate | stalemate | draw
    const rest = s.b.filter(p => p !== "." && p.toLowerCase() !== "k");
    if (!rest.length || (rest.length === 1 && "nNbB".includes(rest[0]))) return "draw";
    const n = legal(s).length, chk = inCheck(s);
    return n ? (chk ? "check" : "play") : chk ? "mate" : "stalemate";
  }
  const perft = (s, d) => d ? legal(s).reduce((n, m) => n + perft(make(s, m), d - 1), 0) : 1;

  function evaluate(b) {                                   // from White's side, in centipawns
    let v = 0;
    for (let i = 0; i < 64; i++) {
      const p = b[i]; if (p === ".") continue;
      const k = p.toLowerCase(), w = p < "a", r = i >> 3, c = i & 7, centre = 14 - Math.abs(2 * r - 7) - Math.abs(2 * c - 7);
      let x = VAL[k];
      if (k === "n" || k === "b") x += centre * 3;
      else if (k === "p") x += (w ? 6 - r : r - 1) * 8 + (c === 3 || c === 4 ? 10 : 0);
      else if (k === "q") x += centre;
      v += w ? x : -x;
    }
    return v;
  }
  const gain = (s, m) => (s.b[m.t] !== "." ? VAL[s.b[m.t].toLowerCase()] * 10 - VAL[s.b[m.f].toLowerCase()] / 10 : 0) + (m.promo ? 8000 : 0);
  const order = s => (x, y) => gain(s, y) - gain(s, x);    // captures of big pieces by small ones first: more cut-offs
  function quiesce(s, a, bt, d) {                          // only captures, so a move isn't judged in the middle of an exchange
    const e = s.turn === "w" ? evaluate(s.b) : -evaluate(s.b);
    if (e >= bt || !d) return e; if (e > a) a = e;
    for (const m of legal(s).filter(m => s.b[m.t] !== "." || m.promo).sort(order(s))) {
      const v = -quiesce(make(s, m), -bt, -a, d - 1);
      if (v >= bt) return v; if (v > a) a = v;
    }
    return a;
  }
  function search(s, d, a, bt, ply) {
    if (!d) return quiesce(s, a, bt, 4);
    const ms = legal(s);
    if (!ms.length) return inCheck(s) ? -99999 + ply : 0;  // mated (sooner is worse) or stalemate
    for (const m of ms.sort(order(s))) {
      const v = -search(make(s, m), d - 1, -bt, -a, ply + 1);
      if (v >= bt) return v; if (v > a) a = v;
    }
    return a;
  }
  function best(s, depth = 3, rnd = Math.random) {
    let top = null, score = -Infinity;
    for (const m of legal(s).sort(order(s))) {
      // the noise (< 12) only breaks near-ties; moves that can't come within 12 of the best are cut short
      const v = -search(make(s, m), depth - 1, -Infinity, 12 - score, 1) + rnd() * 12;
      if (v > score) { score = v; top = m; }
    }
    return top;
  }
  const engine = { start, legal, make, status, perft, best, inCheck };

  // ---------- the window ----------
  const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }, NAME = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
  const sqName = i => "abcdefgh"[i & 7] + (8 - (i >> 3));
  const glyph = p => GLYPH[p.toLowerCase()] + "︎";     // U+FE0E: text style, never the emoji pawn

  function mount(w, io) {
    const body = w.querySelector(".w31-body");
    body.innerHTML = `<div class="w31-xstat" aria-live="polite"></div><div class="w31-xboard">${Array.from({ length: 64 }, (_, i) => `<button type="button" data-xs="${i}"></button>`).join("")}</div>`
      + `<p class="w31-xpromo" hidden>Promote to: ${[..."qrbn"].map(k => `<button type="button" class="w31-btn" data-xp="${k}" aria-label="${NAME[k]}">${glyph(k)}</button>`).join(" ")}</p>`
      + `<p class="w31-btns"><button type="button" class="w31-btn" data-xnew>New game</button></p>`;
    const $ = q => body.querySelector(q);
    let s, sel, last, busy, note, timer = 0, pending = null;
    const fresh = () => { clearTimeout(timer); s = start(); sel = -1; last = null; busy = false; note = ""; pending = null; $(".w31-xpromo").hidden = true; draw(); };
    const draw = () => {
      const st = status(s), targets = sel < 0 ? [] : legal(s).filter(m => m.f === sel).map(m => m.t), king = s.b.indexOf(s.turn === "w" ? "K" : "k");
      body.querySelectorAll("[data-xs]").forEach(b => {
        const i = +b.dataset.xs, p = s.b[i];
        b.className = `${((i >> 3) + i) % 2 ? "w31-xd" : "w31-xl"}${p !== "." ? (p < "a" ? " w31-xw" : " w31-xb") : ""}${i === sel ? " w31-xsel" : ""}${targets.includes(i) ? " w31-xto" : ""}`
          + `${last && (i === last.f || i === last.t) ? " w31-xlast" : ""}${i === king && (st === "check" || st === "mate") ? " w31-xchk" : ""}`;
        b.textContent = p === "." ? "" : glyph(p);
        b.setAttribute("aria-label", sqName(i) + (p === "." ? "" : ` ${p < "a" ? "white" : "black"} ${NAME[p.toLowerCase()]}`));
      });
      $(".w31-xstat").textContent = {
        mate: s.turn === "b" ? "Checkmate. You win!" : "Checkmate. Windows wins.", stalemate: "Stalemate. Draw.", draw: "Draw: not enough pieces to mate.",
        check: busy ? "Check! Windows is thinking..." : `${note}Check! Your move.`, play: busy ? "Windows is thinking..." : `${note}Your move (White).`,
      }[st];
    };
    const over = () => ["mate", "stalemate", "draw"].includes(status(s));
    const play = m => {
      s = make(s, m); last = m; sel = -1; io.sfx.key();
      if (over()) { (status(s) === "mate" ? io.sfx.ok : io.sfx.blip)(); return draw(); }
      busy = true; draw();
      timer = setTimeout(() => {                            // let the "thinking" line paint first
        const r = best(s); s = make(s, r); last = r; busy = false;
        note = `Windows: ${sqName(r.f)}-${sqName(r.t)}${r.promo ? "=" + r.promo.toUpperCase() : ""}. `;
        if (status(s) === "mate") io.sfx.err(); else io.sfx.key();
        draw();
      }, 250);
    };
    body.addEventListener("click", e => {
      if (e.target.closest("[data-xnew]")) return fresh();
      const pr = e.target.closest("[data-xp]");
      if (pr && pending) { const m = pending.find(m => m.promo.toLowerCase() === pr.dataset.xp); pending = null; $(".w31-xpromo").hidden = true; return play(m); }
      const b = e.target.closest("[data-xs]"); if (!b || busy || over()) return;
      const i = +b.dataset.xs, ms = legal(s).filter(m => m.f === sel && m.t === i);
      if (ms.length > 1) { pending = ms; $(".w31-xpromo").hidden = false; return; }   // promotion: the visitor picks the piece
      if (ms.length) return play(ms[0]);
      pending = null; $(".w31-xpromo").hidden = true;
      sel = col(s.b[i]) === "w" && i !== sel ? i : -1; draw();
    });
    w.addEventListener("w31close", () => clearTimeout(timer));
    fresh();
  }

  GM.chess = { engine, mount };
})();
