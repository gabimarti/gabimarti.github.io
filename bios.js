// Award-style CMOS Setup Utility for gabimarti.github.io. Loaded on demand by site.js when DEL is pressed during POST.
// Settings live in memory only (a page reload is a dead CMOS battery). "Quick Power On Self Test" really speeds up the POST.
// Easter eggs (F1 hints at them): Ctrl+F1 (or 5 taps on the title) shows a hidden menu, real 90s Award backdoor passwords
// unlock Curiosity Overdrive = Ludicrous (saving it releases the magic smoke) and the PC Speaker Test plays one of 17 tunes from 90s games.
"use strict";
(() => {
  const { esc, sfx } = GM;
  const opt = (k, ...v) => ({ k, v, i: 0 });          // editable item: first option is the default
  const ro = (k, v) => ({ k, ro: v });                  // read-only item (v may be a function)
  const DAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" "), MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  const p2 = n => String(n).padStart(2, "0");
  const BACKDOORS = ["AWARD_SW", "AWARD?SW", "AWARD_PW", "LKWPETER", "J262", "BIOSTAR", "ALFAROME", "SYXZ", "589589"];   // real ones
  const PAGES = {
    "STANDARD CMOS SETUP": [
      { k: "Date (mm:dd:yy)", v: [""], i: 0, f: d => { const t = GM.now(); t.setDate(t.getDate() + d); GM.setNow(t); },   // PgUp/PgDn: one day
        show: () => { const d = GM.now(); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${p2(d.getDate())} ${d.getFullYear()}`; } },
      ro("Time (hh:mm:ss)", () => { const d = GM.now(); return `${p2(d.getHours())} : ${p2(d.getMinutes())} : ${p2(d.getSeconds())}`; }),
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
      opt("Curiosity Overdrive", "Enabled", "Turbo", "Disabled"),       // + "Ludicrous" after a backdoor password
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
    "GM SECRET FEATURES": [
      opt("Turbo Button", "66MHz", "33MHz (for old games)"),
      opt("Coffee Maker on COM1", "Brewing", "Decaf", "Disabled"),
      opt("Cat-on-Keyboard Detection", "Enabled", "Disabled"),
      ro("Y2K Compliance", "Pending..."),
      opt("Magic Smoke Retention", "Enabled", "Best Effort"),
      { k: "PC Speaker Test", v: ["[Press Enter]"], i: 0, f: () => speaker() },   // f: an action instead of options
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
    ["GM SECRET FEATURES", "You weren't supposed to find this"],       // hidden until Ctrl+F1
  ];
  const HELP = "GM BIOS HELP — nothing to see here. Probably.<br><br>" +
    "· Award menus had more rows than they showed. Old techs held Ctrl while asking for help.<br>" +
    "· Forgot the password? Award engineers never did — they left one for themselves.<br>" +
    "· Some settings are not meant for mortals. Save them anyway.<br><br>(No keyboard? Knock five times on the title.)";
  const items = () => Object.values(PAGES).flat().filter(x => x.v);
  let saved = items().map(x => x.i);                  // what's "in CMOS"
  const restore = () => items().forEach((x, j) => { x.i = saved[j]; });
  const overdrive = items().find(x => x.k === "Curiosity Overdrive");

  let el, done, page = null, sel = 0, mainSel = 0, dlg = null, clock = 0, secret = false, knocks = 0;
  const found = new Set();                              // easter eggs found: menu, backdoor, smoke, speaker
  const menu = () => secret ? MENU : MENU.slice(0, -1);
  const box = (cls, html) => `<div class="${cls}">${html}</div>`;
  function render() {
    let body;
    if (!page) {
      body = box("b-menu", menu().map(([k], j) => `<button type="button" data-i="${j}"${j === sel ? ' class="hi"' : ""}>${esc(k)}</button>`).join(""));
      body += box("b-keys", `<button type="button" data-key="Escape">Esc</button> : Quit &nbsp; ↑ ↓ → ← : Select Item<br><button type="button" data-key="F10">F10</button> : Save &amp; Exit Setup &nbsp; <button type="button" data-key="F1">F1</button> : Help`);
      body += box("b-help", esc(MENU[sel][1]));
      const left = 4 - found.size;                      // nudge visitors to go hunting
      body += box("b-hint", left ? `<b>!!</b> WARNING: ${left} UNDOCUMENTED FEATURE${left > 1 ? "S" : ""} DETECTED (found ${found.size}/4) <b>!!</b><br>Real 90s hackers knew where to look. Press F1 for a clue.`
        : "ALL 4 SECRETS FOUND — you would have made a fine 90s technician.");
    } else {
      body = box("b-page", PAGES[page].map((x, j) => {
        const v = x.ro ? (typeof x.ro === "function" ? x.ro() : x.ro) : x.show ? x.show() : x.v[x.i];
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
    if (how === "save" && overdrive.v[overdrive.i] === "Ludicrous") return smoke();
    if (how === "save") saved = items().map(x => x.i); else restore();
    clearInterval(clock); document.removeEventListener("keydown", onKey, true); el.removeEventListener("click", onClick);
    sfx.ok(); done();
  }
  function smoke() {                                    // overheat, then a "dead" CMOS: defaults + checksum error in the next POST
    found.add("smoke"); el.classList.add("smoke");
    dlg = { html: "WARNING: CPU TEMPERATURE 451°F !!!<br>MAGIC SMOKE RELEASED<br><br>System Halted.", lock: true }; render();
    for (let i = 0; i < 12; i++) sfx.tone(i % 2 ? 660 : 880, .14, "square", .05, i * .16);
    setTimeout(() => { el.classList.remove("smoke"); dlg = null; items().forEach(x => { x.i = 0; }); GM.bios.cmosBad = true; exit("save"); }, 3500);
  }
  let lastTune = -1;
  async function speaker() {                            // a random tune (tunes.js), never the same one twice in a row
    found.add("speaker");
    try { await GM.need("tunes.js"); } catch (e) { return say("PC SPEAKER TEST: tunes.js failed to load"); }
    const L = GM.tunes.list;
    let i; do i = Math.floor(Math.random() * L.length); while (i === lastTune); lastTune = i;
    const [stop, secs] = GM.tunes.play(L[i].tune), t = setTimeout(() => { if (dlg?.stop === stop) { dlg = null; render(); } }, secs * 1000 + 500);
    dlg = { html: `PC SPEAKER TEST: ${esc(L[i].title)}<br>as heard in ${esc(L[i].game)}<br><br>♪ ♫ ♪` + (sfx.on ? "" : "<br><br>(sound is muted — 🔊 in the title bar)") +
      "<br><br>Press any key to stop...", stop, onClose: () => { clearTimeout(t); stop(); } };
    render();
  }
  function enter(j) {
    const k = MENU[j][0];
    if (PAGES[k]) {
      mainSel = j; page = k; sel = Math.max(0, PAGES[k].findIndex(x => x.v));
      if (k === "STANDARD CMOS SETUP") clock = setInterval(() => !dlg && render(), 1000);
      sfx.blip(); return render();
    }
    if (k.startsWith("LOAD ")) return ask(`Load ${k.includes("BIOS") ? "BIOS" : "SETUP"} Defaults`, () => { items().forEach(x => { x.i = 0; }); dlg = null; render(); });
    if (k.endsWith("PASSWORD")) {                       // a real input, so phones get their on-screen keyboard
      dlg = { html: `Enter Password: <input type="password" class="b-pw" maxlength="8" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Password"><br><br><button type="button" data-key="Enter">Enter</button> <button type="button" data-key="Escape">Esc</button>`, pw: true };
      render(); return el.querySelector(".b-pw").focus();
    }
    if (k === "IDE HDD AUTO DETECTION")
      return say("Primary Master   : GM-HDD 1986MB<br>CYLS 4092  HEAD 16  PRECOMP 65535  LANDZ 4091  SECTOR 63  MODE LBA<br>Primary Slave    : None<br>Secondary Master : ATAPI CD-ROM 52X<br>Secondary Slave  : ZIP 100");
    if (k === "SAVE & EXIT SETUP") return ask("SAVE to CMOS and EXIT", () => exit("save"), "Y");
    if (k === "EXIT WITHOUT SAVING") return ask("Quit Without Saving", () => exit("quit"));
  }
  function change(d) {
    const x = PAGES[page][sel]; if (!x || !x.v) return;
    if (x.f) { x.f(d); if (x.show) { sfx.key(); render(); } return; }
    x.i = (x.i + d + x.v.length) % x.v.length; sfx.key(); render();
  }
  function move(d) {                                    // pages skip read-only rows; the main menu jumps columns with ← →
    const list = page ? PAGES[page] : menu(); let j = sel;
    do { j += d; if (j < 0 || j >= list.length) return; } while (page && !list[j].v);
    sel = j; sfx.tick(); render();
  }
  function key(k) {
    if (dlg) {
      if (dlg.lock) return;
      if (dlg.pw) {                                     // password prompt: the input does the typing; only read to spot a backdoor
        const pw = el.querySelector(".b-pw").value;
        if (k === "Enter") return BACKDOORS.includes(pw.toUpperCase()) ? backdoor() :
          say(pw ? "PASSWORD ACCEPTED. (Not really — nothing leaves this page.)" : "PASSWORD DISABLED !!!");
        if (k === "Escape") { dlg = null; return render(); }
        return;
      }
      if (!dlg.yn) { dlg.onClose?.(); dlg = null; return render(); }
      if (/^y$/i.test(k) || (k === "Enter" && dlg.html.endsWith("Y"))) return dlg.onYes();
      if (/^n$/i.test(k) || k === "Escape" || k === "Enter") { dlg = null; render(); }
      return;
    }
    if (k === "F1") return say(HELP);
    if (k === "^F1") {                                  // the real Award trick: Ctrl+F1 in the main menu shows hidden items
      if (page) return;
      secret = true; found.add("menu"); sel = MENU.length - 1; sfx.ok(); return render();
    }
    if (k === "F10") return ask("SAVE to CMOS and EXIT", () => exit("save"), "Y");
    if (k === "Escape") {
      if (!page) return ask("Quit Without Saving", () => exit("quit"));
      clearInterval(clock); page = null; sel = mainSel; sfx.blip(); return render();
    }
    if (k === "ArrowDown" || k === "ArrowUp") return move(k === "ArrowDown" ? 1 : -1);
    if (!page && (k === "ArrowRight" || k === "ArrowLeft")) return move(k === "ArrowRight" ? 7 : -7);
    if (!page && k === "Enter") return enter(sel);
    if (page && (k === "PageUp" || k === "+" || k === "Enter")) return change(1);
    if (page && (k === "PageDown" || k === "-")) return change(-1);
  }
  function backdoor() {
    found.add("backdoor");
    if (!overdrive.v.includes("Ludicrous")) overdrive.v.push("Ludicrous");
    sfx.ok(); say("AWARD BACKDOOR PASSWORD ACCEPTED<br>(a real 90s master password — yes, this worked)<br><br>CHIPSET FEATURES SETUP: Curiosity Overdrive has a new level.");
  }
  function onKey(e) {
    if (e.ctrlKey && e.key === "F1") { e.preventDefault(); e.stopPropagation(); return key("^F1"); }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    if (dlg?.pw && e.key !== "Enter" && e.key !== "Escape") {   // let the password input get the keystroke
      e.stopPropagation(); if (e.key.length === 1) sfx.key(); return;
    }
    e.preventDefault(); e.stopPropagation(); key(e.key);
  }
  function onClick(e) {
    if (!dlg && e.target.closest(".b-ttl") && ++knocks === 5) return key("^F1");
    const b = e.target.closest("button");
    if (b?.dataset.key) return key(b.dataset.key);
    if (dlg?.pw) return el.querySelector(".b-pw").focus();            // tap on the prompt: back to typing
    if (dlg) return key("Escape");                                     // tap: close message / answer N
    if (!b) return;
    const j = +b.dataset.i;
    if (j !== sel) { sel = j; sfx.tick(); return render(); }
    page ? change(1) : enter(j);                         // tapping the highlighted item opens / changes it
  }

  GM.bios = {
    get driveA() { const x = items().find(y => y.k === "Drive A"); return x.v[x.i]; },   // read by MS-DOS (drive A:)
    get virusWarning() { return items().find(x => x.k === "Virus Warning").i === 1; },   // read by MS-DOS (C:\VIRUSES)
    get quickPost() { return items().find(x => x.k === "Quick Power On Self Test").i === 1; },
    open(container) {
      el = document.createElement("div"); el.className = "bios"; container.append(el);
      page = null; sel = mainSel = 0; dlg = null; render();
      document.addEventListener("keydown", onKey, true); el.addEventListener("click", onClick);
      return new Promise(res => { done = res; });
    },
  };
})();
