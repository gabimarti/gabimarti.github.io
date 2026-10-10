// MS-DOS 3.10 for gabimarti.github.io (GRUB entry "MS-DOS 3.1"). Loaded on demand by site.js.
// A tiny COMMAND.COM over the same content as the quick view (ids c-*), with 8.3 file names.
// Hidden challenge: C:\UTILS (hidden dir, see AUTOEXEC.BAT) has LOCKED.COM, which shows the CV with the right password;
// the password is XORed inside the program, so DEBUG (D = dump, U = unassemble) gives it away. Data: vault.json "dos".
// open() resolves "classic" on EXIT, or nothing on REBOOT / Ctrl+Alt+Del (site.js then restarts the POST).
"use strict";
(() => {
  const { $, esc, sleep, sfx } = GM;
  const html = sel => { const el = $(sel); return el ? el.outerHTML.replace(/ id="[^"]*"/, "").replace(/>\s+</g, "><") : ""; };
  const txt = s => esc(s).replace(/\n/g, "<br>");
  const README = `GABIMARTI.GITHUB.IO - MS-DOS EDITION
====================================
This is MS-DOS 3.10 (1985): there is no HELP command yet.
Things you can type:

  DIR [dir]   list files             CD dir, CD .., CD \\   change directory
  TYPE file   show a file            CLS                  clear the screen
  VER, VOL    version, volume        DATE, TIME           system clock
  CHKDSK      disk and memory        ECHO text            say something
  EXIT        back to the quick view
  REBOOT      restart the PC (or Ctrl+Alt+Del)

Start with:  TYPE ABOUT.TXT   then   DIR SKILLS   and   DIR CONTACT
Tip: you can also tap the names in a DIR listing.

Not everything on this disk shows up in DIR. A good start: how does this PC boot?`;
  const NOTES = `NOTES.TXT - 1986
- My CV now lives inside LOCKED.COM: only the right password shows it.
- I forgot the password. Again.
- But the program knows it: it has to compare what I type with something...
  and it only XORs it, with a key that changes on every byte.
- DEBUG LOCKED.COM, then U (unassemble) and D (dump). .COM programs start at 0100.`;
  const SKILLS = ["OFFENSE", "REVERSE", "WEBINTEL", "DEFENSE", "GRC", "DEV", "LANGUAGE"];
  const CONTACTS = ["X", "LINKEDIN", "GITHUB", "MEDIUM", "EMAIL"];
  const OLD = " 3-07-85   1:43p", Y86 = " 6-12-86  11:59p";
  // tree: directories are objects; files are [size or null (= computed), date or null (= today), content() -> html or none (binary)]
  const FS = {
    "COMMAND.COM": [23612, OLD],
    "AUTOEXEC.BAT": [null, OLD, () => txt("PROMPT $P$G\nPATH C:\\DOS;C:\\UTILS\nDATE\nTIME")],
    "CONFIG.SYS": [null, OLD, () => txt("FILES=20\nBUFFERS=20\nCOUNTRY=034")],
    "README.TXT": [null, null, () => txt(README)],
    "ABOUT.TXT": [null, null, () => html("#c-about")],
    "SUMMARY.TXT": [null, null, () => html("#c-summary")],
    "INTEREST.TXT": [null, null, () => html("#c-interests")],
    "ARTICLES.TXT": [null, null, () => html("#c-articles")],
    "AVATAR.TXT": [null, null, () => html("#avatar .avatar")],
    DOS: {
      "CHKDSK.COM": [9435, OLD], "DEBUG.COM": [15647, OLD], "EDLIN.COM": [7261, OLD],
      "FDISK.COM": [16737, OLD], "FORMAT.COM": [11005, OLD], "SYS.COM": [4607, OLD],
    },
    SKILLS: Object.fromEntries(SKILLS.map((k, i) => [k + ".TXT", [null, null, () => html(`#c-skills dd:nth-of-type(${i + 1})`)]])),
    CONTACT: Object.fromEntries(CONTACTS.map((k, i) => [k + ".URL", [null, null, () => html(`#c-contact li:nth-child(${i + 1}) a`)]])),
    UTILS: { "NOTES.TXT": [null, Y86, () => txt(NOTES)], "LOCKED.COM": [192, Y86] },
  };
  const HIDDEN = new Set(["UTILS"]), PATH = [["DOS"], ["UTILS"]];
  const DAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
  const p2 = n => String(n).padStart(2, "0"), hx = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, "0");
  const today = () => { const d = new Date(); return `${d.getMonth() + 1}-${p2(d.getDate())}-${String(d.getFullYear()).slice(2)}`; };
  const dateLine = () => { const d = new Date(); return `Current date is ${DAYS[d.getDay()]} ${p2(d.getMonth() + 1)}-${p2(d.getDate())}-${d.getFullYear()}`; };
  const timeLine = () => { const d = new Date(); return `Current time is ${d.getHours()}:${p2(d.getMinutes())}:${p2(d.getSeconds())}.${p2(Math.floor(d.getMilliseconds() / 10))}`; };

  // ---------- LOCKED.COM: a real-looking image built from vault.json (key and XORed bytes) ----------
  let vaultP = null;
  const vault = () => vaultP ||= fetch("vault.json", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(e => { vaultP = null; throw e; });
  const SEG = "1F2A";
  async function lockedImage() {                            // [bytes at 0100.., code listing]
    const { key, enc } = (await vault()).dos, k = hx(key);
    const CODE = [    // [offset, bytes, mnemonic]
      [0x100, "BA9001", "MOV     DX,0190"], [0x103, "B409", "MOV     AH,09"], [0x105, "CD21", "INT     21"],
      [0x107, "BA3E01", "MOV     DX,013E"], [0x10A, "B40A", "MOV     AH,0A"], [0x10C, "CD21", "INT     21"],
      [0x10E, "BE8001", "MOV     SI,0180"], [0x111, "BF4001", "MOV     DI,0140"], [0x114, "B90800", "MOV     CX,0008"],
      [0x117, "B3" + k, "MOV     BL," + k], [0x119, "AC", "LODSB"], [0x11A, "32C3", "XOR     AL,BL"],
      [0x11C, "3A05", "CMP     AL,[DI]"], [0x11E, "750A", "JNZ     012A"], [0x120, "47", "INC     DI"],
      [0x121, "FEC3", "INC     BL"], [0x123, "E2F4", "LOOP    0119"], [0x125, "BA6001", "MOV     DX,0160"],
      [0x128, "EB03", "JMP     012D"], [0x12A, "BA7001", "MOV     DX,0170"], [0x12D, "B409", "MOV     AH,09"],
      [0x12F, "CD21", "INT     21"], [0x131, "B8004C", "MOV     AX,4C00"], [0x134, "CD21", "INT     21"],
    ];
    const mem = new Uint8Array(0xC0), put = (at, bytes) => bytes.forEach((b, i) => { mem[at - 0x100 + i] = b; });
    const ascii = s => [...s].map(c => c.charCodeAt(0));
    CODE.forEach(([at, h]) => put(at, h.match(/../g).map(b => parseInt(b, 16))));
    put(0x13E, [9, 0]); put(0x160, ascii("Access granted$")); put(0x170, ascii("Access denied$"));
    put(0x180, enc); put(0x190, ascii("Password: $")); put(0x1A0, ascii("LOCKED v1.0 (C)1986 gabimarti"));
    return [mem, CODE];
  }

  let el, out, form, input, promptEl, done, cwd = [], hist = [], hpos = 0, pending = null;
  const pathStr = (p = cwd) => "C:\\" + p.join("\\");
  const node = p => p.reduce((n, k) => n?.[k], FS);
  const isDir = n => n && !Array.isArray(n);
  const print = h => { const d = document.createElement("div"); d.innerHTML = h; out.append(d); el.closest("main").scrollTop = 1e9; return d; };
  const err = h => { sfx.err(); return print(h); };
  const setPrompt = t => { promptEl.textContent = t ?? pathStr() + ">"; };
  // a program waiting for input: label is the prompt, cb gets the line (DATE/TIME ignore it, DEBUG loops, LOCKED wants a password)
  const ask = (label, cb = () => {}, secret = false) => { pending = cb; setPrompt(label); input.type = secret ? "password" : "text"; };
  function resolve(arg) {                                   // DOS path (case-insensitive, \ or /) -> array, or null
    const a = arg.toUpperCase().replace(/\//g, "\\").replace(/^C:/, "");
    const p = a.startsWith("\\") ? [] : [...cwd];
    for (const part of a.split("\\").filter(Boolean)) {
      if (part === ".") continue;
      if (part === "..") { if (!p.length) return null; p.pop(); continue; }
      p.push(part);
    }
    return node(p) ? p : null;
  }
  function findProgram(name) {                              // name, name.COM or name.BAT in cwd, then in PATH -> [path array, file]
    const n = name.toUpperCase().replace(/\//g, "\\"), exts = /\.(COM|BAT)$/.test(n) ? [""] : [".COM", ".BAT"];
    for (const e of exts) {
      if (n.includes("\\")) { const p = resolve(n + e); if (p && !isDir(node(p))) return p; continue; }
      for (const dir of [cwd, ...PATH]) if (node([...dir, n + e]) && !isDir(node([...dir, n + e]))) return [...dir, n + e];
    }
    return null;
  }
  function size(f) {
    if (f[0]) return f[0];
    const t = document.createElement("div"); t.innerHTML = f[2](); return t.textContent.length;
  }
  function dir(arg) {
    const p = arg ? resolve(arg) : cwd, n = p && node(p);
    if (!isDir(n)) return err("File not found");
    const up = p.length ? [[".", null], [".."]] : [], rows = [];
    let count = 0, bytes = 0;
    for (const [name, v] of [...up, ...Object.entries(n).filter(([k]) => p.length || !HIDDEN.has(k))]) {
      const [b, e = ""] = name.startsWith(".") ? [name] : name.split(".");
      const label = esc(`${b.padEnd(8)} ${e.padEnd(3)}`), path = esc([...p, name].join("\\"));
      count++;
      if (!v || isDir(v)) {
        const btn = v ? `<button type="button" class="fs" data-dos="CD \\${path}">${label}</button>` : label;
        rows.push(`${btn}     &lt;DIR&gt;    ${today().padStart(8)}  12:00p`);
      } else {
        const s = size(v), btn = v[2] ? `<button type="button" class="fs file" data-dos="TYPE \\${path}">${label}</button>` : label;
        bytes += s;
        rows.push(`${btn} ${String(s).padStart(9)}  ${v[1] || today().padStart(8) + "  12:00p"}`);
      }
    }
    print(`<pre> Volume in drive C is GABIMARTI\n Directory of  ${esc(pathStr(p))}\n\n${rows.join("\n")}\n${String(count).padStart(9)} File(s)  ${20123648 - bytes} bytes free</pre>`);
  }

  // ---------- DEBUG: D [addr], U [addr], R, G, Q over the loaded .COM (or empty memory) ----------
  async function debug(arg) {
    let mem = new Uint8Array(0xC0), code = [], prog = null;
    if (arg) {
      prog = findProgram(arg) || resolve(arg);
      if (!prog || isDir(node(prog))) return err("File not found");
      if (prog.join("\\") === "UTILS\\LOCKED.COM") {
        try { [mem, code] = await lockedImage(); } catch (e) { return err("Disk error reading drive C"); }
      }
    }
    let dAt = 0x100, uAt = 0x100;
    const byte = a => a >= 0x100 && a < 0x100 + mem.length ? mem[a - 0x100] : 0;
    const dump = from => {
      const lines = [];
      for (let a = from & ~15, row = 0; row < 8; row++, a += 16) {
        const bs = Array.from({ length: 16 }, (_, i) => byte(a + i));
        const hex = bs.map((b, i) => hx(b) + (i === 7 ? "-" : " ")).join("").trimEnd();
        lines.push(`${SEG}:${hx(a, 4)}  ${hex}   ${bs.map(b => b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".").join("")}`);
      }
      dAt = (from & ~15) + 128; return lines.join("\n");
    };
    const unasm = from => {
      const lines = []; let a = from;
      while (lines.length < 16) {
        const ins = code.find(c => c[0] === a);
        if (ins) { lines.push(`${SEG}:${hx(a, 4)} ${ins[1].padEnd(14)}${ins[2]}`); a += ins[1].length / 2; }
        else { lines.push(`${SEG}:${hx(a, 4)} ${hx(byte(a)).padEnd(14)}DB      ${hx(byte(a))}`); a++; }
      }
      uAt = a; return lines.join("\n");
    };
    const step = line => {
      const t = line.trim().toUpperCase(), [c, ...rest] = t.split(/\s+/), at = rest[0] ? parseInt(rest[0].replace(/^.*:/, ""), 16) : NaN;
      if (!t) return;
      if (c === "Q") { input.type = "text"; return setPrompt(), true; }
      if (c === "D") print(`<pre>${esc(dump(isNaN(at) ? dAt : at))}</pre>`);
      else if (c === "U") print(`<pre>${esc(unasm(isNaN(at) ? uAt : at))}</pre>`);
      else if (c === "R") print(`<pre>AX=0000  BX=0000  CX=${hx(prog ? mem.length : 0, 4)}  DX=0000  SP=FFFE  BP=0000  SI=0000  DI=0000\nDS=${SEG}  ES=${SEG}  SS=${SEG}  CS=${SEG}  IP=0100   NV UP EI PL NZ NA PO NC\n${esc(unasm(0x100).split("\n")[0])}</pre>`);
      else if (c === "G" && code.length) { print("Password: (run LOCKED from the prompt to type it)<br><br>Program terminated normally"); }
      else if (c === "G") print("Program terminated normally");
      else print("  ^ Error");
    };
    const loop = line => { if (!step(line)) ask("-", loop); };
    ask("-", loop);
  }

  // ---------- LOCKED.COM: the right password decrypts the DOS part of vault.json (flag + CV) ----------
  function locked() {
    ask("Password: ", async pw => {
      setPrompt(""); form.hidden = true;
      let text = null;
      try {
        const v = await vault(), d = v.dos, b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
        if ([...pw].length === d.enc.length && [...pw].every((c, i) => c.charCodeAt(0) === (d.enc[i] ^ (d.key + i) & 0xff))) {
          const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
          const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(d.salt), iterations: v.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
          text = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(d.iv) }, key, b64(d.ct)));
        }
      } catch (e) { text = null; }
      if (text) { sfx.ok(); print("Access granted"); print(`<pre class="dos-cv">${esc(text)}</pre>`); }
      else err("Access denied");
      form.hidden = false; setPrompt(); input.focus({ preventScroll: true });
    }, true);
  }

  const CMDS = {
    DIR: dir,
    CLS: () => { out.innerHTML = ""; },
    VER: () => print("<br>MS-DOS Version 3.10<br><br>"),
    VOL: () => print(" Volume in drive C is GABIMARTI"),
    ECHO: a => print(a ? esc(a) : "ECHO is on"),
    CD: a => {
      if (!a) return print(esc(pathStr()));
      const p = resolve(a);
      if (!p || !isDir(node(p))) return err("Invalid directory");
      cwd = p; setPrompt();
    },
    TYPE: async a => {
      if (!a) return err("Required parameter missing");
      const p = resolve(a), n = p && node(p);
      if (!n || isDir(n)) return err("File not found");
      if (n[2]) return print(`<div class="dos-file">${n[2]()}</div>`);
      let mem = null;
      if (p.join("\\") === "UTILS\\LOCKED.COM") try { [mem] = await lockedImage(); } catch (e) { /* binary noise below */ }
      print(`<pre>${esc(mem ? [...mem].map(b => b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : b ? "▒" : " ").join("") : "MZ▒▒▒▒▒▒")}</pre>`);
    },
    DATE: () => { print(dateLine()); ask("Enter new date (mm-dd-yy): "); },
    TIME: () => { print(timeLine()); ask("Enter new time: "); },
    CHKDSK: () => print(`<pre>Volume GABIMARTI   created Mar 7, 1985 1:43p

  21309440 bytes total disk space
     55296 bytes in 3 hidden files
     12288 bytes in 6 directories
   1118208 bytes in 43 user files
  20123648 bytes available on disk

    655360 bytes total memory
    602144 bytes free</pre>`),
    DEBUG: debug,
    LOCKED: locked,
    FORMAT: () => err("Nice try. This disk holds 35 years of work."),
    FDISK: () => err("Nice try. The partitions are staying where they are."),
    EXIT: () => finish("classic"),
    REBOOT: () => finish(),
  };
  const EXTERNAL = new Set(["CHKDSK", "DEBUG", "LOCKED", "FORMAT", "FDISK"]);   // programs on disk: only run if found in cwd / PATH
  async function exec(line) {
    print(esc(promptEl.textContent + (input.type === "password" ? "" : line)));
    if (pending) { const cb = pending; pending = null; input.type = "text"; setPrompt(); return cb(line); }
    const t = line.trim(); if (!t) return;
    hist.push(t); hpos = hist.length;
    if (/^[a-z]:$/i.test(t)) return /^c:$/i.test(t) ? null : err("Invalid drive specification");
    const [, c, a] = t.match(/^([^\s/.]+(?:\.[a-z0-9]{1,3})?)(.*)$/i) || [, t, ""];   // CD.. and CD\ work too
    if (/^cd\\/i.test(c)) return CMDS.CD(t.slice(2));
    const prog = c.includes("\\") ? findProgram(c) : null, base = (prog ? prog.at(-1) : c.toUpperCase()).replace(/\.(COM|EXE|BAT)$/, "");
    if (CMDS[base] && (!EXTERNAL.has(base) || prog || findProgram(base))) return CMDS[base](a.trim());
    if (findProgram(c)) return err("Program too big to fit in memory");
    err("Bad command or file name");
  }
  function finish(next) {
    document.removeEventListener("keydown", onKey, true);
    done(next);
  }
  function onKey(e) {                                       // Ctrl+Alt+Del reboots; typing anywhere goes to the prompt
    if (e.ctrlKey && e.altKey && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); return finish(); }
    if (e.target !== input && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) input.focus({ preventScroll: true });
  }

  GM.dos = {
    async open(container) {
      el = document.createElement("div"); el.className = "dos";
      el.innerHTML = `<div class="dos-out"></div><form class="dos-form" autocomplete="off" hidden><label class="dos-prompt" for="dos-in"></label><input id="dos-in" spellcheck="false" autocapitalize="off" autocomplete="off"></form>`;
      container.append(el);
      out = el.querySelector(".dos-out"); form = el.querySelector("form"); input = el.querySelector("input"); promptEl = el.querySelector("label");
      cwd = []; hist = []; hpos = 0; pending = null;
      print("  Booting 'MS-DOS 3.1'<br><br>rootnoverify (hd0,1)<br>chainloader +1<br><br>"); await sleep(900);
      print("Starting MS-DOS...<br><br>"); await sleep(1400);
      print(dateLine()); print("Enter new date (mm-dd-yy): "); await sleep(800); sfx.clack("\n");
      print(timeLine()); print("Enter new time: "); await sleep(800); sfx.clack("\n");
      print("<br>Microsoft(R) MS-DOS(R)  Version 3.10<br>             (C)Copyright Microsoft Corp 1981-1985<br><br>Type TYPE README.TXT to get started.<br><br>");
      setPrompt(); form.hidden = false; input.focus({ preventScroll: true });
      form.addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; sfx.key(); exec(v); });
      input.addEventListener("keydown", e => {
        if (pending) return;
        if ((e.key === "ArrowUp" || e.key === "F3") && hpos > 0) { input.value = hist[--hpos]; e.preventDefault(); }
        else if (e.key === "ArrowDown") { hpos = Math.min(hist.length, hpos + 1); input.value = hist[hpos] || ""; e.preventDefault(); }
      });
      el.addEventListener("click", e => {
        const b = e.target.closest("[data-dos]");
        if (b && !pending) exec(b.dataset.dos);
        if (!e.target.closest("a") && !getSelection().toString()) input.focus({ preventScroll: true });
      });
      document.addEventListener("keydown", onKey, true);
      return new Promise(res => { done = res; });
    },
  };
})();
