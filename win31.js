// Windows 3.1 for gabimarti.github.io: type WIN at the MS-DOS prompt (dos.js). Loaded on demand.
// Program Manager with a "Gabriel Martí" group; each icon opens the CV content (the quick view's #c-* sections) in a window, plus Calculator, Media Player (tunes.js), Clock and a "Games" group with Minesweeper.
// Windows move by their title bar (desktop), come to the front on click, minimize to desktop icons, maximize and close; on phones they stack full width.
// GM.win31.run(container, { html, sfx, sleep }) -> Promise resolved by "Exit Windows".
"use strict";
(() => {
  const { esc } = GM;
  const APPS = [   // [icon, label, window title, content (html) or special, Program Manager group (default: the first)]
    ["📝", "Write", "Write - CV.WRI", io => `<p><strong>Gabriel Martí</strong> (@gabimarti)</p>${io.html("#c-role")}${io.html("#c-summary")}`],
    ["🗂", "Cardfile", "Cardfile - SKILLS.CRD", io => io.html("#c-skills")],
    ["📁", "File Manager", "File Manager - C:\\REPOS", io => io.html("#c-repos")],
    ["🗒", "Notepad", "Notepad - ARTICLES.TXT", io => io.html("#c-articles")],
    ["📄", "About", "Notepad - ABOUT.TXT", io => io.html("#c-about") + io.html("#c-interests")],
    ["🎨", "Paintbrush", "Paintbrush - AVATAR.BMP", io => io.html("#avatar .avatar")],
    ["📇", "Contacts", "Cardfile - CONTACT.CRD", io => io.html("#c-contact")],
    ["🧮", "Calculator", "Calculator", "calc"],
    ["🎵", "Media Player", "Media Player", "mplayer"],
    ["🕐", "Clock", "Clock", "clock"],
    ["⚙", "Control Panel", "Control Panel", "control"],
    ["🚪", "Exit Windows", null, "exit"],
    ["💣", "Minesweeper", "Minesweeper", "mines", "Games"],
  ];
  const GROUPS = ["Gabriel Martí", "Games"];
  let z = 10;
  const HOURGLASS = `<span class="w31-hg" aria-hidden="true"><svg viewBox="0 0 16 22" width="22" height="30" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" stroke="#000" d="M2 1h12v2h-1v3c0 2-3 3-3 5s3 3 3 5v3h1v2H2v-2h1v-3c0-2 3-3 3-5S3 8 3 6V3H2z"/><path d="M5 6h6c0 1-2 2-3 3C7 8 5 7 5 6zM8 15c1 1 3 2 3 4H5c0-2 2-3 3-4z"/></svg></span>`;   // phones (no mouse cursor); desktops get it as the cursor (style.css)
  // our own waving four-colour flag (drawn here, not Microsoft's bitmap), with the trailing pixels of the 1992 splash
  const FLAG = `<svg class="w31-flag" viewBox="0 0 100 80" aria-hidden="true">
    <path fill="#e8161b" d="M30 12C40 6 50 6 60 12V40C50 34 40 34 30 40Z"/><path fill="#10a33d" d="M63 13C73 19 83 19 93 13V41C83 47 73 47 63 41Z"/>
    <path fill="#1f5bd6" d="M30 43C40 37 50 37 60 43V71C50 65 40 65 30 71Z"/><path fill="#f5c400" d="M63 44C73 50 83 50 93 44V72C83 78 73 78 63 72Z"/>
    <path fill="#e8161b" d="M21 16h5v5h-5zM13 20h4v4h-4zM6 15h3v3h-3zM14 30h4v4h-4z"/><path fill="#1f5bd6" d="M21 48h5v5h-5zM13 52h4v4h-4zM6 47h3v3h-3zM14 62h4v4h-4z"/></svg>`;
  const KEYS = [["bk", "←"], ["ce", "CE"], ["clr", "C"], ["and", "And"], ["or", "Or"], ["xor", "Xor"],
    ["mc", "MC"], "7", "8", "9", ["/", "÷"], ["not", "Not"], ["mr", "MR"], "4", "5", "6", ["*", "×"], ["sqrt", "√"],
    ["ms", "MS"], "1", "2", "3", ["-", "−"], ["%", "%"], ["m+", "M+"], "0", ["neg", "±"], ".", ["+", "+"], ["inv", "1/x"],
    "A", "B", "C", "D", "E", "F", ["=", "="]].map(k => typeof k === "string" ? [k, k] : k);

  // Calculator engine (no DOM): Dec works with decimals; Hex/Oct/Bin with 32-bit integers, negatives shown in two's complement,
  // like the 1992 Scientific mode. press(key) with the KEYS ids; base(16|10|8|2) converts what's on the display.
  function calc() {
    let disp = "0", acc = null, op = null, fresh = true, base = 10, mem = 0, err = false;
    const val = () => base === 10 ? parseFloat(disp) : parseInt(disp, base) | 0;
    const show = v => {
      if (!isFinite(v)) { err = true; return "Error"; }
      return base === 10 ? String(+v.toPrecision(12)) : ((Math.trunc(v) | 0) >>> 0).toString(base).toUpperCase();
    };
    const apply = (a, o, b) => {
      const i = base !== 10;
      return { "+": a + b, "-": a - b, "*": a * b, "/": i ? (b ? Math.trunc(a / b) : NaN) : a / b, and: a & b, or: a | b, xor: a ^ b }[o];
    };
    const set = v => { disp = show(v); fresh = true; };
    const press = k => {
      if (err && k !== "clr" && k !== "ce") return;
      if (/^[0-9A-F]$/.test(k)) {
        if (parseInt(k, 16) >= base) return;
        disp = fresh || disp === "0" ? k : disp.length < (base === 2 ? 32 : 16) ? disp + k : disp; fresh = false;
      } else if (k === ".") { if (base !== 10) return; disp = fresh ? "0." : disp.includes(".") ? disp : disp + "."; fresh = false; }
      else if (["+", "-", "*", "/", "and", "or", "xor"].includes(k)) {
        if (op && !fresh) { acc = apply(acc, op, val()); set(acc); } else acc = val();
        op = k; fresh = true;
      } else if (k === "=") { if (op) { set(apply(acc, op, val())); acc = op = null; } }
      else if (k === "neg") disp = base === 10 ? (disp.startsWith("-") ? disp.slice(1) : disp === "0" ? disp : "-" + disp) : show(-val());
      else if (k === "sqrt") set(Math.sqrt(val()));
      else if (k === "inv") set(1 / val());
      else if (k === "not") set(~val());
      else if (k === "%") { if (acc !== null) set(acc * val() / 100); }
      else if (k === "clr") { disp = "0"; acc = op = null; fresh = true; err = false; }
      else if (k === "ce") { disp = "0"; fresh = true; err = false; }
      else if (k === "bk") { if (!fresh) disp = disp.slice(0, -1).replace(/^-?$/, "0"); }
      else if (k === "mc") mem = 0;
      else if (k === "mr") set(mem);
      else if (k === "ms") { mem = val(); fresh = true; }
      else if (k === "m+") { mem += val(); fresh = true; }
    };
    return { press, base: b => { const v = val(); base = b; if (!err) set(v); }, get display() { return disp; }, get mem() { return mem !== 0; }, get radix() { return base; } };
  }

  function calcWindow(w, io) {                            // wires a Calculator window to calc()
    const c = calc(), d = w.querySelector(".w31-cdisp"), m = w.querySelector(".w31-cmem");
    const draw = () => {
      d.textContent = c.display; m.textContent = c.mem ? "M" : "";
      w.querySelectorAll("[data-cb]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.cb === c.radix));
      w.querySelectorAll("[data-ck]").forEach(b => {
        const k = b.dataset.ck;
        b.disabled = /^[0-9A-F]$/.test(k) ? parseInt(k, 16) >= c.radix : k === "." ? c.radix !== 10 : false;
      });
    };
    w.addEventListener("click", e => {
      const b = e.target.closest("[data-ck],[data-cb]"); if (!b) return;
      if (b.dataset.cb) c.base(+b.dataset.cb); else c.press(b.dataset.ck);
      io.sfx.key(); draw();
    });
    w.addEventListener("keydown", e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const k = { Enter: "=", "=": "=", Escape: "clr", Backspace: "bk", Delete: "ce", ",": ".", "&": "and", "|": "or", "^": "xor", "~": "not" }[e.key]
        || (/^[0-9a-fA-F.+\-*/%]$/.test(e.key) ? e.key.toUpperCase() : null);
      if (!k) return;
      e.preventDefault(); c.press(k); io.sfx.key(); draw();
    });
    draw(); w.focus({ preventScroll: true });
  }

  // Media Player: the PC speaker tunes of tunes.js (shared with the BIOS and MS-DOS). Stops when its window closes.
  function playerWindow(w, io) {
    const L = GM.tunes.list, $ = s => w.querySelector(s);
    let cur = 0, stop = null, timer = 0, t0 = 0, len = 0;
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const draw = (el = 0) => {
      $("progress").value = len ? el / len : 0;
      $(".w31-mtime").textContent = `${fmt(el)} / ${fmt(len)}`;
      $(".w31-mnow").textContent = `${L[cur].title} — ${L[cur].game}`;
      w.querySelectorAll("[data-mt]").forEach(b => b.setAttribute("aria-current", +b.dataset.mt === cur));
    };
    const halt = () => { stop?.(); stop = null; clearInterval(timer); draw(); };
    const play = i => {
      stop?.(); clearInterval(timer);
      cur = (i + L.length) % L.length; [stop, len] = GM.tunes.play(L[cur].tune); t0 = performance.now();
      timer = setInterval(() => {
        const el = (performance.now() - t0) / 1000;
        if (el < len) draw(el); else if ($(".w31-mrep").checked) play(cur); else halt();
      }, 250);
      draw();
    };
    w.addEventListener("click", e => {
      const b = e.target.closest("[data-mp],[data-mt]"); if (!b) return;
      if (b.dataset.mt) return play(+b.dataset.mt);
      ({ play: () => play(cur), stop: halt, prev: () => play(cur - 1), next: () => play(cur + 1) })[b.dataset.mp]();
    });
    w.addEventListener("w31close", halt);
    draw();
  }

  // Clock: analog (hands every second) or digital, the visitor's local time. Stops ticking when its window closes.
  const CLOCK = `<svg class="w31-kface" viewBox="0 0 100 100" aria-hidden="true">${Array.from({ length: 60 }, (_, i) => i % 5
    ? `<circle cx="50" cy="7" r=".9" transform="rotate(${i * 6} 50 50)"/>` : `<rect x="48" y="5" width="4" height="4" transform="rotate(${i * 6} 50 50)"/>`).join("")}
    <path class="w31-kh" d="M50 50 47 46 50 24 53 46z"/><path class="w31-km" d="M50 50 48 46 50 12 52 46z"/><line class="w31-ks" x1="50" y1="56" x2="50" y2="12"/></svg>`;
  function clockWindow(w) {
    const $ = s => w.querySelector(s);
    const tick = () => {
      const d = GM.now(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = d.getHours() % 12 + m / 60;
      [[".w31-kh", h * 30], [".w31-km", m * 6], [".w31-ks", s * 6]].forEach(([k, a]) => $(k).setAttribute("transform", `rotate(${a} 50 50)`));
      $(".w31-kdig").textContent = d.toLocaleTimeString("en-US");     // a US-English 1992 build, like the rest of the chrome
      $(".w31-kdate").textContent = d.toLocaleDateString("en-US");
    };
    const t = setInterval(tick, 1000); tick();
    w.addEventListener("w31close", () => clearInterval(t));
    w.addEventListener("click", e => {
      const b = e.target.closest("[data-kmode]"); if (!b) return;
      b.textContent = w.classList.toggle("w31-digital") ? "Analog" : "Digital";
    });
  }

  // Minesweeper engine (no DOM): 9x9 with 10 mines, laid on the first click away from it and its neighbours (a safe start).
  // reveal(i) opens a cell (a 0 opens its neighbours too; on an open number whose flags are all placed it opens the rest),
  // flag(i) toggles a flag. state: ready -> playing -> won | lost.
  function mines(W = 9, H = 9, N = 10, rnd = Math.random) {
    const n = W * H, mine = Array(n).fill(false), open = Array(n).fill(false), flag = Array(n).fill(false);
    let state = "ready", boom = -1;
    const around = i => {
      const x = i % W, y = i / W | 0, r = [];
      for (let b = y - 1; b <= y + 1; b++) for (let a = x - 1; a <= x + 1; a++) if ((a !== x || b !== y) && a >= 0 && a < W && b >= 0 && b < H) r.push(b * W + a);
      return r;
    };
    const count = i => around(i).filter(j => mine[j]).length;
    const flood = i => {
      for (const todo = [i]; todo.length;) { const j = todo.pop(); if (open[j] || flag[j]) continue; open[j] = true; if (!mine[j] && !count(j)) todo.push(...around(j)); }
    };
    const reveal = i => {
      if (state === "won" || state === "lost" || flag[i]) return;
      if (state === "ready") {
        const keep = new Set([i, ...around(i)]), free = [...Array(n).keys()].filter(j => !keep.has(j));
        for (let k = 0; k < N; k++) mine[free.splice(rnd() * free.length | 0, 1)[0]] = true;
        state = "playing";
      }
      const todo = !open[i] ? [i] : count(i) === around(i).filter(j => flag[j]).length ? around(i) : [];
      todo.forEach(flood);
      boom = todo.find(j => mine[j] && open[j]) ?? -1;
      if (boom >= 0) state = "lost"; else if (open.filter(Boolean).length === n - N) state = "won";
    };
    const toggle = i => { if ((state === "ready" || state === "playing") && !open[i]) flag[i] = !flag[i]; };
    return {
      W, H, reveal, flag: toggle, cell: i => ({ open: open[i], flag: flag[i], mine: mine[i], n: count(i), boom: i === boom }),
      get state() { return state; }, get left() { return N - flag.filter(Boolean).length; },
    };
  }

  function minesWindow(w, io) {                            // wires a Minesweeper window to mines(); the timer stops when it closes
    let g, t = 0, timer = 0, flagMode = false, held = false, press = 0;
    const $ = s => w.querySelector(s);
    const led = v => String(Math.max(-99, Math.min(999, v))).padStart(3, "0");
    const draw = () => {
      const end = g.state === "won" || g.state === "lost";
      w.querySelectorAll("[data-mc]").forEach(b => {
        const c = g.cell(+b.dataset.mc);
        b.className = c.open ? `w31-mo w31-n${c.n}${c.boom ? " w31-mboom" : ""}` : "";
        b.textContent = c.open ? (c.mine ? "💣" : c.n || "") : end && c.mine && !c.flag ? (g.state === "won" ? "🚩" : "💣") : c.flag ? (end && !c.mine ? "❌" : "🚩") : "";
        b.disabled = end;
      });
      $('[data-ms="left"]').textContent = led(g.state === "won" ? 0 : g.left);
      $('[data-ms="time"]').textContent = led(t);
      $(".w31-msface").textContent = { won: "😎", lost: "😵" }[g.state] || "🙂";
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const fresh = () => { stop(); g = mines(); t = 0; draw(); };
    const act = (i, flagIt) => {
      if (flagIt) { g.flag(i); io.sfx.key(); return draw(); }
      const before = g.state; g.reveal(i);
      if (before === "ready" && g.state !== "ready") { t = 1; timer = setInterval(() => { if (t < 999) t++; draw(); }, 1000); }
      if (g.state === "lost") { stop(); io.sfx.err(); } else if (g.state === "won") { stop(); io.sfx.ok(); } else io.sfx.key();
      draw();
    };
    w.addEventListener("click", e => {
      if (e.target.closest(".w31-msface")) return fresh();
      const f = e.target.closest("[data-msflag]");
      if (f) { flagMode = !flagMode; f.setAttribute("aria-pressed", flagMode); return; }
      const b = e.target.closest("[data-mc]"); if (!b) return;
      if (held) { held = false; return; }                  // a long press already flagged it
      act(+b.dataset.mc, flagMode);
    });
    w.addEventListener("contextmenu", e => {               // right click (or a phone's long press) = flag
      const b = e.target.closest("[data-mc]"); if (!b) return;
      e.preventDefault(); if (!held) act(+b.dataset.mc, true);
    });
    w.addEventListener("pointerdown", e => {               // the face holds its breath; touch: long press = flag
      const b = e.target.closest("[data-mc]"); if (!b || b.disabled) return;
      $(".w31-msface").textContent = "😮"; held = false;
      if (e.pointerType !== "mouse") press = setTimeout(() => { held = true; act(+b.dataset.mc, true); }, 450);
    });
    const release = () => { clearTimeout(press); draw(); };
    w.addEventListener("pointerup", release); w.addEventListener("pointercancel", release);
    w.addEventListener("w31close", stop);
    fresh();
  }

  // 10-15 (GM.party): fireworks over the desktop, chunky VGA pixels, ~9 s of bursts with a pop each
  function fireworks(root, sfx) {
    const c = document.createElement("canvas"); c.className = "w31-fw"; root.append(c);
    const g = c.getContext("2d"), W = c.width = root.clientWidth, H = c.height = root.clientHeight;
    const COLORS = ["#ff5555", "#55ff55", "#5555ff", "#ffff55", "#ff55ff", "#55ffff", "#ffffff"], parts = [];
    let t0 = 0, last = 0;
    const burst = () => {
      const x = W * (.15 + .7 * Math.random()), y = H * (.12 + .4 * Math.random()), col = COLORS[Math.random() * COLORS.length | 0];
      for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, v = .8 + Math.random() * 2.6; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 50 + Math.random() * 40, col }); }
      sfx.tone(90 + Math.random() * 60, .15, "sawtooth", .03);
    };
    const step = now => {
      t0 ||= now;
      if (now - t0 < 9000 && now - last > 420) { burst(); last = now; }
      g.clearRect(0, 0, W, H);
      for (let i = parts.length; i--;) {
        const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += .035; p.vx *= .985;
        if (--p.life < 0) { parts.splice(i, 1); continue; }
        g.fillStyle = p.col; g.fillRect(p.x | 0, p.y | 0, 3, 3);
      }
      if (c.isConnected && (now - t0 < 9000 || parts.length)) requestAnimationFrame(step); else c.remove();
    };
    requestAnimationFrame(step);
  }

  GM.win31 = {
    calc, mines,                                           // engines, exposed for the tests
    async run(container, io) {
      const root = document.createElement("div"); root.className = "w31";
      root.innerHTML = `<div class="w31-splash"><div>${FLAG}<div class="w31-logo">Microsoft<br><b>Windows</b><sup>™</sup> <span>3.1</span></div><p>Copyright © 1985-1992 Microsoft Corp.<br>gabimarti edition</p></div></div>`;
      container.append(root);
      const busy = async ms => {                            // a slow 90s PC: hourglass while "loading"
        root.classList.add("w31-wait"); root.insertAdjacentHTML("beforeend", HOURGLASS);
        await io.sleep(ms);
        root.classList.remove("w31-wait"); root.querySelector(".w31-hg")?.remove();
      };
      io.sfx.post(); await busy(4500);                      // full length even with reduced motion, like the boot
      root.innerHTML = ""; await busy(1200);                // empty desktop before Program Manager shows up
      const tray = document.createElement("div"); tray.className = "w31-tray"; root.append(tray);   // minimized windows
      let done; const finished = new Promise(r => { done = r; });

      const win = (title, body, cls = "") => {              // a Windows 3.1 window
        const w = document.createElement("section"); w.className = "w31-win " + cls; w.setAttribute("aria-label", title);
        w.innerHTML = `<div class="w31-title"><button type="button" class="w31-ctl" aria-label="Close" title="Close">▬</button><span>${esc(title)}</span><button type="button" class="w31-min" aria-label="Minimize" title="Minimize">▼</button><button type="button" class="w31-max" aria-label="Maximize" title="Maximize">▲</button></div><div class="w31-body">${body}</div>`;
        const n = root.querySelectorAll(".w31-win").length;
        w.style.left = `${2 + n * 3}%`; w.style.top = `${4 + n * 4}%`; w.style.zIndex = ++z;   // CSSOM: allowed by the CSP
        root.append(w); return w;
      };
      const pm = win("Program Manager", GROUPS.map(g => `<div class="w31-group"><div class="w31-gtitle">${esc(g)}</div><div class="w31-icons">${APPS.map(([ic, label, , , grp = GROUPS[0]], i) =>
        grp !== g ? "" : `<button type="button" class="w31-icon" data-w31="${i}"><span class="w31-ic" aria-hidden="true">${ic}</span>${esc(label)}</button>`).join("")}</div></div>`).join(""), "w31-pm");
      pm.querySelector(".w31-ctl").remove();                // closing Program Manager = Exit Windows: use the icon
      if (GM.party()) {
        fireworks(root, io.sfx);
        const d = GM.now();
        win("Party time!", `<p>Today is ${d.getMonth() + 1}/${d.getDate()} and this PC is celebrating.</p><p>Fireworks are on the house.</p><p class="w31-btns"><button type="button" class="w31-btn" data-party>OK</button></p>`, "w31-dlg")
          .addEventListener("click", e => { if (e.target.closest("[data-party]")) close(e.currentTarget); });
      }

      const open = async i => {
        const [, , title, content] = APPS[i];
        if (content === "exit") return confirmExit();
        const existing = find(title);
        if (existing) return restore(existing);
        await busy(700);
        if (content === "control") {
          const w = win(title, `<p>Desktop</p><p><button type="button" class="w31-btn" data-cp="theme">Toggle light / dark</button></p><p>International</p><p>${["en", "es", "ca"].map(l => `<button type="button" class="w31-btn" data-cp="${l}">${l.toUpperCase()}</button>`).join(" ")}</p>`);
          w.addEventListener("click", e => { const b = e.target.closest("[data-cp]"); if (!b) return; if (b.dataset.cp === "theme") GM.toggleTheme(); else GM.setLang(b.dataset.cp, true); io.sfx.key(); });
          return;
        }
        if (content === "calc") {
          const w = win(title, `<div class="w31-calc"><div class="w31-cline"><span class="w31-cmem"></span><output class="w31-cdisp">0</output></div>`
            + `<div class="w31-cbase">${[[16, "Hex"], [10, "Dec"], [8, "Oct"], [2, "Bin"]].map(([b, l]) => `<button type="button" class="w31-btn" data-cb="${b}">${l}</button>`).join("")}</div>`
            + `<div class="w31-ckeys">${KEYS.map(([k, l]) => `<button type="button" class="w31-btn" data-ck="${k}">${l}</button>`).join("")}</div></div>`, "w31-calcwin");
          w.tabIndex = -1; io.sfx.blip(); return calcWindow(w, io);
        }
        if (content === "mplayer") {
          try { await GM.need("tunes.js"); } catch (e) { return; }
          const w = win(title, `<div class="w31-mnow"></div><div class="w31-mbar"><progress max="1" value="0"></progress><span class="w31-mtime"></span></div>`
            + `<p class="w31-btns">${[["prev", "⏮"], ["play", "▶"], ["stop", "■"], ["next", "⏭"]].map(([k, l]) => `<button type="button" class="w31-btn" data-mp="${k}" aria-label="${k}" title="${k}">${l}</button>`).join(" ")}`
            + ` <label><input type="checkbox" class="w31-mrep"> Repeat</label></p>`
            + `<ol class="w31-mlist">${GM.tunes.list.map((t, i) => `<li><button type="button" data-mt="${i}">${esc(t.title)} <span>— ${esc(t.game)}</span></button></li>`).join("")}</ol>`, "w31-mpwin");
          io.sfx.blip(); return playerWindow(w, io);
        }
        if (content === "clock") {
          const w = win(title, `${CLOCK}<div class="w31-kdigital"><div class="w31-kdig"></div><div class="w31-kdate"></div></div><p class="w31-btns"><button type="button" class="w31-btn" data-kmode>Digital</button></p>`, "w31-clockwin");
          io.sfx.blip(); return clockWindow(w);
        }
        if (content === "mines") {
          const w = win(title, `<div class="w31-mshead"><output class="w31-msled" data-ms="left"></output><button type="button" class="w31-msface" aria-label="New game" title="New game"></button><output class="w31-msled" data-ms="time"></output></div>`
            + `<div class="w31-msgrid">${Array.from({ length: 81 }, (_, i) => `<button type="button" data-mc="${i}"></button>`).join("")}</div>`
            + `<p class="w31-btns"><button type="button" class="w31-btn" data-msflag aria-pressed="false">🚩 Flag</button></p>`, "w31-mswin");
          io.sfx.blip(); return minesWindow(w, io);
        }
        io.sfx.blip(); win(title, content(io));
      };
      const find = title => [...root.querySelectorAll(".w31-win")].find(w => w.getAttribute("aria-label") === title);
      const minimize = w => {                               // the window becomes an icon at the bottom of the desktop
        const t = w.getAttribute("aria-label");
        w.classList.add("w31-iconic");
        tray.insertAdjacentHTML("beforeend", `<button type="button" class="w31-task" data-task="${esc(t)}"><span class="w31-ic" aria-hidden="true">${APPS.find(a => a[2] === t)?.[0] || "🗔"}</span>${esc(t)}</button>`);
      };
      const restore = w => {
        const t = w.getAttribute("aria-label");
        w.classList.remove("w31-iconic"); [...tray.children].find(b => b.dataset.task === t)?.remove(); w.style.zIndex = ++z;
      };
      const close = w => { w.dispatchEvent(new Event("w31close")); w.remove(); };   // w31close: windows with timers/sound clean up
      const closeAll = () => root.querySelectorAll(".w31-win").forEach(close);
      const confirmExit = () => {
        const w = win("Exit Windows", `<p>This will end your Windows session.</p><p class="w31-btns"><button type="button" class="w31-btn" data-exit="ok">OK</button> <button type="button" class="w31-btn" data-exit="cancel">Cancel</button></p>`, "w31-dlg");
        w.addEventListener("click", e => { const b = e.target.closest("[data-exit]"); if (!b) return; if (b.dataset.exit === "ok") { closeAll(); io.sfx.ok(); done(); } else w.remove(); });
      };

      root.addEventListener("click", e => {
        if (root.classList.contains("w31-wait")) return;   // busy: clicks are ignored, as in 1992
        const icon = e.target.closest(".w31-icon"); if (icon) return open(+icon.dataset.w31);
        const task = e.target.closest(".w31-task"); if (task) { io.sfx.key(); return restore(find(task.dataset.task)); }
        const w = e.target.closest(".w31-win"); if (!w) return;
        w.style.zIndex = ++z;
        if (e.target.closest(".w31-ctl")) close(w);
        else if (e.target.closest(".w31-min")) minimize(w);
        else if (e.target.closest(".w31-max")) w.classList.toggle("w31-maxed");
      });
      // drag by the title bar (pointer events; skipped on narrow screens, where windows stack)
      root.addEventListener("pointerdown", e => {
        const bar = e.target.closest(".w31-title"); if (!bar || e.target.closest("button") || matchMedia("(max-width: 640px)").matches) return;
        const w = bar.parentElement, r = root.getBoundingClientRect(), sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop;
        w.style.zIndex = ++z; bar.setPointerCapture(e.pointerId);
        const move = ev => { w.style.left = Math.max(0, Math.min(r.width - 60, ev.clientX - sx)) + "px"; w.style.top = Math.max(0, Math.min(r.height - 24, ev.clientY - sy)) + "px"; };
        const up = () => { bar.removeEventListener("pointermove", move); bar.removeEventListener("pointerup", up); };
        bar.addEventListener("pointermove", move); bar.addEventListener("pointerup", up);
      });
      await finished;
      root.remove();
    },
  };
})();
