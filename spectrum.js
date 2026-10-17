// Sinclair ZX Spectrum 48K for gabimarti.github.io (GRUB > Vintage machines). Loaded on demand by site.js.
// Not an emulator and no ROM: Sinclair BASIC rewritten in JS. Keywords are typed in full (PRINT, GO TO...), in any case.
// Screen: 256x192 pixels with 8x8 colour attributes (and their clash), PLOT/DRAW/CIRCLE, UDGs (POKE USR "a"), BEEP.
// Tape: LOAD "" loads the next program, with the border stripes and the noise; LOAD "name" looks for one; MERGE adds
// its lines to the ones in memory; SAVE keeps yours for this visit. Esc is BREAK; when idle it goes back to the PC.
"use strict";
(() => {
  const { sfx, sleep } = GM;
  const W = 256, H = 192, BD = 32, S = 3, SPEED = 5;   // BD: border; S: canvas pixels per Spectrum pixel; SPEED: statements per frame (~300/s)
  const PAL = [[0, 0, 0], [0, 0, 215], [215, 0, 0], [215, 0, 215], [0, 215, 0], [0, 215, 215], [215, 215, 0], [215, 215, 215]];
  const PALB = PAL.map(c => c.map(v => v && 255));
  const css = (c, b) => `rgb(${(b ? PALB : PAL)[c].join()})`;
  const FUNCS = new Set(["RND", "INKEY$", "PI", "FN", "POINT", "SCREEN$", "ATTR", "VAL$", "CODE", "VAL", "LEN", "SIN", "COS", "TAN",
    "ASN", "ACS", "ATN", "LN", "EXP", "INT", "SQR", "SGN", "ABS", "PEEK", "IN", "USR", "STR$", "CHR$", "NOT", "BIN"]);
  const WORDS = new Set([...FUNCS, "AND", "OR", "PRINT", "LET", "IF", "THEN", "GO", "GOTO", "GOSUB", "RETURN", "FOR", "TO", "STEP",
    "NEXT", "INPUT", "DIM", "READ", "DATA", "RESTORE", "RANDOMIZE", "CLS", "BORDER", "INK", "PAPER", "FLASH", "BRIGHT", "INVERSE",
    "OVER", "BEEP", "PAUSE", "PLOT", "DRAW", "CIRCLE", "POKE", "STOP", "REM", "RUN", "CLEAR", "NEW", "LIST", "LLIST", "LPRINT",
    "CONT", "LOAD", "SAVE", "VERIFY", "MERGE", "DEF", "AT", "TAB", "LINE", "OUT", "COPY", "CAT", "FORMAT", "MOVE", "ERASE", "OPEN", "CLOSE"]);
  const COLOURS = ["INK", "PAPER", "FLASH", "BRIGHT", "INVERSE", "OVER"];
  const REP = { 0: "OK", 1: "NEXT without FOR", 2: "Variable not found", 3: "Subscript wrong", 4: "Out of memory", 5: "Out of screen",
    6: "Number too big", 7: "RETURN without GO SUB", 9: "STOP statement", A: "Invalid argument", B: "Integer out of range",
    C: "Nonsense in BASIC", D: "BREAK - CONT repeats", E: "Out of DATA", F: "Invalid file name", I: "FOR without NEXT",
    K: "Invalid colour", L: "BREAK into program", P: "FN without DEF", Q: "Parameter error", R: "Tape loading error" };
  const err = c => ({ zx: String(c) }), RESET = { reset: true };

  // ---------- the tape ----------
  // "La caza del submarino" (c. 1985): the listing was printed with lines missing. The tape has it as printed, and the
  // phone call where the author dictated the missing lines (which MERGE also brings in).
  const GAME = `1 REM LA CAZA DEL SUBMARINO
2 REM G. Marti - revista ZX, c.1985
3 REM Reconstruido en 2026 de memoria: el listado original se perdio
10 GO SUB 900
20 BORDER 1: PAPER 5: INK 0: CLS
30 LET c=5: LET t=0: LET mr=0: LET sr=1+INT (RND*8): LET sc=1+INT (RND*8)
40 GO SUB 800
100 IF mr THEN PRINT AT 2+2*mr,3*mc; PAPER 1;"  ": LET mr=0
110 GO SUB 850
120 INPUT "Coordenada (ej. C5): ";a$
130 IF LEN a$<>2 THEN GO TO 120
140 LET f=CODE a$: IF f>96 THEN LET f=f-32
150 LET q=f-64: LET r=CODE a$(2)-48
160 IF q<1 OR q>8 OR r<1 OR r>8 THEN GO TO 120
170 LET c=c-1: LET t=t+1: GO SUB 870
180 FOR i=1 TO 3: BORDER 2: BEEP .02,-10-i*5: BORDER 1: NEXT i
190 IF r=sr AND q=sc THEN GO TO 500
200 PRINT AT 2+2*r,3*q; PAPER 1; INK 6;CHR$ 146;CHR$ 146: LET mr=r: LET mc=q
210 IF ABS (r-sr)<=1 AND ABS (q-sc)<=1 THEN PRINT AT 20,0; INK 2;"Cerca! El sonar lo ha oido.";AT 21,0;"Ganas una carga extra.";: LET c=c+1: BEEP .1,12: GO TO 230
220 PRINT AT 20,0;"Agua. Ni rastro del submarino.";
230 GO SUB 600
240 IF c>0 THEN GO TO 100
250 GO TO 700
500 PRINT AT 2+2*sr,3*sc; PAPER 1; INK 7; FLASH 1;CHR$ 144;CHR$ 145
510 FOR i=1 TO 8: BORDER 2: BEEP .03,-20+i*3: BORDER 6: NEXT i: BORDER 1
520 PRINT AT 20,0; INK 2;"HUNDIDO! en ";t;" lanzamientos";
530 GO SUB 850: GO TO 720
600 REM el submarino se mueve a una casilla vecina
610 LET nr=sr+INT (RND*3)-1: LET nc=sc+INT (RND*3)-1
620 IF nr<1 OR nr>8 OR nc<1 OR nc>8 OR (nr=sr AND nc=sc) THEN GO TO 610
630 LET sr=nr: LET sc=nc: RETURN
700 GO SUB 850: PRINT AT 20,0;"Sin cargas. El submarino escapa";
710 PRINT AT 2+2*sr,3*sc; PAPER 1; INK 7;CHR$ 144;CHR$ 145
720 PRINT AT 21,0; INK 1;"Por fin navega (1985-2026)";
730 PAUSE 100: INPUT "Otra partida (s/n)? ";a$
740 IF a$="s" OR a$="S" THEN GO TO 20
750 BORDER 7: PAPER 7: INK 0: CLS: GO TO 9999
800 PRINT AT 0,0; PAPER 1; INK 7; BRIGHT 1;"    LA CAZA DEL SUBMARINO       "
805 PRINT AT 1,0;"5 cargas. Cerca = carga extra."
806 PRINT AT 2,0;"Tras cada carga, se mueve."
810 PRINT AT 3,3;"A  B  C  D  E  F  G  H"
820 FOR r=1 TO 8: PRINT AT 2+2*r,1;r: FOR q=1 TO 8: PRINT AT 2+2*r,3*q; PAPER 1;"  ": NEXT q: NEXT r
830 RETURN
850 PRINT AT 19,0;"CARGAS: ";c;"   LANZADAS: ";t;"  ": RETURN
870 PRINT AT 20,0;"                               ";AT 21,0;"                               ";: RETURN
900 REM graficos definidos (UDG)
910 FOR i=0 TO 23: READ n: POKE USR "a"+i,n: NEXT i
920 RETURN
930 DATA 0,0,0,31,127,255,127,0
940 DATA 32,32,112,248,254,255,254,0
950 DATA 73,42,28,127,28,42,73,0`;
  const LOST = [30, 190, 930, 940, 950];
  const lineNo = l => +l.split(" ")[0], gameLines = GAME.split("\n"), lost = gameLines.filter(l => LOST.includes(lineNo(l)));
  const TAPE = [
    { name: "timeline", line: 10, text: `10 REM the Spectrum years
20 BORDER 0: PAPER 0: INK 7: CLS
30 PRINT INK 5;"c. 1984"
40 PRINT "My first own computer: this ZX"'"Spectrum 48K, bought with my"'"savings. BASIC, a bit of FORTH"'"and my first Z80 assembler."
50 PRINT "I enjoyed writing games more"'"than playing them."''
60 PRINT INK 5;"c. 1985"
70 PRINT "My first game was published in"'"the magazine ZX: a BASIC"'"listing, 5,000 pesetas of prize"'"... and some lines missing."
80 PRINT "A reader phoned me from the"'"Canary Islands to ask for them."'"This tape still has both."''
90 PRINT INK 5;"1986"
100 PRINT "Game reviewer in MicroHobby's"'"reader jury."
110 PRINT AT 21,0; INK 6;"Next on the tape: LOAD """"";` },
    { name: "demo", line: 10, text: `10 REM PLOT, DRAW, CIRCLE and BEEP
20 BORDER 1: PAPER 0: INK 7: CLS
30 PRINT INK 6;"PLOT, DRAW and CIRCLE"
40 FOR i=1 TO 7: INK i: CIRCLE 128,88,i*11: BEEP .05,i*2: NEXT i
50 FOR a=0 TO 2*PI STEP PI/12
60 PLOT 128,88: DRAW INK 1+INT (RND*7);60*COS a,60*SIN a
70 NEXT a
80 PRINT AT 20,0; INK 5;"Attribute clash: one INK and"'"one PAPER per 8x8 square.";
90 FOR n=1 TO 8: READ p: BEEP .15,p: NEXT n
100 DATA 0,2,4,5,7,9,11,12
110 INK 7` },
    { name: "submarino", line: 1, text: gameLines.filter(l => !LOST.includes(lineNo(l))).join("\n") },
    { name: "llamada", line: 9000, text: [...lost, `9000 REM la llamada
9010 BORDER 0: PAPER 0: INK 7: CLS
9020 PRINT INK 6;"c. 1985. Suena el telefono."
9030 PRINT '"Un lector de Canarias: el juego"'"del submarino no funciona. La"'"revista se comio unas lineas."
9040 PRINT '"Se las dicto por telefono:"'`,
      ...lost.map((l, i) => `${9050 + i * 10} PRINT INK 5;"${l.replace(/"/g, '""')}"`),
      `9100 PRINT '"Tocaba teclearlas... o, si"'"conoces el Spectrum, MERGE."
9110 STOP`].join("\n") },
  ];

  let el, cv, ctx, off, offCtx, img, inp, done, alive = false, dirty = true, flashOn = false, frameN = 0, tape = null;
  const pix = new Uint8Array(W * H), chr = new Uint16Array(768), inv = new Uint8Array(768), att = new Uint8Array(768), mem = new Uint8Array(65536);
  let border = 7, perm, row = 0, col = 0, px = 0, py = 0, msg = null, line = "", inPrompt = "", cur = 0, t0 = 0;
  let prog = new Map(), lc = null, vars = {}, arrs = {}, fns = {}, fors = {}, subs = [], data = [], dptr = 0, cont = null;
  let L = 0, T = [], P = 0, jmp = false, ended = false, stopReq = false, busy = false, inputCb = null, keyWait = null;
  let askScroll = false, queue = [], held = null, heldT = 0, keyN = 0, tapePos = 0, saved = [];

  // ---------- tokenizer: keywords are whole words, as they appear in a LIST ----------
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " ") { i++; continue; }
      if (c === '"') {                                   // "" inside a string is one quote
        let v = ""; i++;
        while (i < s.length) { if (s[i] === '"') { if (s[i + 1] !== '"') { i++; break; } i++; } v += s[i++]; }
        t.push({ k: "s", v }); continue;
      }
      if (/[0-9.]/.test(c)) { const m = /^\d*\.?\d*(?:e[+-]?\d+)?/i.exec(s.slice(i))[0]; t.push({ k: "n", v: parseFloat(m) || 0, t: m }); i += m.length; continue; }
      if (/[a-z]/i.test(c)) {
        const w = /^[a-z][a-z0-9]*\$?/i.exec(s.slice(i))[0], U = w.toUpperCase(); i += w.length;
        if (!WORDS.has(U)) { t.push({ k: "v", v: w.toLowerCase(), t: w }); continue; }
        let k = { GOTO: "GO TO", GOSUB: "GO SUB" }[U] || U;
        const nx = /^\s*([a-z]+)/i.exec(s.slice(i)), n = nx && nx[1].toUpperCase();
        if ((k === "GO" && (n === "TO" || n === "SUB")) || (k === "DEF" && n === "FN")) { k += " " + n; i += nx[0].length; }
        t.push({ k: "k", v: k });
        if (k === "REM") { t.push({ k: "r", v: s.slice(i) }); break; }
        continue;
      }
      const two = s.slice(i, i + 2);
      if (two === "<=" || two === ">=" || two === "<>") { t.push({ k: "o", v: two }); i += 2; continue; }
      t.push({ k: "o", v: c }); i++;
    }
    return t;
  }
  function detok(ts) {                                  // back to text, spaced like the Spectrum lists it
    let s = "";
    for (const t of ts) {
      if (t.k === "k") { if (!FUNCS.has(t.v) && s && !s.endsWith(" ")) s += " "; s += t.v + (["RND", "INKEY$", "PI"].includes(t.v) ? "" : " "); }
      else s += t.k === "s" ? `"${t.v.replace(/"/g, '""')}"` : t.k === "o" || t.k === "r" ? t.v : t.t;
    }
    return s.replace(/ +/g, " ").trim();
  }
  const lines = () => lc || (lc = [...prog.keys()].sort((a, b) => a - b));
  function nextLine(n) { const ls = lines(), i = ls.indexOf(n); return i >= 0 && i + 1 < ls.length ? ls[i + 1] : null; }

  // ---------- expressions: Sinclair rules (true is 1, functions bind tighter than operators: INT RND*10 is 0) ----------
  const is = (k, v) => P < T.length && T[P].k === k && (v === undefined || T[P].v === v);
  const op = v => is("o", v), kw = v => is("k", v);
  function need(k, v) { if (!is(k, v)) throw err("C"); P++; }
  const num = x => { if (typeof x !== "number") throw err("C"); return x; };
  const str = x => { if (typeof x !== "string") throw err("C"); return x; };
  const fin = x => { if (!isFinite(x)) throw err("6"); return x; };
  const int = (x, lo, hi, e = "B") => { x = Math.round(num(x)); if (x < lo || x > hi) throw err(e); return x; };
  const idx = () => int(expr(), 0, 65535);
  const expr = () => orE();
  function orE() { let a = andE(); while (kw("OR")) { P++; const b = num(andE()); a = b ? 1 : num(a); } return a; }
  function andE() { let a = notE(); while (kw("AND")) { P++; const b = num(notE()); a = typeof a === "string" ? (b ? a : "") : (b ? a : 0); } return a; }
  function notE() { if (kw("NOT")) { P++; return num(notE()) ? 0 : 1; } return rel(); }
  function rel() {
    let a = add();
    for (;;) {
      const o = ["=", "<", ">", "<=", ">=", "<>"].find(op);
      if (!o) return a;
      P++;
      const b = add();
      if (typeof a !== typeof b) throw err("C");
      a = { "=": a === b, "<": a < b, ">": a > b, "<=": a <= b, ">=": a >= b, "<>": a !== b }[o] ? 1 : 0;
    }
  }
  function add() {
    let a = mul();
    while (op("+") || op("-")) { const o = T[P++].v, b = mul(); a = o === "+" && typeof a === "string" ? a + str(b) : fin(o === "+" ? num(a) + num(b) : num(a) - num(b)); }
    return a;
  }
  function mul() {
    let a = neg();
    while (op("*") || op("/")) { const o = T[P++].v, b = num(neg()); if (o === "/" && !b) throw err("6"); a = fin(o === "*" ? num(a) * b : num(a) / b); }
    return a;
  }
  function neg() { if (op("-")) { P++; return -num(neg()); } if (op("+")) { P++; return neg(); } return pow(); }
  function pow() {
    let a = prim();
    while (op("^")) { P++; const b = num(neg()); if (num(a) < 0 && b !== Math.floor(b)) throw err("A"); a = fin(Math.pow(a, b)); }
    return a;
  }
  function sliceSpec(len) {                             // (2 TO 4), (TO 3), (5 TO), (3) -> [from, to]
    P++;
    let a = 1, b = len;
    if (kw("TO")) { P++; if (!op(")")) b = idx(); }
    else { a = idx(); if (kw("TO")) { P++; if (!op(")")) b = idx(); } else b = a; }
    need("o", ")");
    return [a, b];
  }
  function slice(s) {
    while (op("(")) {
      const [a, b] = sliceSpec(s.length);
      if (b < a) { s = ""; continue; }
      if (a < 1 || b > s.length) throw err("3");
      s = s.slice(a - 1, b);
    }
    return s;
  }
  function prim() {
    const t = T[P];
    if (!t) throw err("C");
    if (t.k === "n") { P++; return t.v; }
    if (t.k === "s") { P++; return slice(t.v); }
    if (op("(")) { P++; const v = expr(); need("o", ")"); return typeof v === "string" ? slice(v) : v; }
    if (t.k === "v") { P++; return getVar(t.v); }
    if (t.k !== "k" || !FUNCS.has(t.v)) throw err("C");
    P++;
    return func(t.v);
  }
  const arg = () => { if (op("-")) { P++; return -num(arg()); } return prim(); };
  function func(f) {
    switch (f) {
      case "RND": return Math.random();
      case "PI": return Math.PI;
      case "INKEY$": return held || "";
      case "FN": return callFn();
      case "NOT": return num(arg()) ? 0 : 1;
      case "BIN": { const t = T[P]; if (!t || t.k !== "n" || !/^[01]+$/.test(t.t)) throw err("C"); P++; return parseInt(t.t, 2); }
      case "POINT": case "ATTR": case "SCREEN$": {
        need("o", "("); const a = idx(); need("o", ","); const b = idx(); need("o", ")");
        if (f === "POINT") { if (a > 255 || b > 175) throw err("B"); return pix[(175 - b) * W + a]; }
        if (a > 23 || b > 31) throw err("B");
        const c = chr[a * 32 + b];
        return f === "ATTR" ? att[a * 32 + b] : c >= 32 && c < 128 ? String.fromCharCode(c) : "";
      }
      case "USR": {                                     // USR "a": the address of a user-defined graphic; USR 0: the reset
        const x = arg();
        if (typeof x === "string") { const c = x.toLowerCase().charCodeAt(0) - 97; if (x.length !== 1 || c < 0 || c > 20) throw err("A"); return 65368 + c * 8; }
        if (int(x, 0, 65535) === 0) throw RESET;
        return x;
      }
    }
    const x = arg();
    switch (f) {
      case "VAL": return num(evalStr(str(x)));
      case "VAL$": return str(evalStr(str(x)));
      case "CODE": return str(x).length ? x.charCodeAt(0) : 0;
      case "LEN": return str(x).length;
      case "SIN": return Math.sin(num(x));
      case "COS": return Math.cos(num(x));
      case "TAN": return fin(Math.tan(num(x)));
      case "ASN": if (Math.abs(num(x)) > 1) throw err("A"); return Math.asin(x);
      case "ACS": if (Math.abs(num(x)) > 1) throw err("A"); return Math.acos(x);
      case "ATN": return Math.atan(num(x));
      case "LN": if (num(x) <= 0) throw err("A"); return Math.log(x);
      case "EXP": return fin(Math.exp(num(x)));
      case "INT": return Math.floor(num(x));
      case "SQR": if (num(x) < 0) throw err("A"); return Math.sqrt(x);
      case "SGN": return Math.sign(num(x));
      case "ABS": return Math.abs(num(x));
      case "PEEK": return peek(int(x, 0, 65535));
      case "IN": num(x); return 255;
      case "STR$": return fmt(num(x));
      case "CHR$": return String.fromCharCode(int(x, 0, 255));
    }
    throw err("C");
  }
  function evalStr(s) { const sT = T, sP = P; T = tokenize(s); P = 0; try { const v = expr(); if (P < T.length) throw err("C"); return v; } finally { T = sT; P = sP; } }
  function fmt(n) {                                     // 3.1415927, 0.5, 1E-6, 1.2345679E+10
    if (Number.isInteger(n) && Math.abs(n) < 1e10) return String(n);
    const a = Math.abs(n);
    if (a >= 1e10 || a < 1e-5) { let [m, e] = n.toExponential(7).split("e"); m = m.replace(/\.?0+$/, ""); return `${m}E${+e < 0 ? "-" : "+"}${Math.abs(+e)}`; }
    return String(+n.toPrecision(8));
  }
  function getVar(n) {
    if (op("(") && arrs[n]) return elem(n).get();
    if (!(n in vars)) throw err("2");
    return n.endsWith("$") ? slice(vars[n]) : vars[n];
  }
  function elem(n) {                                    // a(2,3) or b$(4): arrays start at 1; string arrays have fixed-length elements
    const a = arrs[n], isS = n.endsWith("$"), dims = isS ? a.dims.slice(0, -1) : a.dims, len = a.dims.at(-1);
    need("o", "(");
    const ix = [idx()]; while (op(",")) { P++; ix.push(idx()); }
    need("o", ")");
    if (ix.length !== dims.length || ix.some((v, i) => v < 1 || v > dims[i])) throw err("3");
    const at = ix.reduce((s, v, i) => s * dims[i] + v - 1, 0);
    return { get: () => isS ? slice(a.d[at]) : a.d[at], set: v => { a.d[at] = isS ? str(v).slice(0, len).padEnd(len) : num(v); } };
  }
  function target() {                                   // what LET, READ and INPUT assign to
    const t = T[P]; need("v"); const n = t.v;
    if (op("(")) {
      if (arrs[n]) return elem(n);
      if (!n.endsWith("$") || !(n in vars)) throw err("2");
      const [a, b] = sliceSpec(vars[n].length);        // LET a$(2 TO 3)="xy": the slice keeps its length
      if (a < 1 || b > vars[n].length) throw err("3");
      return { set: v => { const s = vars[n], k = Math.max(0, b - a + 1); vars[n] = s.slice(0, a - 1) + str(v).slice(0, k).padEnd(k) + s.slice(b); } };
    }
    return { set: v => { vars[n] = n.endsWith("$") ? str(v) : num(v); } };
  }
  function callFn() {
    const t = T[P]; need("v");
    const f = fns[t.v]; if (!f) throw err("P");
    need("o", "(");
    const a = [];
    if (!op(")")) { a.push(expr()); while (op(",")) { P++; a.push(expr()); } }
    need("o", ")");
    if (a.length !== f.params.length) throw err("Q");
    const keep = f.params.map(p => [p, p in vars, vars[p]]);
    f.params.forEach((p, i) => { vars[p] = p.endsWith("$") ? str(a[i]) : num(a[i]); });
    const sT = T, sP = P; T = f.T; P = f.at;
    try { return expr(); }
    finally { T = sT; P = sP; keep.forEach(([p, had, v]) => { if (had) vars[p] = v; else delete vars[p]; }); }
  }

  // ---------- screen: pixels, characters and attributes ----------
  const pattr = () => mix(0, perm);
  function mix(old, a) {                                // colour 8 keeps what the square had, 9 contrasts
    let paper = a.paper === 8 ? (old >> 3) & 7 : a.paper, ink = a.ink === 8 ? old & 7 : a.ink;
    if (paper === 9) paper = ink < 4 && ink !== 9 ? 7 : 0;
    if (ink === 9) ink = paper < 4 ? 7 : 0;
    const flash = a.flash === 8 ? old >> 7 & 1 : a.flash, bright = a.bright === 8 ? old >> 6 & 1 : a.bright;
    return flash << 7 | bright << 6 | paper << 3 | ink;
  }
  function cls() {
    pix.fill(0, 0, 176 * W); chr.fill(0, 0, 704); inv.fill(0, 0, 704); att.fill(pattr(), 0, 704);
    row = col = 0; dirty = true; scrLeft = 1;
  }
  let scrLeft = 1;                                      // SCR CT (23692): after a CLS the first scroll asks "scroll?", then a screenful per key
  function scroll() {
    if (--scrLeft <= 0) askScroll = true;
    pix.copyWithin(0, 8 * W, 176 * W); pix.fill(0, 168 * W, 176 * W);
    for (const a of [chr, inv]) { a.copyWithin(0, 32, 704); a.fill(0, 672, 704); }
    att.copyWithin(0, 32, 704); att.fill(pattr(), 672, 704);
  }
  function cellBits(i, bits, a) {
    const r = i >> 5, x0 = (i & 31) * 8;
    for (let y = 0; y < 8; y++) {
      const byte = bits[y] ^ (a.inverse ? 255 : 0);
      for (let x = 0; x < 8; x++) { const o = (r * 8 + y) * W + x0 + x, b = byte >> (7 - x) & 1; pix[o] = a.over ? pix[o] ^ b : b; }
    }
  }
  const ZERO = new Uint8Array(8);
  function putChar(c, a) {
    if (col > 31) { col = 0; row++; }
    if (row > 21) { scroll(); row = 21; }
    const i = row * 32 + col++;
    att[i] = mix(att[i], a);
    if (c >= 128 && c <= 164) {                         // block graphics and UDGs are pixels
      let bits;
      if (c >= 144) bits = mem.subarray(65368 + (c - 144) * 8, 65376 + (c - 144) * 8);
      else { const q = c - 128, t = (q & 2 ? 0xf0 : 0) | (q & 1 ? 0x0f : 0), b = (q & 8 ? 0xf0 : 0) | (q & 4 ? 0x0f : 0); bits = [t, t, t, t, b, b, b, b]; }
      cellBits(i, bits, a); chr[i] = 0;
    } else { if (!a.over) cellBits(i, ZERO, { inverse: 0, over: 0 }); chr[i] = c; inv[i] = a.inverse; }
    dirty = true;
  }
  function newline() { col = 0; if (++row > 21) { scroll(); row = 21; } }
  let ctl = null;
  function printStr(s, a) {                             // with the control codes CHR$ 13, 6 (comma), 16-21 (colours), 22 (AT), 23 (TAB)
    for (const ch of s) {
      const c = ch.charCodeAt(0);
      if (ctl) {
        ctl.args.push(c);
        if (ctl.c < 22) { setColour(a, COLOURS[ctl.c - 16], c); ctl = null; }
        else if (ctl.args.length === 2) { if (ctl.c === 22) { row = Math.min(ctl.args[0], 21); col = ctl.args[1] & 31; } else tab(ctl.args[0], a); ctl = null; }
        continue;
      }
      if (c === 13) newline();
      else if (c === 6) comma(a);
      else if (c >= 16 && c <= 23) ctl = { c, args: [] };
      else if (c >= 32) putChar(c, a);
    }
  }
  function tab(n, a) { n %= 32; if (n < col) { while (col < 32) putChar(32, a); newline(); } while (col < n) putChar(32, a); }
  function comma(a) { if (col > 31) newline(); tab(col < 16 ? 16 : 0, a); }
  function setColour(a, k, v) {
    const n = Math.round(num(v)), ok = k === "INK" || k === "PAPER" ? n >= 0 && n <= 9 : k === "FLASH" || k === "BRIGHT" ? n === 0 || n === 1 || n === 8 : n === 0 || n === 1;
    if (!ok) throw err("K");
    a[k.toLowerCase()] = n;
  }
  function colourItems() {                              // PLOT INK 2;x,y
    const a = { ...perm };
    while (COLOURS.some(kw)) { const k = T[P++].v; setColour(a, k, expr()); if (!op(";") && !op(",")) throw err("C"); P++; }
    return a;
  }
  function plot(x, y, a) {
    if (x < 0 || x > 255 || y < 0 || y > 175) throw err("B");
    const o = (175 - y) * W + x, bit = a.inverse ? 0 : 1, i = (175 - y >> 3) * 32 + (x >> 3);
    pix[o] = a.over ? pix[o] ^ bit : bit;
    att[i] = mix(att[i], a);
    px = x; py = y; dirty = true;
  }
  function lineTo(x1, y1, a) {
    let x = px, y = py;
    const dx = Math.abs(x1 - x), dy = -Math.abs(y1 - y), sx = x < x1 ? 1 : -1, sy = y < y1 ? 1 : -1;
    let e = dx + dy;
    while (x !== x1 || y !== y1) { const e2 = 2 * e; if (e2 >= dy) { e += dy; x += sx; } if (e2 <= dx) { e += dx; y += sy; } plot(x, y, a); }
  }
  function draw(dx, dy, ang, a) {
    const x0 = px, y0 = py, x1 = Math.round(x0 + dx), y1 = Math.round(y0 + dy);
    if (!ang || Math.abs(Math.sin(ang / 2)) < 1e-6) return lineTo(x1, y1, a);
    const c = Math.hypot(dx, dy), n = Math.max(4, Math.ceil(Math.abs(ang) * c / 6));
    const seg = c * Math.sin(ang / (2 * n)) / Math.sin(ang / 2);
    let x = x0, y = y0, th = Math.atan2(dy, dx) - ang / 2 + ang / (2 * n);
    for (let i = 1; i <= n; i++, th += ang / n) {        // an arc that turns ang radians on the way
      x += seg * Math.cos(th); y += seg * Math.sin(th);
      lineTo(i === n ? x1 : Math.round(x), i === n ? y1 : Math.round(y), a);
    }
  }
  function circle(cx, cy, r, a) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(Math.abs(r));
    if (cx - r < 0 || cx + r > 255 || cy - r < 0 || cy + r > 175) throw err("B");
    let x = r, y = 0, e = 1 - r;
    while (x >= y) {
      for (const [u, v] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) plot(cx + u, cy + v, a);
      y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
    }
  }

  // ---------- memory: the screen, the attributes, a few system variables and the UDGs ----------
  const scrY = o => (o >> 8 & 7) | (o >> 2 & 0x38) | (o >> 5 & 0xc0);   // the Spectrum's interleaved screen rows
  function peek(a) {
    if (a < 16384) return 0;
    if (a < 22528) { const o = a - 16384, s = scrY(o) * W + (o & 31) * 8; let b = 0; for (let i = 0; i < 8; i++) b = b << 1 | pix[s + i]; return b; }
    if (a < 23296) return att[a - 22528];
    if (a >= 23672 && a <= 23674) return Math.floor((Date.now() - t0) / 20) >> (a - 23672) * 8 & 255;   // FRAMES
    if (a === 23692) return Math.max(0, scrLeft);
    if (a === 23560) return held ? held.charCodeAt(0) : 0;                                                // LAST K
    if (a === 23675) return 0x58;
    if (a === 23676) return 0xff;                                                                         // UDG = 65368
    return mem[a];
  }
  function poke(a, v) {
    if (a < 16384) return;                              // ROM
    if (a < 22528) { const o = a - 16384, s = scrY(o) * W + (o & 31) * 8; for (let i = 0; i < 8; i++) pix[s + i] = v >> (7 - i) & 1; }
    else if (a < 23296) att[a - 22528] = v;
    else if (a === 23692) scrLeft = v;
    else mem[a] = v;
    dirty = true;
  }

  // ---------- sound and the tape ----------
  async function beep(d, p) {
    sfx.tone(261.63 * Math.pow(2, p / 12), Math.max(d, .01), "square", .04);
    const end = Date.now() + d * 1000;
    while (Date.now() < end) { if (stopReq || !alive) throw { brk: "D" }; await sleep(Math.min(25, end - Date.now())); }
  }
  async function pause(n) {                             // n frames (50 per second), or until a key; PAUSE 0 waits for the key
    const k0 = keyN, end = n ? Date.now() + n * 20 : Infinity;
    while (Date.now() < end && keyN === k0) { if (stopReq || !alive) throw { brk: "D" }; await sleep(20); }
  }
  let toneH = null;
  async function tapeBlock(kind, ms) {                  // pilot tone (red/cyan stripes) or data (blue/yellow): the loading noise
    tape = kind;
    toneH = toneH || sfx.hold(807, .015);
    const end = Date.now() + ms;
    try {
      while (Date.now() < end) {
        if (stopReq || !alive) throw { brk: "D" };
        toneH?.set(kind === "pilot" ? 807 : Math.random() < .5 ? 1023 : 2047, .015);
        await sleep(kind === "pilot" ? 60 : 12);
      }
    } finally { tape = null; dirty = true; }
  }
  const tapeQuiet = () => { toneH?.stop(); toneH = null; };
  async function tapeStmt(cmd) {
    const name = str(expr());
    if (kw("CODE") || kw("SCREEN$") || kw("DATA")) throw err("R");
    let start = null;
    if (cmd === "SAVE" && kw("LINE")) { P++; start = idx(); }
    if (name.length > 10 || (cmd === "SAVE" && !name)) throw err("F");
    try {
      if (cmd === "SAVE") {
        msg = "Start tape, then press any key."; dirty = true;
        const k = await new Promise(res => { keyWait = res; });
        msg = null;
        if (k === "\x1b" || !alive) throw { brk: "D" };
        await tapeBlock("pilot", 1500); await tapeBlock("data", 300); await tapeBlock("pilot", 800); await tapeBlock("data", 1500);
        const p = { name, line: start, text: lines().map(n => `${n} ${detok(prog.get(n))}`).join("\n") };
        const i = saved.findIndex(s => s.name === name);
        if (i >= 0) saved[i] = p; else saved.push(p);
        return;
      }
      const all = [...TAPE, ...saved];
      for (let n = 0; n < all.length; n++) {
        const p = all[(tapePos + n) % all.length];
        await tapeBlock("pilot", 1500); await tapeBlock("data", 250);
        scrLeft = 22; printStr(`Program: ${p.name}`, { ...perm }); newline();   // everyone is watching the tape: no scroll?
        if (name && p.name !== name) continue;
        tapePos = (tapePos + n + 1) % all.length;
        await tapeBlock("pilot", 800); await tapeBlock("data", 1800);
        if (cmd === "VERIFY") return;
        if (cmd === "LOAD") prog = new Map();
        for (const l of p.text.split("\n")) { const m = /^(\d+) (.*)$/.exec(l); if (m) prog.set(+m[1], tokenize(m[2])); }
        lc = null; cont = null;
        if (p.line === null) { ended = true; return; }
        clr(); return goLine(p.line);                   // saved with LINE: it runs by itself
      }
      throw err("R");
    } finally { tapeQuiet(); }
  }

  // ---------- statements ----------
  async function gate() {                               // "scroll?": N, SPACE or BREAK stop here
    if (!askScroll) return;
    msg = "scroll?"; dirty = true;
    const k = await new Promise(res => { keyWait = res; });
    msg = null; askScroll = false; scrLeft = 22; dirty = true;
    if (!alive || (k === "n" || k === "N" || k === " " || k.charCodeAt(0) === 27)) throw { brk: "D" };
  }
  const endOfStmt = () => P >= T.length || op(":");
  const lineArg = () => int(expr(), 0, 65535);
  function goLine(n) { const nx = lines().find(x => x >= n); if (nx === undefined) { ended = true; return; } L = nx; T = prog.get(nx); P = 0; jmp = true; }
  const back = at => { [L, T, P] = at; jmp = true; };
  function skipStmt() { while (!endOfStmt()) P++; }
  function stmtNo() { let n = 1; for (let i = 0; i < Math.min(P, T.length); i++) if ((T[i].k === "o" && T[i].v === ":") || (T[i].k === "k" && T[i].v === "THEN")) n++; return n; }
  function clr() {
    vars = {}; arrs = {}; fns = {}; fors = {}; subs = []; data = []; dptr = 0;
    for (const n of lines()) {
      const ts = prog.get(n);
      for (let i = 0; i < ts.length; i++) {
        const t = ts[i];
        if (t.k === "k" && t.v === "DATA") {           // DATA items are expressions, read one by one
          let s = i + 1, depth = 0;
          for (let j = i + 1; ; j++) {
            const u = ts[j], end = !u || (u.k === "o" && u.v === ":");
            if (end || (u.k === "o" && u.v === "," && !depth)) { if (j > s) data.push({ n, T: ts, s, e: j }); s = j + 1; if (end) { i = j; break; } }
            else if (u.k === "o" && u.v === "(") depth++;
            else if (u.k === "o" && u.v === ")") depth--;
          }
        } else if (t.k === "k" && t.v === "DEF FN" && ts[i + 1]?.k === "v") {
          const params = []; let j = i + 3;
          while (ts[j]?.k === "v") { params.push(ts[j].v); j += ts[j + 1]?.v === "," ? 2 : 1; }
          if (ts[j]?.v === ")" && ts[j + 1]?.v === "=") fns[ts[i + 1].v] = { params, T: ts, at: j + 2 };
        }
      }
    }
  }
  function readData() {
    if (dptr >= data.length) throw err("E");
    const d = data[dptr++], sT = T, sP = P;
    T = d.T; P = d.s;
    try { const v = expr(); if (P !== d.e) throw err("C"); return v; } finally { T = sT; P = sP; }
  }
  function skipFor(n) {                                 // FOR with nothing to do: on to its NEXT
    let ln = L, ts = T, i = P;
    for (;;) {
      for (; i < ts.length - 1; i++) if (ts[i].k === "k" && ts[i].v === "NEXT" && ts[i + 1].v === n) { L = ln; T = ts; P = i + 2; jmp = true; return; }
      const nx = ln ? nextLine(ln) : null;
      if (nx === null) throw err("I");
      ln = nx; ts = prog.get(nx); i = 0;
    }
  }
  function printStmt() {
    const a = { ...perm };
    let nl = true;
    while (!endOfStmt()) {
      nl = true;
      if (op(";")) { P++; nl = false; continue; }
      if (op(",")) { P++; comma(a); nl = false; continue; }
      if (op("'")) { P++; newline(); nl = false; continue; }
      if (kw("AT")) {
        P++; const y = int(expr(), 0, 255); need("o", ","); const x = int(expr(), 0, 255);
        if (y > 21) throw err(y > 23 ? "B" : "5");
        if (x > 31) throw err("B");
        row = y; col = x; nl = false; continue;
      }
      if (kw("TAB")) { P++; tab(int(arg(), 0, 65535), a); nl = false; continue; }
      if (COLOURS.some(kw)) { const k = T[P++].v; setColour(a, k, expr()); nl = false; continue; }
      const v = expr();
      printStr(typeof v === "number" ? fmt(v) : v, a);
      nl = !(op(";") || op(",") || op("'"));
    }
    if (nl) newline();
  }
  const ask = prompt => new Promise(res => { inPrompt = prompt; line = ""; inputCb = res; dirty = true; });
  async function inputStmt() {
    let prompt = "";
    while (!endOfStmt()) {
      if (op(";")) { P++; continue; }
      if (op(",") || op("'")) { P++; prompt += " "; continue; }
      if (is("s")) { prompt += T[P++].v; continue; }
      if (kw("LINE")) { P++; continue; }
      if (!is("v")) throw err("C");
      const n = T[P].v, r = target();
      for (;;) {
        const s = await ask(prompt);
        if (s === null || stopReq || !alive) throw { brk: "D" };
        if (n.endsWith("$")) { r.set(s); break; }
        try { r.set(num(evalStr(s))); break; } catch (e) { if (!e.zx) throw e; }   // not a number: it asks again
      }
      prompt = "";
    }
    inPrompt = ""; dirty = true; scrLeft = 22;
  }
  async function stmt() {
    const t = T[P];
    if (t.k !== "k") throw err("C");                    // no LET, no assignment: the Spectrum always wanted LET
    P++;
    switch (t.v) {
      case "LET": { const r = target(); need("o", "="); r.set(expr()); return; }
      case "PRINT": return printStmt();
      case "INPUT": return inputStmt();
      case "REM": P = T.length; return;
      case "DATA": case "DEF FN": case "LPRINT": case "LLIST": case "COPY": case "OUT": skipStmt(); return;   // no ZX Printer attached
      case "STOP": throw { stop: true };
      case "GO TO": return goLine(lineArg());
      case "GO SUB": { const n = lineArg(); subs.push([L, T, P]); return goLine(n); }
      case "RETURN": if (!subs.length) throw err("7"); return back(subs.pop());
      case "IF": { const c = num(expr()); need("k", "THEN"); if (!c) { P = T.length; return; } return stmt(); }
      case "FOR": {
        const v = T[P]; need("v"); if (v.v.length !== 1) throw err("C");
        need("o", "="); const a = num(expr()); need("k", "TO"); const lim = num(expr());
        let step = 1; if (kw("STEP")) { P++; step = num(expr()); }
        vars[v.v] = a;
        if (step >= 0 ? a > lim : a < lim) return skipFor(v.v);
        fors[v.v] = { lim, step, at: [L, T, P] };
        return;
      }
      case "NEXT": {
        const v = T[P]; need("v"); const f = fors[v.v]; if (!f) throw err("1");
        const x = vars[v.v] + f.step; vars[v.v] = x;
        if (f.step >= 0 ? x <= f.lim : x >= f.lim) return back(f.at);
        return;
      }
      case "DIM": {
        const v = T[P]; need("v"); need("o", "(");
        const d = [idx()]; while (op(",")) { P++; d.push(idx()); } need("o", ")");
        if (d.some(x => x < 1)) throw err("3");
        const isS = v.v.endsWith("$");
        if (isS && d.length === 1) { delete arrs[v.v]; vars[v.v] = " ".repeat(d[0]); return; }
        const size = (isS ? d.slice(0, -1) : d).reduce((s, x) => s * x, 1);
        if (size * (isS ? d.at(-1) : 5) > 40000) throw err("4");
        arrs[v.v] = { dims: d, d: new Array(size).fill(isS ? " ".repeat(d.at(-1)) : 0) };
        if (isS) delete vars[v.v];
        return;
      }
      case "READ": do target().set(readData()); while (op(",") && ++P); return;
      case "RESTORE": { const n = endOfStmt() ? 0 : lineArg(); dptr = data.findIndex(d => d.n >= n); if (dptr < 0) dptr = data.length; return; }
      case "RANDOMIZE": if (!endOfStmt()) num(expr()); return;
      case "CLS": cls(); return;
      case "BORDER": border = int(expr(), 0, 7, "K"); dirty = true; return;
      case "INK": case "PAPER": case "FLASH": case "BRIGHT": case "INVERSE": case "OVER": setColour(perm, t.v, expr()); return;
      case "BEEP": { const d = num(expr()); need("o", ","); const p = num(expr()); if (d < 0 || d > 10 || p < -60 || p > 69) throw err("B"); return beep(d, p); }
      case "PAUSE": return pause(int(expr(), 0, 65535));
      case "PLOT": { const a = colourItems(), x = int(expr(), 0, 255); need("o", ","); plot(x, int(expr(), 0, 175), a); return; }
      case "DRAW": { const a = colourItems(), dx = num(expr()); need("o", ","); const dy = num(expr()); let g = 0; if (op(",")) { P++; g = num(expr()); } draw(dx, dy, g, a); return; }
      case "CIRCLE": { const a = colourItems(), x = num(expr()); need("o", ","); const y = num(expr()); need("o", ","); circle(x, y, num(expr()), a); return; }
      case "POKE": { const a = int(expr(), 0, 65535); need("o", ","); poke(a, int(expr(), -255, 255) & 255); return; }
      case "RUN": { const n = endOfStmt() ? 0 : lineArg(); clr(); cls(); px = py = 0; return goLine(n); }
      case "CLEAR": if (!endOfStmt()) num(expr()); clr(); cls(); return;
      case "NEW": throw RESET;
      case "LIST": { const n = endOfStmt() ? 0 : lineArg(); cls(); cur = n; for (const l of lines()) if (l >= n) { const r = rowsOf(l); if (row + r > 21 && scrLeft <= row + r - 21) askScroll = true; await gate(); listLine(l); } return; }
      case "CONT": { if (L || !cont) return; const c = cont; cont = null; return back(c); }
      case "LOAD": case "SAVE": case "VERIFY": case "MERGE": return tapeStmt(t.v);
      default: throw err("C");
    }
  }
  function listLine(n) { printStr(`${String(n).padStart(4)}${n === cur ? ">" : " "}${detok(prog.get(n))}`, { ...perm }); newline(); }
  const rowsOf = n => Math.ceil((5 + detok(prog.get(n)).length) / 32);
  function autoList() {                                 // after a line is typed in, the program is listed around it
    cls();
    const ls = lines(), rows = ls.map(rowsOf);
    let s = 0;
    const k = ls.indexOf(cur);
    while (s < k && rows.slice(s, k + 1).reduce((a, b) => a + b, 0) > 22) s++;
    for (let i = s, used = 0; i < ls.length && (used += rows[i]) <= 22; i++) listLine(ls[i]);
  }
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  function report(c) { msg = `${c} ${REP[c]}, ${L}:${stmtNo()}`; dirty = true; }
  async function run(ts) {                              // a direct command; RUN and GO TO hop into the program
    L = 0; T = ts; P = 0; ended = false; stopReq = false; busy = true; msg = null; dirty = true; askScroll = false;
    let n = 0, at = [0, ts, 0];
    try {
      for (;;) {
        if (P >= T.length) { if (!L) break; const nx = nextLine(L); if (nx === null) break; L = nx; T = prog.get(nx); P = 0; continue; }
        if (op(":")) { P++; continue; }
        at = [L, T, P]; jmp = false;
        await stmt();
        if (ended || !alive) break;
        await gate();
        if (!jmp && !endOfStmt()) throw err("C");
        if (++n % SPEED === 0) { await frame(); if (stopReq) throw { brk: "L" }; }
      }
      report("0");
    } catch (e) {
      if (e === RESET) { busy = false; return power(); }
      if (!alive) return;
      if (e.brk) { cont = e.brk === "D" ? at : [L, T, P]; report(e.brk); }
      else if (e.stop) { cont = [L, T, P]; report("9"); }
      else if (e.zx) { cont = at; report(e.zx); }
      else throw e;
    }
    busy = false; inputCb = null; inPrompt = ""; dirty = true;
  }
  async function enter(s) {                             // a typed line: stored (with a number) or run at once
    const m = /^\s*(\d+)\s*(.*)$/.exec(s);
    if (!m) return s.trim() ? run(tokenize(s)) : undefined;
    const n = +m[1], body = m[2].trim();
    if (n < 1 || n > 9999) { msg = "B Integer out of range, 0:1"; dirty = true; return; }
    if (body) prog.set(n, tokenize(body)); else prog.delete(n);
    lc = null; cont = null; cur = n; autoList();
  }

  // ---------- painting: border, attributes and pixels, characters, the lower screen ----------
  function wrap(s) { const r = []; for (let i = 0; i < s.length; i += 32) r.push(s.slice(i, i + 32)); return r.length ? r : [""]; }
  function glyph(ch, x, y, colour) {
    ctx.fillStyle = colour;
    ctx.setTransform(1.65, 0, 0, 1, (BD + x * 8 + 4) * S, (BD + y * 8 + 4.5) * S);
    ctx.fillText(ch, 0, 0);
  }
  const charOf = c => c === 96 ? "£" : c === 94 ? "↑" : c === 127 ? "©" : String.fromCharCode(c);
  function stripes() {
    const pilot = tape === "pilot";
    let y = pilot ? -(frameN * 7 % 20) * S : 0, c = 0;
    while (y < cv.height) { const h = (pilot ? 10 : 1 + Math.random() * 4) * S; ctx.fillStyle = css(pilot ? (c ? 5 : 2) : (c ? 6 : 1)); ctx.fillRect(0, y, cv.width, h); y += h; c ^= 1; }
  }
  function paint() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (tape) stripes(); else { ctx.fillStyle = css(border); ctx.fillRect(0, 0, cv.width, cv.height); }
    const d = img.data;
    for (let i = 0; i < 704; i++) {
      const a = att[i], b = a & 64, fl = a & 128 && flashOn;
      const ic = (b ? PALB : PAL)[fl ? a >> 3 & 7 : a & 7], pc = (b ? PALB : PAL)[fl ? a & 7 : a >> 3 & 7];
      for (let y = 0; y < 8; y++) {
        let o = ((i >> 5) * 8 + y) * W + (i & 31) * 8;
        for (let x = 0; x < 8; x++, o++) { const c = pix[o] ? ic : pc, k = o * 4; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255; }
      }
    }
    offCtx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, 176, BD * S, BD * S, W * S, 176 * S);
    for (let i = 0; i < 704; i++) {
      const c = chr[i];
      if (!c || (c === 32 && !inv[i])) continue;
      const a = att[i], b = a & 64, fl = a & 128 && flashOn, ink = css(fl ? a >> 3 & 7 : a & 7, b), paper = css(fl ? a & 7 : a >> 3 & 7, b);
      if (inv[i]) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = ink; ctx.fillRect((BD + (i & 31) * 8) * S, (BD + (i >> 5) * 8) * S, 8 * S, 8 * S); }
      if (c !== 32) glyph(charOf(c), i & 31, i >> 5, inv[i] ? paper : ink);
    }
    // the lower screen: border colour, its own ink; it grows upwards with long lines
    // the cursor: a flashing block (no K/L letter: it read like a typed character); under a report too
    let rowsTxt;
    if (msg) rowsTxt = busy ? wrap(msg) : [...wrap(msg), "\0"];
    else if (busy) rowsTxt = wrap(inputCb ? inPrompt + line + "\0" : "");
    else rowsTxt = wrap(line + "\0");
    const n = Math.max(2, rowsTxt.length), top = 24 - n;
    const ink = css(border < 4 ? 7 : 0), paper = css(border);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = paper; ctx.fillRect(BD * S, (BD + top * 8) * S, W * S, n * 8 * S);
    rowsTxt.forEach((s, r) => [...s].forEach((ch, x) => {
      const y = 24 - rowsTxt.length + r;
      if (ch !== "\0") { if (ch !== " ") glyph(ch, x, y, ink); return; }
      if (flashOn) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = ink; ctx.fillRect((BD + x * 8) * S, (BD + y * 8) * S, 8 * S, 8 * S); }
    }));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function loop() {
    if (!alive) return;
    if (++frameN % 20 === 0) { flashOn = !flashOn; dirty = true; }   // FLASH and the cursor: about 3 times a second
    if (dirty || tape) { dirty = false; paint(); }
    requestAnimationFrame(loop);
  }

  // ---------- keyboard: typed or pasted lines in order; INKEY$ sees the key being held ----------
  function edit(k) {
    if (k === "\r") { const s = line; line = ""; dirty = true; return s; }
    if (k === "\b") line = line.slice(0, -1);
    else if (k.length === 1 && k >= " " && line.length < 255) line += k;
    dirty = true;
    return null;
  }
  function feed(k) {
    if (!alive) return;
    if (keyWait) { const w = keyWait; keyWait = null; return w(k); }
    if (busy) {                                         // a program runs: BREAK, or the INPUT line
      if (k === "\x1b") { stopReq = true; if (inputCb) { const cb = inputCb; inputCb = null; cb(null); } return; }
      if (inputCb) { const s = edit(k); if (s !== null) { const cb = inputCb; inputCb = null; cb(s); } }
      return;
    }
    queue.push(k); pump();
  }
  async function pump() {
    if (pump.on) return;
    pump.on = true;
    while (queue.length && alive && !busy) {
      const k = queue.shift();
      if (k === "\x1b") { pump.on = false; return exit(); }
      if (msg) { msg = null; dirty = true; }            // any key clears the report
      const s = edit(k);
      if (s !== null) await enter(s);
    }
    pump.on = false;
  }
  const press = k => { held = k; keyN++; clearTimeout(heldT); };
  const ARROWS = { ArrowLeft: "\x08", ArrowRight: "\x09", ArrowDown: "\x0a", ArrowUp: "\x0b" };   // CAPS SHIFT + 5..8
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    e.stopPropagation();
    if (ARROWS[e.key]) { e.preventDefault(); press(ARROWS[e.key]); return; }
    const k = { Enter: "\r", Backspace: "\b", Escape: "\x1b" }[e.key];
    if (k) { e.preventDefault(); inp.value = typed = ""; if (k === "\r") press(k); else keyN++; feed(k); }
    else if (e.key.length === 1) { press(e.key); keyDown = true; if (e.target !== inp) { e.preventDefault(); feed(e.key); } }
  }
  const onKeyUp = () => { held = null; keyDown = false; };
  // what landed in the hidden input (phones, paste). Phone keyboards rewrite the word being composed, so only
  // the difference is typed, and the input is emptied only between words (wiping it mid-word repeated letters).
  let typed = "", keyDown = false;
  function onInput(e) {
    const v = inp.value; let i = 0;
    while (i < typed.length && typed[i] === v[i]) i++;
    for (let j = typed.length; j > i; j--) feed("\b");
    for (const ch of v.slice(i)) { if (!keyDown) press(ch); feed(ch === "\n" ? "\r" : ch); }
    typed = v;
    if (!e.isComposing) inp.value = typed = "";
    if (!keyDown) heldT = setTimeout(() => { held = null; }, 150);   // phone keyboards send no key-up
  }
  function onPaste(e) {
    const s = e.clipboardData?.getData("text");
    if (!s) return;
    e.preventDefault();
    for (const ch of s.replace(/\r\n?/g, "\n")) feed(ch === "\n" ? "\r" : ch);
  }
  const onClick = e => {
    if (e.target.closest("[data-zx-break]")) feed("\x1b");
    else if (e.target.closest("[data-zx-exit]")) return exit();
    inp.focus({ preventScroll: true });
  };
  function power() {                                    // the power-on screen
    tapeQuiet(); prog = new Map(); lc = null; clr(); mem.fill(0); border = 7; line = ""; cont = null; cur = 0; px = py = 0;
    perm = { ink: 0, paper: 7, flash: 0, bright: 0, inverse: 0, over: 0 };
    cls(); t0 = Date.now(); msg = "© 1982 Sinclair Research Ltd";
  }
  function exit() {
    if (!alive) return;
    alive = false; stopReq = true; queue = []; tapeQuiet();
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("keyup", onKeyUp, true);
    if (keyWait) { const w = keyWait; keyWait = null; w("\x1b"); }
    if (inputCb) { const cb = inputCb; inputCb = null; cb(null); }
    done();
  }

  GM.spectrum = {
    open(container) {
      el = document.createElement("div"); el.className = "zx"; container.append(el);
      el.innerHTML = `<canvas class="zx-scr" width="${(W + 2 * BD) * S}" height="${(H + 2 * BD) * S}" aria-label="ZX Spectrum screen"></canvas>
<input class="vic-in" aria-label="ZX Spectrum keyboard" autocomplete="off" autocapitalize="none" spellcheck="false">
<p class="vic-keys"><button type="button" data-zx-break>BREAK</button> <button type="button" data-zx-exit>⏏ PC</button></p>
<p class="vic-help">Keywords typed in full: PRINT, GO TO, LET... · LOAD "" loads the next program on the tape · LIST · RUN · Esc = BREAK<br>Simulated, not emulated: Sinclair BASIC rewritten for this PC, no ROM inside.</p>`;
      cv = el.querySelector("canvas"); ctx = cv.getContext("2d"); inp = el.querySelector("input");
      off = document.createElement("canvas"); off.width = W; off.height = H; offCtx = off.getContext("2d"); img = offCtx.createImageData(W, H);
      ctx.font = `bold ${8 * S - 4}px ui-monospace, Consolas, "Courier New", monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      alive = true; busy = false; queue = []; pump.on = false; keyWait = null; inputCb = null; tapePos = 0; saved = []; held = null;
      power();
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("keyup", onKeyUp, true);
      inp.addEventListener("input", onInput);
      inp.addEventListener("paste", onPaste);
      el.addEventListener("click", onClick);
      inp.focus({ preventScroll: true });
      requestAnimationFrame(loop);
      return new Promise(res => { done = res; });
    },
    // the text on the screen (upper rows, then the lower screen): lets the site's tests read the canvas
    text: () => [...Array(22)].map((_, r) => [...chr.subarray(r * 32, r * 32 + 32)].map(c => c >= 32 && c < 128 ? charOf(c) : " ").join("").trimEnd()).join("\n") + "\n" + (msg || inPrompt + line),
  };
})();
