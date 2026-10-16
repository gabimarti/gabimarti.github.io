// MS-DOS 3.10 for gabimarti.github.io (GRUB entry "MS-DOS 3.1"). Loaded on demand by site.js.
// A tiny COMMAND.COM over the same content as the quick view (ids c-*), with 8.3 file names.
// Hidden challenge: C:\UTILS (hidden dir, see AUTOEXEC.BAT) has LOCKED.COM, which shows the CV with the right password;
// the password is XORed inside the program, so DEBUG (D = dump, U = unassemble) gives it away. Data: vault.json "dos".
// Batch files run (CV.BAT, AUTOEXEC.BAT): @, ECHO ON/OFF/., REM, PAUSE, GOTO/:label, IF, SET/%VAR%, %0-%9, CALL, ECHO ^G = beep.
// Pipes (|) and input redirection (<) feed MORE, FIND and SORT. Commands newer than 1985 run with a wink.
// Easter eggs: DIR /WTF, FORMAT C:, DEL *.* (-> REGRETS.TXT), PING, HACK; drive A: makes floppy noise, asks
// Abort, Retry, Fail? and finds a 1986 backup disk on the 3rd try (BIOS Setup Drive A = None -> no drive A:).
// TELNET <host> opens THE CURIOSITY BBS (bbs.js, loaded on demand): a scripted 1997 bulletin board.
// Hidden C:\MUSIC (clue: CONFIG.SYS) has MIDI\*.MID and PLAY.COM, which plays them on the PC speaker (tunes.js, shared
// with the BIOS). Hidden C:\42.TXT shows up with ATTRIB.
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
  CHKDSK, MEM disk and memory        ECHO text            say something
  SCAN        look for viruses (McAfee, 1990)
  TREE [/F]   directory tree         ATTRIB [file]        file attributes
  MORE, FIND, SORT   filters: TYPE README.TXT | FIND "DIR"   or   MORE < README.TXT
  SET, PATH, PROMPT, LABEL           environment, search path, prompt, volume label
  EDIT file   look at a file         CV                   run CV.BAT
  EXIT        back to the quick view
  REBOOT      restart the PC (or Ctrl+Alt+Del)

Too much typing? CV runs CV.BAT: my CV, one section at a time.
Bored? C:\\GAMES has SNAKE and TETRIS.
Prefer windows? Type WIN for Windows 3.1 (yes, on top of DOS, like in 1992).
Start with:  TYPE ABOUT.TXT   then   DIR SKILLS   and   DIR CONTACT
Tip: you can also tap the names in a DIR listing.

Not everything on this disk shows up in DIR. A good start: how does this PC boot?

More to find on this PC, and beyond it: TYPE EXPLORE.TXT`;
  const EXPLORE = `EXPLORE.TXT - THINGS TO FIND ON THIS PC
=======================================
[ ] This disk: a directory that DIR won't show. How does this PC boot?
[ ] 1 flag on this PC: LOCKED.COM keeps it, with my CV, behind a password.
    DEBUG knows the password.
[ ] DIR doesn't list every file either. ATTRIB is less discreet.
[ ] The commands every DOS user feared still work. Sort of.
[ ] Drive A: is still there. Bring patience (and Retry).
[ ] A 1997 BBS is still online, and its SYSOP still answers. Look in C:\\DOS.
[ ] This PC used to play music. Its drivers still load at boot.
[ ] Debian GNU/Linux (boot menu): 2 flags, one of them only for root.
    The admin keeps forgetting root's password, and writing notes about it.
[ ] BIOS Setup: press DEL during the memory test.
    4 undocumented features. F1 gives clues.
[ ] memtest86+ (boot menu): let it run. Old RAM fails sometimes.
[ ] This PC's owner keeps a museum on this disk. Its name is the obvious one.
[ ] The boot menu keeps machines older than this PC, tapes still in.
    On one of them, a 1985 game never ran as it was printed.
[ ] A 90s virus collector left his zoo on this disk. SCAN finds it.
[ ] Once a year this PC throws a party. Its clock is easier to change
    than it looks.

REBOOT (or Ctrl+Alt+Del) takes you back to the boot menu.`;
  const NOTES = `NOTES.TXT - 1986
- My CV now lives inside LOCKED.COM: only the right password shows it.
- I forgot the password. Again.
- But the program knows it: it has to compare what I type with something...
  and it only XORs it, with a key that changes on every byte.
