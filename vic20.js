// Commodore VIC-20 for gabimarti.github.io (GRUB > Vintage machines). Loaded on demand by site.js.
// Not an emulator and no ROM: CBM BASIC V2 rewritten in JS, on the VIC's 22x23 screen, at roughly its speed.
// Tape: LOAD loads the next program on the cassette, LOAD "NAME" looks for one; SAVE keeps yours for this visit.
// POKE 36879 (screen/border), 646 (text colour), 7680+ (screen), 38400+ (colour) and 36874-36878 (sound) do what they did.
// SYS 64802 resets.
// Esc is RUN/STOP; with no program running it (or the button) goes back to the PC.
"use strict";
(() => {
  const { esc, sfx } = GM;
  const COLS = 22, ROWS = 23, SPEED = 30;               // SPEED: statements per frame, ~1800/s like the real 1 MHz 6502
  const KW = ["END", "FOR", "NEXT", "DATA", "INPUT#", "INPUT", "DIM", "READ", "LET", "GOTO", "RUN", "IF", "RESTORE", "GOSUB",
    "RETURN", "REM", "STOP", "ON", "WAIT", "LOAD", "SAVE", "VERIFY", "DEF", "POKE", "PRINT#", "PRINT", "CONT", "LIST", "CLR",
    "CMD", "SYS", "OPEN", "CLOSE", "GET#", "GET", "NEW", "TAB(", "TO", "FN", "SPC(", "THEN", "NOT", "STEP", "AND", "OR", "SGN",
    "INT", "ABS", "USR", "FRE", "POS", "SQR", "RND", "LOG", "EXP", "COS", "SIN", "TAN", "ATN", "PEEK", "LEN", "STR$", "VAL",
    "ASC", "CHR$", "LEFT$", "RIGHT$", "MID$"].sort((a, b) => b.length - a.length);
  const FREE = 3583;
  // the cassette: my programs, oldest first
  const TAPE = [
    ["PAPER", `10 REM WRITTEN ON PAPER AT HOME
20 REM TYPED IN AT SCHOOL, 1981
30 PRINT CHR$(147);"GUESS MY NUMBER"
40 PRINT "(1 TO 100)":PRINT
50 N=INT(RND(1)*100)+1:T=0
60 INPUT "YOUR GUESS";G
70 T=T+1
80 IF G<N THEN PRINT G;"IS TOO LOW":GOTO 60
90 IF G>N THEN PRINT G;"IS TOO HIGH":GOTO 60
100 PRINT "YES! IN";T;"TRIES."
110 PRINT:PRINT "IT TOOK ME A WEEK OF"
120 PRINT "PAPER TO SEE IT RUN."`],
    ["QUIZ", `10 REM CAPITALS QUIZ
20 REM DATA, READ, ARRAYS AND RND
30 DIM C$(9),K$(9),U(9)
40 FOR I=0 TO 9:READ C$(I),K$(I):NEXT
50 PRINT CHR$(147);CHR$(28);"CAPITALS QUIZ"
60 PRINT CHR$(31);"5 QUESTIONS.":PRINT
70 S=0:FOR I=0 TO 9:U(I)=0:NEXT
80 FOR Q=1 TO 5
90 N=INT(RND(1)*10):IF U(N) THEN 90
100 U(N)=1
110 PRINT CHR$(144);"CAPITAL OF ";C$(N)
120 INPUT A$
130 IF A$=K$(N) THEN PRINT CHR$(30);"RIGHT!":S=S+1:GOTO 150
140 PRINT CHR$(28);"NO, IT IS ";K$(N)
150 PRINT CHR$(31):NEXT Q
160 PRINT "SCORE:";S;"OF 5"
170 IF S=5 THEN PRINT "PERFECT!"
180 PRINT:INPUT "AGAIN (Y/N)";A$
190 IF A$="Y" THEN 50
200 END
210 DATA FRANCE,PARIS,ITALY,ROME
220 DATA JAPAN,TOKYO,PERU,LIMA
230 DATA EGYPT,CAIRO,NORWAY,OSLO
240 DATA CANADA,OTTAWA,KENYA,NAIROBI
250 DATA CHILE,SANTIAGO,AUSTRIA,VIENNA`],
    ["TIMELINE", `10 PRINT CHR$(147);CHR$(31);
20 PRINT "1981. A VIC-20 AT"
30 PRINT "HIGH SCHOOL, AND"
40 PRINT "BASIC, MY FIRST"
50 PRINT "LANGUAGE.":PRINT
60 PRINT "NO COMPUTER AT HOME:"
70 PRINT "I WROTE PROGRAMS ON"
80 PRINT "PAPER, THEN TYPED"
90 PRINT "THEM IN HERE, HOPING"
100 PRINT "THEY WOULD RUN.":PRINT
110 PRINT "NEXT: A CASIO FX-710P"
120 PRINT "AND A ZX SPECTRUM.":PRINT
130 PRINT "THE WHOLE STORY IS IN"
140 PRINT "TIMELINE.TXT, ON THE"
150 PRINT "PC'S OTHER SYSTEMS."`],
    ["COLOURS", `10 REM SCREEN, BORDER, SOUND
20 POKE 36878,15
30 FOR C=8 TO 255 STEP 17
40 POKE 36879,C
50 POKE 36876,128+C/2
60 FOR D=1 TO 200:NEXT D
70 NEXT C
80 POKE 36876,0:POKE 36879,27`],
    ["SNOWBALL", `10 REM SNOWBALL: Z LEFT, M RIGHT
20 REM POKE TO THE SCREEN, PEEK TO CRASH
30 V=36878:T$=CHR$(97):POKE V,15
40 POKE 36879,25:PRINT CHR$(147);CHR$(31)
50 PRINT "      SNOWBALL":PRINT
60 PRINT " ROLL DOWN THE SLOPE,":PRINT " DODGE THE TREES."
70 PRINT:PRINT " Z = LEFT   M = RIGHT"
80 PRINT:PRINT " PRESS ANY KEY":POKE 198,0
90 GET K$:IF K$="" THEN 90
100 PRINT CHR$(147):FOR I=1 TO 22:PRINT:NEXT
110 X=10:D=0:W=150:P=7790+X
120 POKE P,32:POKE 36876,0
130 R=INT(RND(1)*20):PRINT CHR$(30);TAB(R);T$;
140 IF R<12 AND RND(1)<.4 THEN PRINT TAB(R+4+INT(RND(1)*5));T$;
150 PRINT
160 GET K$:POKE 198,0:IF K$="Z" AND X>0 THEN X=X-1:POKE 36876,200
170 IF K$="M" AND X<21 THEN X=X+1:POKE 36876,210
180 P=7790+X:IF PEEK(P)<>32 THEN 300
190 POKE P,81:POKE P+30720,2
200 D=D+1:IF W>40 THEN W=W-.5
210 FOR I=1 TO W:NEXT:GOTO 120
300 POKE P,42:POKE P+30720,2:POKE 36876,0
310 POKE 36877,200
320 FOR L=15 TO 0 STEP -1:POKE V,L
330 POKE 36879,26-(L AND 1)
340 FOR I=1 TO 40:NEXT:NEXT
350 POKE 36877,0:POKE 36879,25:POKE V,15
360 PRINT CHR$(19);CHR$(144);"DISTANCE:";D
370 PRINT "AGAIN? (Y/N)":POKE 198,0
380 GET K$:IF K$="" THEN 380
390 IF K$="Y" THEN 100
395 IF K$<>"N" THEN 380
400 POKE 36879,27:PRINT CHR$(147);CHR$(31);`],
  ];
  // screen codes 64-127 of the upper case/graphics set (PETSCII 96-127 and 160-191 print them)
  const SC = [..."@ABCDEFGHIJKLMNOPQRSTUVWXYZ[£]↑←", ..." !\"#$%&'()*+,-./0123456789:;<=>?",
    ..."─♠│────││╮╰╯└╲╱┌┐●▁♥│╭╳○♣│♦┼▒│π◥", ..." ▌▄▔▁▏▒▕▒◤▕├▗└┐▂┌┴┬┤▎▍▐▔▀▃┘▖▝┘▘▚"];
  const CODE = new Map(); SC.forEach((c, i) => { if (!CODE.has(c)) CODE.set(c, i); });
  const petscii = k => k >= 96 && k < 128 ? SC[k - 32] : k >= 160 && k < 192 ? SC[k - 64] : k >= 192 && k < 224 ? SC[k - 128] : k >= 224 && k < 255 ? SC[k - 128] : k === 255 ? "π" : String.fromCharCode(k).toUpperCase();
  const ERRS = { SN: "SYNTAX", US: "UNDEF'D STATEMENT", NF: "NEXT WITHOUT FOR", RG: "RETURN WITHOUT GOSUB", OD: "OUT OF DATA",
    DZ: "DIVISION BY ZERO", TM: "TYPE MISMATCH", IQ: "ILLEGAL QUANTITY", BS: "BAD SUBSCRIPT", DD: "REDIM'D ARRAY",
    LS: "STRING TOO LONG", OV: "OVERFLOW", OM: "OUT OF MEMORY", CN: "CAN'T CONTINUE", UF: "UNDEF'D FUNCTION",
    FNF: "FILE NOT FOUND", DNP: "DEVICE NOT PRESENT", ID: "ILLEGAL DIRECT" };
  const err = c => { const e = new Error(ERRS[c]); e.basic = true; return e; };
  const BREAK = { brk: true }, RESET = { reset: true };
  // PETSCII control codes that PRINT CHR$() understands: colours, cursor moves, reverse, clear/home
  const COLOR = { 144: 0, 5: 1, 28: 2, 159: 3, 156: 4, 30: 5, 31: 6, 158: 7 };

  let el, scr, bd, inp, done, cells, row, col, fg, rvs, reg = 27, vol = 0, keys = [], queue = [], busy = false, alive = false;
  let prog = new Map(), toksCache = new Map(), vars = {}, arrs = {}, fns = {}, fors = [], subs = [], data = [], dptr = 0;
  let L = -1, T = [], P = 0, jmp = false, ended = false, stopReq = false, cont = null, tapePos = 0, saved = [], t0 = 0, inputCb = null, line = "", keyWait = null;

  // ---------- screen ----------
  const blank = () => ({ c: " ", f: fg ?? 6, r: false });
  const clear = () => { cells = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, blank)); row = col = 0; };
  function scroll() { cells.shift(); cells.push(Array.from({ length: COLS }, blank)); row = ROWS - 1; }
  function nl() { col = 0; if (++row >= ROWS) scroll(); }
  function put(ch) { cells[row][col] = { c: ch, f: fg, r: rvs }; if (++col >= COLS) nl(); }
  function out(s) {
    for (const ch of String(s)) {
      const k = ch.charCodeAt(0);
      if (ch === "\n" || k === 13) { nl(); rvs = false; }
      else if (k === 147) clear();
      else if (k === 19) row = col = 0;
      else if (k === 17) { if (++row >= ROWS) scroll(); }
      else if (k === 145) row = Math.max(0, row - 1);
      else if (k === 29) { if (++col >= COLS) nl(); }
      else if (k === 157) { if (col) col--; else if (row) { row--; col = COLS - 1; } }
      else if (k === 18) rvs = true;
      else if (k === 146) rvs = false;
      else if (k in COLOR) fg = COLOR[k];
      else if (k >= 32) put(petscii(k));
    }
    draw();
  }
  const say = s => out(s + "\n");
  let drawQ = false;                                   // repaint once per frame, however many PRINTs and POKEs
  const draw = () => { if (!drawQ) { drawQ = true; requestAnimationFrame(paint); } };
  function paint() {
    drawQ = false;
    if (!alive) return;
    const inv = !(reg & 8), showCur = !busy || inputCb;
    let h = "";
    for (let y = 0; y < ROWS; y++) {
      let run = "", cls = "";
      for (let x = 0; x < COLS; x++) {
        const c = cells[y][x], cur = showCur && y === row && x === col;
        const k = cur ? `vcur vr${fg}` : ((c.r !== inv) ? "vr" : "vf") + c.f;
        if (k !== cls) { if (run) h += `<span class="${cls}">${esc(run)}</span>`; run = ""; cls = k; }
        run += c.c;
      }
      h += `<span class="${cls}">${esc(run)}</span>\n`;
    }
    scr.innerHTML = h;
    scr.className = "vic-scr vs" + (reg >> 4);
    bd.className = "vic-bd vs" + (reg & 7);
  }

  // ---------- sound: 3 voices + noise POKEd at 36874-36877 (on while bit 7 is set), volume at 36878 ----------
  let vreg = [0, 0, 0, 0], vox = [null, null, null, null];
  function sound(i) {
    const v = vreg[i], f = v > 127 && vol ? Math.min(8000, [3995, 7990, 15980, 31960][i] / (128 - (v & 127))) : 0;
    if (!f) { vox[i]?.stop(); vox[i] = null; return; }
    if (vox[i]) vox[i].set(f, .005 * vol); else vox[i] = sfx.hold(f, .005 * vol, i === 3 ? "noise" : "square");
  }
  const voice = (a, v) => { vreg[a - 36874] = v; sound(a - 36874); };
  const hush = () => { vreg = [0, 0, 0, 0]; for (let i = 0; i < 4; i++) sound(i); };

  // ---------- tokenizer: keywords are found anywhere, like the real cruncher (FORI=1TO9 works) ----------
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " ") { i++; continue; }
      if (c === '"') { let j = s.indexOf('"', i + 1); if (j < 0) j = s.length; t.push({ k: "s", v: s.slice(i + 1, j) }); i = j + 1; continue; }
      if (/[0-9.]/.test(c)) {
        const m = /^(\d*\.?\d*)(E[+-]?\d+)?/.exec(s.slice(i));
        t.push({ k: "n", v: m[1] === "." ? 0 : parseFloat(m[0]) }); i += m[0].length; continue;
      }
      if (c === "?") { t.push({ k: "k", v: "PRINT" }); i++; continue; }
      if (c === "π") { t.push({ k: "n", v: Math.PI }); i++; continue; }
      const kw = KW.find(k => s.startsWith(k, i));
      if (kw) {
        t.push({ k: "k", v: kw }); i += kw.length;
        if (kw === "REM") { t.push({ k: "r", v: s.slice(i) }); break; }
        if (kw === "DATA") {
          let j = i, q = false;
          while (j < s.length && (q || s[j] !== ":")) { if (s[j] === '"') q = !q; j++; }
          t.push({ k: "d", v: s.slice(i, j) }); i = j;
        }
        continue;
      }
      if (/[A-Z]/.test(c)) {
        let j = i + 1;
        while (j < s.length && /[A-Z0-9]/.test(s[j]) && !KW.some(k => s.startsWith(k, j))) j++;
        let name = s.slice(i, j);
        if (s[j] === "$" || s[j] === "%") name += s[j++];
        t.push({ k: "v", v: name }); i = j; continue;
      }
      t.push({ k: "o", v: c }); i++;
    }
    return t;
  }
  const toks = n => { if (!toksCache.has(n)) toksCache.set(n, tokenize(prog.get(n))); return toksCache.get(n); };
  const lines = () => [...prog.keys()].sort((a, b) => a - b);
  const size = () => { let n = 0; for (const [, s] of prog) n += s.length + 5; return n; };

  // ---------- expressions ----------
  const peek = () => T[P], is = (k, v) => P < T.length && T[P].k === k && (v === undefined || T[P].v === v);
  const op = v => is("o", v), kw = v => is("k", v);
  function need(k, v) { if (!is(k, v)) throw err("SN"); P++; }
  const num = x => { if (typeof x !== "number") throw err("TM"); return x; };
  const str = x => { if (typeof x !== "string") throw err("TM"); return x; };
  const int = (x, lo, hi) => { x = Math.floor(num(x)); if (x < lo || x > hi) throw err("IQ"); return x; };
  const int16 = x => int(x, -32768, 32767);
  const vkey = n => { const s = /[$%]$/.test(n) ? n.slice(-1) : ""; return n.replace(/[$%]$/, "").slice(0, 2) + s; };
  function fmt(n) {                                     // CBM style: " 5", "-1.5", " .5", " 1E+10"
    if (!isFinite(n)) throw err("OV");
    const a = Math.abs(n);
    let s;
    if (a !== 0 && (a >= 1e9 || a < .01)) {
      let [m, e] = a.toExponential(8).split("e");
      m = m.replace(/\.?0+$/, "");
      s = `${m}E${+e < 0 ? "-" : "+"}${String(Math.abs(+e)).padStart(2, "0")}`;
    } else s = String(+a.toPrecision(9)).replace(/^0\./, ".");
    return (n < 0 ? "-" : " ") + s;
  }
  const expr = () => orE();
  function orE() { let a = andE(); while (kw("OR")) { P++; a = int16(a) | int16(andE()); } return a; }
  function andE() { let a = notE(); while (kw("AND")) { P++; a = int16(a) & int16(notE()); } return a; }
  function notE() { if (kw("NOT")) { P++; return ~int16(notE()); } return rel(); }
  function rel() {
    let a = add();
    for (;;) {
      let o = "";
      while (op("<") || op(">") || op("=")) o += T[P++].v;
      if (!o) return a;
      const b = add();
      if (typeof a !== typeof b) throw err("TM");
      const r = { "=": a === b, "<": a < b, ">": a > b, "<=": a <= b, "=<": a <= b, ">=": a >= b, "=>": a >= b, "<>": a !== b, "><": a !== b }[o];
      if (r === undefined) throw err("SN");
      a = r ? -1 : 0;
    }
  }
  function add() {
    let a = mul();
    while (op("+") || op("-")) {
      const o = T[P++].v, b = mul();
      if (o === "+" && typeof a === "string") { a = a + str(b); if (a.length > 255) throw err("LS"); }
      else a = o === "+" ? num(a) + num(b) : num(a) - num(b);
    }
    return a;
  }
  function mul() {
    let a = unary();
    while (op("*") || op("/")) {
      const o = T[P++].v, b = num(unary());
      if (o === "/" && b === 0) throw err("DZ");
      a = o === "*" ? num(a) * b : num(a) / b;
    }
    return a;
  }
  function unary() { if (op("-")) { P++; return -num(unary()); } if (op("+")) { P++; return unary(); } return pow(); }
  function pow() { let a = prim(); while (op("^") || op("↑")) { P++; a = Math.pow(num(a), num(unary())); } return a; }
  function args(n) { const a = [expr()]; while (a.length < n && op(",")) { P++; a.push(expr()); } need("o", ")"); return a; }
  function prim() {
    const t = peek();
    if (!t) throw err("SN");
    if (t.k === "n" || t.k === "s") { P++; return t.v; }
    if (op("(")) { P++; const v = expr(); need("o", ")"); return v; }
    if (t.k === "v") { P++; return getVar(t.v); }
    if (t.k !== "k") throw err("SN");
    P++;
    const f = t.v;
    if (f === "FN") { const n = peek(); need("v"); need("o", "("); const x = expr(); need("o", ")"); return callFn(n.v, x); }
    need("o", "(");
    if (f === "MID$") { const a = args(3), s = str(a[0]), b = int(a[1], 1, 255), n = a.length > 2 ? int(a[2], 0, 255) : 255; return s.substr(b - 1, n); }
    if (f === "LEFT$" || f === "RIGHT$") { const [s, n] = args(2), k = int(n, 0, 255); return f === "LEFT$" ? str(s).slice(0, k) : (k ? str(s).slice(-k) : ""); }
    const [x] = args(1);
    switch (f) {
      case "SGN": return Math.sign(num(x));
      case "INT": return Math.floor(num(x));
      case "ABS": return Math.abs(num(x));
      case "SQR": if (num(x) < 0) throw err("IQ"); return Math.sqrt(x);
      case "RND": return Math.random();
      case "LOG": if (num(x) <= 0) throw err("IQ"); return Math.log(x);
      case "EXP": return Math.exp(num(x));
      case "COS": return Math.cos(num(x));
      case "SIN": return Math.sin(num(x));
      case "TAN": return Math.tan(num(x));
      case "ATN": return Math.atan(num(x));
      case "PEEK": return peekMem(int(x, 0, 65535));
      case "LEN": return str(x).length;
      case "STR$": return fmt(num(x));
      case "VAL": { const m = /^[-+]?\d*\.?\d*(E[-+]?\d+)?/.exec(str(x).replace(/ /g, "")); return parseFloat(m[0]) || 0; }
      case "ASC": if (!str(x).length) throw err("IQ"); return x.charCodeAt(0);
      case "CHR$": return String.fromCharCode(int(x, 0, 255));
      case "FRE": return Math.max(0, FREE - size());
      case "POS": return col;
      default: throw err("IQ");                       // USR: there is no machine code under this BASIC
    }
  }
  function getVar(n) {
    if (op("(")) return arrRef(n).get();
    if (n === "TI") return Math.floor((Date.now() - t0) * .06);
    if (vkey(n) === "TI$") { const s = Math.floor((Date.now() - t0) / 1000) % 86400; return [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, "0")).join(""); }
    if (n === "ST") return 0;
    const k = vkey(n);
    return k in vars ? vars[k] : (k.endsWith("$") ? "" : 0);
  }
  function setVar(n, v) {
    const k = vkey(n);
    if (k.endsWith("$")) str(v); else num(v);
    if (k === "TI$") { if (!/^\d{6}$/.test(v)) throw err("IQ"); t0 = Date.now() - (+v.slice(0, 2) * 3600 + +v.slice(2, 4) * 60 + +v.slice(4)) * 1000; return; }
    if (k === "TI" || k === "ST") throw err("SN");
    vars[k] = k.endsWith("%") ? int16(v) : v;
  }
  function arrRef(n) {
    need("o", "(");
    const ix = [int(expr(), 0, 32767)];
    while (op(",")) { P++; ix.push(int(expr(), 0, 32767)); }
    need("o", ")");
    const k = vkey(n);
    if (!arrs[k]) arrs[k] = mkArr(k, ix.map(() => 10));
    const a = arrs[k];
    if (ix.length !== a.dims.length || ix.some((v, i) => v > a.dims[i])) throw err("BS");
    const at = ix.reduce((s, v, i) => s * (a.dims[i] + 1) + v, 0);
    return { str: k.endsWith("$"), get: () => a.d[at], set: v => { if (k.endsWith("$")) str(v); else num(v); a.d[at] = k.endsWith("%") ? int16(v) : v; } };
  }
  function mkArr(k, dims) {
    const n = dims.reduce((s, d) => s * (d + 1), 1);
    if (n > 4000) throw err("OM");
    return { dims, d: new Array(n).fill(k.endsWith("$") ? "" : 0) };
  }
  function callFn(n, x) {
    const f = fns[vkey(n)];
    if (!f) throw err("UF");
    const k = vkey(f.p), had = k in vars, keep = vars[k], sT = T, sP = P;
    vars[k] = num(x); T = f.t; P = f.at;
    try { return expr(); } finally { T = sT; P = sP; if (had) vars[k] = keep; else delete vars[k]; }
  }
  const ref = t => op("(") ? arrRef(t.v) : { str: vkey(t.v).endsWith("$"), set: v => setVar(t.v, v) };

  // ---------- memory: only the addresses that mattered ----------
  const SCREEN = 7680, COLRAM = 38400, CELLS = COLS * ROWS;   // unexpanded VIC: screen and colour memory
  function peekMem(a) {
    if (a >= SCREEN && a < SCREEN + CELLS) { const c = cells[(a - SCREEN) / COLS | 0][(a - SCREEN) % COLS]; return (CODE.get(c.c) ?? 32) + (c.r ? 128 : 0); }
    if (a >= COLRAM && a < COLRAM + CELLS) return cells[(a - COLRAM) / COLS | 0][(a - COLRAM) % COLS].f;
    if (a >= 36874 && a <= 36877) return vreg[a - 36874];
    if (a === 36878) return vol;
    if (a === 36879) return reg;
    if (a === 646) return fg;
    if (a === 197) return keys.length ? 0 : 64;
    if (a === 198) return keys.length;
    if (a === 162) return Math.floor((Date.now() - t0) * .06) & 255;
    return 0;
  }
  function poke(a, v) {
    if (a >= SCREEN && a < SCREEN + CELLS) { const y = (a - SCREEN) / COLS | 0, x = (a - SCREEN) % COLS; cells[y][x] = { c: SC[v & 127], f: cells[y][x].f, r: v > 127 }; draw(); }
    else if (a >= COLRAM && a < COLRAM + CELLS) { cells[(a - COLRAM) / COLS | 0][(a - COLRAM) % COLS].f = v & 7; draw(); }
    else if (a === 36879) { reg = v; draw(); }
    else if (a === 646) fg = v & 7;
    else if (a === 36878) { vol = v & 15; for (let i = 0; i < 4; i++) sound(i); }
    else if (a >= 36874 && a <= 36877) voice(a, v);
    else if (a === 198 && v === 0) keys = [];
  }

  // ---------- statements ----------
  const endOfStmt = () => P >= T.length || op(":");
  function goLine(n) { if (!prog.has(n)) throw err("US"); L = n; T = toks(n); P = 0; jmp = true; }
  const back = at => { [L, T, P] = at; jmp = true; };
  function nextLine() { const ls = lines(), i = ls.indexOf(L); return i >= 0 && i + 1 < ls.length ? ls[i + 1] : null; }
  function lineNum() { const t = peek(); if (!t || t.k !== "n") throw err("SN"); P++; return t.v; }
  function splitData(s) { const r = []; let cur = "", q = false; for (const ch of s) { if (ch === '"') q = !q; else if (ch === "," && !q) { r.push(cur); cur = ""; } else cur += ch; } r.push(cur); return r.map(v => v.trim()); }
  function clr() {
    vars = {}; arrs = {}; fns = {}; fors = []; subs = []; dptr = 0; data = [];
    for (const n of lines()) for (const t of toks(n)) if (t.k === "d") data.push(...splitData(t.v));
  }
  function printStmt() {
    let nlEnd = true;
    while (!endOfStmt()) {
      nlEnd = true;
      if (op(";")) { P++; nlEnd = false; continue; }
      if (op(",")) { P++; nlEnd = false; out(" ".repeat(col < 11 ? 11 - col : COLS - col)); continue; }
      if (kw("TAB(") || kw("SPC(")) {
        const tab = T[P++].v === "TAB(", n = int(expr(), 0, 255); need("o", ")");
        out(" ".repeat(tab ? Math.max(0, n - col) : n)); nlEnd = false; continue;
      }
      const v = expr();
      out(typeof v === "number" ? fmt(v) + " " : v);
      nlEnd = !(op(";") || op(","));
    }
    if (nlEnd) out("\n");
  }
  const askLine = prompt => new Promise(res => { out(prompt); inputCb = res; draw(); });
  async function inputStmt() {
    if (L < 0) throw err("ID");
    let prompt = "";
    if (is("s")) { prompt = T[P++].v; need("o", ";"); }
    const targets = [];
    do { const t = peek(); need("v"); targets.push(ref(t)); } while (op(",") && ++P);
    const vals = [];
    let first = true;
    while (vals.length < targets.length) {
      const got = splitData(await askLine(first ? prompt + "? " : "?? ")); first = false;
      if (stopReq || !alive) throw BREAK;
      vals.push(...got);
    }
    if (vals.length > targets.length) say("?EXTRA IGNORED");
    targets.forEach((t, i) => {
      const v = vals[i];
      if (t.str) return t.set(v);
      const n = parseFloat(v);
      if (v !== "" && isNaN(n)) { say("?REDO FROM START"); throw { redo: true }; }
      t.set(n || 0);
    });
  }
  async function hiss(ms) {                             // the datasette is silent: the tape never reached the TV speaker
    for (let t = 0; t < ms; t += 60) {
      if (stopReq || !alive) throw BREAK;
      await new Promise(r => setTimeout(r, 60));
    }
  }
  const nextKey = () => new Promise(res => { keyWait = res; });
  async function tape(cmd, name) {
    say(cmd === "SAVE" ? "PRESS RECORD & PLAY ON TAPE" : "PRESS PLAY ON TAPE");
    if (await nextKey() === "\x1b") throw BREAK;
    say("OK");
    if (cmd === "SAVE") {
      say(`SAVING ${name}`);
      await hiss(1500);
      const i = saved.findIndex(p => p[0] === name), p = [name, lines().map(n => `${n} ${prog.get(n)}`).join("\n")];
      if (i >= 0) saved[i] = p; else saved.push(p);
      return;
    }
    const all = [...TAPE, ...saved];
    say(name ? `SEARCHING FOR ${name}` : "SEARCHING");
    await hiss(900);
    for (let n = 0; n < all.length; n++) {
      const p = all[(tapePos + n) % all.length];
      say(`FOUND ${p[0]}`);
      await hiss(600);
      if (name && p[0] !== name) continue;
      tapePos = (tapePos + n + 1) % all.length;
      if (cmd === "VERIFY") { say("VERIFYING"); await hiss(1200); say("OK"); return; }
      say("LOADING");
      await hiss(1800);
      prog = new Map(); toksCache = new Map();
      for (const ln of p[1].split("\n")) { const m = /^(\d+) ?(.*)$/.exec(ln); if (m) prog.set(+m[1], m[2]); }
      clr();
      return;
    }
    throw err("FNF");
  }
  function device() { const n = int(expr(), 0, 255); if ([1, 4, 8].includes(n)) throw err("DNP"); throw err("IQ"); }
  async function stmt() {
    const t = peek();
    if (t.k === "v") { P++; const r = op("(") ? arrRef(t.v) : null; need("o", "="); const v = expr(); return r ? r.set(v) : setVar(t.v, v); }
    if (t.k !== "k") throw err("SN");
    P++;
    switch (t.v) {
      case "LET": if (!is("v")) throw err("SN"); return stmt();
      case "PRINT": return printStmt();
      case "INPUT": return inputStmt();
      case "REM": P = T.length; return;
      case "DATA": P++; return;
      case "END": ended = true; return;
      case "STOP": throw BREAK;
      case "GOTO": return goLine(lineNum());
      case "GOSUB": { const n = lineNum(); if (subs.length > 23) throw err("OM"); subs.push([L, T, P]); return goLine(n); }
      case "RETURN": if (!subs.length) throw err("RG"); return back(subs.pop());
      case "IF": {
        const c = expr();
        if (kw("THEN")) P++; else if (!kw("GOTO")) throw err("SN");
        if (!(typeof c === "string" ? c.length : c)) { P = T.length; return; }
        if (kw("GOTO")) { P++; return goLine(lineNum()); }
        if (is("n")) return goLine(lineNum());
        return stmt();
      }
      case "ON": {
        const n = int(expr(), 0, 255), sub = kw("GOSUB");
        if (!sub && !kw("GOTO")) throw err("SN");
        P++;
        const ls = [lineNum()]; while (op(",")) { P++; ls.push(lineNum()); }
        if (n < 1 || n > ls.length) return;
        if (sub) subs.push([L, T, P]);
        return goLine(ls[n - 1]);
      }
      case "FOR": {
        const v = peek(); need("v"); need("o", "="); setVar(v.v, num(expr()));
        need("k", "TO"); const lim = num(expr());
        let step = 1; if (kw("STEP")) { P++; step = num(expr()); }
        const k = vkey(v.v), i = fors.findIndex(f => f.k === k); if (i >= 0) fors.length = i;
        if (fors.length > 9) throw err("OM");
        fors.push({ k, v: v.v, lim, step, at: [L, T, P] });
        return;
      }
      case "NEXT":
        for (;;) {
          let f;
          if (is("v")) { const k = vkey(T[P++].v), i = fors.findIndex(x => x.k === k); if (i < 0) throw err("NF"); fors.length = i + 1; f = fors[i]; }
          else { if (!fors.length) throw err("NF"); f = fors[fors.length - 1]; }
          const v = (vars[f.k] ?? 0) + f.step; setVar(f.v, v);
          if (f.step >= 0 ? v <= f.lim : v >= f.lim) return back(f.at);
          fors.pop();
          if (!op(",")) return;
          P++;
        }
      case "DIM":
        do {
          const v = peek(); need("v"); need("o", "(");
          const d = [int(expr(), 0, 32767)]; while (op(",")) { P++; d.push(int(expr(), 0, 32767)); } need("o", ")");
          const k = vkey(v.v); if (arrs[k]) throw err("DD"); arrs[k] = mkArr(k, d);
        } while (op(",") && ++P);
        return;
      case "READ":
        do {
          const v = peek(); need("v"); const r = ref(v);
          if (dptr >= data.length) throw err("OD");
          const s = data[dptr++];
          if (r.str) r.set(s); else { const n = parseFloat(s); if (s !== "" && isNaN(n)) throw err("SN"); r.set(n || 0); }
        } while (op(",") && ++P);
        return;
      case "RESTORE": dptr = 0; return;
      case "DEF": {
        if (L < 0) throw err("ID");
        need("k", "FN"); const n = peek(); need("v"); need("o", "("); const p = peek(); need("v"); need("o", ")"); need("o", "=");
        fns[vkey(n.v)] = { p: p.v, t: T, at: P }; while (!endOfStmt()) P++; return;
      }
      case "POKE": { const a = int(expr(), 0, 65535); need("o", ","); poke(a, int(expr(), 0, 255)); return; }
      case "WAIT": expr(); need("o", ","); expr(); if (op(",")) { P++; expr(); } return;
      case "SYS": { const a = int(expr(), 0, 65535); if (a === 64802 || a === 65234) throw RESET; return; }
      case "GET": {
        if (L < 0) throw err("ID");
        const v = peek(); need("v"); const r = ref(v), k = keys.shift() || "";
        r.set(r.str ? k : (/^\d$/.test(k) ? +k : 0));
        return;
      }
      case "CLR": clr(); return;
      case "NEW": prog = new Map(); toksCache = new Map(); clr(); ended = true; return;
      case "RUN": { clr(); const ls = lines(); if (!ls.length) { ended = true; return; } return goLine(is("n") ? lineNum() : ls[0]); }
      case "CONT": { if (!cont || L >= 0) throw err("CN"); const c = cont; cont = null; return back(c); }
      case "LIST": {
        let a = 0, b = 63999;
        if (is("n")) a = b = lineNum();
        if (op("-")) { P++; b = is("n") ? lineNum() : 63999; }
        for (const n of lines()) if (n >= a && n <= b) say(`${n} ${prog.get(n)}`);
        ended = true; return;
      }
      case "LOAD": case "SAVE": case "VERIFY": {
        const name = is("s") ? T[P++].v : "";
        if (op(",")) { P++; device(); }
        await tape(t.v, name);
        if (t.v === "LOAD" && L >= 0 && lines().length) return goLine(lines()[0]);   // LOAD inside a program chains it
        ended = true; return;
      }
      case "OPEN": case "CLOSE": case "CMD": case "PRINT#": case "INPUT#": case "GET#": return device();
      default: throw err("SN");
    }
  }
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  async function run(lineToks) {                        // run a direct-mode line; RUN and GOTO hop into the program
    L = -1; T = lineToks; P = 0; ended = false; stopReq = false; busy = true; draw();
    let n = 0;
    try {
      for (;;) {
        if (P >= T.length) { if (L < 0) break; const nx = nextLine(); if (nx === null) break; goLine(nx); continue; }
        if (op(":")) { P++; continue; }
        const at = [L, T, P];
        jmp = false;
        try { await stmt(); }
        catch (e) { if (e.redo) { [L, T, P] = at; continue; } throw e; }
        if (ended || !alive) break;
        if (!jmp && !endOfStmt()) throw err("SN");
        if (++n % SPEED === 0) { await frame(); if (stopReq) throw BREAK; }
      }
    } catch (e) {
      if (e === RESET) { busy = false; return power(); }
      if (!alive) return;
      if (e === BREAK) { hush(); cont = L >= 0 ? [L, T, P] : null; if (col) out("\n"); say("BREAK" + (L >= 0 ? ` IN ${L}` : "")); }
      else if (e.basic) { if (col) out("\n"); say(`?${e.message}  ERROR` + (L >= 0 ? ` IN ${L}` : "")); }
      else throw e;
    }
    busy = false; inputCb = null;
    if (alive) say("READY.");
  }
  async function enter(s) {                             // a typed line: stored (with a number) or run at once
    const m = /^\s*(\d+)\s?(.*)$/.exec(s);
    if (m) {
      const n = +m[1], body = m[2].trimEnd();
      if (n > 63999) { say("?SYNTAX  ERROR"); return say("READY."); }
      toksCache.delete(n);
      if (body) prog.set(n, body); else prog.delete(n);
      cont = null; return draw();
    }
    if (s.trim()) await run(tokenize(s));
  }

  // ---------- keyboard: a queue, so pasted programs type themselves in ----------
  function edit(k) {                                   // the line editor; returns the line on RETURN
    if (k === "\r") { const s = line; line = ""; out("\n"); return s.toUpperCase(); }
    if (k === "\b") { if (line) { line = line.slice(0, -1); out(String.fromCharCode(157)); cells[row][col] = blank(); draw(); } }
    else if (k === "home") out(String.fromCharCode(19));
    else if (k === "clr") out(String.fromCharCode(147));
    else if (k.length === 1 && line.length < 88) { line += k; out(k.toUpperCase()); }
    return null;
  }
  function feed(k) {
    if (!alive) return;
    if (keyWait) { const w = keyWait; keyWait = null; return w(k); }
    if (busy) {                                         // a program runs: RUN/STOP, INPUT's line, or GET's buffer
      if (k === "\x1b") { stopReq = true; if (inputCb) { const cb = inputCb; inputCb = null; cb(""); } return; }
      if (inputCb) { const s = edit(k); if (s !== null) { const cb = inputCb; inputCb = null; cb(s); } return; }
      if (k.length === 1 && keys.length < 10) keys.push(k.toUpperCase());
      return;
    }
    queue.push(k); pump();
  }
  async function pump() {                               // direct mode: keys (typed or pasted) in order, one line at a time
    if (pump.on) return;
    pump.on = true;
    while (queue.length && alive && !busy) {
      const k = queue.shift();
      if (k === "\x1b") { pump.on = false; return exit(); }
      const s = edit(k);
      if (s !== null) await enter(s);
    }
    pump.on = false;
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    const k = { Enter: "\r", Backspace: "\b", Escape: "\x1b", Home: e.shiftKey ? "clr" : "home" }[e.key];
    e.stopPropagation();
    if (k) { e.preventDefault(); feed(k); }
    else if (e.key.length === 1 && e.target !== inp) { e.preventDefault(); feed(e.key); }
  }
  function onInput() {                                  // what landed in the hidden input (phones, paste)
    const v = inp.value; inp.value = "";
    for (const ch of v) feed(ch === "\n" ? "\r" : ch);
  }
  function onPaste(e) {
    const s = e.clipboardData?.getData("text");
    if (!s) return;
    e.preventDefault();
    for (const ch of s.replace(/\r\n?/g, "\n")) feed(ch === "\n" ? "\r" : ch);
  }
  const onClick = e => {
    if (e.target.closest("[data-vic-stop]")) feed("\x1b");
    else if (e.target.closest("[data-vic-exit]")) return exit();
    inp.focus({ preventScroll: true });
  };
  function power() {                                    // the power-on screen
    prog = new Map(); toksCache = new Map(); clr(); reg = 27; fg = 6; rvs = false; vol = 0; hush(); line = ""; cont = null; keys = [];
    t0 = Date.now(); clear();
    out("**** CBM BASIC V2 ****"); say(`${FREE} BYTES FREE`); say(""); say("READY.");
  }
  function exit() {
    if (!alive) return;
    alive = false; stopReq = true; queue = []; hush();
    document.removeEventListener("keydown", onKey, true);
    if (keyWait) { const w = keyWait; keyWait = null; w("\x1b"); }
    if (inputCb) { const cb = inputCb; inputCb = null; cb(""); }
    done();
  }

  GM.vic20 = {
    open(container) {
      el = document.createElement("div"); el.className = "vic"; container.append(el);
      el.innerHTML = `<div class="vic-bd"><pre class="vic-scr"></pre></div>
<input class="vic-in" aria-label="VIC-20 keyboard" autocomplete="off" autocapitalize="characters" spellcheck="false">
<p class="vic-keys"><button type="button" data-vic-stop>RUN/STOP</button> <button type="button" data-vic-exit>⏏ PC</button></p>
<p class="vic-help">LOAD, then any key: the next program on the tape · LOAD "SNOWBALL" · LIST · RUN · Esc = RUN/STOP<br>Try POKE 36879,8 · POKE 36878,15:POKE 36876,220 (POKE 36876,0 stops it) · POKE 7680,83<br>Simulated, not emulated: CBM BASIC V2 rewritten for this PC, no ROM inside.</p>`;
      bd = el.querySelector(".vic-bd"); scr = el.querySelector(".vic-scr"); inp = el.querySelector(".vic-in");
      alive = true; busy = false; queue = []; pump.on = false; keyWait = null; inputCb = null; tapePos = 0; saved = [];
      power();
      document.addEventListener("keydown", onKey, true);
      inp.addEventListener("input", onInput);
      inp.addEventListener("paste", onPaste);
      el.addEventListener("click", onClick);
      inp.focus({ preventScroll: true });
      return new Promise(res => { done = res; });
    },
  };
})();
