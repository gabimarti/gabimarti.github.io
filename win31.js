// Windows 3.1 for gabimarti.github.io: type WIN at the MS-DOS prompt (dos.js). Loaded on demand.
// Program Manager with a "Gabriel Martí" group; each icon opens the CV content (the quick view's #c-* sections) in a window.
// Windows move by their title bar (desktop), come to the front on click, maximize and close; on phones they stack full width.
// GM.win31.run(container, { html, sfx, sleep }) -> Promise resolved by "Exit Windows".
"use strict";
(() => {
  const { esc } = GM;
  const APPS = [   // [icon, label, window title, content (html) or special]
    ["📝", "Write", "Write - CV.WRI", io => `<p><strong>Gabriel Martí</strong> (@gabimarti)</p>${io.html("#c-role")}${io.html("#c-summary")}`],
    ["🗂", "Cardfile", "Cardfile - SKILLS.CRD", io => io.html("#c-skills")],
    ["📁", "File Manager", "File Manager - C:\\REPOS", io => io.html("#c-repos")],
    ["🗒", "Notepad", "Notepad - ARTICLES.TXT", io => io.html("#c-articles")],
    ["📄", "About", "Notepad - ABOUT.TXT", io => io.html("#c-about") + io.html("#c-interests")],
    ["🎨", "Paintbrush", "Paintbrush - AVATAR.BMP", io => io.html("#avatar .avatar")],
    ["📇", "Contacts", "Cardfile - CONTACT.CRD", io => io.html("#c-contact")],
    ["🧮", "Calculator", "Calculator", "calc"],
    ["⚙", "Control Panel", "Control Panel", "control"],
    ["🚪", "Exit Windows", null, "exit"],
  ];
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

  GM.win31 = {
    calc,                                                  // engine, exposed for the tests
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
      let done; const finished = new Promise(r => { done = r; });

      const win = (title, body, cls = "") => {              // a Windows 3.1 window
        const w = document.createElement("section"); w.className = "w31-win " + cls; w.setAttribute("aria-label", title);
        w.innerHTML = `<div class="w31-title"><button type="button" class="w31-ctl" aria-label="Close" title="Close">▬</button><span>${esc(title)}</span><button type="button" class="w31-max" aria-label="Maximize" title="Maximize">▲</button></div><div class="w31-body">${body}</div>`;
        const n = root.querySelectorAll(".w31-win").length;
        w.style.left = `${2 + n * 3}%`; w.style.top = `${4 + n * 4}%`; w.style.zIndex = ++z;   // CSSOM: allowed by the CSP
        root.append(w); return w;
      };
      const pm = win("Program Manager", `<div class="w31-group"><div class="w31-gtitle">Gabriel Martí</div><div class="w31-icons">${APPS.map(([ic, label], i) =>
        `<button type="button" class="w31-icon" data-w31="${i}"><span class="w31-ic" aria-hidden="true">${ic}</span>${esc(label)}</button>`).join("")}</div></div>`, "w31-pm");
      pm.querySelector(".w31-ctl").remove();                // closing Program Manager = Exit Windows: use the icon

      const open = async i => {
        const [, , title, content] = APPS[i];
        if (content === "exit") return confirmExit();
        const existing = [...root.querySelectorAll(".w31-win")].find(w => w.getAttribute("aria-label") === title);
        if (existing) { existing.style.zIndex = ++z; return; }
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
        io.sfx.blip(); win(title, content(io));
      };
      const confirmExit = () => {
        const w = win("Exit Windows", `<p>This will end your Windows session.</p><p class="w31-btns"><button type="button" class="w31-btn" data-exit="ok">OK</button> <button type="button" class="w31-btn" data-exit="cancel">Cancel</button></p>`, "w31-dlg");
        w.addEventListener("click", e => { const b = e.target.closest("[data-exit]"); if (!b) return; if (b.dataset.exit === "ok") { io.sfx.ok(); done(); } else w.remove(); });
      };

      root.addEventListener("click", e => {
        if (root.classList.contains("w31-wait")) return;   // busy: clicks are ignored, as in 1992
        const icon = e.target.closest(".w31-icon"); if (icon) return open(+icon.dataset.w31);
        const w = e.target.closest(".w31-win"); if (!w) return;
        w.style.zIndex = ++z;
        if (e.target.closest(".w31-ctl")) w.remove();
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
