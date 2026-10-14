// gmsh — interactive shell for gabimarti.github.io. Loaded on demand by site.js (uses the global GM api).
"use strict";
(() => {
  const { $, B, esc, sleep, type } = GM;
  const root = document.documentElement, main = $("main");
  const out = $("#sh-out"), form = $("#sh-form"), input = $("#sh-in"), promptEl = $("#sh-prompt");
  // reuse the classic view's content (ids c-*), without ids and indentation whitespace
  const html = sel => { const el = $(sel); return el ? el.outerHTML.replace(/ id="[^"]*"/, "").replace(/>\s+</g, "><") : ""; };
  const HOST = "gabimarti.github.io", HOME = "/home/gabimarti";
  let user = "gabimarti", cwd = HOME, cv = null, pending = null, started = false;
  const hist = []; let hpos = 0; const t0 = Date.now();

  // ---------- output ----------
  let sink = out;                                       // where print() writes: the screen, or a pipe buffer
  const print = (h, cls = "") => {
    const d = document.createElement("div"); d.className = "line " + cls; d.innerHTML = h; sink.append(d);
    main.scrollTop = main.scrollHeight; return d;
  };
  const err = h => { GM.sfx.err(); return print(h, "err"); }, pre = h => print(h, "pre");
  const rnd = n => Math.floor(Math.random() * n), pickN = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n);
  const disp = p => p === HOME || p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p;
  const env = { HOME, USER: "gabimarti", SHELL: "/bin/gmsh", PATH: "/usr/local/bin:/usr/bin:/bin", TERM: "vt100", LANG: "en_US.UTF-8" };
  const aliases = { ll: "ls -la", la: "ls -a", l: "ls" };
  const unquote = s => s.replace(/^(["'])([\s\S]*)\1$/, "$2");
  const promptText = () => env.PS1 ? env.PS1.replace(/\\([uhwW$dt])/g, (_, c) => ({ u: user, h: HOST, w: disp(cwd), W: disp(cwd).split("/").pop() || "/",
    $: user === "root" ? "#" : "$", d: GM.now().toDateString(), t: GM.now().toTimeString().slice(0, 8) })[c]) : `${user}@${HOST}:${disp(cwd)}${user === "root" ? "#" : "$"}`;
  const promptHtml = () => `<span class="prompt${user === "root" ? " root" : ""}">${esc(promptText())}</span>`;
  const setPrompt = txt => { promptEl.className = "prompt" + (user === "root" ? " root" : ""); promptEl.textContent = txt ?? promptText(); };
  // plain text of some output, in the active language (pipes, filters, editors)
  function plain(h) {
    const d = document.createElement("div");
    d.innerHTML = h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(li|p|dd|dt|div|pre|h\d)>/gi, "$&\n");
    d.querySelectorAll("[lang]").forEach(x => { if (x.lang !== root.lang) x.remove(); });
    return d.textContent.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "");
  }
  async function capture(fn) { const s = sink; sink = document.createElement("div"); try { await fn(); return plain(sink.innerHTML); } finally { sink = s; } }
  const words = line => (line.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(unquote);
  // a line typed by a program (vi, nano): same prompt mechanism as su's password
  const askLine = (label, secret = false) => new Promise(res => { pending = res; input.type = secret ? "password" : "text"; input.value = ""; setPrompt(label); input.focus({ preventScroll: true }); });
  const waitKey = () => new Promise(res => {                // any key or tap (less, read in scripts)
    const k = e => { if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return; e.preventDefault(); e.stopPropagation(); done(e.key); };
    const c = e => { if (e.target.closest("a")) return; done("tap"); };
    const done = v => { removeEventListener("keydown", k, true); $("#shell").removeEventListener("click", c, true); cancelKey = null; res(v); };
    cancelKey = () => done("cancel");
    setTimeout(() => { addEventListener("keydown", k, true); $("#shell").addEventListener("click", c, true); });
  });
  const beep = () => GM.sfx.tone(1000, .12, "square", .05);
  let cancelKey = null, floppyIn = false, floppyTries = 0;
  const run = (c, label = c) => `<button type="button" class="fs" data-run="${esc(c)}">${esc(label)}</button>`;

  // ---------- filesystem ----------
  const SKILLS = ["offensive", "reversing", "web-intel", "defense", "grc", "dev", "languages"];
  const CVSH_TEXT = { en: "#!/bin/sh\n# cv.sh - my CV for people who'd rather script than type\nclear\necho \"== cv.sh - Gabriel Marti (@gabimarti), shell edition ==\"\necho \"my CV for people who'd rather script than type. Any key between sections (q quits).\"\necho -e \"\\a\"\nread -p \"Press any key to start...\"\nclear; echo \"[1/7] whoami\"; whoami; cat summary.txt; read -p \"-- any key --\"\nclear; echo \"[2/7] skills\"; echo \"offensive/\"; cat skills/offensive.txt; echo \"reversing/\"; cat skills/reversing.txt; echo \"web-intel/\"; cat skills/web-intel.txt; echo \"defense/\"; cat skills/defense.txt; echo \"grc/\"; cat skills/grc.txt; echo \"dev/\"; cat skills/dev.txt; echo \"languages/\"; cat skills/languages.txt; read -p \"-- any key --\"\nclear; echo \"[3/7] about\"; cat about.txt; read -p \"-- any key --\"\nclear; echo \"[4/7] interests\"; cat interests.txt; read -p \"-- any key --\"\nclear; echo \"[5/7] github repos\"; cat repos.txt; read -p \"-- any key --\"\nclear; echo \"[6/7] articles\"; cat articles.txt; read -p \"-- any key --\"\nclear; echo \"[7/7] contact\"; ls contact\necho -e \"\\a\\a\"\necho \"Done: 7 sections, 0 commands typed by you. That's the spirit.\"\necho \"More secrets: cat explore.txt\"",
    es: "#!/bin/sh\n# cv.sh - mi CV para quien prefiere un script a teclear\nclear\necho \"== cv.sh - Gabriel Marti (@gabimarti), edición shell ==\"\necho \"mi CV para quien prefiere un script a teclear. Una tecla entre secciones (q para salir).\"\necho -e \"\\a\"\nread -p \"Pulsa una tecla para empezar...\"\nclear; echo \"[1/7] whoami\"; whoami; cat summary.txt; read -p \"-- una tecla --\"\nclear; echo \"[2/7] skills\"; echo \"offensive/\"; cat skills/offensive.txt; echo \"reversing/\"; cat skills/reversing.txt; echo \"web-intel/\"; cat skills/web-intel.txt; echo \"defense/\"; cat skills/defense.txt; echo \"grc/\"; cat skills/grc.txt; echo \"dev/\"; cat skills/dev.txt; echo \"languages/\"; cat skills/languages.txt; read -p \"-- una tecla --\"\nclear; echo \"[3/7] sobre mí\"; cat about.txt; read -p \"-- una tecla --\"\nclear; echo \"[4/7] intereses\"; cat interests.txt; read -p \"-- una tecla --\"\nclear; echo \"[5/7] github repos\"; cat repos.txt; read -p \"-- una tecla --\"\nclear; echo \"[6/7] artículos\"; cat articles.txt; read -p \"-- una tecla --\"\nclear; echo \"[7/7] contacto\"; ls contact\necho -e \"\\a\\a\"\necho \"Hecho: 7 secciones, 0 comandos tecleados por ti. Así se hace.\"\necho \"Más secretos: cat explore.txt\"",
    ca: "#!/bin/sh\n# cv.sh - el meu CV per a qui prefereix un script a teclejar\nclear\necho \"== cv.sh - Gabriel Marti (@gabimarti), edició shell ==\"\necho \"el meu CV per a qui prefereix un script a teclejar. Una tecla entre seccions (q per sortir).\"\necho -e \"\\a\"\nread -p \"Prem una tecla per començar...\"\nclear; echo \"[1/7] whoami\"; whoami; cat summary.txt; read -p \"-- una tecla --\"\nclear; echo \"[2/7] skills\"; echo \"offensive/\"; cat skills/offensive.txt; echo \"reversing/\"; cat skills/reversing.txt; echo \"web-intel/\"; cat skills/web-intel.txt; echo \"defense/\"; cat skills/defense.txt; echo \"grc/\"; cat skills/grc.txt; echo \"dev/\"; cat skills/dev.txt; echo \"languages/\"; cat skills/languages.txt; read -p \"-- una tecla --\"\nclear; echo \"[3/7] sobre mi\"; cat about.txt; read -p \"-- una tecla --\"\nclear; echo \"[4/7] interessos\"; cat interests.txt; read -p \"-- una tecla --\"\nclear; echo \"[5/7] github repos\"; cat repos.txt; read -p \"-- una tecla --\"\nclear; echo \"[6/7] articles\"; cat articles.txt; read -p \"-- una tecla --\"\nclear; echo \"[7/7] contacte\"; ls contact\necho -e \"\\a\\a\"\necho \"Fet: 7 seccions, 0 ordres teclejades per tu. Així es fa.\"\necho \"Més secrets: cat explore.txt\"" };
  const CVSH = () => CVSH_TEXT[root.lang] || CVSH_TEXT.en;   // ~/cv.sh, in the active language
  const SCRIPTS = { [HOME + "/cv.sh"]: CVSH };
  const CONTACTS = ["x", "linkedin", "github", "medium", "email"];
  const D = {
    "/": ["bin/", "etc/", "home/", "mnt/", "root/", "tmp/", "usr/", "var/"],
    "/bin": [], "/tmp": [], "/mnt": ["floppy/"], "/mnt/floppy": [], "/usr": ["games/", "share/"], "/usr/games": ["snake", "tetris"], "/usr/share": ["midi/"], "/usr/share/midi": [], "/home": ["gabimarti/"], "/var": ["backups/"],
    [HOME]: ["about.txt", "summary.txt", "interests.txt", "articles.txt", "repos.txt", "avatar.txt", "hint.txt", "explore.txt", "cv.sh", "skills/", "contact/", ".bash_history", ".notes/", ".plan", ".secret"],
    [HOME + "/skills"]: [...SKILLS.map(k => k + ".txt"), "hint.txt"],
    [HOME + "/contact"]: CONTACTS.map(k => k + ".url"),
    [HOME + "/.notes"]: ["todo.txt"],
    "/etc": ["hostname", "motd", "shadow"],
    "/var/backups": ["root_pw.bak"],
    "/root": ["cv.txt", "flag.txt"],
  };
  let vaultP = null;
  const vault = () => vaultP ||= fetch("vault.json", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch(e => { vaultP = null; throw e; });
  const F = {
    [HOME + "/about.txt"]: () => html("#c-about"),
    [HOME + "/summary.txt"]: () => html("#c-summary"),
    [HOME + "/interests.txt"]: () => html("#c-interests"),
    [HOME + "/articles.txt"]: () => html("#c-articles"),
    [HOME + "/repos.txt"]: () => html("#c-repos"),
    [HOME + "/avatar.txt"]: () => html("#avatar .avatar"),
    [HOME + "/hint.txt"]: () => B(
      "Welcome, visitor. A few ideas to get started:\n  1. 'whoami' and 'cat summary.txt'\n  2. 'ls skills', 'cat articles.txt' and 'cat repos.txt'\n  3. 'ls contact' or 'open github'\n  4. 'cat avatar.txt' for a portrait\n  5. 'neofetch', 'myip', 'fingerprint'\n  6. 'cat explore.txt': this machine is bigger than this shell\n  7. './cv.sh': my CV, scripted (any key between sections)\nSome files are hidden. Real hackers use 'ls -a'.",
      "Bienvenido/a. Algunas ideas para empezar:\n  1. 'whoami' y 'cat summary.txt'\n  2. 'ls skills', 'cat articles.txt' y 'cat repos.txt'\n  3. 'ls contact' u 'open github'\n  4. 'cat avatar.txt' para ver un retrato\n  5. 'neofetch', 'myip', 'fingerprint'\n  6. 'cat explore.txt': esta máquina es más grande que esta shell\n  7. './cv.sh': mi CV, en un script (una tecla entre secciones)\nHay ficheros ocultos. Los hackers de verdad usan 'ls -a'.", "Benvingut/da. Algunes idees per començar:\n  1. 'whoami' i 'cat summary.txt'\n  2. 'ls skills', 'cat articles.txt' i 'cat repos.txt'\n  3. 'ls contact' o 'open github'\n  4. 'cat avatar.txt' per veure un retrat\n  5. 'neofetch', 'myip', 'fingerprint'\n  6. 'cat explore.txt': aquesta màquina és més gran que aquesta shell\n  7. './cv.sh': el meu CV, en un script (una tecla entre seccions)\nHi ha fitxers amagats. Els hackers de veritat fan servir 'ls -a'."),
    [HOME + "/cv.sh"]: () => esc(CVSH()),
    [HOME + "/.plan"]: () => B("Finish the BIOS (it hides more than it shows).\nWrite more CTFs.\nTeach reversing to anyone curious enough.\nNever trust a program that only XORs.",
      "Terminar la BIOS (esconde más de lo que muestra).\nEscribir más CTFs.\nEnseñar reversing a quien tenga curiosidad.\nNo fiarse nunca de un programa que solo hace XOR.",
      "Acabar la BIOS (amaga més del que mostra).\nEscriure més CTFs.\nEnsenyar reversing a qui tingui curiositat.\nNo refiar-se mai d'un programa que només fa XOR."),
    [HOME + "/explore.txt"]: () => B(
      "THIS MACHINE IS BIGGER THAN THIS SHELL\n\n  [ ] 2 flags in this shell: one hides from a plain 'ls', the other only root can read.\n  [ ] root's password: the admin keeps forgetting it... and keeps writing notes about it.\n  [ ] MS-DOS 3.1 (boot menu): 1 flag. LOCKED.COM keeps it, with my CV, behind a password\n      in a directory DIR won't show.\n  [ ] BIOS Setup: press DEL while the memory is being counted.\n      It has 4 undocumented features. F1 gives clues.\n  [ ] memtest86+ (boot menu): leave it running. Old RAM is not always perfect.\n  [ ] Classic Unix jokes still work: sudo, rm, make... and old friends like fortune, cowsay and sl.\n  [ ] A floppy waits in /dev/fd0 and a MIDI collection in /usr/share/midi.\n  [ ] finger the owner of this machine. A 1997 BBS is one telnet away.\n  [ ] Once a year this PC throws a party. Its clock is easier to change than it looks.\n\nHow to get there: 'reboot', and watch the screen closely.",
      "ESTA MÁQUINA ES MÁS GRANDE QUE ESTA SHELL\n\n  [ ] 2 flags en esta shell: una se esconde de un 'ls' normal, la otra solo la puede leer root.\n  [ ] La contraseña de root: el admin siempre la olvida... y siempre deja notas sobre ello.\n  [ ] MS-DOS 3.1 (menú de arranque): 1 flag. LOCKED.COM la guarda, con mi CV, tras una contraseña\n      en un directorio que DIR no muestra.\n  [ ] BIOS Setup: pulsa SUPR (DEL) mientras se cuenta la memoria.\n      Tiene 4 funciones no documentadas. F1 da pistas.\n  [ ] memtest86+ (menú de arranque): déjalo funcionar. La RAM vieja no siempre es perfecta.\n  [ ] Los chistes clásicos de Unix funcionan: sudo, rm, make... y viejos amigos como fortune, cowsay y sl.\n  [ ] Hay un disquete esperando en /dev/fd0 y una colección MIDI en /usr/share/midi.\n  [ ] Haz finger al dueño de esta máquina. Una BBS de 1997 está a un telnet.\n  [ ] Una vez al año este PC monta una fiesta. Su reloj es más fácil de cambiar de lo que parece.\n\nCómo llegar: 'reboot', y mira la pantalla con atención.", "AQUESTA MÀQUINA ÉS MÉS GRAN QUE AQUESTA SHELL\n\n  [ ] 2 flags en aquesta shell: una s'amaga d'un 'ls' normal, l'altra només la pot llegir root.\n  [ ] La contrasenya de root: l'admin sempre l'oblida... i sempre en deixa notes.\n  [ ] MS-DOS 3.1 (menú d'arrencada): 1 flag. LOCKED.COM la guarda, amb el meu CV, darrere una contrasenya\n      en un directori que DIR no mostra.\n  [ ] BIOS Setup: prem SUPR (DEL) mentre es compta la memòria.\n      Té 4 funcions no documentades. F1 dona pistes.\n  [ ] memtest86+ (menú d'arrencada): deixa'l funcionar. La RAM vella no sempre és perfecta.\n  [ ] Els acudits clàssics d'Unix funcionen: sudo, rm, make... i vells amics com fortune, cowsay i sl.\n  [ ] Hi ha un disquet esperant a /dev/fd0 i una col·lecció MIDI a /usr/share/midi.\n  [ ] Fes finger al propietari d'aquesta màquina. Una BBS de 1997 és a un telnet.\n  [ ] Un cop l'any aquest PC fa festa. El seu rellotge és més fàcil de canviar del que sembla.\n\nCom arribar-hi: 'reboot', i mira la pantalla amb atenció."),
    [HOME + "/skills/hint.txt"]: () => B(
      "Each file here is a skill area: try 'cat dev.txt' or 'cat web-intel.txt'.\nCurious about the machine? 'neofetch', 'mem', 'df', 'ps', 'ls /'.",
      "Cada fichero es un área: prueba 'cat dev.txt' o 'cat web-intel.txt'.\n¿Curiosidad por la máquina? 'neofetch', 'mem', 'df', 'ps', 'ls /'.", "Cada fitxer és una àrea: prova 'cat dev.txt' o 'cat web-intel.txt'.\nCuriositat per la màquina? 'neofetch', 'mem', 'df', 'ps', 'ls /'."),
    [HOME + "/.bash_history"]: () => esc("whoami\nls -a\ncat .secret\ncat .notes/todo.txt\nsudo su\nexit\nmyip\nopen github"),
    [HOME + "/.secret"]: () => B(
      "🏁 flag{curi0s1ty_1s_th3_b3st_3xpl01t}\nNice. Next level: become root and read my CV. Start with ~/.notes",
      "🏁 flag{curi0s1ty_1s_th3_b3st_3xpl01t}\nBien. Siguiente nivel: hazte root y lee mi CV. Empieza por ~/.notes", "🏁 flag{curi0s1ty_1s_th3_b3st_3xpl01t}\nBé. Següent nivell: fes-te root i llegeix el meu CV. Comença per ~/.notes"),
    [HOME + "/.notes/todo.txt"]: () => B(
      "TODO\n  [x] write 'El Arte de los Hashes' on Medium (cat ~/articles.txt)\n  [ ] stop forgetting the root password!!\n  [ ] delete the old backup in /var/backups — it's only ENCODED, not encrypted...\n      (my favourite chef's recipe: a classic Caesar shift of 13, then base 64, then base 16)\n  [ ] check /etc/shadow permissions (anyone can verify the hash there)",
      "TODO\n  [x] escribir 'El Arte de los Hashes' en Medium (cat ~/articles.txt)\n  [ ] ¡¡dejar de olvidar la contraseña de root!!\n  [ ] borrar el backup viejo de /var/backups — solo está CODIFICADO, no cifrado...\n      (la receta de mi chef favorito: un César clásico de 13, luego base 64, luego base 16)\n  [ ] revisar permisos de /etc/shadow (cualquiera puede verificar el hash)", "TODO\n  [x] escriure 'El Arte de los Hashes' a Medium (cat ~/articles.txt)\n  [ ] deixar d'oblidar la contrasenya de root!!\n  [ ] esborrar el backup vell de /var/backups — només està CODIFICAT, no xifrat...\n      (la recepta del meu xef preferit: un Cèsar clàssic de 13, després base 64, després base 16)\n  [ ] revisar els permisos de /etc/shadow (qualsevol hi pot verificar el hash)"),
    "/etc/hostname": () => HOST,
    "/etc/motd": () => B("GMOS 1.33.60 — authorized users only. Curious ones too.", "GMOS 1.33.60 — solo usuarios autorizados. Y curiosos.", "GMOS 1.33.60 — només usuaris autoritzats. I curiosos."),
    "/etc/shadow": async () => { const v = await vault(); return `root:${v.sha256}:20370:0:99999:7:::\ngabimarti:!:20370:0:99999:7:::\n<span class="dim"># hash: SHA-256 (hex)</span>`; },
    "/var/backups/root_pw.bak": async () => { const v = await vault(); return `<span class="dim"># root password backup — 2019</span>\n${esc(v.backup)}`; },
    "/root/cv.txt": () => esc(cv.slice(cv.indexOf("\n") + 1)),            // decrypted vault: flag line, then the CV
    "/root/flag.txt": () => esc(cv.slice(0, cv.indexOf("\n"))) + "\n" + B("Congratulations, you are root. Say hi: 'open email'.", "Enhorabuena, eres root. Salúdame: 'open email'.", "Enhorabona, ets root. Saluda'm: 'open email'."),
  };
  SKILLS.forEach((k, i) => F[`${HOME}/skills/${k}.txt`] = () => html(`#c-skills dd:nth-of-type(${i + 1})`));
  CONTACTS.forEach((k, i) => F[`${HOME}/contact/${k}.url`] = () => html(`#c-contact li:nth-child(${i + 1}) a`));
  const PRE_FILES = new Set([HOME + "/cv.sh", HOME + "/.plan", "/etc/shadow", "/var/backups/root_pw.bak", "/root/cv.txt", HOME + "/.notes/todo.txt", HOME + "/.bash_history"]);

  function resolve(p) {
    if (!p) return cwd;
    const parts = p.startsWith("/") ? [] : (p.startsWith("~") ? HOME : cwd).split("/").filter(Boolean);
    for (const seg of p.replace(/^~/, "").split("/")) {
      if (!seg || seg === ".") continue;
      if (seg === "..") parts.pop(); else parts.push(seg);
    }
    const abs = "/" + parts.join("/");
    return !(abs in D) && !(abs in F) && (HOME + abs in D || HOME + abs in F) ? HOME + abs : abs;   // "ls /contact" works too
  }
  const isDir = p => p in D, isFile = p => p in F;
  const denied = p => (p === "/root" || p.startsWith("/root/")) && user !== "root";
  const short = p => { const d = disp(p); return d.startsWith("~/") ? d.slice(2) : d; };
  const item = (name, dir) => {
    const full = (dir === "/" ? "" : dir) + "/" + name.replace(/\/$/, "");
    return name.endsWith("/") ? run("ls " + short(full), name) : `<button type="button" class="fs file" data-run="cat ${esc(short(full))}">${esc(name)}</button>`;
  };

  // ---------- su / root: password checked against SHA-256, CV decrypted with AES-GCM ----------
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const sha256 = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, "0")).join("");
  function askPassword(cb) { pending = cb; input.type = "password"; input.value = ""; setPrompt({ es: "Contraseña:", ca: "Contrasenya:" }[root.lang] || "Password:"); }
  function endPassword() { pending = null; input.type = "text"; setPrompt(); }
  function su() {
    if (user === "root") return print(B("You are already root.", "Ya eres root.", "Ja ets root."));
    if (!window.crypto || !crypto.subtle) return err("su: WebCrypto not available (needs https)");
    askPassword(async pw => {
      let v;
      try { v = await vault(); } catch (e) { return err(B("su: cannot reach the vault (offline?)", "su: no se puede acceder al vault (¿sin conexión?)", "su: no es pot accedir al vault (sense connexió?)")); }
      await sleep(700);                                     // like a real su: slow on failure
      if (await sha256(pw) !== v.sha256) return err("su: Authentication failure");
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(v.salt), iterations: v.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      cv = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(v.iv) }, key, b64(v.ct)));
      user = "root"; cwd = "/root"; setPrompt();
      print(`<strong>${B("Welcome, root.", "Bienvenido, root.", "Benvingut, root.")}</strong> ${B("Try", "Prueba", "Prova")} ${run("ls")} · ${run("cat cv.txt")} · ${run("cat flag.txt")} · ${run("exit")}`);
    });
  }

  // ---------- network: real requests only when the visitor runs the command ----------
  const host = s => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(s || "") ? s.toLowerCase() : null;
  async function myip() {
    print(`<span class="dim">${B("# asking api.ipify.org (a public IP echo service) — nothing is stored here", "# consultando api.ipify.org (servicio público que devuelve tu IP) — aquí no se guarda nada", "# consultant api.ipify.org (servei públic que retorna la teva IP) — aquí no es desa res")}</span>`);
    try { const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store", signal: AbortSignal.timeout(5000) }); print(`${B("Your public IP", "Tu IP pública", "La teva IP pública")}: <strong>${esc((await r.json()).ip)}</strong>`); }
    catch (e) { err(B("myip: request failed (offline or blocked by an extension)", "myip: la petición falló (sin conexión o bloqueada por una extensión)", "myip: la petició ha fallat (sense connexió o bloquejada per una extensió)")); }
  }
  async function ping(args) {
    const h = host(args.find(a => !a.startsWith("-")));
    if (!h) return err(B("usage: ping <host>   e.g. ping github.com", "uso: ping <host>   p.ej. ping github.com", "ús: ping <host>   p. ex. ping github.com"));
    print(`PING ${esc(h)}`);
    const times = [];
    for (let i = 1; i <= 4; i++) {
      const t = performance.now();
      try {
        await fetch(`https://${h}/favicon.ico?gmsh=${Math.random()}`, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(3000) });
        const ms = performance.now() - t; times.push(ms);
        pre(`reply from ${esc(h)}: seq=${i} time=${ms.toFixed(1)} ms`);
      } catch (e) { pre(`seq=${i} ${B("request timeout", "tiempo de espera agotado", "temps d'espera esgotat")}`); }
      await sleep(400);
    }
    const n = times.length;
    pre(`--- ${esc(h)} ping statistics ---\n4 sent, ${n} received, ${100 - n * 25}% loss` + (n ? `\nrtt min/avg/max = ${Math.min(...times).toFixed(1)}/${(times.reduce((a, b) => a + b) / n).toFixed(1)}/${Math.max(...times).toFixed(1)} ms` : ""));
  }
  async function dig(args) {
    const TYPES = /^(A|AAAA|MX|TXT|NS|CNAME)$/i;
    const h = host(args.find(a => !a.startsWith("-") && !TYPES.test(a))), t = (args.find(a => TYPES.test(a)) || "A").toUpperCase();
    if (!h) return err(B("usage: dig <domain> [A|AAAA|MX|TXT|NS|CNAME]", "uso: dig <dominio> [A|AAAA|MX|TXT|NS|CNAME]", "ús: dig <domini> [A|AAAA|MX|TXT|NS|CNAME]"));
    print(`<span class="dim">${B("# DNS over HTTPS via cloudflare-dns.com", "# DNS sobre HTTPS vía cloudflare-dns.com", "# DNS sobre HTTPS via cloudflare-dns.com")}</span>`);
    try {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(h)}&type=${t}`, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) });
      const ans = (await r.json()).Answer || [];
      pre(`;; QUESTION: ${esc(h)}. IN ${t}\n;; ANSWER (${ans.length}):\n` + (ans.map(a => `${esc(a.name).padEnd(28)} ${String(a.TTL).padStart(6)}  IN  ${esc(a.data)}`).join("\n") || `   (${B("no records", "sin registros", "sense registres")})`));
    } catch (e) { err(B("dig: query failed", "dig: la consulta falló", "dig: la consulta ha fallat")); }
  }
  function ifconfig() {
    const c = navigator.connection || {};
    pre(`lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 10.13.37.42  netmask 255.255.255.0  broadcast 10.13.37.255
        ether de:ad:be:ef:13:37  txqueuelen 1000
<span class="dim"># ${B("your browser reports", "tu navegador indica", "el teu navegador indica")}: ${navigator.onLine ? "online" : "offline"}${c.effectiveType ? `, ${esc(c.effectiveType)}, ~${c.downlink} Mb/s, rtt ~${c.rtt} ms` : ""}
# ${B("public IP: run 'myip'", "IP pública: ejecuta 'myip'", "IP pública: executa 'myip'")}</span>`);
  }
  function fingerprint() {
    const n = navigator, s = screen;
    pre(`<span class="dim">${B("# what any website can read about you — no cookies needed", "# lo que cualquier web puede leer de ti — sin necesidad de cookies", "# el que qualsevol web pot llegir de tu — sense necessitat de galetes")}</span>
User-Agent   : ${esc(n.userAgent)}
${B("Languages   ", "Idiomas     ", "Idiomes     ")} : ${esc((n.languages || [n.language]).join(", "))}
${B("Time zone   ", "Zona horaria", "Zona horària")} : ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}
${B("Screen      ", "Pantalla    ", "Pantalla    ")} : ${s.width}x${s.height} @${devicePixelRatio}x, ${s.colorDepth}-bit
${B("CPU cores   ", "Núcleos CPU ", "Nuclis CPU  ")} : ${n.hardwareConcurrency ?? "?"}${n.deviceMemory ? `   RAM ≈ ${n.deviceMemory} GB` : ""}
${B("Touch       ", "Táctil      ", "Tàctil      ")} : ${n.maxTouchPoints > 0 ? "yes" : "no"}   Do-Not-Track: ${esc(n.doNotTrack ?? "?")}`);
  }
  async function traceroute(args) {
    const h = host(args[0]) || HOST;
    pre(`traceroute to ${esc(h)}, 30 hops max`);
    const hops = ["gateway.local (192.168.1.1)", "isp-edge.bcn (10.0.0.1)", "coffee-machine.lan (10.13.37.1)", "ix.barcelona (185.1.48.1)", "ghidra-backbone.net (198.51.100.7)", h];
    for (let i = 0; i < hops.length; i++) { await sleep(GM.reduce ? 0 : 250); pre(`${String(i + 1).padStart(2)}  ${esc(hops[i]).padEnd(40)} ${(4 + i * 6 + Math.random() * 4).toFixed(3)} ms`); }
    print(`<span class="dim">${B("# simulated — browsers can't send raw packets", "# simulado — los navegadores no pueden enviar paquetes en bruto", "# simulat — els navegadors no poden enviar paquets en brut")}</span>`);
  }
  async function nmap(args) {
    const h = host(args.find(a => !a.startsWith("-"))) || "localhost";
    pre(`Starting Nmap 7.95 ( https://nmap.org )\nNmap scan report for ${esc(h)}`);
    await sleep(GM.reduce ? 0 : 700);
    const st = () => ["open", "open", "closed", "filtered"][rnd(4)];
    const ports = [[80, "http", "open"], [443, "https", "open"], ...pickN(NMAP_PORTS, 4).map(([n, sv]) => [n, sv, st()])].sort((a, b) => a[0] - b[0]);
    pre(`PORT      STATE    SERVICE
${ports.map(([n, sv, s]) => `${(n + "/tcp").padEnd(10)}${s.padEnd(9)}${sv}`).join("\n")}

Nmap done: 1 IP address (1 host up) scanned in ${(0.3 + Math.random() * 2).toFixed(2)} seconds
<span class="dim">${B("# simulated — no real scan is performed", "# simulado — no se escanea nada de verdad", "# simulat — no s'escaneja res de veritat")}</span>`);
  }

  // random pools for ps / nmap / netstat
  const PS_LAB = ["nc -lvnp 4444            # honeypot", "keylogger_poc.exe        # TFM 2019, sandboxed", "mimikatz.exe             # quarantined",
    "rev_shell.py             # lab only", "wannacry.exe             # defanged sample", "john --wordlist=rockyou.txt", "hashcat -m 1400 hashes.txt", "msfconsole -q"];
  const NMAP_PORTS = [[21, "ftp"], [22, "ssh"], [23, "telnet"], [25, "smtp"], [53, "domain"], [110, "pop3"], [139, "netbios-ssn"], [445, "microsoft-ds"],
    [1337, "waste"], [3306, "mysql"], [3389, "ms-wbt-server"], [5432, "postgresql"], [5900, "vnc"], [6379, "redis"], [6667, "irc"], [8080, "http-proxy"], [27017, "mongodb"], [31337, "elite"]];
  const NETSTAT_SITES = ["gchq.github.io", "ghidra-sre.org", "virustotal.com", "shodan.io", "exploit-db.com", "hackthebox.com", "tryhackme.com", "x64dbg.com"];

  const SHOUT = [
    ["NO NEED TO SHOUT. This is Linux, not MS-DOS: commands are lowercase.", "NO HACE FALTA GRITAR. Esto es Linux, no MS-DOS: los comandos van en minúsculas.", "NO CAL CRIDAR. Això és Linux, no MS-DOS: les ordres van en minúscules."],
    ["Caps Lock detected. The kernel has feelings, you know.", "Bloq Mayús detectado. El kernel también tiene sentimientos, ¿sabes?", "Bloq Maj detectat. El kernel també té sentiments, saps?"],
    ["Command not found. Case-sensitive since 1991, deal with it.", "Comando no encontrado. Distingo mayúsculas desde 1991, asúmelo.", "Ordre no trobada. Distingeixo majúscules des del 1991, assumeix-ho."],
    ["Who taught you to type? Your fax machine?", "¿Quién te enseñó a escribir? ¿Tu fax?", "Qui et va ensenyar a escriure? El teu fax?"],
    ["Ugh. Lowercase, please. I'm old and my ears hurt.", "Uf. En minúsculas, por favor. Soy mayor y me duelen los oídos.", "Uf. En minúscules, si us plau. Soc gran i em fan mal les orelles."],
  ];

  // ---------- commands ----------
  const HELP = [
    ["help", "this help", "esta ayuda", "aquesta ajuda"],
    ["whoami · id", "who am I", "quién soy", "qui soc"],
    ["ls [-a] [dir] · cd · pwd", "list files, change directory", "listar ficheros, cambiar de directorio", "llistar fitxers, canviar de directori"],
    ["cat <file>", "show a file (try 'cat avatar.txt')", "mostrar un fichero (prueba 'cat avatar.txt')", "mostrar un fitxer (prova 'cat avatar.txt')"],
    ["open <x|linkedin|github|medium|email>", "open a contact", "abrir un contacto", "obrir un contacte"],
    ["neofetch · fingerprint", "system info · what your browser reveals", "info del sistema · lo que revela tu navegador", "info del sistema · el que revela el teu navegador"],
    ["myip · ping · dig · ifconfig", "network tools (real queries)", "herramientas de red (consultas reales)", "eines de xarxa (consultes reals)"],
    ["traceroute · nmap · netstat", "network tools (simulated)", "herramientas de red (simuladas)", "eines de xarxa (simulades)"],
    ["mem · df · dh · du · ds", "memory, disks, disk health, usage, stack dump", "memoria, discos, salud del disco, uso, volcado de pila", "memòria, discos, salut del disc, ús, volcat de pila"],
    ["ps · uptime · uname · date", "processes and system", "procesos y sistema", "processos i sistema"],
    ["su · sudo su", "become root (password required)", "hacerse root (requiere contraseña)", "fer-se root (cal contrasenya)"],
    ["history · clear · echo", "shell utilities", "utilidades de la shell", "utilitats de la shell"],
    ["cmd | grep · less · sort · wc · head · tail", "pipes and filters", "tuberías y filtros", "canonades i filtres"],
    ["./cv.sh · sh <script>", "my CV, scripted", "mi CV, en un script", "el meu CV, en un script"],
    ["alias · export · env · PS1", "aliases, variables and the prompt", "alias, variables y el prompt", "àlies, variables i el prompt"],
    ["vi · nano", "read-only editors", "editores de solo lectura", "editors de només lectura"],
    ["snake · tetris", "games (/usr/games)", "juegos (/usr/games)", "jocs (/usr/games)"],
    ["lang <en|es|ca> · theme [light|dark]", "language and colours", "idioma y colores", "idioma i colors"],
    ["quick · exit", "quick view (everything at once)", "vista rápida (todo de golpe)", "vista ràpida (tot de cop)"],
    ["reboot · shutdown", "restart the system (the shell starts from scratch)", "reiniciar el sistema (la shell empieza de cero)", "reiniciar el sistema (la shell comença de zero)"],
  ];
  const CMDS = {
    help: () => print(`<div class="help">${HELP.map(([c, en, es_, ca]) => {
      const name = c.split(/[ ·]/)[0];
      return `<div class="row"><span>${run(name)}${esc(c.slice(name.length))}</span><span class="dim">${B(en, es_, ca)}</span></div>`;   // rows: display contents (grid) + one line each in pipes
    }).join("")}</div>`),
    whoami: () => user === "root" ? print("root") : print(`<strong>Gabriel Martí</strong> <span class="dim">(@gabimarti)</span>\n${html("#c-role")}`),
    id: () => pre(user === "root" ? "uid=0(root) gid=0(root) groups=0(root)" : "uid=1337(gabimarti) gid=31337(reversers) groups=31337(reversers),80(web),73(hamradio)"),
    pwd: () => print(esc(cwd)),
    ls: args => {
      const all = args.some(a => /^-\w*a/.test(a)), arg = args.find(a => !a.startsWith("-")), p = resolve(arg);
      if (denied(p)) return err(`ls: ${B("cannot open directory", "no se puede abrir el directorio", "no es pot obrir el directori")} '${esc(arg || p)}': ${B("Permission denied", "Permiso denegado", "Permís denegat")}`);
      if (isFile(p)) return print(esc(p.split("/").pop()));
      if (!isDir(p)) return err(`ls: ${B("cannot access", "no se puede acceder a", "no es pot accedir a")} '${esc(arg)}': ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`);
      if (p === HOME + "/contact") return print(html("#c-contact"));
      if (p === HOME + "/skills") return print(html("#c-skills") + `\n<span class="dim">+ </span>${item("hint.txt", p)}`);
      const names = p === "/bin" ? Object.keys(CMDS).sort() : D[p].filter(n => all || !n.startsWith("."));
      print([...(all ? [".", ".."] : []), ...names.map(n => p === "/bin" ? run(n) : item(n, p))].join("  ") || " ");
    },
    cd: args => {
      const p = resolve(args[0] || (user === "root" ? "/root" : HOME));
      if (denied(p)) return err(`cd: ${esc(args[0])}: ${B("Permission denied", "Permiso denegado", "Permís denegat")}`);
      if (isDir(p)) { cwd = p; setPrompt(); return; }
      err(`cd: ${esc(args[0])}: ${isFile(p) ? B("Not a directory", "No es un directorio", "No és un directori") : B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`);
    },
    cat: async (args, stdin) => {
      if (!args.length && stdin !== undefined) return pre(esc(stdin));
      if (!args.length) return err(B("usage: cat <file>   (try 'ls')", "uso: cat <fichero>   (prueba 'ls')", "ús: cat <fitxer>   (prova 'ls')"));
      for (const a of args) {
        const p = resolve(a);
        if (denied(p)) err(`cat: ${esc(a)}: ${B("Permission denied", "Permiso denegado", "Permís denegat")}`);
        else if (isFile(p)) { try { const h = await F[p](); PRE_FILES.has(p) ? pre(h) : print(h); } catch (e) { err(`cat: ${esc(a)}: ${B("I/O error (offline?)", "error de E/S (¿sin conexión?)", "error d'E/S (sense connexió?)")}`); } }
        else if (isDir(p)) err(`cat: ${esc(a)}: ${B("Is a directory", "Es un directorio", "És un directori")}`);
        else err(`cat: ${esc(a)}: ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`);
      }
    },
    open: args => {
      const k = ({ twitter: "x", mail: "email" })[(args[0] || "").toLowerCase()] || (args[0] || "").toLowerCase(), i = CONTACTS.indexOf(k);
      if (i < 0) return err(B("usage: open <x|linkedin|github|medium|email>", "uso: open <x|linkedin|github|medium|email>", "ús: open <x|linkedin|github|medium|email>"));
      print(B("Opening ", "Abriendo ", "Obrint ") + html(`#c-contact li:nth-child(${i + 1}) a`) + " …");
      window.open($(`#c-contact li:nth-child(${i + 1}) a`).href, "_blank", "noopener");
    },
    neofetch: () => {
      const logo = [" ██████  ███    ███", "██       ████  ████", "██   ███ ██ ████ ██", "██    ██ ██  ██  ██", " ██████  ██      ██"];
      const info = [
        `<strong>${user}</strong>@<strong>${HOST}</strong>`, "--------------------",
        `<span class="dim">OS:</span> GMOS 1.33.60 (reverse-engineered)`,
        `<span class="dim">Host:</span> ${HOST}`,
        `<span class="dim">Kernel:</span> 6.6.6-curiosity`,
        `<span class="dim">Uptime:</span> ${B("35+ years in IT", "más de 35 años en informática", "més de 35 anys en informàtica")}`,
        `<span class="dim">Shell:</span> gmsh 0.40`,
        `<span class="dim">${B("Languages", "Lenguajes", "Llenguatges")}:</span> Python, C, Delphi, ASM`,
        `<span class="dim">${B("Tools", "Herramientas", "Eines")}:</span> Ghidra, Burp Suite, Wazuh`,
        `<span class="dim">CPU:</span> ${B("human brain @ coffee GHz", "cerebro humano @ café GHz", "cervell humà @ cafè GHz")}`,
      ];
      pre(info.map((l, i) => `<span class="ok">${esc((logo[i] || "").padEnd(22))}</span>${l}`).join("\n"));
    },
    fingerprint, myip, ping, dig, ifconfig, traceroute, nmap,
    netstat: () => pre(`Proto Local Address          Foreign Address        State
tcp   10.13.37.42:51337      github.com:443         ESTABLISHED
tcp   10.13.37.42:51338      medium.com:443         ESTABLISHED
${pickN(NETSTAT_SITES, 1 + rnd(2)).map(h => `tcp   10.13.37.42:${50000 + rnd(15000)}      ${(h + ":443").padEnd(23)}${["ESTABLISHED", "TIME_WAIT", "SYN_SENT"][rnd(3)]}`).join("\n")}
tcp   127.0.0.1:31337        0.0.0.0:*              LISTEN
<span class="dim">${B("# simulated", "# simulado", "# simulat")}</span>`),
    mem: () => pre(`              total        used        free
Mem:           640K        637K          3K
Swap:            0B          0B          0B
<span class="dim">${B("# 640K ought to be enough for anybody.", "# 640K deberían bastar para cualquiera.", "# 640K haurien de ser suficients per a tothom.")}</span>`),
    df: () => pre(`Filesystem      Size   Used  Avail Use% Mounted on
/dev/brain      100T    97T     3T  97% /
/dev/coffee     500M   499M     1M  99% /var/caffeine
/dev/ghidra      64G    42G    22G  66% /opt/reversing
/dev/hacking    1337G  1336G     1G  99% /opt/redteam
tmpfs            16K     1K    15K   7% /tmp/ideas`),
    dh: () => pre(`${B("SMART health check", "Comprobación SMART", "Comprovació SMART")}: <strong>PASSED</strong>
  ${B("Reallocated sectors", "Sectores reasignados", "Sectors reassignats")}:   0
  ${B("Pending ideas", "Ideas pendientes", "Idees pendents")}:         42
  ${B("Power-on hours", "Horas encendido", "Hores encès")}:        306600 (~35 ${B("years", "años", "anys")})
  ${B("Temperature", "Temperatura", "Temperatura")}:           36.6 °C`),
    du: () => pre(`4.0K\tabout.txt\n4.0K\tsummary.txt\n4.0K\tinterests.txt\n4.0K\tarticles.txt\n4.0K\trepos.txt\n12K\tavatar.txt\n4.0K\thint.txt\n4.0K\texplore.txt\n4.0K\tcv.sh\n32K\tskills/\n20K\tcontact/\n<strong>96K\ttotal</strong>`),
    ds: () => {
      const bytes = [...new TextEncoder().encode("gabimarti :: reverser :: developer :: always learning\0\x13\x37\xde\xad\xbe\xef")]; let t = "";
      for (let i = 0; i < bytes.length; i += 16) {
        const row = bytes.slice(i, i + 16);
        t += (0x7ffde4a0 + i).toString(16).padStart(12, "0") + "  " + row.map(b => b.toString(16).padStart(2, "0")).join(" ").padEnd(47)
          + "  |" + row.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("") + "|\n";
      }
      pre(`<span class="dim">${B("stack dump @ rsp", "volcado de pila @ rsp", "volcat de pila @ rsp")}</span>\n` + esc(t.trimEnd()));
    },
    ps: () => {
      const lab = pickN(PS_LAB, 2).map(c => `${String(2000 + rnd(28000)).padStart(5)} pts/${1 + rnd(3)}    00:${String(rnd(60)).padStart(2, "0")}:${String(rnd(60)).padStart(2, "0")} ${c}`);
      pre(`  PID TTY          TIME CMD
    1 ?        35y      curiosity
  137 ?        08:00:00 coffee.d
  404 pts/0    01:23:45 ghidra
 1337 pts/0    00:42:00 python3 agent.py --mcp
${lab.join("\n")}
31337 pts/0    00:00:01 gmsh`);
    },
    uptime: () => pre(`${GM.now().toTimeString().slice(0, 8)} up 35+ ${B("years", "años", "anys")}, ${Math.round((Date.now() - t0) / 1000)}s ${B("on this page", "en esta página", "en aquesta pàgina")}, 1 user, load average: 0.42, 0.13, 0.37`),
    uname: args => pre(args.includes("-a") ? `GMOS ${HOST} 6.6.6-curiosity #1 SMP x86_64 GNU/Linux` : "GMOS"),
    date: args => {                                         // date -s sets the PC clock (GM.now) — root only, like the real one
      const i = args.indexOf("-s");
      if (i >= 0) {
        if (user !== "root") return print("date: cannot set date: Operation not permitted");
        const s = args.slice(i + 1).join(" ").replace(/^["']|["']$/g, ""), t = new Date(/^\d{4}-\d\d-\d\d$/.test(s) ? s + "T00:00" : s);
        if (!s || isNaN(t)) return print(esc(`date: invalid date '${s}'`));
        GM.setNow(t);
      }
      print(esc(GM.now().toString()));
      if (i >= 0 && GM.party()) cake();
      const h = GM.now().getHours();
      if (h >= 3 && h < 6) print(B("It's too late to be using Linux. Even the daemons are asleep.", "Es demasiado tarde para usar Linux. Hasta los daemons duermen.", "És massa tard per fer servir Linux. Fins i tot els daemons dormen."), "dim");
    },
    hostname: () => print(HOST),
    echo: args => print(esc(args.join(" "))),
    history: () => pre(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n")),
    clear: () => { out.innerHTML = ""; },
    su: () => su(),
    sudo: args => {
      if (["su", "-i", "-s"].includes(args[0])) return su();
      if (args.join(" ") === "make me a sandwich") return print(B("Okay. 🥪", "Vale. 🥪", "D'acord. 🥪"));   // xkcd 149
      if (user === "root" && args.length) return exec(args.join(" "), true);
      err(B("gabimarti is not in the sudoers file. This incident will be reported. 😉  (hint: 'sudo su')", "gabimarti no está en el fichero sudoers. Se informará de este incidente. 😉  (pista: 'sudo su')", "gabimarti no és al fitxer sudoers. Es notificarà aquest incident. 😉  (pista: 'sudo su')"));
    },
    rm: async args => {
      const a = args.join(" ");
      if (/-\w*(rf|fr)\w*|-r\w* -f|-f\w* -r/.test(a) && /(^|\s)\/\*?(\s|$)/.test(a)) {   // rm -rf /: the drama
        form.hidden = true;
        for (const d of ["/bin", "/etc", "/usr/share/midi", "/var/backups", "/home/gabimarti", "/root"]) { print(`removed directory '${d}'`, "dim"); GM.sfx.tick(); await sleep(GM.reduce ? 10 : 260); }
        await sleep(GM.reduce ? 0 : 500);
        err(B("rm: cannot remove '/': Nice try. This is JavaScript: / is read-only, and a page refresh brings everything back.", "rm: no se puede borrar '/': Buen intento. Esto es JavaScript: / es de solo lectura y recargar la página lo devuelve todo.", "rm: no es pot esborrar '/': Bon intent. Això és JavaScript: / és de només lectura i recarregar la pàgina ho torna tot."));
        form.hidden = false; input.focus({ preventScroll: true }); return;
      }
      err(user === "root" ? B("rm: nope. Not even as root. 🙂", "rm: no. Ni siquiera como root. 🙂", "rm: no. Ni tan sols com a root. 🙂") : B("rm: permission denied — nice try.", "rm: permiso denegado — buen intento.", "rm: permís denegat — bon intent."));
    },
    lang: args => { if (!["en", "es", "ca"].includes(args[0])) return err(B("usage: lang <en|es|ca>", "uso: lang <en|es|ca>", "ús: lang <en|es|ca>")); GM.setLang(args[0], true); },
    theme: args => {
      if (args[0] && !["light", "dark"].includes(args[0])) return err(B("usage: theme [light|dark]", "uso: theme [light|dark]", "ús: theme [light|dark]"));
      args[0] ? GM.setTheme(args[0]) : GM.toggleTheme();
      print(`theme: ${GM.isLight() ? "light" : "dark"}`);
    },
    quick: () => GM.setMode("classic"),
    classic: () => GM.setMode("classic"),   // old name, still accepted
    exit: () => {
      if (user === "root") { user = "gabimarti"; cwd = HOME; setPrompt(); return print("logout"); }
      GM.setMode("classic");
    },
    reboot: async () => {
      pre(B("Broadcast message: the system is going down for reboot NOW!", "Mensaje global: ¡el sistema se reinicia AHORA!", "Missatge global: el sistema es reinicia ARA!"));
      await sleep(GM.reduce ? 0 : 900); reset(); GM.showBoot();
    },
    shutdown: async () => {
      pre(B("Broadcast message: the system is going down for poweroff NOW!", "Mensaje global: ¡el sistema se apaga AHORA!", "Missatge global: el sistema s'apaga ARA!"));
      await sleep(GM.reduce ? 0 : 900); reset();
      GM.halt(B("System halted.<br>It's now safe to turn off your computer.<br><br><small>press any key to boot</small>",
        "Sistema detenido.<br>Ya puede apagar el ordenador con seguridad.<br><br><small>pulsa una tecla para arrancar</small>", "Sistema aturat.<br>Ja podeu apagar l'ordinador amb seguretat.<br><br><small>prem una tecla per arrencar</small>"));
    },
    man: args => { const h = HELP.find(([c]) => c.split(/ · | /).includes(args[0])); h ? print(`${esc(h[0])}  ${B(h[1], h[2], h[3])}`) : err(B(`No manual entry for ${esc(args[0] || "")}`, `No hay entrada de manual para ${esc(args[0] || "")}`, `No hi ha cap entrada de manual per a ${esc(args[0] || "")}`)); },
    curl: args => /^(https?:\/\/)?(ifconfig\.me|icanhazip\.com|ipinfo\.io)\/?$/.test(args.find(a => !a.startsWith("-")) || "") ? myip()
      : err(B("curl: (1) sandboxed — only 'curl ifconfig.me' works here", "curl: (1) entorno limitado — aquí solo funciona 'curl ifconfig.me'", "curl: (1) entorn limitat — aquí només funciona 'curl ifconfig.me'")),
  };
  Object.assign(CMDS, {
    free: CMDS.mem, top: CMDS.ps, ll: () => CMDS.ls(["-la"]), hint: () => CMDS.cat(["~/hint.txt"]), contact: () => CMDS.ls(["~/contact"]),
    ip: CMDS.ifconfig, nslookup: CMDS.dig, logout: CMDS.exit, quit: CMDS.exit, poweroff: CMDS.shutdown, halt: CMDS.shutdown,
  });
  Object.assign(CMDS, {
    grep: async (args, stdin) => {
      const flags = args.filter(a => /^-[a-z]+$/.test(a)).join(""), rest = args.filter(a => !/^-[a-z]+$/.test(a)), pat = rest[0];
      if (pat === undefined) return err(B("usage: grep [-i -v -n -c] pattern [file...]", "uso: grep [-i -v -n -c] patrón [fichero...]", "ús: grep [-i -v -n -c] patró [fitxer...]"));
      let re; try { re = new RegExp(pat, flags.includes("i") ? "i" : ""); } catch (e) { re = { test: l => l.includes(pat) }; }
      const srcs = await sources(rest.slice(1), stdin, "grep"); if (!srcs) return;
      const outL = [];
      for (const [name, text] of srcs) {
        const hits = text.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => re.test(l) !== flags.includes("v"));
        const tag = srcs.length > 1 ? name + ":" : "";
        if (flags.includes("c")) outL.push(tag + hits.length);
        else hits.forEach(([n, l]) => outL.push(tag + (flags.includes("n") ? n + ":" : "") + l));
      }
      if (outL.length) pre(esc(outL.join("\n")));
    },
    wc: async (args, stdin) => {
      const flags = args.filter(a => a.startsWith("-")).join(""), srcs = await sources(args.filter(a => !a.startsWith("-")), stdin, "wc"); if (!srcs) return;
      pre(esc(srcs.map(([name, t]) => {
        const c = [t ? t.split("\n").length : 0, (t.match(/\S+/g) || []).length, t.length];
        const pick = flags ? c.filter((_, i) => flags.includes("lwc"[i])) : c;
        return pick.map(n => String(n).padStart(7)).join("") + (name ? " " + name : "");
      }).join("\n")));
    },
    head: (args, stdin) => cut(args, stdin, "head"),
    tail: (args, stdin) => cut(args, stdin, "tail"),
    sort: async (args, stdin) => {
      const srcs = await sources(args.filter(a => !a.startsWith("-")), stdin, "sort"); if (!srcs) return;
      const lines = srcs.flatMap(([, t]) => t.split("\n"));
      lines.sort(args.includes("-n") ? (a, b) => parseFloat(a) - parseFloat(b) : (a, b) => a.localeCompare(b));
      if (args.includes("-r")) lines.reverse();
      pre(esc(lines.join("\n")));
    },
    less: async (args, stdin) => {
      const srcs = await sources(args.filter(a => !a.startsWith("-")), stdin, "less"); if (!srcs) return;
      const lines = srcs.flatMap(([, t]) => t.split("\n"));
      form.hidden = true;
      try {
        for (let i = 0; i < lines.length; i += 20) {
          pre(esc(lines.slice(i, i + 20).join("\n")));
          if (i + 20 >= lines.length) break;
          const m = print(`--More--(${Math.round((i + 20) / lines.length * 100)}%)`, "dim"); const k = await waitKey(); m.remove();
          if (k === "q" || k === "Escape") break;
        }
      } finally { form.hidden = false; input.focus({ preventScroll: true }); main.scrollTop = main.scrollHeight; }
    },
    alias: args => {
      if (!args.length) return pre(esc(Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join("\n")));
      const m = args.join(" ").match(/^([\w.-]+)=(.*)$/);
      if (!m) return aliases[args[0]] ? pre(esc(`alias ${args[0]}='${aliases[args[0]]}'`)) : err(`alias: ${esc(args[0])}: not found`);
      aliases[m[1]] = unquote(m[2]);
    },
    unalias: args => { delete aliases[args[0]]; },
    export: args => {
      if (!args.length) return CMDS.env();
      const m = args.join(" ").match(/^([A-Za-z_]\w*)=(.*)$/);
      if (!m) return err(B("usage: export NAME=value", "uso: export NOMBRE=valor", "ús: export NOM=valor"));
      env[m[1]] = unquote(m[2]); if (m[1] === "PS1") setPrompt();
    },
    unset: args => { delete env[args[0]]; if (args[0] === "PS1") setPrompt(); },
    env: () => pre(esc(Object.entries({ ...env, USER: user }).map(([k, v]) => `${k}=${v}`).join("\n"))),
    sh: args => script(args[0]), bash: args => script(args[0]), source: args => script(args[0]),
    vi: args => editor("vi", args), vim: args => editor("vi", args), nano: args => editor("nano", args),
  });
  Object.assign(CMDS, { printenv: CMDS.env, more: CMDS.less, view: CMDS.vi, pico: CMDS.nano });

  // ---------- easter eggs (phase 1b) ----------
  const pick = a => a[rnd(a.length)];
  const FORTUNES = ["Talk is cheap. Show me the code. — Linus Torvalds", "UNIX is simple. It just takes a genius to understand its simplicity. — Dennis Ritchie",
    "Any sufficiently advanced technology is indistinguishable from magic. — Arthur C. Clarke", "The best way to predict the future is to invent it. — Alan Kay",
    "There are 10 types of people: those who understand binary and those who don't.", "It's not a bug, it's an undocumented feature.",
    "Weeks of coding can save you hours of planning.", "Real programmers count from 0.", "The quieter you become, the more you are able to hear.",
    "Curiosity is the best exploit."];
  const cow = t => {
    const w = Math.min(Math.max(...t.split("\n").map(l => l.length)), 60), lines = (t.match(new RegExp(`.{1,${w}}(\\s|$)`, "g")) || [t.slice(0, w)]).map(l => l.trim());
    return ` ${"_".repeat(w + 2)}\n` + lines.map((l, i) => `${lines.length === 1 ? "<" : i === 0 ? "/" : i === lines.length - 1 ? "\\" : "|"} ${l.padEnd(w)} ${lines.length === 1 ? ">" : i === 0 ? "\\" : i === lines.length - 1 ? "/" : "|"}`).join("\n")
      + `\n ${"-".repeat(w + 2)}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
  };
  const TRAIN = ["      ====        ___________", "  _D _|  |_______/  GMSH 1997 \\__", "   |(_)---  |   [] [] [] [] []  |", "   /     |  |____________________|",
    "  | ________|___O========O========O", " ==/_/     \\_/    \\_/      \\_/     "];
  const BACKUP86 = "BACKUP86.TXT - 1986\nThe only backup I ever made.\nWhat it contains: this text file.\nLesson learned: test your restores.";
  const HISCORE = "HIGH SCORES - DIGGER (1983)\n 1. GABIMARTI   999990\n 2. GABIMARTI   871200\n 3. YOU              0   <- the night is young";
  async function anim(frames, ms, cls) {                     // frames (pre html) in one element; any key stops
    form.hidden = true; const el = pre(""); if (cls) el.classList.add(cls);
    let stop = false; waitKey().then(() => { stop = true; });
    for (const f of frames) { if (stop) break; el.innerHTML = f; main.scrollTop = main.scrollHeight; await sleep(GM.reduce ? 5 : ms); }
    cancelKey?.(); form.hidden = false; input.focus({ preventScroll: true }); return el;
  }
  Object.assign(CMDS, {
    fortune: () => pre(esc(pick(FORTUNES))),
    cowsay: args => pre(esc(cow(args.join(" ") || pick(FORTUNES)))),
    make: args => args.join(" ") === "me a sandwich" ? print(B("What? Make it yourself.", "¿Qué? Háztelo tú.", "Què? Fes-te'l tu.")) : err(`make: *** ${B("No targets specified and no makefile found.", "No se han indicado objetivos ni hay makefile.", "No s'han indicat objectius ni hi ha makefile.")}  Stop.`),
    sl: async () => {
      const frames = [];
      for (let x = 64; x > -36; x -= 2) frames.push(esc(TRAIN.map(l => x >= 0 ? " ".repeat(x) + l : l.slice(-x)).join("\n")));
      (await anim(frames, 45)).remove();
      print(B("(sl: you typed sl instead of ls. The train always wins.)", "(sl: escribiste sl en vez de ls. El tren siempre gana.)", "(sl: has escrit sl en lloc de ls. El tren sempre guanya.)"), "dim");
    },
    cmatrix: async () => {
      const COLS = 60, ROWS = 14, CH = "01アイウエオカキクケコｱｲｳｴｵ$#@%&*+=<>", drops = Array.from({ length: COLS }, () => -Math.floor(Math.random() * ROWS)), frames = [];
      for (let f = 0; f < 120; f++) {
        const g = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
        drops.forEach((d, c) => { for (let r = Math.max(0, d - 6); r <= Math.min(ROWS - 1, d); r++) g[r][c] = CH[(Math.random() * CH.length) | 0]; drops[c] = d >= ROWS + 6 ? 0 : d + 1; });
        frames.push(esc(g.map(r => r.join("")).join("\n")));
      }
      (await anim(frames, 50, "matrix")).remove();
      print(B("(cmatrix: wake up, Neo... any key brought you back.)", "(cmatrix: despierta, Neo... una tecla te ha traído de vuelta.)", "(cmatrix: desperta, Neo... una tecla t'ha tornat.)"), "dim");
    },
    telnet: async args => {
      if (!args[0]) return err(B("usage: telnet host   (any host will do: they all lead to the same BBS)", "uso: telnet host   (cualquier host sirve: todos llevan a la misma BBS)", "ús: telnet host   (qualsevol host serveix: tots porten a la mateixa BBS)"));
      try { await GM.need("bbs.js"); } catch (e) { return err("telnet: no route to host"); }
      await GM.bbs.run({ host: args[0], print, err, askLine, sleep, esc, sfx: GM.sfx, cls: () => { out.innerHTML = ""; }, reduce: GM.reduce,
        wink: B("(telnet: plain text, no encryption, 1997 style. Don't type real passwords.)", "(telnet: texto plano, sin cifrar, estilo 1997. No escribas contraseñas reales.)", "(telnet: text pla, sense xifrar, estil 1997. No escriguis contrasenyes reals.)") });
      setPrompt();
    },
    finger: args => {
      const u = (args[0] || "gabimarti").replace(/@.*/, "");
      if (u === "root") return pre(`Login: root                     Name: root\nNever logged in.\nPlan:\n${B("Forget the password. Again.", "Olvidar la contraseña. Otra vez.", "Oblidar la contrasenya. Una altra vegada.")}`);
      if (u !== "gabimarti") return err(`finger: ${esc(u)}: no such user.`);
      pre(`Login: gabimarti                Name: Gabriel Martí\nDirectory: /home/gabimarti     Shell: /bin/gmsh\nOn since ${esc(new Date(t0).toString().slice(0, 21))} on tty1\nMail last read Fri Dec 19 23:59 1997\nPlan:\n${F[HOME + "/.plan"]()}`);
    },
    mount: async args => {
      const a = args.join(" ");
      if (!a) return pre("/dev/sda1 on / type gmfs (ro)\nproc on /proc type proc (rw)" + (floppyIn ? "\n/dev/fd0 on /mnt/floppy type msdos (ro)" : ""));
      if (!/fd0|floppy/.test(a)) return err(`mount: ${esc(a)}: ${B("special device does not exist", "no existe el dispositivo especial", "no existeix el dispositiu especial")}`);
      if (floppyIn) return err("mount: /dev/fd0: already mounted on /mnt/floppy");
      form.hidden = true; GM.sfx.floppy(); await sleep(GM.reduce ? 50 : 1300); form.hidden = false; input.focus({ preventScroll: true });
      if (++floppyTries < 3) return err(`mount: /dev/fd0: ${B("no medium found (floppies wanted patience: try again)", "no se encontró ningún medio (las disqueteras pedían paciencia: prueba otra vez)", "no s'ha trobat cap suport (les disqueteres demanaven paciència: torna-ho a provar)")}`);
      floppyIn = true; D["/mnt/floppy"] = ["backup86.txt", "hiscore.txt"];
      F["/mnt/floppy/backup86.txt"] = () => esc(BACKUP86); F["/mnt/floppy/hiscore.txt"] = () => esc(HISCORE);
      PRE_FILES.add("/mnt/floppy/backup86.txt"); PRE_FILES.add("/mnt/floppy/hiscore.txt");
      print(B("(a dusty floppy labelled BACKUP 86 turns up) /dev/fd0 mounted on /mnt/floppy", "(aparece un disquete polvoriento etiquetado BACKUP 86) /dev/fd0 montado en /mnt/floppy", "(apareix un disquet polsós etiquetat BACKUP 86) /dev/fd0 muntat a /mnt/floppy"));
    },
    umount: () => { if (!floppyIn) return err("umount: /mnt/floppy: not mounted"); floppyIn = false; D["/mnt/floppy"] = []; if (cwd.startsWith("/mnt/floppy")) { cwd = "/mnt"; setPrompt(); } },
    aplay: async args => {
      const L = GM.tunes?.list;
      if (!L) return err("aplay: no sound card found (tunes.js not loaded)");
      const a = args.find(x => !x.startsWith("-"));
      if (!a) return err(B("usage: aplay <file.mid>   (try ls /usr/share/midi)", "uso: aplay <fichero.mid>   (prueba ls /usr/share/midi)", "ús: aplay <fitxer.mid>   (prova ls /usr/share/midi)"));
      const p = resolve(a), t = a.endsWith("*.mid") ? pick(L) : L.find(x => "/usr/share/midi/" + x.file.toLowerCase() === p);
      if (!t) return err(`aplay: ${esc(a)}: ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`);
      const [stop, secs] = GM.tunes.play(t.tune);
      print(`Playing MIDI '${esc(t.file.toLowerCase())}': ${esc(t.title)} (${B("as heard in", "como en", "com a")} ${esc(t.game)})`);
      form.hidden = true; const m = print(B("Press any key to stop", "Pulsa una tecla para parar", "Prem una tecla per aturar"), "dim");
      await Promise.race([waitKey(), sleep(secs * 1000 + 300)]);
      cancelKey?.(); stop(); m.remove(); form.hidden = false; input.focus({ preventScroll: true });
    },
  });
  Object.assign(CMDS, { play: CMDS.aplay });
  async function game(name) {                               // /usr/games (games.js, shared with MS-DOS)
    try { await GM.need("games.js"); } catch (e) { return err(`${name}: ${B("cannot load the game", "no se puede cargar el juego", "no es pot carregar el joc")}`); }
    form.hidden = true;
    try { const score = await GM.games.run(name, print("")); print(`${name}: score ${score}`); }
    finally { form.hidden = false; input.focus({ preventScroll: true }); main.scrollTop = main.scrollHeight; }
  }
  Object.assign(CMDS, { snake: () => game("snake"), tetris: () => game("tetris") });
  ["snake", "tetris"].forEach(g => { F["/usr/games/" + g] = () => esc(`\x7fELF\u2592\u2592\u2592 /usr/games/${g} (binary: type '${g}' to play)`); });

  // text sources for filters: files given, else the pipe; [name, plain text] or null after an error
  async function sources(files, stdin, cmd) {
    if (!files.length) {
      if (stdin === undefined) { err(B(`${cmd}: missing file operand (or pipe something into it: cat about.txt | ${cmd})`, `${cmd}: falta el fichero (o pásale algo con una tubería: cat about.txt | ${cmd})`, `${cmd}: falta el fitxer (o passa-li alguna cosa amb una canonada: cat about.txt | ${cmd})`)); return null; }
      return [["", stdin]];
    }
    const res = [];
    for (const f of files) {
      const p = resolve(f);
      if (denied(p)) { err(`${cmd}: ${esc(f)}: ${B("Permission denied", "Permiso denegado", "Permís denegat")}`); continue; }
      if (!isFile(p)) { err(`${cmd}: ${esc(f)}: ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`); continue; }
      try { res.push([f, plain(await F[p]())]); } catch (e) { err(`${cmd}: ${esc(f)}: I/O error`); }
    }
    return res.length ? res : null;
  }
  async function cut(args, stdin, cmd) {
    let n = 10; const files = [];
    for (let i = 0; i < args.length; i++) { if (args[i] === "-n") n = +args[++i]; else if (/^-\d+$/.test(args[i])) n = -args[i]; else files.push(args[i]); }
    const srcs = await sources(files, stdin, cmd); if (!srcs) return;
    pre(esc(srcs.map(([, t]) => { const l = t.split("\n"); return (cmd === "head" ? l.slice(0, n) : l.slice(-n)).join("\n"); }).join("\n")));
  }
  // scripts: comments, echo [-e] with \a = beep, read -p (waits a key, q quits), sleep; anything else runs as a command
  async function script(file) {
    if (!file) return err(B("usage: sh <script>", "uso: sh <script>", "ús: sh <script>"));
    const p = resolve(file);
    if (!SCRIPTS[p]) return isFile(p) ? err(`sh: ${esc(file)}: ${B("not a script", "no es un script", "no és un script")}`) : err(`sh: ${esc(file)}: ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`);
    form.hidden = true;
    try {
      for (const raw of SCRIPTS[p]().split("\n")) {
        const line = raw.trim(); if (!line || line.startsWith("#")) continue;
        for (const part of line.split(/\s*;\s*/)) {
          const w = words(part);
          if (w[0] === "echo") {
            let t = w.slice(1).filter(x => x !== "-e" && x !== "-n").join(" ");
            const bells = (t.match(/\\a/g) || []).length; t = t.replace(/\\a/g, "");
            for (let i = 0; i < bells; i++) setTimeout(beep, i * 220);
            if (t) print(esc(t)); continue;
          }
          if (w[0] === "read") {
            const m = print(esc(w[w.indexOf("-p") + 1] || ""), "dim"); const k = await waitKey(); m.remove();
            if (k === "q" || k === "Escape") return print("^C", "echo");
            continue;
          }
          if (w[0] === "sleep") { await sleep(GM.reduce ? 0 : +w[1] * 1000); continue; }
          await runLine(part);
        }
        await sleep(30);
      }
    } finally { form.hidden = false; input.focus({ preventScroll: true }); main.scrollTop = main.scrollHeight; }
  }
  // vi / nano: read-only viewers (and the oldest joke in Unix: how do you exit vim?)
  async function editor(kind, args) {
    const a = args.find(x => !x.startsWith("-")), p = a && resolve(a);
    if (p && denied(p)) return err(`${kind}: ${esc(a)}: ${B("Permission denied", "Permiso denegado", "Permís denegat")}`);
    const lines = p && isFile(p) ? plain(await F[p]()).split("\n") : [];
    if (kind === "vi") {
      pre(esc(lines.join("\n")) + (lines.length ? "\n" : "") + Array(Math.max(1, 8 - lines.length)).fill('<span class="dim">~</span>').join("\n") + `\n"${esc(a || "[No Name]")}" [readonly] ${lines.length}L`);
      for (;;) {
        const c = (await askLine(":")).trim().replace(/^:/, "");
        if (/^q!?$/.test(c)) break;
        if (/^(w|wq|x)!?$/.test(c)) { err("E45: 'readonly' option is set (add ! to override)... " + B("just kidding, this file system is read-only. Try :q", "es broma, el sistema de ficheros es de solo lectura. Prueba :q", "és broma, el sistema de fitxers és de només lectura. Prova :q")); continue; }
        err(`E492: Not an editor command: ${esc(c)} &nbsp;` + B("(hint: :q to quit. You're not the first one stuck in vim.)", "(pista: :q para salir. No eres el primero atrapado en vim.)", "(pista: :q per sortir. No ets el primer atrapat al vim.)"));
      }
      print(B("You exited vim. Few people can say that.", "Has salido de vim. Pocos pueden decirlo.", "Has sortit del vim. Pocs ho poden dir."), "dim");
    } else {
      pre(`  GNU nano 1.0          ${esc(a || "New Buffer")}          [ Read Only ]\n\n${esc(lines.join("\n"))}\n\n^X Exit   ^O WriteOut   ^W Where Is   ^K Cut Text`);
      while (!/^(\^x|x|exit|q)$/i.test((await askLine("^X? ")).trim())) err(B("Read-only buffer. ^X (or x) to exit.", "Búfer de solo lectura. ^X (o x) para salir.", "Búfer de només lectura. ^X (o x) per sortir."));
    }
  }

  async function exec(line, silent = false) {
    if (!silent) print(`${promptHtml()} ${esc(line)}`, "echo");
    line = line.trim(); if (!line) return;
    if (!silent) { hist.push(line); hpos = hist.length; }
    await runLine(line);
  }
  const pipes = t => { const parts = [""]; let q = ""; for (const ch of t) { if ((ch === '"' || ch === "'") && (!q || q === ch)) q = q ? "" : ch; if (ch === "|" && !q) parts.push(""); else parts[parts.length - 1] += ch; } return parts.map(s => s.trim()); };
  async function runLine(line, stdin) {
    const ps = pipes(line);
    if (ps.length > 1) {
      let data = stdin;
      for (const [i, part] of ps.entries()) { if (i < ps.length - 1) data = await capture(() => runLine(part, data)); else return runLine(part, data); }
    }
    if (/>/.test(line.replace(/"[^"]*"|'[^']*'/g, ""))) return err(`gmsh: ${B("cannot write: read-only file system", "no se puede escribir: sistema de ficheros de solo lectura", "no es pot escriure: sistema de fitxers de només lectura")}`);
    line = line.replace(/\$\{?([A-Za-z_]\w*)\}?/g, (_, k) => k === "USER" ? user : env[k] ?? "");
    let [cmd, ...args] = words(line);
    if (!cmd) return;
    if (Object.hasOwn(aliases, cmd)) [cmd, ...args] = [...words(aliases[cmd]), ...args];
    if (cmd.includes("/")) { const p = resolve(cmd); return SCRIPTS[p] ? script(cmd) : isFile(p) || isDir(p) ? err(`gmsh: ${esc(cmd)}: ${B("Permission denied", "Permiso denegado", "Permís denegat")}`) : err(`gmsh: ${esc(cmd)}: ${B("No such file or directory", "No existe el fichero o directorio", "No existeix el fitxer o directori")}`); }
    if (cmd.endsWith(".sh") && SCRIPTS[resolve(cmd)]) return err(`gmsh: ${esc(cmd)}: ${B("command not found. The current directory is not in the PATH: try", "comando no encontrado. El directorio actual no está en el PATH: prueba", "ordre no trobada. El directori actual no és al PATH: prova")} './${esc(cmd)}'`);
    const f = Object.hasOwn(CMDS, cmd) && CMDS[cmd], lower = cmd.toLowerCase();
    if (f) await f(args, stdin);
    else if (cmd !== lower && Object.hasOwn(CMDS, lower)) {    // Linux is case-sensitive, and grumpy about it
      const [en, es_, ca] = SHOUT[rnd(SHOUT.length)];
      err(`gmsh: ${esc(cmd)}: ${B(en, es_, ca)} ${B(`Try '${esc(lower)}'.`, `Prueba '${esc(lower)}'.`, `Prova '${esc(lower)}'.`)}`);
    }
    else err(`gmsh: ${B("command not found", "comando no encontrado", "ordre no trobada")}: ${esc(cmd)} — ${B("type 'help'", "escribe 'help'", "escriu 'help'")}`);
  }

  function reset() {                       // reboot/shutdown: next time the shell starts like a fresh system
    user = "gabimarti"; cwd = HOME; cv = null; hist.length = 0; hpos = 0; started = false;
    floppyIn = false; floppyTries = 0; D["/mnt/floppy"] = [];
    if (pending) endPassword();
    out.innerHTML = ""; input.value = ""; setPrompt();
  }

  // ---------- input ----------
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const v = input.value; input.value = ""; GM.sfx.key();
    if (pending) { const cb = pending; print(esc(promptEl.textContent) + (input.type === "password" ? "" : " " + esc(v)), "echo"); endPassword(); await cb(v); return; }
    await exec(v);
  });
  input.addEventListener("keydown", e => {
    if (pending) { if (e.key === "c" && e.ctrlKey) { e.preventDefault(); print("^C", "echo"); endPassword(); } return; }
    if (e.key === "ArrowUp" && hpos > 0) { input.value = hist[--hpos]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hpos = Math.min(hist.length, hpos + 1); input.value = hist[hpos] || ""; e.preventDefault(); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); CMDS.clear(); }
    else if (e.key === "c" && e.ctrlKey && !getSelection().toString()) { print(`${promptHtml()} ${esc(input.value)}^C`, "echo"); input.value = ""; }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
  });
  function complete() {
    const parts = input.value.split(" "), last = parts.pop();
    let cands;
    if (!parts.length) cands = Object.keys(CMDS).filter(c => c.startsWith(last));
    else {
      const slash = last.lastIndexOf("/"), dirPart = slash >= 0 ? last.slice(0, slash + 1) : "", base = last.slice(slash + 1);
      const dir = resolve(dirPart || ".");
      cands = (isDir(dir) && !denied(dir) ? D[dir] : []).filter(n => n.startsWith(base) && (base.startsWith(".") || !n.startsWith("."))).map(n => dirPart + n);
    }
    if (cands.length === 1) input.value = [...parts, cands[0]].join(" ") + (cands[0].endsWith("/") ? "" : " ");
    else if (cands.length > 1) print(cands.map(esc).join("  "), "dim");
  }
  out.addEventListener("click", async e => {
    const b = e.target.closest("[data-run]");
    if (b) { await exec(b.dataset.run); input.focus({ preventScroll: true }); }
  });
  $("#shell").addEventListener("click", e => { if (!e.target.closest("a, button") && !getSelection().toString()) input.focus({ preventScroll: true }); });
  document.addEventListener("keydown", e => {   // typing anywhere goes to the prompt
    if (!$("#shell").hidden && document.activeElement !== input && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest("button, a, input")) input.focus();
  });

  // 10-15 (GM.party): partyd serves an ANSI cake while the PC speaker plays; on login, or when root's 'date -s' lands on it
  async function cake() {
    try { await GM.need("tunes.js"); } catch (e) { /* a silent cake */ }
    const el = print("", "pre cake"), FL = [..."()'*"], sp = (c, t) => `<span class="pc${c}">${t}</span>`;
    const [stop, secs] = GM.tunes ? GM.tunes.play(GM.tunes.party) : [() => {}, 5];
    const end = performance.now() + Math.max(secs, 5) * 1000;
    for (let i = 0; performance.now() < end; i++) {
      const flames = [0, 1, 2, 3].map(() => sp([4, 1, 5][rnd(3)], FL[rnd(4)])).join("   ");
      const icing = n => [..."~".repeat(19)].map((c, j) => sp(1 + (i + j + n) % 6, c)).join("");
      el.innerHTML = `      ${flames}\n      |   |   |   |\n  .---|---|---|---|---.\n  |${icing(0)}|\n  |   ${sp(4, "PARTY  TIME!")}    |\n  |${icing(3)}|\n  '-------------------'`;
      main.scrollTop = main.scrollHeight;
      await sleep(160);
    }
    stop();
    print(`partyd[1015]: ${B("it's 10-15. Cake for everyone.", "hoy es 15-10. Tarta para todos.", "avui és 15-10. Pastís per a tothom.")}`);
  }

  GM.shell = {
    open() {
      if (!started) {
        started = true; setPrompt();
        if (!D["/usr/share/midi"].length) GM.need("tunes.js").then(() => {      // /usr/share/midi: the same tunes as the BIOS and MS-DOS
          D["/usr/share/midi"] = GM.tunes.list.map(t => t.file.toLowerCase());
          for (const t of GM.tunes.list) { const p = "/usr/share/midi/" + t.file.toLowerCase(); F[p] = () => esc(`MThd\u2592\u2592\u2592\u2592 ${t.title}\nas heard in ${t.game}\n(binary MIDI data: aplay it instead)`); PRE_FILES.add(p); }
        }).catch(() => {});
        type(print(""), {
          es: "gmsh 0.40 — gabimarti.github.io\nEscribe 'help' para ver los comandos, o empieza por 'cat hint.txt'.\n",
          ca: "gmsh 0.40 — gabimarti.github.io\nEscriu 'help' per veure les ordres, o comença per 'cat hint.txt'.\n",
        }[root.lang] || "gmsh 0.40 — gabimarti.github.io\nType 'help' for the list of commands, or start with 'cat hint.txt'.\n", 10).then(() => GM.party() && cake());
      }
      input.focus({ preventScroll: true });
    },
  };
})();
