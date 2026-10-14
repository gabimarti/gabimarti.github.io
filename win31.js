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
    ["⚙", "Control Panel", "Control Panel", "control"],
    ["🚪", "Exit Windows", null, "exit"],
  ];
  let z = 10;

  GM.win31 = {
    async run(container, io) {
      const root = document.createElement("div"); root.className = "w31";
      root.innerHTML = `<div class="w31-splash"><div class="w31-logo">Microsoft<br><b>Windows</b><sup>™</sup> <span>3.1</span></div><p>Copyright © 1985-1992 Microsoft Corp.<br>gabimarti edition</p></div>`;
      container.append(root);
      io.sfx.post(); await io.sleep(GM.reduce ? 100 : 1800);
      root.innerHTML = "";
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

      const open = i => {
        const [, , title, content] = APPS[i];
        if (content === "exit") return confirmExit();
        const existing = [...root.querySelectorAll(".w31-win")].find(w => w.getAttribute("aria-label") === title);
        if (existing) { existing.style.zIndex = ++z; return; }
        if (content === "control") {
          const w = win(title, `<p>Desktop</p><p><button type="button" class="w31-btn" data-cp="theme">Toggle light / dark</button></p><p>International</p><p>${["en", "es", "ca"].map(l => `<button type="button" class="w31-btn" data-cp="${l}">${l.toUpperCase()}</button>`).join(" ")}</p>`);
          w.addEventListener("click", e => { const b = e.target.closest("[data-cp]"); if (!b) return; if (b.dataset.cp === "theme") GM.toggleTheme(); else GM.setLang(b.dataset.cp, true); io.sfx.key(); });
          return;
        }
        io.sfx.blip(); win(title, content(io));
      };
      const confirmExit = () => {
        const w = win("Exit Windows", `<p>This will end your Windows session.</p><p class="w31-btns"><button type="button" class="w31-btn" data-exit="ok">OK</button> <button type="button" class="w31-btn" data-exit="cancel">Cancel</button></p>`, "w31-dlg");
        w.addEventListener("click", e => { const b = e.target.closest("[data-exit]"); if (!b) return; if (b.dataset.exit === "ok") { io.sfx.ok(); done(); } else w.remove(); });
      };

      root.addEventListener("click", e => {
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
