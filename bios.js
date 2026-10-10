// Award-style CMOS Setup Utility for gabimarti.github.io. Loaded on demand by site.js when DEL is pressed during POST.
// Settings live in memory only (a page reload is a dead CMOS battery). "Quick Power On Self Test" really speeds up the POST.
"use strict";
(() => {
  const { esc, sfx } = GM;
  const opt = (k, ...v) => ({ k, v, i: 0 });          // editable item: first option is the default
  const ro = (k, v) => ({ k, ro: v });                  // read-only item (v may be a function)
  const DAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" "), MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  const p2 = n => String(n).padStart(2, "0");
  const PAGES = {
    "STANDARD CMOS SETUP": [
      ro("Date (mm:dd:yy)", () => { const d = new Date(); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${p2(d.getDate())} ${d.getFullYear()}`; }),
      ro("Time (hh:mm:ss)", () => { const d = new Date(); return `${p2(d.getHours())} : ${p2(d.getMinutes())} : ${p2(d.getSeconds())}`; }),
      ro("Primary Master", "GM-HDD 1986MB"),
      ro("Secondary Master", "CD-ROM 52X"),
      ro("Secondary Slave", "ZIP 100"),
      opt("Drive A", "1.44M, 3.5 in.", "1.2M, 5.25 in.", "720K, 3.5 in.", "None"),
      opt("Drive B", "None", "1.2M, 5.25 in.", "1.44M, 3.5 in."),
      opt("Video", "EGA/VGA", "CGA 80", "CGA 40", "MONO"),
      opt("Halt On", "All Errors", "No Errors", "All, But Keyboard", "All, But Diskette"),
      ro("Base Memory", "640K"), ro("Extended Memory", "64512K"), ro("Total Memory", "65536K"),
    ],
    "BIOS FEATURES SETUP": [
      opt("Virus Warning", "Disabled", "Enabled"),
      opt("CPU Internal Cache", "Enabled", "Disabled"),
      opt("External Cache", "Enabled", "Disabled"),
      opt("Quick Power On Self Test", "Disabled", "Enabled"),
      opt("Boot Sequence", "A,C,SCSI", "C,A,SCSI", "CDROM,C,A", "C only"),
      opt("Swap Floppy Drive", "Disabled", "Enabled"),
      opt("Boot Up NumLock Status", "On", "Off"),
      opt("Typematic Rate Setting", "Disabled", "Enabled"),
      opt("Security Option", "Setup", "System"),
      opt("Video BIOS Shadow", "Enabled", "Disabled"),
    ],
    "CHIPSET FEATURES SETUP": [
      opt("Auto Configuration", "Enabled", "Disabled"),
      opt("DRAM Read Burst Timing", "x3333", "x2222", "x4444"),
      opt("ISA Bus Clock", "PCICLK/4", "PCICLK/3"),
      opt("Memory Hole At 15M-16M", "Disabled", "Enabled"),
      opt("Curiosity Overdrive", "Enabled", "Turbo", "Disabled"),
    ],
    "POWER MANAGEMENT SETUP": [
      opt("Power Management", "Disabled", "Min Saving", "Max Saving", "User Define"),
      opt("Video Off Method", "V/H SYNC+Blank", "Blank Screen", "DPMS"),
      opt("HDD Power Down", "Disabled", "1 Min", "5 Min", "15 Min"),
      opt("Doze Mode", "Disabled", "1 Min", "1 Hour"),
      opt("Coffee Break Timer", "15 Min", "30 Min", "Disabled"),
    ],
    "PNP/PCI CONFIGURATION": [
      opt("PNP OS Installed", "No", "Yes"),
      opt("Resources Controlled By", "Manual", "Auto"),
      opt("IRQ-3 assigned to", "Legacy ISA", "PCI/ISA PnP"),
      opt("IRQ-4 assigned to", "Legacy ISA", "PCI/ISA PnP"),
      opt("PCI IDE IRQ Map To", "PCI-AUTO", "ISA"),
    ],
    "INTEGRATED PERIPHERALS": [
      opt("IDE HDD Block Mode", "Enabled", "Disabled"),
      opt("Onboard FDC Controller", "Enabled", "Disabled"),
      opt("Onboard UART 1", "3F8/IRQ4", "2F8/IRQ3", "Disabled"),
      opt("Onboard UART 2", "2F8/IRQ3", "3F8/IRQ4", "Disabled"),
      opt("Onboard Parallel Port", "378/IRQ7", "278/IRQ5", "Disabled"),
      opt("Parallel Port Mode", "SPP", "EPP", "ECP"),
    ],
  };
  const MENU = [
    ["STANDARD CMOS SETUP", "Time, Date, Hard Disk Type..."],
    ["BIOS FEATURES SETUP", "Virus Protection, Boot Sequence, Quick POST..."],
    ["CHIPSET FEATURES SETUP", "Chipset Special Features"],
    ["POWER MANAGEMENT SETUP", "Power Saving Modes"],
    ["PNP/PCI CONFIGURATION", "Plug and Play / PCI Resources"],
    ["LOAD BIOS DEFAULTS", "Load BIOS Defaults (the safe ones)"],
    ["LOAD SETUP DEFAULTS", "Load Setup Defaults (the fast ones)"],
    ["INTEGRATED PERIPHERALS", "Onboard I/O Ports"],
    ["SUPERVISOR PASSWORD", "Change/Set/Disable Password"],
    ["USER PASSWORD", "Change/Set/Disable Password"],
    ["IDE HDD AUTO DETECTION", "Detect the IDE Hard Disks"],
    ["SAVE & EXIT SETUP", "Save Data to CMOS & Exit SETUP"],
    ["EXIT WITHOUT SAVING", "Abandon all Data & Exit SETUP"],
  ];
  const items = () => Object.values(PAGES).flat().filter(x => x.v);
  let saved = items().map(x => x.i);                  // what's "in CMOS"
  const restore = () => items().forEach((x, j) => { x.i = saved[j]; });

  let el, done, page = null, sel = 0, mainSel = 0, dlg = null, clock = 0;
  const box = (cls, html) => `<div class="${cls}">${html}</div>`;
  function render() {
    let body;
    if (!page) {
      body = box("b-menu", MENU.map(([k], j) => `<button type="button" data-i="${j}"${j === sel ? ' class="hi"' : ""}>${esc(k)}</button>`).join(""));
      body += box("b-keys", `<button type="button" data-key="Escape">Esc</button> : Quit &nbsp; ↑ ↓ → ← : Select Item<br><button type="button" data-key="F10">F10</button> : Save &amp; Exit Setup`);
      body += box("b-help", esc(MENU[sel][1]));
    } else {
      body = box("b-page", PAGES[page].map((x, j) => {
        const v = x.ro ? (typeof x.ro === "function" ? x.ro() : x.ro) : x.v[x.i];
        return `<button type="button" data-i="${j}"${j === sel ? ' class="hi"' : ""}${x.ro ? " disabled" : ""}><span>${esc(x.k)}</span><b>${esc(v)}</b></button>`;
      }).join(""));
      body += box("b-keys", `<button type="button" data-key="Escape">ESC</button> : Quit &nbsp; ↑ ↓ : Select Item &nbsp; <button type="button" data-key="+">PU/+</button> <button type="button" data-key="-">PD/-</button> : Modify<br><button type="button" data-key="F10">F10</button> : Save &amp; Exit Setup &nbsp; (tap an item to change it)`);
    }
    el.innerHTML = box("b-ttl", `ROM PCI/ISA BIOS (2A4IGM66)<br>${page ? esc(page) : "CMOS SETUP UTILITY"}<br>GM SOFTWARE, INC.`) + body +
      (dlg ? box("b-dlg", dlg.html + (dlg.yn ? `<br><br><button type="button" data-key="y">Y</button> <button type="button" data-key="n">N</button>` : "")) : "");
  }
  // dialogs: yes/no (Enter takes the default shown), password prompt, or a message closed by any key / tap
  const ask = (html, onYes, def = "N") => { dlg = { html: `${html} (Y/N)? ${def}`, yn: true, onYes }; render(); };
  const say = html => { dlg = { html: html + "<br><br>Press any key to continue..." }; render(); };
  function exit(how) {
    if (how === "save") saved = items().map(x => x.i); else restore();
    clearInterval(clock); document.removeEventListener("keydown", onKey, true); el.removeEventListener("click", onClick);
    sfx.ok(); done();
  }
  function enter(j) {
    const k = MENU[j][0];
    if (PAGES[k]) {
      mainSel = j; page = k; sel = Math.max(0, PAGES[k].findIndex(x => x.v));
      if (k === "STANDARD CMOS SETUP") clock = setInterval(() => !dlg && render(), 1000);
      sfx.blip(); return render();
    }
    if (k.startsWith("LOAD ")) return ask(`Load ${k.includes("BIOS") ? "BIOS" : "SETUP"} Defaults`, () => { items().forEach(x => { x.i = 0; }); dlg = null; render(); });
    if (k.endsWith("PASSWORD")) { dlg = { html: "Enter Password: ", pw: "" }; return render(); }
    if (k === "IDE HDD AUTO DETECTION")
      return say("Primary Master   : GM-HDD 1986MB<br>CYLS 4092  HEAD 16  PRECOMP 65535  LANDZ 4091  SECTOR 63  MODE LBA<br>Primary Slave    : None<br>Secondary Master : ATAPI CD-ROM 52X<br>Secondary Slave  : ZIP 100");
    if (k === "SAVE & EXIT SETUP") return ask("SAVE to CMOS and EXIT", () => exit("save"), "Y");
    if (k === "EXIT WITHOUT SAVING") return ask("Quit Without Saving", () => exit("quit"));
  }
  function change(d) {
    const x = PAGES[page][sel]; if (!x || !x.v) return;
    x.i = (x.i + d + x.v.length) % x.v.length; sfx.key(); render();
  }
  function move(d) {                                    // pages skip read-only rows; the main menu jumps columns with ← →
    const list = page ? PAGES[page] : MENU; let j = sel;
    do { j += d; if (j < 0 || j >= list.length) return; } while (page && !list[j].v);
    sel = j; sfx.tick(); render();
  }
  function key(k) {
    if (dlg) {
      if (dlg.pw !== undefined) {                       // password prompt: only shows stars, nothing is stored
        if (k === "Enter") return say(dlg.pw ? "PASSWORD ACCEPTED. (Not really — nothing leaves this page.)" : "PASSWORD DISABLED !!!");
        if (k === "Escape") { dlg = null; return render(); }
        if (k.length === 1 && dlg.pw.length < 8) { dlg.pw += "*"; dlg.html = "Enter Password: " + dlg.pw; render(); }
        return;
      }
      if (!dlg.yn) { dlg = null; return render(); }
      if (/^y$/i.test(k) || (k === "Enter" && dlg.html.endsWith("Y"))) return dlg.onYes();
      if (/^n$/i.test(k) || k === "Escape" || k === "Enter") { dlg = null; render(); }
      return;
    }
    if (k === "F10") return ask("SAVE to CMOS and EXIT", () => exit("save"), "Y");
    if (k === "Escape") {
      if (!page) return ask("Quit Without Saving", () => exit("quit"));
      clearInterval(clock); page = null; sel = mainSel; sfx.blip(); return render();
    }
    if (k === "ArrowDown" || k === "ArrowUp") return move(k === "ArrowDown" ? 1 : -1);
    if (!page && (k === "ArrowRight" || k === "ArrowLeft")) return move(k === "ArrowRight" ? 7 : -7);
    if (!page && k === "Enter") return enter(sel);
    if (page && (k === "PageUp" || k === "+")) return change(1);
    if (page && (k === "PageDown" || k === "-")) return change(-1);
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    e.preventDefault(); e.stopPropagation(); key(e.key);
  }
  function onClick(e) {
    const b = e.target.closest("button");
    if (b?.dataset.key) return key(b.dataset.key);
    if (dlg) return key(dlg.pw !== undefined ? "Enter" : "Escape");   // tap: confirm password / close message / answer N
    if (!b) return;
    const j = +b.dataset.i;
    if (j !== sel) { sel = j; sfx.tick(); return render(); }
    page ? change(1) : enter(j);                         // tapping the highlighted item opens / changes it
  }

  GM.bios = {
    get quickPost() { return items().find(x => x.k === "Quick Power On Self Test").i === 1; },
    open(container) {
      el = document.createElement("div"); el.className = "bios"; container.append(el);
      page = null; sel = mainSel = 0; dlg = null; render();
      document.addEventListener("keydown", onKey, true); el.addEventListener("click", onClick);
      return new Promise(res => { done = res; });
    },
  };
})();
