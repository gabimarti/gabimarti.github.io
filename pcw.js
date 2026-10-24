// Amstrad PCW 8512 for gabimarti.github.io (GRUB > Vintage machines). Loaded on demand by site.js.
// Not an emulator and no disc image: CP/M Plus and Mallard BASIC (Locomotive Software) rewritten in JS.
// Screen: 90x32 green text with the PCW's escape codes (ESC E clears, ESC H homes, ESC Y row col moves the cursor,
// ESC p / ESC q reverse video). Drive A: is the 3" start-of-day disc (180K), B: the 720K second drive, M: the RAM disc. Files saved last a visit.
// Esc is STOP: it breaks a program; at a prompt it goes back to the PC.
"use strict";
(() => {
  const { sfx, sleep } = GM;
  const COLS = 90, ROWS = 32, CW = 12, CH = 24, SPEED = 40;   // CW x CH: canvas pixels per character; SPEED: statements per frame
  const GREEN = "#3ff23f", DARK = "#020d02";
  const FUNCS = new Set(["ABS", "ASC", "ATN", "CHR$", "COS", "EXP", "FIX", "HEX$", "INKEY$", "INSTR", "INT", "LEFT$", "LEN", "LOG",
    "LOWER$", "MID$", "RIGHT$", "EOF", "RND", "SGN", "SIN", "SPACE$", "SQR", "STR$", "STRING$", "TAN", "UPPER$", "VAL"]);
  const WORDS = new Set([...FUNCS, "AND", "OR", "XOR", "NOT", "MOD", "PRINT", "LPRINT", "USING", "TAB", "SPC", "LET", "IF", "THEN", "ELSE",
    "GOTO", "GOSUB", "RETURN", "ON", "FOR", "TO", "STEP", "NEXT", "WHILE", "WEND", "INPUT", "LINE", "DIM", "READ", "DATA", "RESTORE",
    "RANDOMIZE", "END", "STOP", "REM", "RUN", "NEW", "LIST", "LLIST", "CONT", "CLEAR", "LOAD", "SAVE", "FILES", "KILL", "NAME", "AS",
    "SYSTEM", "SWAP", "DELETE", "WIDTH", "AUTO", "OPEN", "CLOSE", "CLS", "WRITE"]);
  class BErr { constructor(m) { this.m = m; } }
  const bad = m => new BErr(m), SYN = "Syntax error";
  const NUMRE = /^[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?$/i;

  // ---------- the start-of-day disc ----------
  // BIBLIO.BAS: the catalogue of a personal library, kept on the disc in LIBROS.DAT (title, author, publisher, ISBN, subject)
  const BIBLIO = `10 REM BIBLIOTECA - fichero de una biblioteca personal
20 REM G. Marti, c.1988. Mi primer programa cobrado.
30 REM Escrito en este PCW, impreso y tecleado otra vez a mano en el IBM del cliente.
40 REM Reconstruido de memoria en 2026: el original se perdio. Los libros, en LIBROS.DAT
50 MX=300: DIM T$(MX),A$(MX),E$(MX),I$(MX),M$(MX): N=0: CB=0: OD=0: C$=CHR$(27): F$="LIBROS.DAT"
60 PRINT C$;"E";C$;"H";"Leyendo ";F$;"...": GOSUB 8000
100 PRINT C$;"E";C$;"H";
110 PRINT TAB(36);"B I B L I O T E C A"
120 PRINT TAB(36);STRING$(19,"=")
130 PRINT: PRINT TAB(31);"Libros en el fichero:";N: PRINT
140 PRINT TAB(31);"1. Alta de un libro"
150 PRINT TAB(31);"2. Listado por titulo"
160 PRINT TAB(31);"3. Buscar por titulo, autor o tema"
170 PRINT TAB(31);"4. Ficha de un libro (y baja)"
180 PRINT TAB(31);"5. Grabar y terminar"
190 PRINT: PRINT TAB(31);: INPUT "Opcion";O
200 ON O GOSUB 1000,2000,3000,4000,5000
210 GOTO 100
1000 PRINT C$;"E";C$;"H";"ALTA DE UN LIBRO": PRINT
1010 IF N=MX THEN PRINT "Fichero lleno.": GOTO 1090
1020 LINE INPUT "Titulo:    ";X$: IF X$="" THEN RETURN
1030 LINE INPUT "Autor:     ";Y$
1040 LINE INPUT "Editorial: ";Z$
1050 LINE INPUT "ISBN:      ";W$
1060 LINE INPUT "Tema:      ";V$
1070 N=N+1: T$(N)=UPPER$(X$): A$(N)=UPPER$(Y$): E$(N)=UPPER$(Z$): I$(N)=W$: M$(N)=UPPER$(V$): CB=1: OD=0
1080 PRINT: PRINT "Anotado. Libros en el fichero:";N
1090 GOSUB 9000: RETURN
2000 IF OD=0 THEN PRINT C$;"E";C$;"H";"Ordenando por titulo...": GOSUB 7000
2005 PRINT C$;"E";C$;"H";
2010 PRINT "NUM  TITULO";TAB(44);"AUTOR";TAB(72);"TEMA"
2020 PRINT STRING$(89,"-")
2030 FOR I=1 TO N
2040 PRINT USING "###  ";I;: PRINT LEFT$(T$(I),36);TAB(44);LEFT$(A$(I),26);TAB(72);LEFT$(M$(I),17)
2050 IF I MOD 25=0 AND I<N THEN GOSUB 9000: PRINT C$;"E";C$;"H";
2060 NEXT I
2070 GOSUB 9000: RETURN
3000 PRINT C$;"E";C$;"H";"BUSCAR": PRINT
3010 LINE INPUT "Texto a buscar (titulo, autor o tema): ";X$: IF X$="" THEN RETURN
3020 X$=UPPER$(X$): F=0: PRINT
3030 FOR I=1 TO N
3040 IF INSTR(T$(I),X$)>0 OR INSTR(A$(I),X$)>0 OR INSTR(M$(I),X$)>0 THEN F=F+1: PRINT USING "###  ";I;: PRINT T$(I);" - ";A$(I)
3050 NEXT I
3060 IF F=0 THEN PRINT "Ningun libro con ";CHR$(34);X$;CHR$(34)
3070 GOSUB 9000: RETURN
4000 PRINT C$;"E";C$;"H";"FICHA DE UN LIBRO": PRINT
4010 INPUT "Numero (el del listado)";K: IF K<1 OR K>N THEN RETURN
4020 PRINT: PRINT "Titulo:    ";T$(K): PRINT "Autor:     ";A$(K): PRINT "Editorial: ";E$(K)
4030 PRINT "ISBN:      ";I$(K): PRINT "Tema:      ";M$(K): PRINT
4040 INPUT "Dar de baja (S/N)";X$: IF UPPER$(X$)<>"S" THEN RETURN
4050 FOR I=K TO N-1: T$(I)=T$(I+1): A$(I)=A$(I+1): E$(I)=E$(I+1): I$(I)=I$(I+1): M$(I)=M$(I+1): NEXT I
4060 N=N-1: CB=1: PRINT "Baja anotada."
4090 GOSUB 9000: RETURN
5000 PRINT C$;"E";C$;"H";
5010 IF CB THEN PRINT "Grabando ";F$;"...": GOSUB 8500
5020 PRINT N;"libros en ";F$;". Hasta otra."
5030 PRINT "SYSTEM vuelve a CP/M.": END
7000 REM ordena por titulo (burbuja)
7010 FOR I=1 TO N-1: FOR J=1 TO N-I
7020 IF T$(J)>T$(J+1) THEN SWAP T$(J),T$(J+1): SWAP A$(J),A$(J+1): SWAP E$(J),E$(J+1): SWAP I$(J),I$(J+1): SWAP M$(J),M$(J+1)
7030 NEXT J,I: OD=1: RETURN
8000 REM lee el fichero del disco
8010 OPEN "I",#1,F$
8020 WHILE NOT EOF(1) AND N<MX
8030 N=N+1: INPUT #1,T$(N),A$(N),E$(N),I$(N),M$(N)
8040 WEND: CLOSE #1: RETURN
8500 REM graba el fichero en el disco
8510 OPEN "O",#1,F$
8520 FOR I=1 TO N: WRITE #1,T$(I),A$(I),E$(I),I$(I),M$(I): NEXT I
8530 CLOSE #1: CB=0: RETURN
9000 PRINT: PRINT "Pulsa una tecla...";: WHILE INKEY$="": WEND: RETURN`;
  const LIBROS = `"EL LENGUAJE DE PROGRAMACION C","B.W. KERNIGHAN / D.M. RITCHIE","PRENTICE-HALL","84-8320-818-0","INFORMATICA"
"ALGORITMOS + ESTRUCTURAS DE DATOS = PROGRAMAS","NIKLAUS WIRTH","DEL CASTILLO","84-219-9212-0","INFORMATICA"
"PROGRAMACION DEL Z80","RODNAY ZAKS","ANAYA MULTIMEDIA","84-7614-778-3","INFORMATICA"
"MANUAL DEL USUARIO PCW 8256/8512","AMSTRAD","AMSTRAD","84-505-4401-7","INFORMATICA"
"EL NOMBRE DE LA ROSA","UMBERTO ECO","LUMEN","84-264-8456-5","NOVELA"
"EL PERFUME","PATRICK SUSKIND","SEIX BARRAL","84-322-8129-8","NOVELA"
"LA CONJURA DE LOS NECIOS","JOHN KENNEDY TOOLE","ANAGRAMA","84-339-2331-5","NOVELA"
"LA PLACA DEL DIAMANT","MERCE RODOREDA","CLUB EDITOR","84-7329-176-X","NOVELA"
"1984","GEORGE ORWELL","DESTINO","84-233-6635-9","NOVELA"
"YO, ROBOT","ISAAC ASIMOV","EDHASA","84-350-8429-9","CIENCIA FICCION"
"EL SENOR DE LOS ANILLOS","J.R.R. TOLKIEN","MINOTAURO","84-450-0268-6","CIENCIA FICCION"
"BREVE HISTORIA DEL TIEMPO","STEPHEN W. HAWKING","CRITICA","84-7423-180-9","CIENCIA"
"DON QUIJOTE DE LA MANCHA","MIGUEL DE CERVANTES","CATEDRA","84-376-2560-2","CLASICOS"
"TIRANT LO BLANC","JOANOT MARTORELL","EDICIONS 62","84-297-4169-0","CLASICOS"`;
  const MASTER = `10 REM MASTERMIND - break the secret code in 10 tries
20 REM Mallard BASIC on the Amstrad PCW 8512
30 E$=CHR$(27): DIM S(4),G(4),U(4),V(4)
40 PRINT E$;"E";E$;"H";E$;"p";SPACE$(35);"M A S T E R M I N D";SPACE$(36);E$;"q"
50 PRINT: PRINT "I have chosen a code of 4 digits, each one from 1 to 6. Digits may repeat."
60 PRINT "After each guess:  * = right digit in the right place"
70 PRINT "                   + = right digit in the wrong place"
80 PRINT "You have 10 tries. Q gives up.": PRINT
90 FOR I=1 TO 4: S(I)=INT(RND*6)+1: NEXT I
100 FOR T=1 TO 10
110 PRINT "Try";T;: INPUT G$: G$=UPPER$(G$)
120 IF G$="Q" THEN 300
130 OK=(LEN(G$)=4)
140 FOR I=1 TO 4: D=VAL(MID$(G$+"0000",I,1)): G(I)=D: IF D<1 OR D>6 THEN OK=0
150 NEXT I
160 IF NOT OK THEN PRINT "Four digits, 1 to 6, like 1234.": GOTO 110
170 B=0: W=0
180 FOR I=1 TO 4: U(I)=S(I): V(I)=G(I): IF V(I)=U(I) THEN B=B+1: U(I)=0: V(I)=-1
190 NEXT I
200 FOR I=1 TO 4: FOR J=1 TO 4: IF V(I)>0 AND V(I)=U(J) THEN W=W+1: U(J)=0: V(I)=-1
210 NEXT J,I
220 PRINT TAB(24);G$;"   ";STRING$(B,"*");STRING$(W,"+");STRING$(4-B-W,".")
230 IF B=4 THEN 400
240 NEXT T
250 PRINT: PRINT "Out of tries. The code was ";: GOSUB 500: GOTO 600
300 PRINT "You gave up. The code was ";: GOSUB 500: GOTO 600
400 PRINT: PRINT CHR$(7);"Code broken in";T;"tries!"
410 IF T<=4 THEN PRINT "Impressive. Are you sure you are not a computer?"
420 GOTO 600
500 FOR I=1 TO 4: PRINT CHR$(48+S(I));: NEXT I: PRINT: RETURN
600 PRINT: PRINT "Another game (Y/N)? ";
610 K$=UPPER$(INKEY$): IF K$<>"Y" AND K$<>"N" THEN 610
620 PRINT K$: IF K$="Y" THEN 40
630 PRINT "RUN plays again, SYSTEM goes back to CP/M.": END`;
  const TIMELINE = `THE AMSTRAD PCW YEARS (c. 1988)

My second computer: an Amstrad PCW 8512. Green screen, two 3" disc drives, a printer in
the box, and CP/M Plus: the system MS-DOS would later look so much like.

  - LocoScript, its word processor, wrote most of my letters.
  - Locomotive's BASIC, Z80 assembler again, and CP/M.
  - My first paid program: the catalogue of a personal library (BIBLIO.BAS, with its books
    in LIBROS.DAT, on this disc). I wrote it here, printed the listing on the dot-matrix
    printer and typed it in again, by hand, on the client's IBM PC Portable, fixing the
    differences between the two BASICs.
  - My first crack: Head Over Heels. I disassembled its boot code and patched the copy
    protection, just to see if I could. A personal challenge, for my own copy.
  - A full program for a textile manufacturer: stock, customers, delivery notes, orders
    and invoices.

Try: BASIC BIBLIO, or BASIC MASTER for a game.`;
  const SYSF = { "J14CPM3.EMS": 25, "BASIC.COM": 29, "DATE.COM": 3, "SHOW.COM": 9, "HELP.COM": 7, "HELP.HLP": 83 };   // sizes in K, for SHOW

  let el, cv, ctx, inp, done, alive = false, dirty = true, frameN = 0, flashOn = true;
  const scr = new Uint8Array(COLS * ROWS).fill(32), rev = new Uint8Array(COLS * ROWS);
  let row = 0, col = 0, revOn = 0, curVis = true, escSeq = null, waiting = false, running = false, stopReq = false;
  let kq = [], kwake = null, drive = "A", disc = {};
  let prog = new Map(), lc = null, vars = {}, arrs = {}, gosubs = [], fors = [], whiles = [], data = [], dptr = 0, cont = null;
  let L = 0, T = [], P = 0, jmp = false, ended = false, files = {}, sink = null;

  // ---------- the console: 90x32, scrolling, escape codes ----------
  function scroll() { scr.copyWithin(0, COLS); rev.copyWithin(0, COLS); scr.fill(32, (ROWS - 1) * COLS); rev.fill(0, (ROWS - 1) * COLS); }
  function cls() { scr.fill(32); rev.fill(0); row = col = 0; }
  function nl() { col = 0; if (++row >= ROWS) { scroll(); row = ROWS - 1; } }
  function putc(c) {
    if (escSeq) {
      escSeq.push(c);
      const k = String.fromCharCode(escSeq[0]);
      if (k === "Y") { if (escSeq.length < 3) return; row = Math.min(Math.max(escSeq[1] - 32, 0), ROWS - 1); col = Math.min(Math.max(escSeq[2] - 32, 0), COLS - 1); }
      else if (k === "E") cls();
      else if (k === "H") row = col = 0;
      else if (k === "p") revOn = 1;
      else if (k === "q") revOn = 0;
      else if (k === "e") curVis = true;
      else if (k === "f") curVis = false;
      else if (k === "K") { scr.fill(32, row * COLS + col, (row + 1) * COLS); rev.fill(0, row * COLS + col, (row + 1) * COLS); }
      else if (k === "J") { scr.fill(32, row * COLS + col); rev.fill(0, row * COLS + col); }
      escSeq = null; return;
    }
    if (c === 27) { escSeq = []; return; }
    if (c === 13) { col = 0; return; }
    if (c === 10) { nl(); return; }
    if (c === 8) { if (col) col--; return; }
    if (c === 7) { sfx.tone(1000, .12, "square", .04); return; }
    if (c < 32) return;
    if (col >= COLS) nl();
    scr[row * COLS + col] = c < 256 ? c : 63; rev[row * COLS + col] = revOn; col++;
  }
  function out(s) { for (const ch of String(s)) { if (ch === "\n") { putc(13); putc(10); } else putc(ch.charCodeAt(0)); } dirty = true; }
  const say = s => out(s + "\n");

  // ---------- keyboard: one queue for line input and INKEY$ ----------
  function push(k) { kq.push(k); const w = kwake; kwake = null; w?.(); }
  async function getKey() {
    while (!kq.length) { if (!alive) return null; await new Promise(r => { kwake = r; }); }
    return kq.shift();
  }
  async function readLine() {                           // echoes as it is typed; Enter ends it, Esc (while running) gives null
    let s = ""; waiting = true; dirty = true;
    try {
      for (;;) {
        const k = await getKey();
        if (k === null || k === "\x1b" || stopReq) return null;
        if (k === "\r") { out("\n"); return s; }
        if (k === "\b") { if (s) { s = s.slice(0, -1); if (col) col--; else if (row) { row--; col = COLS - 1; } scr[row * COLS + col] = 32; dirty = true; } continue; }
        if (k.length === 1 && k >= " " && s.length < 255) { s += k; out(k); }
      }
    } finally { waiting = false; dirty = true; }
  }
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  const brk = () => { if (stopReq || !alive) throw bad("Break"); };

  // ---------- the disc ----------
  function freshDisc() {
    const A = {};
    for (const n of Object.keys(SYSF)) A[n] = { sys: true };
    Object.assign(A, { "BIBLIO.BAS": { text: BIBLIO }, "LIBROS.DAT": { text: LIBROS }, "MASTER.BAS": { text: MASTER }, "TIMELINE.TXT": { text: TIMELINE } });
    disc = { A, B: {}, M: {} };
  }
  function fname(s, ext) {                              // "m:biblio" -> ["M", "BIBLIO.BAS"]
    let d = drive; s = s.trim().toUpperCase();
    const m = /^([A-P]):(.*)$/.exec(s); if (m) { d = m[1]; s = m[2]; }
    if (!(d in disc)) throw bad("Drive not found");
    if (ext && s && !s.includes(".")) s += "." + ext;
    return [d, s];
  }
  const valid = n => /^[A-Z0-9$_-]{1,8}(\.[A-Z0-9$_-]{0,3})?$/.test(n);
  function matches(d, pat) {
    const [b, e = "*"] = (pat || "*.*").split("."), f = x => x.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
    const re = new RegExp(`^${f(b)}\\.${f(e)}$`);
    return Object.keys(disc[d]).filter(n => re.test(n.includes(".") ? n : n + ".")).sort();
  }
  const used = d => Object.entries(disc[d]).reduce((s, [n, f]) => s + (f.sys ? SYSF[n] || 1 : Math.max(1, Math.ceil((f.text || "").length / 1024))), 0);
  const free = d => Math.max(0, ({ A: 173, B: 706, M: 368 }[d]) - used(d));
  const spin = (dur, steps) => {                       // the 3" drive: low motor hum and a few slow head steps
    sfx.tone(48, dur, "sawtooth", .018); sfx.tone(96, dur, "triangle", .008);
    for (let i = 0; i < steps; i++) sfx.tone(70 + Math.random() * 20, .04, "square", .03, .2 + i * (dur - .4) / Math.max(1, steps - 1));
  };
  const whirr = async () => { spin(.7, 2); await sleep(GM.reduce ? 80 : 700); };

  // ---------- BASIC: tokenizer (keywords are whole words; names are upper case) ----------
  function norm(s) {                                    // upper case outside quotes, until REM, ' or DATA
    let o = "", q = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '"') q = !q;
      else if (!q && !/[A-Z0-9$%.]/i.test(s[i - 1] || "")) {
        const m = c === "'" ? "'" : (/^(REM|DATA)\b/i.exec(s.slice(i)) || [])[0];
        if (m) return o + m.toUpperCase() + s.slice(i + m.length);
      }
      o += q ? c : c.toUpperCase();
    }
    return o;
  }
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " " || c === "\t") { i++; continue; }
      if (c === '"') { const j = s.indexOf('"', i + 1), e = j < 0 ? s.length : j; t.push({ k: "s", v: s.slice(i + 1, e) }); i = e + 1; continue; }
      if (/[0-9.]/.test(c)) { const m = /^\d*\.?\d*(?:E[+-]?\d+)?/i.exec(s.slice(i))[0] || c; t.push({ k: "n", v: parseFloat(m) || 0 }); i += m.length; continue; }
      if (c === "'") { t.push({ k: "k", v: "REM" }); break; }
      if (c === "?") { t.push({ k: "k", v: "PRINT" }); i++; continue; }
      if (/[a-z]/i.test(c)) {
        const w = /^[a-z][a-z0-9.]*[$%!]?/i.exec(s.slice(i))[0], U = w.toUpperCase(); i += w.length;
        if (!WORDS.has(U)) { t.push({ k: "v", v: U.replace(/!$/, "") }); continue; }
        t.push({ k: "k", v: U });
        if (U === "REM") break;
        if (U === "DATA") {                             // the rest, up to a colon outside quotes, stays as typed
          let j = i, q = false; while (j < s.length && (q || s[j] !== ":")) { if (s[j] === '"') q = !q; j++; }
          t.push({ k: "d", v: s.slice(i, j) }); i = j;
        }
        continue;
      }
      const two = s.slice(i, i + 2);
      if (["<=", ">=", "<>", "=<", "=>", "><"].includes(two)) { t.push({ k: "o", v: { "=<": "<=", "=>": ">=", "><": "<>" }[two] || two }); i += 2; continue; }
      t.push({ k: "o", v: c }); i++;
    }
    return t;
  }
  const lines = () => lc || (lc = [...prog.keys()].sort((a, b) => a - b));
  const nextLine = n => { const ls = lines(), i = ls.indexOf(n); return i >= 0 && i + 1 < ls.length ? ls[i + 1] : null; };
  const store = (n, s) => { const src = norm(s.trim()); prog.set(n, { src, T: tokenize(src) }); lc = null; };
  const listing = () => lines().map(n => `${n} ${prog.get(n).src}`).join("\n");

  // ---------- expressions: Microsoft rules (true is -1, ^ before unary minus, \ and MOD) ----------
  const is = (k, v) => P < T.length && T[P].k === k && (v === undefined || T[P].v === v);
  const op = v => is("o", v), kw = v => is("k", v);
  function need(k, v) { if (!is(k, v)) throw bad(SYN); P++; }
  const num = x => { if (typeof x !== "number") throw bad("Type mismatch"); return x; };
  const str = x => { if (typeof x !== "string") throw bad("Type mismatch"); return x; };
  const fin = x => { if (!isFinite(x)) throw bad("Overflow"); return x; };
  const i16 = x => { x = Math.round(num(x)); if (x < -32768 || x > 65535) throw bad("Overflow"); return x; };
  const tf = b => b ? -1 : 0;
  const ill = () => bad("Illegal function call");
  const expr = () => xorE();
  function xorE() { let a = orE(); while (kw("XOR")) { P++; a = i16(a) ^ i16(orE()); } return a; }
  function orE() { let a = andE(); while (kw("OR")) { P++; a = i16(a) | i16(andE()); } return a; }
  function andE() { let a = notE(); while (kw("AND")) { P++; a = i16(a) & i16(notE()); } return a; }
  function notE() { if (kw("NOT")) { P++; return ~i16(notE()); } return rel(); }
  function rel() {
    let a = add();
    for (;;) {
      const o = ["=", "<", ">", "<=", ">=", "<>"].find(op);
      if (!o) return a;
      P++;
      const b = add();
      if (typeof a !== typeof b) throw bad("Type mismatch");
      a = tf({ "=": a === b, "<": a < b, ">": a > b, "<=": a <= b, ">=": a >= b, "<>": a !== b }[o]);
    }
  }
  function add() {
    let a = modE();
    while (op("+") || op("-")) { const o = T[P++].v, b = modE(); a = o === "+" && typeof a === "string" ? a + str(b) : fin(o === "+" ? num(a) + num(b) : num(a) - num(b)); }
    return a;
  }
  function modE() { let a = idiv(); while (kw("MOD")) { P++; const b = i16(idiv()); if (!b) throw bad("Division by zero"); a = i16(a) % b; } return a; }
  function idiv() { let a = mul(); while (op("\\")) { P++; const b = i16(mul()); if (!b) throw bad("Division by zero"); a = Math.trunc(i16(a) / b); } return a; }
  function mul() {
    let a = neg();
    while (op("*") || op("/")) { const o = T[P++].v, b = num(neg()); if (o === "/" && !b) throw bad("Division by zero"); a = fin(o === "*" ? num(a) * b : num(a) / b); }
    return a;
  }
  function neg() { if (op("-")) { P++; return -num(neg()); } if (op("+")) { P++; return neg(); } return pow(); }
  function pow() { let a = prim(); while (op("^")) { P++; const b = op("-") ? (P++, -num(prim())) : num(prim()); a = fin(Math.pow(num(a), b)); } return a; }
  function args() { need("o", "("); const a = [expr()]; while (op(",")) { P++; a.push(expr()); } need("o", ")"); return a; }
  function prim() {
    const t = T[P];
    if (!t) throw bad(SYN);
    if (t.k === "n" || t.k === "s") { P++; return t.v; }
    if (op("(")) { P++; const v = expr(); need("o", ")"); return v; }
    if (t.k === "v") { P++; return getVar(t.v); }
    if (t.k !== "k" || !FUNCS.has(t.v)) throw bad(SYN);
    P++;
    return func(t.v);
  }
  function func(f) {
    if (f === "INKEY$") return kq.length && kq[0] !== "\x1b" ? kq.shift() : "";
    if (f === "RND") { if (op("(")) args(); return Math.random(); }
    const a = args(), x = a[0];
    const n = (i, lo = 0, hi = 255) => { const v = Math.round(num(a[i])); if (v < lo || v > hi) throw ill(); return v; };
    switch (f) {
      case "EOF": return tf(atEnd(fileIn(n(0, 1, 15))));
      case "ABS": return Math.abs(num(x));
      case "ASC": if (!str(x).length) throw ill(); return x.charCodeAt(0);
      case "ATN": return Math.atan(num(x));
      case "CHR$": return String.fromCharCode(n(0));
      case "COS": return Math.cos(num(x));
      case "EXP": return fin(Math.exp(num(x)));
      case "FIX": return Math.trunc(num(x));
      case "HEX$": return (i16(x) & 65535).toString(16).toUpperCase();
      case "INSTR": {
        const [s0, s, t] = typeof x === "number" ? [n(0, 1, 255), str(a[1]), str(a[2])] : [1, str(a[0]), str(a[1])];
        return s.indexOf(t, s0 - 1) + 1;
      }
      case "INT": return Math.floor(num(x));
      case "LEFT$": return str(x).slice(0, n(1));
      case "LEN": return str(x).length;
      case "LOG": if (num(x) <= 0) throw ill(); return Math.log(x);
      case "LOWER$": return str(x).toLowerCase();
      case "MID$": { const s = str(x), p = n(1, 1, 255); return s.substr(p - 1, a.length > 2 ? n(2) : 255); }
      case "RIGHT$": { const s = str(x), k = n(1); return k ? s.slice(-k) : ""; }
      case "SGN": return Math.sign(num(x));
      case "SIN": return Math.sin(num(x));
      case "SPACE$": return " ".repeat(n(0));
      case "SQR": if (num(x) < 0) throw ill(); return Math.sqrt(x);
      case "STR$": return fmtN(num(x));
      case "STRING$": return (typeof a[1] === "string" ? a[1][0] || "" : String.fromCharCode(n(1))).repeat(n(0));
      case "TAN": return fin(Math.tan(num(x)));
      case "UPPER$": return str(x).toUpperCase();
      case "VAL": { const m = /^\s*[+-]?(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/i.exec(str(x)); return m ? parseFloat(m[0]) : 0; }
    }
    throw bad(SYN);
  }
  function fmtN(n) {                                    // " 5", "-2.5", " .333333333": a space where the sign would go
    const a = Math.abs(n);
    let s = Number.isInteger(a) && a < 1e10 ? String(a) : String(+a.toPrecision(9));
    if (/e/.test(s)) s = a.toExponential(6).replace(/\.?0+e/, "e").toUpperCase();
    return (n < 0 ? "-" : " ") + s.replace(/^0\./, ".");
  }
  const isS = n => n.endsWith("$");
  const dflt = n => isS(n) ? "" : 0;
  const cast = (n, v) => isS(n) ? str(v) : n.endsWith("%") ? i16(v) : num(v);
  function getVar(n) { if (op("(")) return elem(n).get(); return n in vars ? vars[n] : dflt(n); }
  function dim(n, d) {
    if (arrs[n]) throw bad("Duplicate Definition");
    const size = d.reduce((s, x) => s * (x + 1), 1);
    if (d.some(x => x < 0) || size > 20000) throw bad(size > 20000 ? "Out of memory" : "Illegal function call");
    arrs[n] = { d, v: new Array(size).fill(dflt(n)) };
  }
  function elem(n) {                                    // A(3) or T$(I,J): from 0; an undimensioned array gets 10
    const ix = args().map(v => Math.round(num(v)));
    if (!arrs[n]) dim(n, ix.map(() => 10));
    const a = arrs[n];
    if (ix.length !== a.d.length || ix.some((v, i) => v < 0 || v > a.d[i])) throw bad("Subscript out of range");
    const at = ix.reduce((s, v, i) => s * (a.d[i] + 1) + v, 0);
    return { name: n, get: () => a.v[at], set: v => { a.v[at] = cast(n, v); } };
  }
  function target() {
    const t = T[P]; need("v");
    if (op("(")) return elem(t.v);
    return { name: t.v, get: () => t.v in vars ? vars[t.v] : dflt(t.v), set: v => { vars[t.v] = cast(t.v, v); } };
  }

  // ---------- PRINT (with TAB, SPC and USING) and INPUT ----------
  function using(fmt, vals) {                           // ### ##.## +# #,### for numbers; & ! \  \ for strings; the rest is literal
    let o = "", vi = 0, i = 0, any = false;
    while (vi < vals.length) {
      if (i >= fmt.length) { if (!any) throw ill(); i = 0; }
      const c = fmt[i], m = /^\+?[#,]*\.?#*/.exec(fmt.slice(i))[0];
      if (m.includes("#")) {
        any = true; i += m.length;
        const v = num(vals[vi++]), dec = m.includes(".") ? m.split(".")[1].length : 0;
        let s = Math.abs(v).toFixed(dec); if (m.includes(",")) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (v < 0) s = "-" + s; else if (m.startsWith("+")) s = "+" + s;
        o += s.length > m.length ? "%" + s : s.padStart(m.length);
        continue;
      }
      if (c === "&") { any = true; i++; o += str(vals[vi++]); continue; }
      if (c === "!") { any = true; i++; o += str(vals[vi++]).slice(0, 1); continue; }
      if (c === "\\") { const j = fmt.indexOf("\\", i + 1); if (j > 0) { any = true; const w = j - i + 1; o += str(vals[vi++]).slice(0, w).padEnd(w); i = j + 1; continue; } }
      o += c; i++;
    }
    while (i < fmt.length && !/[#&!\\+]/.test(fmt[i])) o += fmt[i++];
    return o;
  }
  // PRINT writes to the screen, or (PRINT #n) to a file: sink is the open file
  const w = s => { if (!sink) return out(s); for (const ch of String(s)) { if (ch === "\n") { sink.text += "\n"; sink.col = 0; } else { sink.text += ch; sink.col++; } } };
  const cc = () => sink ? sink.col : col;
  function printStmt() {
    if (kw("USING")) {
      P++; const f = str(expr()); need("o", ";");
      const vals = []; let tail = true;
      while (!endStmt()) { if (op(";") || op(",")) { P++; tail = false; continue; } vals.push(expr()); tail = true; }
      w(using(f, vals)); if (tail) w("\n"); return;
    }
    let newl = true;
    while (!endStmt()) {
      newl = true;
      if (op(";")) { P++; newl = false; continue; }
      if (op(",")) { P++; const z = (Math.floor(cc() / 15) + 1) * 15; if (z >= COLS) w("\n"); else w(" ".repeat(z - cc())); newl = false; continue; }
      if (kw("TAB") || kw("SPC")) {
        const f = T[P++].v; need("o", "("); const v = Math.round(num(expr())); need("o", ")");
        if (f === "SPC") w(" ".repeat(Math.max(0, v)));
        else { const c = (Math.max(1, v) - 1) % COLS; if (c < cc()) w("\n"); w(" ".repeat(c - cc())); }
        newl = false; continue;
      }
      const v = expr();
      w(typeof v === "number" ? fmtN(v) + " " : v);
      newl = !(op(";") || op(","));
    }
    if (newl) w("\n");
  }
  async function inputStmt(lineMode) {                  // INPUT "Name";A$ asks "Name? "; with a comma, no "?"
    let prompt = lineMode ? "" : "? ";
    if (op(";")) P++;
    if (is("s")) {
      const s = T[P++].v;
      if (op(",")) { P++; prompt = s; } else { need("o", ";"); prompt = lineMode ? s : s + "? "; }
    }
    const ts = [target()]; while (!lineMode && op(",")) { P++; ts.push(target()); }
    for (;;) {
      out(prompt);
      const s = await readLine();
      if (s === null) throw bad("Break");
      if (lineMode) { ts[0].set(s); return; }
      const parts = s.split(","), vals = [];
      let okay = parts.length === ts.length;
      ts.forEach((t, i) => {
        const p = (parts[i] ?? "").trim(), q = /^"(.*)"$/.exec(p);
        if (isS(t.name)) vals.push(q ? q[1] : p);
        else if (NUMRE.test(p) || p === "") vals.push(+p || 0); else okay = false;
      });
      if (okay) { ts.forEach((t, i) => t.set(vals[i])); return; }
      say("?Redo from start");
    }
  }

  // ---------- sequential files: OPEN "I"/"O"/"A",#n,"name"; PRINT #, WRITE #, INPUT #, LINE INPUT #, EOF, CLOSE ----------
  function fileNo() { if (op("#")) P++; const n = Math.round(num(expr())); if (n < 1 || n > 15) throw bad("Bad file number"); return n; }
  function fileIn(n) { const f = files[n]; if (!f) throw bad("File not open"); if (f.mode !== "I") throw bad("Bad file mode"); return f; }
  function fileOut(n) { const f = files[n]; if (!f) throw bad("File not open"); if (f.mode === "I") throw bad("Bad file mode"); return f; }
  function flush(n) { const f = files[n]; if (f && f.mode !== "I") f.disc[f.name] = { text: f.text.replace(/\n$/, "") }; delete files[n]; }
  const closeAll = () => Object.keys(files).forEach(flush);
  const atEnd = f => !/\S/.test(f.text.slice(f.pos));
  async function openStmt() {
    const mode = str(expr()).toUpperCase(); need("o", ","); const n = fileNo(); need("o", ","); const [d, name] = fname(str(expr()));
    if (files[n]) throw bad("File already open");
    if (!valid(name)) throw bad("Bad file name");
    await whirr();
    const old = disc[d][name];
    if (mode === "I") { if (!old || old.sys) throw bad("File not found"); files[n] = { mode, name, text: old.text, pos: 0 }; }
    else if (mode === "O" || mode === "A") files[n] = { mode, name, disc: disc[d], text: mode === "A" && old && !old.sys ? old.text + "\n" : "", col: 0 };
    else throw bad("Bad file mode");
  }
  function readItem(f, whole) {                         // one field: "quoted" or up to a comma; LINE INPUT #: the whole line
    if (atEnd(f)) throw bad("Input past end");
    const t = f.text; let p = f.pos, v;
    if (whole) { let e = t.indexOf("\n", p); if (e < 0) e = t.length; f.pos = e + 1; return t.slice(p, e); }
    while (t[p] === " " || t[p] === "\n" || t[p] === "\r") p++;
    if (t[p] === '"') { let e = t.indexOf('"', p + 1); if (e < 0) e = t.length; v = t.slice(p + 1, e); p = e + 1; while (p < t.length && t[p] !== "," && t[p] !== "\n") p++; }
    else { let e = p; while (e < t.length && t[e] !== "," && t[e] !== "\n") e++; v = t.slice(p, e).trim(); p = e; }
    if (t[p] === "," || t[p] === "\n") p++;
    f.pos = p; return v;
  }
  function fileInput(whole) {
    const f = fileIn(fileNo()); need("o", ",");
    for (;;) {
      const r = target(), v = readItem(f, whole);
      if (isS(r.name)) r.set(v); else { if (v.trim() && !NUMRE.test(v.trim())) throw bad("Type mismatch"); r.set(+v || 0); }
      if (whole || !op(",")) return;
      P++;
    }
  }
  function writeStmt() {                                // strings in quotes, numbers without spaces, commas between
    const items = [];
    while (!endStmt()) { if (op(",") || op(";")) { P++; continue; } const v = expr(); items.push(typeof v === "string" ? `"${v}"` : fmtN(v).trim()); }
    w(items.join(",") + "\n");
  }

  // ---------- statements ----------
  const endStmt = () => P >= T.length || op(":") || kw("ELSE");
  const lineArg = () => { const t = T[P]; if (!t || t.k !== "n") throw bad(SYN); P++; return t.v; };
  function goLine(n) { if (!prog.has(n)) throw bad("Undefined line number"); L = n; T = prog.get(n).T; P = 0; jmp = true; }
  const back = at => { [L, T, P] = at; jmp = true; };
  function clr() {
    closeAll(); vars = {}; arrs = {}; gosubs = []; fors = []; whiles = []; data = []; dptr = 0;
    for (const n of lines()) for (const t of prog.get(n).T) if (t.k === "d") {
      const s = t.v; let cur = "", q = false;
      for (let i = 0; i <= s.length; i++) {
        const c = s[i];
        if (i === s.length || (c === "," && !q)) { const v = cur.trim(); data.push({ n, v: /^".*"$/.test(v) ? v.slice(1, -1) : v }); cur = ""; continue; }
        if (c === '"') q = !q;
        cur += c;
      }
    }
  }
  function seek(open, close, from) {                    // the matching NEXT / WEND, further on in the program
    let ln = L, ts = T, i = from, depth = 0;
    for (;;) {
      for (; i < ts.length; i++) {
        if (ts[i].k !== "k") continue;
        if (ts[i].v === open) { depth++; continue; }
        if (ts[i].v !== close) continue;
        let k = 1, j = i + 1;                           // NEXT J,I closes two loops
        if (close === "NEXT") { k = 0; while (ts[j]?.k === "v") { k++; j++; if (ts[j]?.k === "o" && ts[j].v === ",") j++; else break; } k = Math.max(1, k); }
        if ((depth -= k) < 0) { L = ln; T = ts; P = j; jmp = true; return; }
      }
      const nx = ln ? nextLine(ln) : null;
      if (nx === null) throw bad(open === "FOR" ? "FOR without NEXT" : "WHILE without WEND");
      ln = nx; ts = prog.get(nx).T; i = 0;
    }
  }
  function skipToElse() {                               // an IF that failed: on after its ELSE, or to the next line
    let depth = 0;
    for (; P < T.length; P++) {
      if (kw("IF")) depth++;
      else if (kw("ELSE") && depth-- === 0) { P++; if (is("n")) goLine(lineArg()); else jmp = true; return; }
    }
  }
  const same = (a, b) => a && a[1] === b[1] && a[2] === b[2];
  async function stmt() {
    const t = T[P];
    if (t.k === "v") { const r = target(); need("o", "="); r.set(expr()); return; }   // LET is optional
    if (t.k !== "k") throw bad(SYN);
    P++;
    switch (t.v) {
      case "LET": { const r = target(); need("o", "="); r.set(expr()); return; }
      case "PRINT": case "LPRINT":                          // no printer attached: LPRINT shows it here
        if (op("#")) { const f = fileOut(fileNo()); need("o", ","); sink = f; try { return printStmt(); } finally { sink = null; } }
        return printStmt();
      case "WRITE":
        if (op("#")) { const f = fileOut(fileNo()); need("o", ","); sink = f; try { return writeStmt(); } finally { sink = null; } }
        return writeStmt();
      case "INPUT": return op("#") ? fileInput(false) : inputStmt(false);
      case "LINE": need("k", "INPUT"); return op("#") ? fileInput(true) : inputStmt(true);
      case "REM": case "DATA": P = T.length; return;
      case "ELSE": P = T.length; return;                     // the THEN part ran: skip the rest
      case "END": closeAll(); ended = true; cont = null; return;
      case "STOP": throw { stop: true };
      case "GOTO": return goLine(lineArg());
      case "GOSUB": { const n = lineArg(); gosubs.push([L, T, P]); return goLine(n); }
      case "RETURN": if (!gosubs.length) throw bad("RETURN without GOSUB"); return back(gosubs.pop());
      case "ON": {
        const v = Math.round(num(expr())), g = kw("GOSUB"); if (!g && !kw("GOTO")) throw bad(SYN); P++;
        const ls = [lineArg()]; while (op(",")) { P++; ls.push(lineArg()); }
        if (v < 0 || v > 255) throw ill();
        if (v < 1 || v > ls.length) return;
        if (g) gosubs.push([L, T, P]);
        return goLine(ls[v - 1]);
      }
      case "IF": {
        const c = num(expr());
        if (kw("THEN")) P++; else if (!kw("GOTO")) throw bad(SYN);
        if (!c) return skipToElse();
        if (kw("GOTO")) P++;
        if (is("n")) return goLine(lineArg());
        jmp = true; return stmt();
      }
      case "FOR": {
        const v = T[P]; need("v"); need("o", "="); const a = num(expr()); need("k", "TO"); const lim = num(expr());
        let step = 1; if (kw("STEP")) { P++; step = num(expr()); }
        vars[v.v] = cast(v.v, a);
        fors = fors.filter(f => f.v !== v.v);
        if (step >= 0 ? a > lim : a < lim) return seek("FOR", "NEXT", P);
        fors.push({ v: v.v, lim, step, at: [L, T, P] });
        return;
      }
      case "NEXT": {
        for (;;) {
          let f;
          if (is("v")) { const n = T[P++].v, i = fors.findLastIndex(x => x.v === n); if (i < 0) throw bad("NEXT without FOR"); fors.length = i + 1; f = fors[i]; }
          else { f = fors.at(-1); if (!f) throw bad("NEXT without FOR"); }
          const x = vars[f.v] + f.step; vars[f.v] = cast(f.v, x);
          if (f.step >= 0 ? x <= f.lim : x >= f.lim) return back(f.at);
          fors.pop();
          if (!op(",")) return;
          P++;
        }
      }
      case "WHILE": {
        const at = [L, T, P - 1], c = num(expr());
        if (c) { if (!same(whiles.at(-1), at)) whiles.push(at); return; }
        if (same(whiles.at(-1), at)) whiles.pop();
        return seek("WHILE", "WEND", P);
      }
      case "WEND": if (!whiles.length) throw bad("WEND without WHILE"); return back(whiles.at(-1));
      case "DIM": for (;;) { const v = T[P]; need("v"); dim(v.v, args().map(x => Math.round(num(x)))); if (!op(",")) return; P++; }
      case "READ": for (;;) {
        const r = target(); if (dptr >= data.length) throw bad("Out of DATA");
        const d = data[dptr++];
        if (isS(r.name)) r.set(d.v); else { if (!NUMRE.test(d.v)) { L = d.n; throw bad(SYN); } r.set(+d.v); }
        if (!op(",")) return; P++;
      }
      case "RESTORE": { const n = endStmt() ? 0 : lineArg(); dptr = data.findIndex(d => d.n >= n); if (dptr < 0) dptr = data.length; return; }
      case "RANDOMIZE": if (!endStmt()) num(expr()); return;
      case "SWAP": { const a = target(); need("o", ","); const b = target(); const x = a.get(), y = b.get(); if (typeof x !== typeof y) throw bad("Type mismatch"); a.set(y); b.set(x); return; }
      case "WIDTH": while (!endStmt()) P++; return;
      case "CLS": throw bad(SYN);                         // Mallard has no CLS: PRINT CHR$(27)+"E"
      case "OPEN": return openStmt();
      case "CLOSE": {
        const any = Object.values(files).some(f => f.mode !== "I");
        if (endStmt()) closeAll(); else for (;;) { flush(fileNo()); if (!op(",")) break; P++; }
        if (any) await whirr();
        return;
      }
      default: return command(t.v);
    }
  }
  async function command(c) {                           // the ones usually typed at Ok (they work in a program too)
    switch (c) {
      case "RUN": {
        if (is("s")) { await loadProg(T[P++].v); clr(); cont = null; return goFirst(); }
        clr(); cont = null;
        if (is("n")) return goLine(lineArg());
        return goFirst();
      }
      case "LIST": case "LLIST": {
        let a = 0, b = 65535;
        if (is("n")) a = b = lineArg();
        if (op("-")) { P++; b = is("n") ? lineArg() : 65535; }
        let k = 0;
        for (const n of lines()) if (n >= a && n <= b) { say(`${n} ${prog.get(n).src}`); if (++k % 8 === 0) { await frame(); brk(); } }
        return;
      }
      case "NEW": prog = new Map(); lc = null; clr(); cont = null; ended = true; return;
      case "CONT": if (!cont) throw bad("Can't continue"); { const c2 = cont; cont = null; return back(c2); }
      case "CLEAR": while (!endStmt()) P++; clr(); return;
      case "DELETE": { const a = lineArg(); let b = a; if (op("-")) { P++; b = lineArg(); } for (const n of lines()) if (n >= a && n <= b) prog.delete(n); lc = null; ended = true; return; }
      case "LOAD": { await loadProg(str(expr())); clr(); cont = null; ended = true; return; }
      case "SAVE": {
        const [d, n] = fname(str(expr()), "BAS"); if (op(",")) { P++; need("v"); }
        if (!valid(n)) throw bad("Bad file name");
        await whirr(); disc[d][n] = { text: listing() }; return;
      }
      case "FILES": {
        const [d, pat] = endStmt() ? [drive, "*.*"] : fname(str(expr()));
        await whirr();
        const fs = matches(d, pat || "*.*");
        if (!fs.length) throw bad("File not found");
        for (let i = 0; i < fs.length; i += 6) say(fs.slice(i, i + 6).map(n => n.padEnd(14)).join(""));
        say(`${free(d)}K free`); return;
      }
      case "KILL": { const [d, n] = fname(str(expr())); if (!disc[d][n]) throw bad("File not found"); await whirr(); delete disc[d][n]; return; }
      case "NAME": {
        const [d, a] = fname(str(expr())); need("k", "AS"); const [, b] = fname(str(expr()));
        if (!disc[d][a]) throw bad("File not found"); if (disc[d][b]) throw bad("File already exists");
        disc[d][b] = disc[d][a]; delete disc[d][a]; return;
      }
      case "SYSTEM": throw { system: true };
      case "AUTO": throw bad("Feature not available");
    }
    throw bad(SYN);
  }
  function goFirst() { const f = lines()[0]; if (f === undefined) { ended = true; return; } goLine(f); }
  async function loadProg(name) {
    const [d, n] = fname(name, "BAS"); await whirr();
    const f = disc[d][n];
    if (!f || f.sys) throw bad("File not found");
    prog = new Map(); lc = null;
    for (const l of f.text.split("\n")) { const m = /^\s*(\d+)\s?(.*)$/.exec(l); if (m) store(+m[1], m[2]); }
  }
  async function run(ts) {                              // a direct command; RUN and GOTO hop into the program
    L = 0; T = ts; P = 0; ended = false; stopReq = false; running = true;
    let n = 0, at = [0, ts, 0];
    try {
      for (;;) {
        if (P >= T.length) { if (!L) break; const nx = nextLine(L); if (nx === null) break; L = nx; T = prog.get(nx).T; P = 0; continue; }
        if (op(":")) { P++; continue; }
        at = [L, T, P]; jmp = false;
        await stmt();
        if (ended || !alive) break;
        if (!jmp && !endStmt()) throw bad(SYN);
        if (++n % SPEED === 0) { await frame(); brk(); }
      }
    } catch (e) {
      if (e.system) return "system";
      if (!alive) return;
      if (col) out("\n");
      if (e.stop) { cont = [L, T, P]; say(L ? `Break in ${L}` : "Break"); }
      else if (e instanceof BErr) { if (e.m === "Break") cont = at; say(e.m + (L ? ` in ${L}` : "")); }
      else throw e;
    } finally { running = false; stopReq = false; kq = kq.filter(k => k !== ""); }
  }

  // ---------- Mallard BASIC and CP/M Plus: the prompts ----------
  async function basicMain(file) {
    say("Mallard-80 BASIC with Jetsam Version 1.29"); say("(C) Copyright 1984 Locomotive Software Ltd"); say("All rights reserved"); out("\n");
    say("31597 free bytes");
    prog = new Map(); lc = null; clr(); cont = null;
    if (file && await run(tokenize(`RUN "${file.replace(/"/g, "")}"`)) === "system") return;
    for (;;) {
      say("Ok");
      for (;;) {
        running = false; stopReq = false;               // idle at Ok: Esc goes back to the PC
        const s = await readLine();
        if (!alive) return;
        if (s === null) continue;
        const m = /^\s*(\d+)\s?(.*)$/.exec(s);
        if (m) {
          const n = +m[1];
          if (n > 65529) { say(SYN); break; }
          if (m[2].trim()) store(n, m[2]); else { prog.delete(n); lc = null; }
          cont = null; continue;
        }
        if (!s.trim()) continue;
        if (await run(tokenize(norm(s))) === "system") return;
        break;
      }
    }
  }
  async function typeFile(f) {
    if (f.sys) { say("\x1bp\x7f\x7f\x7f\x1bq  (a program: TYPE shows text files)"); return; }
    const ls = f.text.split("\n");
    for (let i = 0; i < ls.length; i++) {
      say(ls[i]);
      if ((i + 1) % (ROWS - 2) === 0 && i + 1 < ls.length) {
        out("Press RETURN to Continue"); const k = await getKey(); out("\r\x1bK");
        if (k === "\x1b" || !alive) return;
      }
    }
  }
  const HELP = `CP/M Plus on this PCW 8512 (simulated, not emulated)

  DIR [d:][name]      the files on a disc: A: and B: are the 3" discs, M: the RAM disc
  TYPE name           shows a text file      ERA name       erases a file
  REN new=old         renames a file         SHOW [d:]      free space
  DATE                the date and time      A: / B: / M:   changes drive
  BASIC [name]        Mallard BASIC, and runs a program from the disc

In BASIC: LOAD "BIBLIO", RUN, LIST, SAVE "name", FILES, NEW, SYSTEM (back to CP/M).
No CLS in Mallard BASIC: PRINT CHR$(27)+"E" clears the screen. Esc = STOP.`;
  async function cpmCmd(s) {
    const [w0, ...rest] = s.trim().split(/\s+/), cmd = w0.toUpperCase(), arg = rest.join(" ");
    if (/^[A-P]:$/.test(cmd)) { if (cmd[0] in disc) drive = cmd[0]; else say(`CP/M Error On ${cmd[0]}: Invalid Drive`); return; }
    try {
      switch (cmd.replace(/^[ABM]:/, "").replace(/\.COM$/, "")) {
        case "DIR": {
          const [d, pat] = fname(arg || "*.*"); await whirr();
          const fs = matches(d, pat || "*.*");
          if (!fs.length) { say("No File"); return; }
          for (let i = 0; i < fs.length; i += 5) say(`${d}: ` + fs.slice(i, i + 5).map(n => { const [b, e = ""] = n.split("."); return b.padEnd(8) + " " + e.padEnd(3); }).join(" : "));
          return;
        }
        case "TYPE": {
          if (!arg) { say("TYPE?"); return; }
          const [d, n] = fname(arg); await whirr();
          if (!disc[d][n]) { say("No File"); return; }
          return typeFile({ ...disc[d][n], name: n });
        }
        case "ERA": case "ERASE": {
          if (!arg) { say("ERA?"); return; }
          const [d, pat] = fname(arg), fs = matches(d, pat);
          if (/^\*\.\*$/.test(pat)) { out(`ERASE ${d}:*.* (Y/N)? `); const k = await getKey(); say(k === "\x1b" ? "" : k || ""); if (!/y/i.test(k || "")) return; }
          if (!fs.length) { say("No File"); return; }
          await whirr(); for (const n of fs) delete disc[d][n]; return;
        }
        case "REN": case "RENAME": {
          const m = /^(\S+)\s*=\s*(\S+)$/.exec(arg); if (!m) { say("REN?"); return; }
          const [d, nw] = fname(m[1]), [, old] = fname(m[2]);
          if (!disc[d][old]) { say("No File"); return; }
          if (disc[d][nw]) { say(`Not renamed: ${nw} file already exists`); return; }
          if (!valid(nw)) { say("REN?"); return; }
          await whirr(); disc[d][nw] = disc[d][old]; delete disc[d][old]; return;
        }
        case "SHOW": {
          const ds = arg ? [fname(/:$/.test(arg) ? arg : arg + ":")[0]] : ["A", "B", "M"];
          for (const d of ds) say(`${d}: RW, Space: ${free(d)}k`);
          return;
        }
        case "DATE": {
          const n = GM.now(), p = x => String(x).padStart(2, "0");
          say(`${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n.getDay()]} ${p(n.getMonth() + 1)}/${p(n.getDate())}/${p(n.getFullYear() % 100)} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`);
          return;
        }
        case "HELP": say(HELP); return;
        case "BASIC": await whirr(); await basicMain(arg); return;
        case "LOCOSCRIPT": case "LOCO": case "LOCOSCRI":
          say("LocoScript lives on its own start-of-day disc. This one is CP/M Plus: try BASIC, or TYPE TIMELINE.TXT"); return;
      }
    } catch (e) { if (e instanceof BErr) { say(e.m === "Break" ? "^C" : e.m); return; } throw e; }
    say(cmd.replace(/\..*$/, "").slice(0, 8) + "?");
  }
  async function main() {
    cls(); curVis = false; dirty = true;
    await sleep(GM.reduce ? 100 : 600); if (!alive) return;
    sfx.tone(1250, .25, "square", .04);                  // the start-up bleep, then the disc
    await sleep(GM.reduce ? 100 : 500); spin(1.5, 3); await sleep(GM.reduce ? 100 : 1500); if (!alive) return;
    curVis = true;
    say("CP/M Plus Amstrad Consumer Electronics plc"); out("\n");
    say("v 1.4, 61K TPA, 2 disc drives, 368K drive M:"); out("\n");
    say("Type HELP for the commands. TIMELINE.TXT is on this disc."); out("\n");
    while (alive) {
      out(drive + ">");
      const s = await readLine();
      if (!alive) return;
      if (s === null || !s.trim()) continue;
      running = true; stopReq = false;
      try { await cpmCmd(s); } finally { running = false; stopReq = false; kq = kq.filter(k => k !== ""); }
    }
  }

  // ---------- painting ----------
  function paint() {
    ctx.fillStyle = DARK; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < scr.length; i++) {
      const c = scr[i], r = rev[i];
      if (c === 32 && !r) continue;
      const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
      if (r) { ctx.fillStyle = GREEN; ctx.fillRect(x, y, CW, CH); }
      if (c !== 32) { ctx.fillStyle = r ? DARK : GREEN; ctx.fillText(c === 127 ? "▒" : String.fromCharCode(c), x + CW / 2, y + CH / 2 + 1); }
    }
    if (curVis && flashOn && (waiting || !running)) { ctx.fillStyle = GREEN; ctx.globalAlpha = .75; ctx.fillRect(col * CW, row * CH + 2, CW, CH - 4); ctx.globalAlpha = 1; }
  }
  function loop() {
    if (!alive) return;
    if (++frameN % 24 === 0) { flashOn = !flashOn; dirty = true; }
    if (dirty) { dirty = false; paint(); }
    requestAnimationFrame(loop);
  }

  // ---------- keys: typed, from a phone keyboard, or pasted ----------
  function feed(k) {
    if (!alive) return;
    if (k === "\x1b") { if (running) { stopReq = true; push("\x1b"); } else exit(); return; }
    push(k);
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    e.stopPropagation();
    const k = { Enter: "\r", Backspace: "\b", Escape: "\x1b" }[e.key];
    if (k) { e.preventDefault(); inp.value = typed = ""; feed(k); }
    else if (e.key.length === 1 && e.target !== inp) { e.preventDefault(); feed(e.key); }
  }
  // phone keyboards rewrite the word being composed: only the difference is typed, the input is emptied between words
  let typed = "";
  function onInput(e) {
    const v = inp.value; let i = 0;
    while (i < typed.length && typed[i] === v[i]) i++;
    for (let j = typed.length; j > i; j--) feed("\b");
    for (const ch of v.slice(i)) feed(ch === "\n" ? "\r" : ch);
    typed = v;
    if (!e.isComposing) inp.value = typed = "";
  }
  function onPaste(e) {
    const s = e.clipboardData?.getData("text"); if (!s) return;
    e.preventDefault();
    for (const ch of s.replace(/\r\n?/g, "\n")) feed(ch === "\n" ? "\r" : ch);
  }
  const onClick = e => {
    if (e.target.closest("[data-pcw-stop]")) feed("\x1b");
    else if (e.target.closest("[data-pcw-exit]")) return exit();
    inp.focus({ preventScroll: true });
  };
  function exit() {
    if (!alive) return;
    alive = false; stopReq = true;
    document.removeEventListener("keydown", onKey, true);
    const w = kwake; kwake = null; w?.();
    done();
  }

  GM.pcw = {
    open(container) {
      el = document.createElement("div"); el.className = "pcw"; container.append(el);
      el.innerHTML = `<canvas class="pcw-scr" width="${COLS * CW}" height="${ROWS * CH}" aria-label="Amstrad PCW screen"></canvas>
<input class="vic-in" aria-label="Amstrad PCW keyboard" autocomplete="off" autocapitalize="none" spellcheck="false">
<p class="vic-keys"><button type="button" data-pcw-stop>STOP</button> <button type="button" data-pcw-exit>⏏ PC</button></p>
<p class="vic-help">DIR · TYPE TIMELINE.TXT · BASIC BIBLIO · BASIC MASTER · HELP · SYSTEM leaves BASIC · Esc = STOP<br>Simulated, not emulated: CP/M Plus and Mallard BASIC rewritten in JS, no ROM inside.</p>`;
      cv = el.querySelector("canvas"); ctx = cv.getContext("2d"); inp = el.querySelector("input");
      ctx.font = `bold ${CH - 5}px ui-monospace, Consolas, "Courier New", monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      alive = true; running = false; stopReq = false; kq = []; kwake = null; drive = "A"; revOn = 0; escSeq = null; typed = "";
      freshDisc(); prog = new Map(); lc = null;
      document.addEventListener("keydown", onKey, true);
      inp.addEventListener("input", onInput);
      inp.addEventListener("paste", onPaste);
      el.addEventListener("click", onClick);
      inp.focus({ preventScroll: true });
      requestAnimationFrame(loop);
      const p = new Promise(res => { done = res; });
      main().catch(e => { if (alive) { say(String(e)); console.error(e); } });
      return p;
    },
    // the text on the screen: lets the site's tests read the canvas
    text: () => [...Array(ROWS)].map((_, r) => String.fromCharCode(...scr.subarray(r * COLS, r * COLS + COLS)).trimEnd()).join("\n"),
  };
})();