- DEBUG LOCKED.COM, then U (unassemble) and D (dump). .COM programs start at 0100.`;
  const AUTOEXEC = "PROMPT $P$G\nPATH C:\\DOS;C:\\UTILS;C:\\WINDOWS\nDATE\nTIME";
  const SKILLS = ["OFFENSE", "REVERSE", "WEBINTEL", "DEFENSE", "GRC", "DEV", "LANGUAGE"];
  const SKILL_NAMES = ["offensive/", "reversing/", "web-intel/", "defense/", "grc/", "dev/", "languages/"];
  const CONTACTS = ["X", "LINKEDIN", "GITHUB", "MEDIUM", "EMAIL"];
  const section = (n, title, body) => `CLS\nECHO [${n}/7] ${title}\nECHO ${"-".repeat(title.length + 6)}\n${body}\nECHO.\nPAUSE`;
  const CVBAT = [
    "@ECHO OFF",
    "REM CV.BAT - Gabriel Marti's CV, for IT people who'd rather automate than type",
    "CLS",
    "ECHO ======================================================",
    "ECHO  CV.BAT - Gabriel Marti (@gabimarti), batch edition",
    "ECHO  For IT people who'd rather automate than type:",
    "ECHO  sit back and press a key between sections.",
    "ECHO ======================================================",
    "ECHO ^G",
    "PAUSE",
    section(1, "WHOAMI", "ECHO Gabriel Marti (@gabimarti)\nTYPE SUMMARY.TXT"),
    section(2, "SKILLS", SKILLS.map((k, i) => `ECHO ${SKILL_NAMES[i]}\nTYPE SKILLS\\${k}.TXT`).join("\n")),
    section(3, "ABOUT", "TYPE ABOUT.TXT"),
    section(4, "INTERESTS", "TYPE INTEREST.TXT"),
    section(5, "GITHUB REPOS", "TYPE REPOS.TXT"),
    section(6, "ARTICLES", "TYPE ARTICLES.TXT"),
    section(7, "CONTACT", CONTACTS.map(k => `ECHO ${k}\nTYPE CONTACT\\${k}.URL`).join("\n")).replace(/\nPAUSE$/, ""),
    "ECHO ^G^G",
    "ECHO Done: 7 sections, 0 commands typed by you. That's the spirit.",
    "ECHO More secrets on this PC: TYPE EXPLORE.TXT",
  ].join("\n");
  const OLD = " 3-07-85   1:43p", Y86 = " 6-12-86  11:59p";
  // tree: directories are objects; files are [size or null (= computed), date or null (= today), content() -> html or none (binary), raw text (.BAT)]
  const FS = {
    "IO.SYS": [22357, OLD], "MSDOS.SYS": [30128, OLD],
    "COMMAND.COM": [23612, OLD],
    "AUTOEXEC.BAT": [null, OLD, () => txt(AUTOEXEC), AUTOEXEC],
    "CONFIG.SYS": [null, OLD, () => txt("FILES=20\nBUFFERS=20\nCOUNTRY=034\nDEVICE=C:\\MUSIC\\MPU401.SYS")],
    "42.TXT": [null, " 4-02-85   4:02a", () => txt("The answer is 42. The question is: why did you type this?")],
    "CV.BAT": [null, null, () => txt(CVBAT), CVBAT],
    "README.TXT": [null, null, () => txt(README)],
    "EXPLORE.TXT": [null, null, () => txt(EXPLORE)],
    "ABOUT.TXT": [null, null, () => html("#c-about")],
    "SUMMARY.TXT": [null, null, () => html("#c-summary")],
    "INTEREST.TXT": [null, null, () => html("#c-interests")],
    "ARTICLES.TXT": [null, null, () => html("#c-articles")],
    "REPOS.TXT": [null, null, () => html("#c-repos")],
    "AVATAR.TXT": [null, null, () => html("#avatar .avatar")],
    DOS: {
      "ATTRIB.EXE": [8234, OLD], "CHKDSK.COM": [9435, OLD], "DEBUG.COM": [15647, OLD], "EDIT.COM": [413, OLD],
      "EDLIN.COM": [7261, OLD], "FDISK.COM": [16737, OLD], "FIND.EXE": [6403, OLD], "FORMAT.COM": [11005, OLD],
      "LABEL.COM": [1826, OLD], "MEM.EXE": [32150, OLD], "MORE.COM": [282, OLD], "SORT.EXE": [1632, OLD],
      "SYS.COM": [4607, OLD], "TELNET.EXE": [64328, OLD], "TREE.COM": [1645, OLD], "SCAN.EXE": [94531, " 7-15-90   6:06p"],
    },
    SKILLS: Object.fromEntries(SKILLS.map((k, i) => [k + ".TXT", [null, null, () => html(`#c-skills dd:nth-of-type(${i + 1})`)]])),
    CONTACT: Object.fromEntries(CONTACTS.map((k, i) => [k + ".URL", [null, null, () => html(`#c-contact li:nth-child(${i + 1}) a`)]])),
    UTILS: { "NOTES.TXT": [null, Y86, () => txt(NOTES)], "LOCKED.COM": [192, Y86] },
    WINDOWS: { "WIN.COM": [44170, " 3-10-92   3:10a"], "PROGMAN.EXE": [115312, " 3-10-92   3:10a"], "WRITE.EXE": [244976, " 3-10-92   3:10a"] },
    MUSEUM: { "TIMELINE.TXT": [null, " 9-01-81  10:00a", () => html("#c-timeline")] },
    GAMES: { "SNAKE.EXE": [24576, Y86], "TETRIS.EXE": [32768, Y86], "README.TXT": [null, Y86, () => txt("C:\\GAMES - CD GAMES, then SNAKE or TETRIS.\nArrows (or WASD) move, P pauses, Q or Esc quits. On a phone, use the pad under the board.")] },
  };
  const BACKUP86 = `BACKUP86.TXT - 1986
The only backup I ever made.
What it contains: this text file.
Lesson learned: test your restores.`;
  const HISCORE = `HIGH SCORES - DIGGER (1983)
 1. GABIMARTI   999990
 2. GABIMARTI   871200
 3. YOU              0   <- the night is young`;
  const FSA = {                                             // the 1986 disk that turns up in drive A:
    "BACKUP86.TXT": [null, Y86, () => txt(BACKUP86)],
    "HISCORE.TXT": [null, Y86, () => txt(HISCORE)],
  };
  const REGRETS = () => `REGRETS.TXT - created by DEL *.* on ${today()}
- I typed DEL *.* on someone else's PC.
- The weekend is gone. The files are fine: this disk is write-protected.
- Next time: COPY *.* A: first.`;
  const WTFD = " 2-30-86  12:00p";
  const MOTIVATE = "@ECHO OFF\nECHO You can do it!\nECHO You are a rockstar developer!\nECHO The deadline is just a suggestion!\nPAUSE\nECHO Just kidding. Go get a coffee: COFFEE";
  const WTF = {                                             // C:\WTF: what DIR /WTF shows (hidden, CD WTF works)
    "REALITY.SYS": [0, "12-31-99  11:59p", () => ""],
    "COFFEE.EXE": [65535, " 1-01-80   6:00a"],
    "MOTIVATE.BAT": [null, WTFD, () => txt(MOTIVATE), MOTIVATE],
    "DEADLINE.TMP": [999999, " 4-01-86   9:00a", () => txt("DEADLINE: yesterday.\nSTATUS:   90% done (the other 90% starts tomorrow).")],
    "BUGS.LOG": [1048576, " 3-13-85   1:13a", () => txt("[01:13] Fixed 1 bug.\n[01:14] 3 new bugs appeared.\n[01:15] Marked as feature.")],
    "EXCUSES.DOC": [640, " 8-08-88   8:08p", () => txt("1. It works on my machine.\n2. That's not a bug, it's undocumented behaviour.\n3. The compiler did it.\n4. Cosmic rays flipped a bit.")],
    "WEEKEND.ZIP": [1, " 5-05-85   5:05p", () => txt("PK\u0003\u0004 - compressed to 1 byte. That's how long it felt.")],
    "MEETING.EXE": [2000000, " 9-09-89   9:09a"],
    "SLEEP.DAT": [404, " 6-06-86   3:00a", () => txt("zzz... 404: sleep not found.")],
  };
  const MUSIC_README = "C:\\MUSIC - my 1986 MIDI collection, played through the PC speaker.\n\nPLAY MIDI\\CANCAN.MID    one tune\nPLAY                    a random one\nDIR MIDI                the whole collection\n\nAny key stops the music.";
  // C:\VIRUSES (hidden; SCAN finds it): a 90s collector's zoo, defanged (virus.js only does the show).
  // file: [size, date, SCAN name, year/origin, what it does, real trigger, test on GM.now()]
  const VIRUSES = {
    "CASCADE.COM": [1701, " 9-10-87   4:12p", "1701 [Cascade]", "1987, Germany", "the letters fall to the bottom of the screen", "October to December 1988", d => d.getFullYear() === 1988 && d.getMonth() >= 9],
    "PINGPONG.COM": [512, " 3-03-88  10:30a", "Ping Pong [Italian]", "1988, Italy", "a ball bounces around the screen", "on the half hour", d => d.getMinutes() === 30],
    "YANKEE.COM": [2885, " 6-01-89   5:00p", "Yankee Doodle [TP-44]", "1989, Bulgaria", "it plays Yankee Doodle", "at 5 pm", d => d.getHours() === 17],
    "AMBULANC.COM": [796, " 7-14-90   9:11a", "Ambulance Car [RedX]", "1990", "an ambulance crosses the screen, siren on", "now and then", () => false],
    "CASINO.COM": [2330, " 1-15-91   3:15p", "Casino [Disk Destroyer]", "1991, Malta", "it bets your FAT on a jackpot", "January 15, April 15 and August 15", d => d.getDate() === 15 && [0, 3, 7].includes(d.getMonth())],
    "WALKER.COM": [4475, " 5-05-92   5:05p", "Walker", "1992", "a little man walks across the screen", "now and then", () => false],
    "BARROTES.COM": [1310, " 1-05-93  12:00a", "Barrotes", "1993, Spain", "bars come down over the screen", "January 5", d => d.getMonth() === 0 && d.getDate() === 5],
  };
  const ZOO = `ZOO.TXT - my virus collection (1987-1993)
Swapped on floppies at school and downloaded from BBSs.
They are defanged: no disk is harmed, they only do their show.

${Object.entries(VIRUSES).map(([f, v]) => `  ${f.padEnd(13)} ${v[2].padEnd(24)} ${v[3]}`).join("\n")}

Run one by name (CD VIRUSES, then CASCADE). Some still wake up
on their own on the right day, if this PC's clock agrees.`;
  FS.VIRUSES = { "ZOO.TXT": [null, " 1-05-93  12:01a", () => txt(ZOO)], ...Object.fromEntries(Object.entries(VIRUSES).map(([f, v]) => [f, [v[0], v[1]]])) };
  const HIDDEN = new Set(["UTILS", "WTF", "MUSIC", "VIRUSES", "MUSEUM"]);
  FS.WTF = WTF;                        // hidden directories (ATTRIB only lists files, so UTILS stays a secret)
  const ATTR0 = { "IO.SYS": "RHS", "MSDOS.SYS": "RHS", "42.TXT": "AH" };     // file attributes (default: A)
  const DAYS = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
  const p2 = n => String(n).padStart(2, "0"), hx = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, "0");
  const today = () => { const d = GM.now(); return `${d.getMonth() + 1}-${p2(d.getDate())}-${String(d.getFullYear()).slice(2)}`; };
  const dateLine = () => { const d = GM.now(); return `Current date is ${DAYS[d.getDay()]} ${p2(d.getMonth() + 1)}-${p2(d.getDate())}-${d.getFullYear()}`; };
  const timeLine = () => { const d = GM.now(); return `Current time is ${d.getHours()}:${p2(d.getMinutes())}:${p2(d.getSeconds())}.${p2(Math.floor(d.getMilliseconds() / 10))}`; };
  const tooLate = () => { const h = GM.now().getHours(); return h >= 3 && h < 6; };   // 03:00-05:59
  const beep = () => sfx.tone(1000, .12, "square", .05);

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
  let env, attrs, vol, echoOn, batchDepth = 0, abort = false, cancelWait = null, busy = false;
  let drive = "C", cwds = { C: [], A: [] }, floppyIn = false, floppyTries = 0;
  const pathStr = (p = cwd) => drive + ":\\" + p.join("\\");
  const node = (p, root = drive === "A" ? FSA : FS) => p.reduce((n, k) => n?.[k], root);
  const isDir = n => n && !Array.isArray(n);
  const print = h => { const d = document.createElement("div"); d.innerHTML = h; out.append(d); el.scrollTop = 1e9; return d; };
  const err = h => { sfx.err(); return print(h); };
  const toBottom = () => { el.scrollTop = el.scrollHeight; };   // prompt back in view (the screen scrolls, never the window)
  const promptText = () => (env.PROMPT ?? "$N$G").replace(/\$(.)/g, (_, c) => ({
    P: pathStr(), G: ">", L: "<", B: "|", Q: "=", N: drive, $: "$", _: "\n", V: "MS-DOS Version 3.10",
    D: dateLine().slice(16), T: timeLine().slice(16), E: "", H: "" })[c.toUpperCase()] ?? "");
  const setPrompt = t => { promptEl.textContent = t ?? (echoOn ? promptText() : ""); };
  // a program waiting for input: label is the prompt, cb gets the line (DATE/TIME ignore it, DEBUG loops, LOCKED wants a password)
  const ask = (label, cb = () => {}, secret = false) => { pending = cb; setPrompt(label); input.type = secret ? "password" : "text"; };
  const askLine = label => new Promise(res => {          // same, awaitable (also inside a batch file, where the prompt is hidden)
    form.hidden = false; input.focus({ preventScroll: true }); toBottom();
    ask(label, v => { if (batchDepth) form.hidden = true; res(v); });
  });
  // wait for a key or a tap (PAUSE, MORE, EDIT); Ctrl+C / Esc stops a running batch file
  const anyKey = (onlyClose = false) => new Promise(res => {
    const k = e => {
      if (e.ctrlKey && e.altKey) return;                    // Ctrl+Alt+Del: onKey reboots
      if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
      if (onlyClose && !["Escape", "Enter"].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      if ((e.ctrlKey && /^c$/i.test(e.key)) || e.key === "Escape") { if (batchDepth) { abort = true; print("^C"); } }
      stop();
    };
    const c = e => { if (onlyClose && !e.target.closest("[data-close]")) return; e.stopPropagation(); stop(); };
    const stop = () => { document.removeEventListener("keydown", k, true); el.removeEventListener("click", c, true); cancelWait = null; res(); };
    cancelWait = stop;
    setTimeout(() => { document.addEventListener("keydown", k, true); el.addEventListener("click", c, true); });
  });
  function resolve(arg) {                                   // DOS path (case-insensitive, \ or /) -> array, or null
    let a = arg.toUpperCase().replace(/\//g, "\\");
    if (/^[A-Z]:/.test(a)) { if (a[0] !== drive) return null; a = a.slice(2); }   // another drive: see onDrive()
    const p = a.startsWith("\\") ? [] : [...cwd];
    for (const part of a.split("\\").filter(Boolean)) {
      if (part === ".") continue;
      if (part === "..") { if (!p.length) return null; p.pop(); continue; }
      p.push(part);
    }
    return node(p) ? p : null;
  }
  const searchPath = () => (env.PATH || "").split(";").filter(Boolean).map(d => d.toUpperCase().replace(/^C:/, "").split("\\").filter(Boolean)).filter(p => isDir(node(p, FS)));
  function findProgram(name) {                              // name, name.COM/.EXE/.BAT in cwd, then in PATH -> [path array, file]
    const n = name.toUpperCase().replace(/\//g, "\\"), exts = /\.(COM|EXE|BAT)$/.test(n) ? [""] : [".COM", ".EXE", ".BAT"];
    for (const e of exts) {
      if (n.includes("\\")) { const p = resolve(n + e); if (p && !isDir(node(p))) return p; continue; }
      const here = node([...cwd, n + e]);
      if (here && !isDir(here)) return [...cwd, n + e];
      for (const dir of searchPath()) { const f = node([...dir, n + e], FS); if (f && !isDir(f)) return [...dir, n + e]; }   // PATH: always drive C:
    }
    return null;
  }
  const attrOf = p => attrs[p.join("\\")] ?? "A";
  const hidden = p => p.length === 1 && HIDDEN.has(p[0]) || attrOf(p).includes("H");
  // plain text of a file in the active language (FIND, SORT, MORE, EDIT)
  function plain(h) {
    const d = document.createElement("div");
    d.innerHTML = h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(li|p|dd|dt|div|pre|h\d)>/gi, "$&\n");
    d.querySelectorAll("[lang]").forEach(x => { if (x.lang !== document.documentElement.lang) x.remove(); });
    return d.textContent.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "");
  }
  const fileText = f => f[3] ?? (f[2] ? plain(f[2]()) : "\u2592".repeat(16));
  function size(f) {
    if (f[0]) return f[0];
    const t = document.createElement("div"); t.innerHTML = f[2](); return t.textContent.length;
  }
  const volLine = () => drive === "A" ? " Volume in drive A is BACKUP 86" : vol ? ` Volume in drive C is ${esc(vol)}` : " Volume in drive C has no label";
  function dir(arg) {
    if (/\/WTF\b/i.test(arg)) arg = "\\WTF";                 // DIR /WTF = DIR \WTF
    arg = arg.replace(/\/\w+/g, "").trim();                   // /W, /P...: ignored
    const p = arg ? resolve(arg) : cwd, n = p && node(p);
    if (!isDir(n)) return err("File not found");
    const up = p.length ? [[".", null], [".."]] : [], rows = [];
    let count = 0, bytes = 0;
    for (const [name, v] of [...up, ...Object.entries(n).filter(([k]) => !hidden([...p, k]))]) {
      const [b, e = ""] = name.startsWith(".") ? [name] : name.split(".");
      const label = esc(`${b.padEnd(8)} ${e.padEnd(3)}`), path = esc([...p, name].join("\\"));
      count++;
      if (!v || isDir(v)) {
        const btn = v ? `<button type="button" class="fs" data-dos="CD \\${path}">${label}</button>` : label;
        rows.push(`${btn}     &lt;DIR&gt;    ${today().padStart(8)}  12:00p`);
      } else {
        const s = size(v), btn = v[2] ? `<button type="button" class="fs file" data-dos="TYPE ${drive}:\\${path}">${label}</button>` : label;
        bytes += s;
        rows.push(`${btn} ${String(s).padStart(9)}  ${v[1] || today().padStart(8) + "  12:00p"}`);
      }
    }
    print(`<pre>${volLine()}\n Directory of  ${esc(pathStr(p))}\n\n${rows.join("\n")}\n${String(count).padStart(9)} File(s)  ${p.join() === "WTF" && drive === "C" ? "0 bytes free (and 0 patience)" : ((drive === "A" ? 1440000 : 20123648) - bytes) + " bytes free"}</pre>`);
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

  // ---------- 10-15 (GM.party): PARTY.COM — text-mode confetti over the PC speaker tune; at boot or when DATE lands on it ----------
  async function party() {
    try { await GM.need("tunes.js"); } catch (e) { /* confetti without music */ }
    const W = 56, H = 11, BITS = [..."☺☻♥♦♣♠•○♪♫☼*+"], d = GM.now();
    const MSG = { 4: "  *** PARTY TIME ***  ", 6: ` Today is ${p2(d.getMonth() + 1)}-${p2(d.getDate())} 3C Edition. This PC celebrates. ` };
    const grid = Array.from({ length: H }, () => Array(W).fill(null));
    const pre = document.createElement("pre"); pre.className = "dos-party"; print("PARTY.COM v1.0 - resident<br>").append(pre);
    const [stop, secs] = GM.tunes ? GM.tunes.play(GM.tunes.party) : [() => {}, 5];
    const end = performance.now() + Math.max(secs, 5) * 1000;
    do {
      grid.pop(); grid.unshift(Array.from({ length: W }, () => Math.random() < .12 ? [BITS[Math.random() * BITS.length | 0], 1 + (Math.random() * 6 | 0)] : null));
      pre.innerHTML = grid.map((row, y) => {
        const m = MSG[y], at = m ? (W - m.length) >> 1 : W;
        return row.map((c, x) => x >= at && x < at + m.length ? `<b>${esc(m[x - at])}</b>` : c ? `<span class="pc${c[1]}">${c[0]}</span>` : " ").join("");
      }).join("\n");
      await sleep(130);
    } while (performance.now() < end);
    stop();
  }

  // ---------- viruses (virus.js): run from C:\VIRUSES, or on their own on their real trigger day/time ----------
  const dueVirus = () => { const d = GM.now(); return Object.keys(VIRUSES).find(f => VIRUSES[f][6](d)); };
  async function virus(file) {
    const v = VIRUSES[file];
    if (GM.bios?.virusWarning) {                             // BIOS Setup > BIOS FEATURES SETUP > Virus Warning = Enabled
      print("<br>!WARNING!<br>Disk boot sector is to be modified<br>Type \"Y\" to accept write or \"N\" to abort write");
      if (!/^y/i.test(await askLine(""))) { if (!batchDepth) form.hidden = true; return print(`Write aborted. ${esc(v[2])} never got to do its show.`); }
      if (!batchDepth) form.hidden = true;
    }
    try { await GM.need("virus.js"); if (file === "YANKEE.COM") await GM.need("tunes.js"); } catch (e) { return err("Program too big to fit in memory"); }
    await GM.virus.run(file, { print, sleep, sfx, anyKey, lines: () => plain(out.innerHTML).split("\n") });
    print(`<span class="dim">${esc(`${v[2]} (${v[3]}): ${v[4]}. Defanged here: only the show. Real trigger: ${v[5]}.`)}</span>`);
  }
  // SCAN.EXE (McAfee, 1990): walks drive C:, hidden directories included, and names the zoo
  async function scan() {
    print("SCAN 7.0V66 Copyright 1989-90 by McAfee Associates.  (408) 988-3832<br><br>Scanning memory for critical viruses.");
    await sleep(700); print("Scanning C:");
    let files = 0, found = 0;
    const walk = async (n, p) => {
      for (const [k, v] of Object.entries(n)) {
        if (isDir(v)) { await walk(v, [...p, k]); continue; }
        files++;
        if (p.join("\\") === "VIRUSES" && VIRUSES[k]) { found++; print(esc(`  Found the ${VIRUSES[k][2]} virus in C:\\VIRUSES\\${k}`)); sfx.err(); await sleep(250); }
      }
      await sleep(80);
    };
    await walk(FS, []);
    print(`<pre>\nSummary report on C:\n  File(s)\n       Analyzed: ${String(files).padStart(6)}\n       Scanned:  ${String(files).padStart(6)}\n  Possibly Infected: ${String(found).padStart(4)}\n  Master Boot Records\n       Analyzed:      1\n  Possibly Infected:    0</pre>`);
    if (found) print("To remove viruses, use CLEAN-UP. (Not included: the collector would never forgive you.)");
  }

  // ---------- batch files ----------
  async function runBatch(path, args) {
    const lines = node(path)[3].split("\n"), labels = {};
    lines.forEach((l, i) => { const m = l.trim().match(/^:(\S+)/); if (m) labels[m[1].toUpperCase()] = i; });
    const params = [path.at(-1).replace(/\.BAT$/, ""), ...args];
    batchDepth++; form.hidden = true;
    try {
      for (let i = 0; i < lines.length && !abort; i++) {
        let l = lines[i].trim();
        if (!l || l.startsWith(":")) continue;
        const quiet = l.startsWith("@"); if (quiet) l = l.slice(1);
        l = l.replace(/%(\d)/g, (_, n) => params[n] ?? "").replace(/%([^%\s]+)%/g, (_, k) => env[k.toUpperCase()] ?? "");
        if (echoOn && !quiet) print(esc(promptText() + l));
        while (l !== null && /^IF\s/i.test(l)) l = evalIf(l.slice(3));
        if (l === null) continue;
        const g = l.match(/^GOTO\s+:?(\S+)/i);
        if (g) {
          const j = labels[g[1].toUpperCase()];
          if (j === undefined) { err("Label not found"); break; }
          i = j; continue;
        }
        const word = l.split(/\s+/)[0], bat = !CMDS[word.toUpperCase()] && findProgram(word);
        if (bat && bat.at(-1).endsWith(".BAT")) { await runBatch(bat, l.split(/\s+/).slice(1)); break; }   // no CALL: chain
        await run(l);
        await sleep(30);                                    // let the screen breathe, like a real 4.77 MHz PC
      }
    } finally {
      if (!--batchDepth) { abort = false; echoOn = true; form.hidden = false; setPrompt(); input.focus({ preventScroll: true }); toBottom(); }
    }
  }
  function evalIf(s) {                                      // IF [NOT] EXIST file | ERRORLEVEL n | a==b  command -> command or null
    let m = s.match(/^(NOT\s+)?(.*)$/i), ok;
    const not = !!m[1]; let rest = m[2];
    if ((m = rest.match(/^EXIST\s+(\S+)\s+(.+)$/i))) { ok = !!resolve(m[1]); rest = m[2]; }
    else if ((m = rest.match(/^ERRORLEVEL\s+(\d+)\s+(.+)$/i))) { ok = 0 >= +m[1]; rest = m[2]; }
    else if ((m = rest.match(/^"?([^"=\s]*)"?\s*==\s*"?([^"\s]*)"?\s+(.+)$/))) { ok = m[1] === m[2]; rest = m[3]; }
    else { err("Syntax error"); return null; }
    return ok !== not ? rest : null;
  }

  // ---------- filters: text comes from a pipe, from < file, or from file arguments ----------
  async function more(a, stdin) {
    if (stdin === undefined) return err("Required parameter missing - try MORE &lt; README.TXT");
    const lines = stdin.split("\n");
    for (let i = 0; i < lines.length && !abort; i += 20) {
      print(`<pre>${esc(lines.slice(i, i + 20).join("\n"))}</pre>`);
      if (i + 20 < lines.length) { const m = print("-- More --"); await anyKey(); m.remove(); }
    }
  }
  function find(a, stdin) {
    const flags = (a.match(/\/[VCNI]/gi) || []).map(f => f[1].toUpperCase()), q = a.match(/"([^"]*)"/);
    if (!q) return err("FIND: Parameter format not correct");
    const files = a.slice(q.index + q[0].length).split(/\s+/).filter(f => f && !f.startsWith("/"));
    const has = l => flags.includes("I") ? l.toLowerCase().includes(q[1].toLowerCase()) : l.includes(q[1]);
    const one = (name, text) => {
      const hits = text.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => has(l) !== flags.includes("V"));
      const head = name ? `\n---------- ${name}${flags.includes("C") ? ": " + hits.length : ""}\n` : "";
      const body = flags.includes("C") ? (name ? "" : String(hits.length)) : hits.map(([n, l]) => (flags.includes("N") ? `[${n}]` : "") + l).join("\n");
      print(`<pre>${esc(head + body)}</pre>`);
    };
    if (!files.length) return stdin === undefined ? err("FIND: Parameter format not correct") : one("", stdin);
    for (const f of files) { const p = resolve(f), n = p && node(p); n && !isDir(n) ? one(p.at(-1), fileText(n)) : err(`File not found - ${esc(f.toUpperCase())}`); }
  }
  function sort(a, stdin) {
    const file = a.split(/\s+/).find(x => x && !x.startsWith("/")), col = +(a.match(/\/\+(\d+)/)?.[1] || 1) - 1;
    let text = stdin;
    if (file) { const p = resolve(file), n = p && node(p); if (!n || isDir(n)) return err("File not found"); text = fileText(n); }
    if (text === undefined) return err("Required parameter missing - try SORT &lt; README.TXT");
    const lines = text.split("\n").sort((x, y) => x.slice(col).localeCompare(y.slice(col), "en", { sensitivity: "base" }));
    if (/\/R/i.test(a)) lines.reverse();
    print(`<pre>${esc(lines.join("\n"))}</pre>`);
  }
  function tree(a) {                                        // the MS-DOS 3.x layout, not the graphic one of DOS 4+
    const files = /\/F/i.test(a), outL = ["", "DIRECTORY PATH LISTING", ""];
    const walk = p => {
      const n = node(p), subs = Object.keys(n).filter(k => isDir(n[k]) && !hidden([...p, k]));
      if (p.length) {
        outL.push(`Path: \\${p.join("\\")}`, "", `Sub-directories:  ${subs.length ? subs.join("\n                  ") : "None"}`, "");
        if (files) {
          const fs = Object.keys(n).filter(k => !isDir(n[k]) && !hidden([...p, k])).map(k => { const [b, e = ""] = k.split("."); return `${b.padEnd(8)} .${e}`; });
          outL.push(`Files:            ${fs.length ? fs.join("\n                  ") : "None"}`, "");
        }
      }
      subs.forEach(k => walk([...p, k]));
    };
    walk([]);
    print(`<pre>${esc(outL.join("\n"))}</pre>`);
  }
  function attrib(a) {
    const sets = (a.match(/[+-][RAHS]/gi) || []).map(s => s.toUpperCase()), spec = a.split(/\s+/).find(x => x && !/^[+-][RAHS]$/i.test(x)) || "*.*";
    const at = spec.toUpperCase().replace(/\//g, "\\").replace(/^C:/, ""), cut = at.lastIndexOf("\\");
    const dirP = cut < 0 ? cwd : resolve(at.slice(0, cut) || "\\"), mask = at.slice(cut + 1);
    if (!dirP || !isDir(node(dirP))) return err("Path not found");
    const re = new RegExp("^" + mask.replace(/[.+^${}()|[\]]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
    const hits = Object.keys(node(dirP)).filter(k => !isDir(node(dirP)[k]) && re.test(k)).map(k => [...dirP, k]);
    if (!hits.length) return err(`File not found - ${esc(spec.toUpperCase())}`);
    if (sets.length) {
      hits.forEach(p => { let s = attrOf(p); sets.forEach(([op, f]) => { s = op === "+" ? (s.includes(f) ? s : s + f) : s.replace(f, ""); }); attrs[p.join("\\")] = s; });
      return;
    }
    print(`<pre>${esc(hits.map(p => { const s = attrOf(p); return `${s.includes("A") ? "A" : " "}    ${["S", "H", "R"].map(f => s.includes(f) ? f : " ").join("")}     ${pathStr(p)}`; }).join("\n"))}</pre>`);
  }
  async function edit(a) {                                  // the blue MS-DOS Editor, read-only
    const p = a && resolve(a), n = p && node(p);
    if (n && isDir(n)) return err("File not found");
    const name = n ? pathStr(p) : (a ? a.toUpperCase() : "Untitled");
    const box = document.createElement("div"); box.className = "dos-edit";
    box.innerHTML = `<div class="ed-menu"> File  Edit  Search  Options  Help</div><div class="ed-title">${esc(name)}</div>`
      + `<pre class="ed-body" tabindex="0">${esc(n ? fileText(n) : "")}</pre>`
      + `<div class="ed-status"><button type="button" data-close>Esc=Exit</button>  MS-DOS Editor · read-only · EDIT arrived in 1991: this PC peeked at the future</div>`;
    out.hidden = form.hidden = true; el.append(box); box.querySelector(".ed-body").focus({ preventScroll: true });
    await anyKey(true);
    box.remove(); out.hidden = false; if (!batchDepth) { form.hidden = false; input.focus({ preventScroll: true }); }
  }

  const CMDS = {
    DIR: dir,
    CLS: () => { out.innerHTML = ""; },
    VER: () => print("<br>MS-DOS Version 3.10<br><br>"),
    VOL: () => print(volLine()),
    LABEL: async a => {
      if (!a) { print(volLine()); a = await askLine("Volume label (11 characters, ENTER for none)? "); if (!a.trim()) return; }
      const v = a.trim().toUpperCase();
      if (v.length > 11 || /[*?/\\|.,;:+=<>[\]"]/.test(v)) return err("Invalid characters in volume label");
      vol = v;
    },
    ECHO: a => {
      if (/^(on|off)$/i.test(a)) { echoOn = /on/i.test(a); return setPrompt(); }
      if (!a) return print(`ECHO is ${echoOn ? "on" : "off"}`);
      const beeps = (a.match(/\^G/gi) || []).length;
      for (let i = 0; i < beeps; i++) setTimeout(beep, i * 220);
      const t = a.replace(/\^G/gi, "").trim();
      if (t) print(esc(t));
    },
    REM: () => {},
    PAUSE: async () => { const m = print("Press any key to continue . . ."); await anyKey(); if (!abort) m.remove(); },
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
      if (n[3]) return print(`<pre class="dos-file">${esc(n[3])}</pre>`);
      if (n[2]) return print(`<div class="dos-file">${n[2]()}</div>`);
      let mem = null;
      if (p.join("\\") === "UTILS\\LOCKED.COM") try { [mem] = await lockedImage(); } catch (e) { /* binary noise below */ }
      print(`<pre>${esc(mem ? [...mem].map(b => b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : b ? "▒" : " ").join("") : "MZ▒▒▒▒▒▒")}</pre>`);
    },
    DATE: async a => {                                      // sets the PC clock (GM.now) for the rest of the visit
      if (!a) print(dateLine());
      for (let line = a; ; line = "") {
        if (!line) line = await askLine("Enter new date (mm-dd-yy): ");
        if (!line.trim()) return;
        const m = line.trim().match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/), t = GM.now();
        const y = m && (m[3].length === 2 ? (+m[3] < 80 ? 2000 : 1900) + +m[3] : +m[3]);
        if (m && y >= 1980 && y <= 2099) { t.setFullYear(y, m[1] - 1, m[2]); if (t.getMonth() === m[1] - 1 && t.getDate() === +m[2]) { GM.setNow(t); if (GM.party()) return party(); const v = dueVirus(); return v && virus(v); } }
        print("Invalid date");
      }
    },
    TIME: async () => {
      print(timeLine());
      if (tooLate()) print("It is too late to be using DOS.");
      await askLine("Enter new time: ");
    },
    CHKDSK: () => print(`<pre>Volume ${esc(vol || "")}   created Mar 7, 1985 1:43p

  21309440 bytes total disk space
     55296 bytes in 3 hidden files
     12288 bytes in 6 directories
   1118208 bytes in 43 user files
  20123648 bytes available on disk

    655360 bytes total memory
    602144 bytes free</pre>`),
    MEM: () => print(`<pre>    655360 bytes total conventional memory
    655360 bytes available to MS-DOS
    602144 largest executable program size

(MEM arrived with MS-DOS 4.0 in 1988: this PC peeked at the future.
 640K ought to be enough for anybody.)</pre>`),
    TREE: tree,
    ATTRIB: attrib,
    MORE: more,
    FIND: find,
    SORT: sort,
    EDIT: edit,
    SET: a => {
      if (!a) return print(`<pre>${esc(Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n"))}</pre>`);
      const m = a.match(/^([^=]+)=(.*)$/);
      if (!m) return err("Syntax error");
      const k = m[1].trim().toUpperCase();
      if (m[2]) env[k] = m[2]; else delete env[k];
      if (k === "PROMPT") setPrompt();
    },
    PATH: a => {
      if (!a) return print(env.PATH ? "PATH=" + esc(env.PATH) : "No Path");
      if (a.trim() === ";") delete env.PATH; else env.PATH = a.trim().toUpperCase();
    },
    PROMPT: a => { if (a) env.PROMPT = a; else delete env.PROMPT; setPrompt(); },
    IF: a => { const rest = evalIf(a); if (rest && !/^GOTO\s/i.test(rest)) return run(rest); },
    GOTO: () => {},                                         // only means something inside a batch file
    CALL: a => {
      const [name, ...args] = a.trim().split(/\s+/), p = name && findProgram(name);
      if (!p || !p.at(-1).endsWith(".BAT")) return err("Bad command or file name");
      return runBatch(p, args);
    },
    DEBUG: debug,
    LOCKED: locked,
    SCAN: scan,
    FORMAT: format,
    DEL: del, ERASE: del,
    PING: ping,
    HACK: hack,
    WIN: windows,
    SNAKE: () => game("snake"), TETRIS: () => game("tetris"),
    PLAY: play,
    HELP: () => { print("(HELP arrived with MS-DOS 5.0 in 1991: this PC peeked at the future. Here is README.TXT.)"); return CMDS.TYPE("\\README.TXT"); },
    TELNET: async a => {
      const host = a.trim().split(/\s+/)[0];
      if (!host) return err("Usage: TELNET host   (any host will do: they all lead to the same BBS)");
      try { await GM.need("bbs.js"); } catch (e) { return err("Network error: no route to host"); }
      return GM.bbs.run({ host, print, err, askLine, sleep, esc, sfx, cls: () => { out.innerHTML = ""; }, reduce: GM.reduce });
    },
    FDISK: () => err("Nice try. The partitions are staying where they are."),
    EXIT: () => finish("classic"),
    REBOOT: () => finish(),
  };
  // programs on disk: only run if found in cwd / PATH (empty the PATH and they are gone, like on a real PC)
  const EXTERNAL = new Set(["SCAN", "CHKDSK", "DEBUG", "LOCKED", "FORMAT", "FDISK", "MEM", "TREE", "ATTRIB", "MORE", "FIND", "SORT", "EDIT", "LABEL", "TELNET", "PLAY", "SNAKE", "TETRIS", "WIN"]);
  // split on | outside quotes
  const pipes = t => { const parts = [""]; let q = false; for (const ch of t) { if (ch === '"') q = !q; if (ch === "|" && !q) parts.push(""); else parts[parts.length - 1] += ch; } return parts.map(s => s.trim()); };
  async function capture(fn) {                              // run a command with its output kept off screen, as plain text
    const screen = out; out = document.createElement("div");
    try { await fn(); return plain(out.innerHTML); } finally { out = screen; }
  }
  async function run(t, stdin) {
    t = t.trim(); if (!t) return;
    if (/^[a-z]:$/i.test(t)) return switchDrive(t[0].toUpperCase());
    if (drive !== "A" && /^(dir|type|vol)\s+a:/i.test(t)) {          // DIR A:, TYPE A:\X from drive C:
      if (!await accessA()) return;
      return onDrive("A", () => run(t.replace(/\sa:/i, " ")));
    }
    const ps = pipes(t);
    if (ps.length > 1) {
      let data = stdin;
      for (const [i, part] of ps.entries()) { if (i < ps.length - 1) data = await capture(() => run(part, data)); else return run(part, data); }
    }
    if (/>/.test(t.replace(/"[^"]*"/g, ""))) return err("Write protect error writing drive C");
    const lt = t.match(/^(.*?)\s*<\s*(\S+)\s*$/);
    if (lt) { const p = resolve(lt[2]), n = p && node(p); if (!n || isDir(n)) return err("File not found"); return run(lt[1], fileText(n)); }
    const [, c, a] = t.match(/^([^\s/.]+(?:\.[a-z0-9]{1,3})?)(.*)$/i) || [, t, ""];   // CD.. and CD\ work too
    if (/^cd\\/i.test(c)) return CMDS.CD(t.slice(2));
    if (/^echo$/i.test(c) && a.startsWith(".")) return print("&nbsp;");      // ECHO. prints an empty line
    const prog = c.includes("\\") ? findProgram(c) : null, base = (prog ? prog.at(-1) : c.toUpperCase()).replace(/\.(COM|EXE|BAT)$/, "");
    if (CMDS[base] && (!EXTERNAL.has(base) || prog || findProgram(base))) return CMDS[base](a.trim(), stdin);
    const p = prog || findProgram(c);
    if (p && p.at(-1).endsWith(".BAT")) return runBatch(p, a.trim().split(/\s+/).filter(Boolean));
    if (p && p.join("\\") === "WTF\\COFFEE.EXE") return coffee();
    if (p && p[0] === "VIRUSES" && VIRUSES[p.at(-1)]) return virus(p.at(-1));
    if (p && p.join("\\") === "WTF\\MEETING.EXE") return print("Starting MEETING.EXE...<br>This meeting could have been an email. Exiting.");
    if (p) return err("Program too big to fit in memory");
    err("Bad command or file name");
  }
  async function exec(line) {                               // a line typed (or tapped) at the prompt
    print(esc(promptEl.textContent + (input.type === "password" ? "" : line)));
    if (pending) { const cb = pending; pending = null; input.type = "text"; setPrompt(); return cb(line); }
    const t = line.trim(); if (!t) return;
    hist.push(t); hpos = hist.length;
    busy = true; form.hidden = true;                         // no typing while a command runs (PING, FORMAT, HACK...)
    try { await run(t); } finally { busy = false; if (!batchDepth) { form.hidden = false; input.focus({ preventScroll: true }); toBottom(); } }
  }
  // ---------- drive A: ----------
  const driveA = () => GM.bios?.driveA ?? "1.44M, 3.5 in.";   // BIOS Setup > STANDARD CMOS SETUP > Drive A
  async function accessA() {                                // floppy noise; empty drive twice, then a dusty 1986 disk
    if (driveA() === "None") { err("Invalid drive specification"); return false; }
    for (;;) {
      sfx.floppy(); await sleep(GM.reduce ? 100 : 1300);
      if (floppyIn || ++floppyTries >= 3) {
        if (!floppyIn) print(`<span class="dim">(a dusty ${esc(driveA().replace(/^\S+ /, ""))} disk labelled BACKUP 86 turns up in the drive)</span>`);
        floppyIn = true; return true;
      }
      print("<br>Not ready reading drive A");
      const k = (await askLine("Abort, Retry, Fail?")).trim().toUpperCase();
      if (!batchDepth) form.hidden = true;
      if (k[0] !== "R") return false;
    }
  }
  async function switchDrive(d) {
    if (d === drive) return;
    if (d !== "A" && d !== "C") return err("Invalid drive specification");
    if (d === "A" && !await accessA()) return;
    cwds[drive] = cwd; drive = d; cwd = cwds[d]; setPrompt();
  }
  async function onDrive(d, fn) {                           // run one command on another drive and come back
    const back = drive; cwds[back] = cwd; drive = d; cwd = cwds[d];
    try { await fn(); } finally { cwds[d] = cwd; drive = back; cwd = cwds[back]; }
  }

  // ---------- easter eggs ----------
  async function format(a) {
    const d = (a.match(/^([a-z]):/i) || [])[1]?.toUpperCase();
    if (!d) return err("Required parameter missing");
    if (d === "A") {
      if (!await accessA()) return;
      print("Insert new diskette for drive A:");
      await askLine("and press ENTER when ready...");
      sfx.floppy(); await sleep(GM.reduce ? 100 : 1300);
      return err("Write protect error writing drive A<br>(that disk is the only backup from 1986: the write-protect tab stays on)");
    }
    if (d !== "C") return err("Invalid drive specification");
    print("<br>WARNING, ALL DATA ON NON-REMOVABLE DISK<br>DRIVE C: WILL BE LOST!");
    if (!/^y/i.test(await askLine("Proceed with Format (Y/N)?"))) return;
    print("Are you REALLY sure? 35 years of work live on this disk.");
    if (!/^y/i.test(await askLine("Last chance. Format anyway (Y/N)?"))) return print("Wise choice.");
    form.hidden = true;
    const bar = print("");
    for (let p = 0; p <= 100 && !abort; p += 4) {
      bar.innerHTML = `<pre>Formatting...  Head: ${p % 2}  Cylinder: ${String(Math.round(p * 6.15)).padStart(3)}\n[${"#".repeat(p / 4)}${".".repeat(25 - p / 4)}] ${p}% complete</pre>`;
      sfx.tick(); await sleep(GM.reduce ? 20 : 120);
    }
    print("Format complete."); await sleep(700);
    sfx.err(); print("<br><strong>Nice try. This is JavaScript.</strong><br>Restoring drive C: from good old common sense... done. Not a single byte was harmed.");
    sfx.ok();
  }
  async function del(a) {
    const spec = a.trim().toUpperCase();
    if (!spec) return err("Required parameter missing");
    if (spec === "*.*" || spec === "." || spec.endsWith("\\*.*")) {
      if (!/^y/i.test(await askLine("Are you sure (Y/N)?"))) return;
      form.hidden = true;
      const dot = print("Deleting your weekend");
      for (let i = 0; i < 6; i++) { await sleep(GM.reduce ? 20 : 300); dot.textContent += "."; sfx.tick(); }
      dot.textContent += " done.";
      if (drive === "C") { node(cwd)["REGRETS.TXT"] = [null, null, () => txt(REGRETS())]; print("1 file created: REGRETS.TXT (the only thing DEL ever created)"); }
      return;
    }
    const p = resolve(spec), n = p && node(p);
    if (!n || isDir(n)) return err("File not found");
    if (p.at(-1) === "REGRETS.TXT") { delete node(p.slice(0, -1))["REGRETS.TXT"]; return print("Regrets deleted. If only it were that easy."); }
    err("Access denied");
  }
  async function ping(a) {
    const host = a.trim().split(/\s+/)[0];
    if (!host) return err("Usage: PING host   (try PING 8.8.8.8)");
    print(`<br>Pinging ${esc(host)} with 32 bytes of data:<br>`);
    const times = [42, 640, 1997, 0, 386];
    for (let i = 0; i < 4 && !abort; i++) {
      await sleep(GM.reduce ? 50 : 650); sfx.tick();
      print(`Reply from ${esc(host)}: bytes=32 time=${times[(Math.random() * times.length) | 0]}ms TTL=1997`);
    }
    print(`<br>Ping statistics for ${esc(host)}:<br>    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)<br><span class="dim">(TTL=1997 can't exist: the maximum is 255. TCP/IP for DOS came years later; this one runs on imagination.)</span>`);
  }
  async function play(a) {                                 // PLAY.COM (C:\MUSIC): a .MID file on the PC speaker
    const L = GM.tunes?.list;
    if (!L) return err("PLAY: no sound driver loaded");
    const arg = a.trim().toUpperCase();
    let t;
    if (!arg || arg.endsWith("*.MID")) t = L[(Math.random() * L.length) | 0];
    else {
      const p = resolve(arg) || resolve("\\MUSIC\\MIDI\\" + arg.split("\\").pop()) || resolve("\\MUSIC\\MIDI\\" + arg + ".MID");
      t = p && L.find(x => x.file === p.at(-1));
      if (!t) return err("File not found - " + esc(arg) + "<br>Usage: PLAY [file.MID]   (no file: a random one)");
    }
    const [stop, secs] = GM.tunes.play(t.tune);
    print(`&#9834; ${esc(t.file)}: ${esc(t.title)} (as heard in ${esc(t.game)})` + (sfx.on ? "" : " (sound is muted: \u{1F50A} in the title bar)"));
    const m = print("Press any key to stop . . .");
    await Promise.race([anyKey(), sleep(secs * 1000 + 300)]);
    cancelWait?.(); stop(); m.remove();
  }
  async function game(name) {                               // C:\GAMES\SNAKE.EXE, TETRIS.EXE (games.js, shared with Linux)
    try { await GM.need("games.js"); } catch (e) { return err("Program too big to fit in memory"); }
    form.hidden = true;
    const score = await GM.games.run(name, print(""));
    print(`${name.toUpperCase()}: score ${score}`);
  }
  async function windows() {                                // WIN: Windows 3.1 on top of DOS (win31.js)
    try { await GM.need("win31.js"); } catch (e) { return err("Program too big to fit in memory"); }
    out.hidden = form.hidden = true;
    await GM.win31.run(el, { html, sfx, sleep });
    out.hidden = false;
    print("<br>(Windows 3.1 ended. Back to MS-DOS, where it all began.)<br>");
  }
  async function coffee() {
    const m = print("Brewing");
    for (let i = 0; i < 5; i++) { await sleep(GM.reduce ? 20 : 350); m.textContent += " ."; sfx.tick(); }
    m.textContent += " \u2615";
    print("Out of beans. Abort, Retry, Fail? (all three lead to the kitchen)");
  }
  async function hack() {                                   // green "movie hacking" screen
    const box = document.createElement("div"); box.className = "dos-hack";
    out.hidden = form.hidden = true; el.append(box);
    const line = s => { const d = document.createElement("div"); d.textContent = s; box.append(d); while (box.childElementCount > 30) box.firstChild.remove(); return d; };
    const hex = () => Array.from({ length: 8 }, () => hx((Math.random() * 65536) | 0, 4)).join(" ");
    const STAGES = ["Bypassing the mainframe firewall", "Cracking 4096-bit RSA with a pocket calculator", "Tracing the IP through 7 proxies",
      "Downloading more RAM", "Injecting SQL into the office printer", "Reversing the polarity of the neutron flow"];
    for (const s of STAGES) {
      line(`> ${s}`); const bar = line("");
      for (let p = 0; p <= 20; p++) {
        bar.textContent = `  [${"#".repeat(p)}${" ".repeat(20 - p)}] ${p * 5}%`;
        if (p % 5 === 0) line("  " + hex());
        sfx.clack("x"); await sleep(GM.reduce ? 5 : 45);
      }
    }
    const g = document.createElement("div"); g.className = "granted"; g.textContent = "ACCESS GRANTED"; box.append(g);
    const c = document.createElement("div"); c.className = "coffee"; c.textContent = "You have unlocked the coffee machine. \u2615"; box.append(c);
    sfx.ok(); line(""); line("Press any key to log out before someone notices...");
    await anyKey();
    box.remove(); out.hidden = false;
  }

  function finish(next) {
    cancelWait?.(); abort = true;
    document.removeEventListener("keydown", onKey, true);
    done(next);
  }
  function onKey(e) {                                       // Ctrl+Alt+Del reboots; typing anywhere goes to the prompt
    if (e.ctrlKey && e.altKey && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); return finish(); }
    if (e.target !== input && !form.hidden && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) input.focus({ preventScroll: true });
  }

  GM.dos = {
    async open(container) {
      el = document.createElement("div"); el.className = "dos";
      el.innerHTML = `<div class="dos-out"></div><form class="dos-form" autocomplete="off" hidden><label class="dos-prompt" for="dos-in"></label><input id="dos-in" spellcheck="false" autocapitalize="off" autocomplete="off"></form>`;
      container.append(el);
      out = el.querySelector(".dos-out"); form = el.querySelector("form"); input = el.querySelector("input"); promptEl = el.querySelector("label");
      new ResizeObserver(toBottom).observe(out);        // output that grows after print (PARTY.COM, viruses, FORMAT) stays in view
      cwd = []; hist = []; hpos = 0; pending = null; batchDepth = 0; abort = false; echoOn = true; vol = "GABIMARTI"; busy = false;
      drive = "C"; cwds = { C: cwd, A: [] }; floppyIn = false; floppyTries = 0;
      if (!FS.MUSIC) try {                              // C:\MUSIC\MIDI is built from the shared tunes
        await GM.need("tunes.js");
        FS.MUSIC = { "PLAY.COM": [3187, Y86], "MPU401.SYS": [2048, Y86], "README.TXT": [null, Y86, () => txt(MUSIC_README)],
          MIDI: Object.fromEntries(GM.tunes.list.map(t => [t.file, [null, Y86, () => txt(`MThd\u2592\u2592\u2592\u2592 ${t.title}\nas heard in ${t.game}\n(binary MIDI data: PLAY it instead)`)]])) };
      } catch (e) { /* no music today */ }
      env = { COMSPEC: "C:\\COMMAND.COM", PATH: "C:\\DOS;C:\\UTILS;C:\\WINDOWS", PROMPT: "$P$G" }; attrs = { ...ATTR0 };
      print("  Booting 'MS-DOS 3.1'<br><br>rootnoverify (hd0,1)<br>chainloader +1<br><br>"); await sleep(900);
      print("Starting MS-DOS...<br><br>"); await sleep(1400);
      print(dateLine()); print("Enter new date (mm-dd-yy): "); await sleep(800); sfx.clack("\n");
      print(timeLine()); if (tooLate()) print("It is too late to be using DOS."); print("Enter new time: "); await sleep(800); sfx.clack("\n");
      print("<br>Microsoft(R) MS-DOS(R)  Version 3.10<br>             (C)Copyright Microsoft Corp 1981-1985<br><br>Type TYPE README.TXT to get started, or CV to let a batch file do the typing.<br><br>");
      if (GM.party()) await party();
      else if (dueVirus()) await virus(dueVirus());               // a resident virus whose day (or hour) has come
      setPrompt(); form.hidden = false; input.focus({ preventScroll: true });
      form.addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; sfx.key(); exec(v); });
      input.addEventListener("keydown", e => {
        if (pending) return;
        if ((e.key === "ArrowUp" || e.key === "F3") && hpos > 0) { input.value = hist[--hpos]; e.preventDefault(); }
        else if (e.key === "ArrowDown") { hpos = Math.min(hist.length, hpos + 1); input.value = hist[hpos] || ""; e.preventDefault(); }
      });
      el.addEventListener("click", e => {
        const b = e.target.closest("[data-dos]");
        if (b && !pending && !batchDepth && !busy) exec(b.dataset.dos);
        if (!e.target.closest("a") && !getSelection().toString() && !form.hidden) input.focus({ preventScroll: true });
      });
      document.addEventListener("keydown", onKey, true);
      return new Promise(res => { done = res; });
    },
  };
})();
