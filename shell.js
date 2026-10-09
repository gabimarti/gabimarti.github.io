// gmsh — interactive shell for gabimarti.github.io. Loaded on demand by site.js (uses the global GM api).
"use strict";
(() => {
  const { $, B, esc, sleep, type } = GM;
  const root = document.documentElement, main = $("main");
  const out = $("#sh-out"), form = $("#sh-form"), input = $("#sh-in"), promptEl = $("#sh-prompt");
  const es = () => root.lang === "es";
  // reuse the classic view's content (ids c-*), without ids and indentation whitespace
  const html = sel => { const el = $(sel); return el ? el.outerHTML.replace(/ id="[^"]*"/, "").replace(/>\s+</g, "><") : ""; };
  const HOST = "gabimarti.github.io", HOME = "/home/gabimarti";
  let user = "gabimarti", cwd = HOME, cv = null, pending = null, started = false;
  const hist = []; let hpos = 0; const t0 = Date.now();

  // ---------- output ----------
  const print = (h, cls = "") => {
    const d = document.createElement("div"); d.className = "line " + cls; d.innerHTML = h; out.append(d);
    main.scrollTop = main.scrollHeight; return d;
  };
  const err = h => { GM.sfx.err(); return print(h, "err"); }, pre = h => print(h, "pre");
  const rnd = n => Math.floor(Math.random() * n), pickN = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n);
  const disp = p => p === HOME || p.startsWith(HOME + "/") ? "~" + p.slice(HOME.length) : p;
  const promptHtml = () => `<span class="prompt${user === "root" ? " root" : ""}">${user}@${HOST}:${esc(disp(cwd))}${user === "root" ? "#" : "$"}</span>`;
  const setPrompt = txt => { promptEl.className = "prompt" + (user === "root" ? " root" : ""); promptEl.textContent = txt ?? `${user}@${HOST}:${disp(cwd)}${user === "root" ? "#" : "$"}`; };
  const run = (c, label = c) => `<button type="button" class="fs" data-run="${esc(c)}">${esc(label)}</button>`;

  // ---------- filesystem ----------
  const SKILLS = ["offensive", "reversing", "web-intel", "defense", "grc", "dev", "languages"];
  const CONTACTS = ["x", "linkedin", "github", "medium", "email"];
  const D = {
    "/": ["bin/", "etc/", "home/", "root/", "tmp/", "var/"],
    "/bin": [], "/tmp": [], "/home": ["gabimarti/"], "/var": ["backups/"],
    [HOME]: ["about.txt", "summary.txt", "interests.txt", "articles.txt", "avatar.txt", "hint.txt", "skills/", "contact/", ".bash_history", ".notes/", ".secret"],
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
    [HOME + "/avatar.txt"]: () => html("#avatar .avatar"),
    [HOME + "/hint.txt"]: () => B(
      "Welcome, visitor. A few ideas to get started:\n  1. 'whoami' and 'cat summary.txt'\n  2. 'ls skills' and 'cat articles.txt'\n  3. 'ls contact' or 'open github'\n  4. 'cat avatar.txt' for a portrait\n  5. 'neofetch', 'myip', 'fingerprint'\nSome files are hidden. Real hackers use 'ls -a'.",
      "Bienvenido/a. Algunas ideas para empezar:\n  1. 'whoami' y 'cat summary.txt'\n  2. 'ls skills' y 'cat articles.txt'\n  3. 'ls contact' u 'open github'\n  4. 'cat avatar.txt' para ver un retrato\n  5. 'neofetch', 'myip', 'fingerprint'\nHay ficheros ocultos. Los hackers de verdad usan 'ls -a'."),
    [HOME + "/skills/hint.txt"]: () => B(
      "Each file here is a skill area: try 'cat dev.txt' or 'cat web-intel.txt'.\nCurious about the machine? 'neofetch', 'mem', 'df', 'ps', 'ls /'.",
      "Cada fichero es un área: prueba 'cat dev.txt' o 'cat web-intel.txt'.\n¿Curiosidad por la máquina? 'neofetch', 'mem', 'df', 'ps', 'ls /'."),
    [HOME + "/.bash_history"]: () => esc("whoami\nls -a\ncat .secret\ncat .notes/todo.txt\nsudo su\nexit\nmyip\nopen github"),
    [HOME + "/.secret"]: () => B(
      "🏁 flag{curi0s1ty_1s_th3_b3st_3xpl01t}\nNice. Next level: become root and read my CV. Start with ~/.notes",
      "🏁 flag{curi0s1ty_1s_th3_b3st_3xpl01t}\nBien. Siguiente nivel: hazte root y lee mi CV. Empieza por ~/.notes"),
    [HOME + "/.notes/todo.txt"]: () => B(
      "TODO\n  [x] write 'El Arte de los Hashes' on Medium (cat ~/articles.txt)\n  [ ] stop forgetting the root password!!\n  [ ] delete the old backup in /var/backups — it's only ENCODED, not encrypted...\n      (my favourite chef's recipe: a classic Caesar shift of 13, then base 64, then base 16)\n  [ ] check /etc/shadow permissions (anyone can verify the hash there)",
      "TODO\n  [x] escribir 'El Arte de los Hashes' en Medium (cat ~/articles.txt)\n  [ ] ¡¡dejar de olvidar la contraseña de root!!\n  [ ] borrar el backup viejo de /var/backups — solo está CODIFICADO, no cifrado...\n      (la receta de mi chef favorito: un César clásico de 13, luego base 64, luego base 16)\n  [ ] revisar permisos de /etc/shadow (cualquiera puede verificar el hash)"),
    "/etc/hostname": () => HOST,
    "/etc/motd": () => B("GMOS 1.0.59 — authorized users only. Curious ones too.", "GMOS 1.0.59 — solo usuarios autorizados. Y curiosos."),
    "/etc/shadow": async () => { const v = await vault(); return `root:${v.sha256}:20370:0:99999:7:::\ngabimarti:!:20370:0:99999:7:::\n<span class="dim"># hash: SHA-256 (hex)</span>`; },
    "/var/backups/root_pw.bak": async () => { const v = await vault(); return `<span class="dim"># root password backup — 2019</span>\n${esc(v.backup)}`; },
    "/root/cv.txt": () => esc(cv),
    "/root/flag.txt": () => "🏁 flag{r00t_0f_4ll_curi0s1ty}\n" + B("Congratulations, you are root. Say hi: 'open email'.", "Enhorabuena, eres root. Salúdame: 'open email'."),
  };
  SKILLS.forEach((k, i) => F[`${HOME}/skills/${k}.txt`] = () => html(`#c-skills dd:nth-of-type(${i + 1})`));
  CONTACTS.forEach((k, i) => F[`${HOME}/contact/${k}.url`] = () => html(`#c-contact li:nth-child(${i + 1}) a`));
  const PRE_FILES = new Set(["/etc/shadow", "/var/backups/root_pw.bak", "/root/cv.txt", HOME + "/.notes/todo.txt", HOME + "/.bash_history"]);

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
  function askPassword(cb) { pending = cb; input.type = "password"; input.value = ""; setPrompt(es() ? "Contraseña:" : "Password:"); }
  function endPassword() { pending = null; input.type = "text"; setPrompt(); }
  function su() {
    if (user === "root") return print(B("You are already root.", "Ya eres root."));
    if (!window.crypto || !crypto.subtle) return err("su: WebCrypto not available (needs https)");
    askPassword(async pw => {
      let v;
      try { v = await vault(); } catch (e) { return err(B("su: cannot reach the vault (offline?)", "su: no se puede acceder al vault (¿sin conexión?)")); }
      await sleep(700);                                     // like a real su: slow on failure
      if (await sha256(pw) !== v.sha256) return err("su: Authentication failure");
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(v.salt), iterations: v.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      cv = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(v.iv) }, key, b64(v.ct)));
      user = "root"; cwd = "/root"; setPrompt();
      print(`<strong>${B("Welcome, root.", "Bienvenido, root.")}</strong> ${B("Try", "Prueba")} ${run("ls")} · ${run("cat cv.txt")} · ${run("cat flag.txt")} · ${run("exit")}`);
    });
  }

  // ---------- network: real requests only when the visitor runs the command ----------
  const host = s => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(s || "") ? s.toLowerCase() : null;
  async function myip() {
    print(`<span class="dim">${B("# asking api.ipify.org (a public IP echo service) — nothing is stored here", "# consultando api.ipify.org (servicio público que devuelve tu IP) — aquí no se guarda nada")}</span>`);
    try { const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store", signal: AbortSignal.timeout(5000) }); print(`${B("Your public IP", "Tu IP pública")}: <strong>${esc((await r.json()).ip)}</strong>`); }
    catch (e) { err(B("myip: request failed (offline or blocked by an extension)", "myip: la petición falló (sin conexión o bloqueada por una extensión)")); }
  }
  async function ping(args) {
    const h = host(args.find(a => !a.startsWith("-")));
    if (!h) return err(B("usage: ping <host>   e.g. ping github.com", "uso: ping <host>   p.ej. ping github.com"));
    print(`PING ${esc(h)}`);
    const times = [];
    for (let i = 1; i <= 4; i++) {
      const t = performance.now();
      try {
        await fetch(`https://${h}/favicon.ico?gmsh=${Math.random()}`, { mode: "no-cors", cache: "no-store", signal: AbortSignal.timeout(3000) });
        const ms = performance.now() - t; times.push(ms);
        pre(`reply from ${esc(h)}: seq=${i} time=${ms.toFixed(1)} ms`);
      } catch (e) { pre(`seq=${i} ${B("request timeout", "tiempo de espera agotado")}`); }
      await sleep(400);
    }
    const n = times.length;
    pre(`--- ${esc(h)} ping statistics ---\n4 sent, ${n} received, ${100 - n * 25}% loss` + (n ? `\nrtt min/avg/max = ${Math.min(...times).toFixed(1)}/${(times.reduce((a, b) => a + b) / n).toFixed(1)}/${Math.max(...times).toFixed(1)} ms` : ""));
  }
  async function dig(args) {
    const TYPES = /^(A|AAAA|MX|TXT|NS|CNAME)$/i;
    const h = host(args.find(a => !a.startsWith("-") && !TYPES.test(a))), t = (args.find(a => TYPES.test(a)) || "A").toUpperCase();
    if (!h) return err(B("usage: dig <domain> [A|AAAA|MX|TXT|NS|CNAME]", "uso: dig <dominio> [A|AAAA|MX|TXT|NS|CNAME]"));
    print(`<span class="dim">${B("# DNS over HTTPS via cloudflare-dns.com", "# DNS sobre HTTPS vía cloudflare-dns.com")}</span>`);
    try {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(h)}&type=${t}`, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(5000) });
      const ans = (await r.json()).Answer || [];
      pre(`;; QUESTION: ${esc(h)}. IN ${t}\n;; ANSWER (${ans.length}):\n` + (ans.map(a => `${esc(a.name).padEnd(28)} ${String(a.TTL).padStart(6)}  IN  ${esc(a.data)}`).join("\n") || `   (${B("no records", "sin registros")})`));
    } catch (e) { err(B("dig: query failed", "dig: la consulta falló")); }
  }
  function ifconfig() {
    const c = navigator.connection || {};
    pre(`lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 10.13.37.42  netmask 255.255.255.0  broadcast 10.13.37.255
        ether de:ad:be:ef:13:37  txqueuelen 1000
<span class="dim"># ${B("your browser reports", "tu navegador indica")}: ${navigator.onLine ? "online" : "offline"}${c.effectiveType ? `, ${esc(c.effectiveType)}, ~${c.downlink} Mb/s, rtt ~${c.rtt} ms` : ""}
# ${B("public IP: run 'myip'", "IP pública: ejecuta 'myip'")}</span>`);
  }
  function fingerprint() {
    const n = navigator, s = screen;
    pre(`<span class="dim">${B("# what any website can read about you — no cookies needed", "# lo que cualquier web puede leer de ti — sin necesidad de cookies")}</span>
User-Agent   : ${esc(n.userAgent)}
${B("Languages   ", "Idiomas     ")} : ${esc((n.languages || [n.language]).join(", "))}
${B("Time zone   ", "Zona horaria")} : ${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}
${B("Screen      ", "Pantalla    ")} : ${s.width}x${s.height} @${devicePixelRatio}x, ${s.colorDepth}-bit
${B("CPU cores   ", "Núcleos CPU ")} : ${n.hardwareConcurrency ?? "?"}${n.deviceMemory ? `   RAM ≈ ${n.deviceMemory} GB` : ""}
${B("Touch       ", "Táctil      ")} : ${n.maxTouchPoints > 0 ? "yes" : "no"}   Do-Not-Track: ${esc(n.doNotTrack ?? "?")}`);
  }
  async function traceroute(args) {
    const h = host(args[0]) || HOST;
    pre(`traceroute to ${esc(h)}, 30 hops max`);
    const hops = ["gateway.local (192.168.1.1)", "isp-edge.bcn (10.0.0.1)", "coffee-machine.lan (10.13.37.1)", "ix.barcelona (185.1.48.1)", "ghidra-backbone.net (198.51.100.7)", h];
    for (let i = 0; i < hops.length; i++) { await sleep(GM.reduce ? 0 : 250); pre(`${String(i + 1).padStart(2)}  ${esc(hops[i]).padEnd(40)} ${(4 + i * 6 + Math.random() * 4).toFixed(3)} ms`); }
    print(`<span class="dim">${B("# simulated — browsers can't send raw packets", "# simulado — los navegadores no pueden enviar paquetes en bruto")}</span>`);
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
<span class="dim">${B("# simulated — no real scan is performed", "# simulado — no se escanea nada de verdad")}</span>`);
  }

  // random pools for ps / nmap / netstat
  const PS_LAB = ["nc -lvnp 4444            # honeypot", "keylogger_poc.exe        # TFM 2019, sandboxed", "mimikatz.exe             # quarantined",
    "rev_shell.py             # lab only", "wannacry.exe             # defanged sample", "john --wordlist=rockyou.txt", "hashcat -m 1400 hashes.txt", "msfconsole -q"];
  const NMAP_PORTS = [[21, "ftp"], [22, "ssh"], [23, "telnet"], [25, "smtp"], [53, "domain"], [110, "pop3"], [139, "netbios-ssn"], [445, "microsoft-ds"],
    [1337, "waste"], [3306, "mysql"], [3389, "ms-wbt-server"], [5432, "postgresql"], [5900, "vnc"], [6379, "redis"], [6667, "irc"], [8080, "http-proxy"], [27017, "mongodb"], [31337, "elite"]];
  const NETSTAT_SITES = ["gchq.github.io", "ghidra-sre.org", "virustotal.com", "shodan.io", "exploit-db.com", "hackthebox.com", "tryhackme.com", "x64dbg.com"];

  const SHOUT = [
    ["NO NEED TO SHOUT. This is Linux, not MS-DOS: commands are lowercase.", "NO HACE FALTA GRITAR. Esto es Linux, no MS-DOS: los comandos van en minúsculas."],
    ["Caps Lock detected. The kernel has feelings, you know.", "Bloq Mayús detectado. El kernel también tiene sentimientos, ¿sabes?"],
    ["Command not found. Case-sensitive since 1991, deal with it.", "Comando no encontrado. Distingo mayúsculas desde 1991, asúmelo."],
    ["Who taught you to type? Your fax machine?", "¿Quién te enseñó a escribir? ¿Tu fax?"],
    ["Ugh. Lowercase, please. I'm old and my ears hurt.", "Uf. En minúsculas, por favor. Soy mayor y me duelen los oídos."],
  ];

  // ---------- commands ----------
  const HELP = [
    ["help", "this help", "esta ayuda"],
    ["whoami · id", "who am I", "quién soy"],
    ["ls [-a] [dir] · cd · pwd", "list files, change directory", "listar ficheros, cambiar de directorio"],
    ["cat <file>", "show a file (try 'cat avatar.txt')", "mostrar un fichero (prueba 'cat avatar.txt')"],
    ["open <x|linkedin|github|medium|email>", "open a contact", "abrir un contacto"],
    ["neofetch · fingerprint", "system info · what your browser reveals", "info del sistema · lo que revela tu navegador"],
    ["myip · ping · dig · ifconfig", "network tools (real queries)", "herramientas de red (consultas reales)"],
    ["traceroute · nmap · netstat", "network tools (simulated)", "herramientas de red (simuladas)"],
    ["mem · df · dh · du · ds", "memory, disks, disk health, usage, stack dump", "memoria, discos, salud del disco, uso, volcado de pila"],
    ["ps · uptime · uname · date", "processes and system", "procesos y sistema"],
    ["su · sudo su", "become root (password required)", "hacerse root (requiere contraseña)"],
    ["history · clear · echo", "shell utilities", "utilidades de la shell"],
    ["lang <en|es> · theme [light|dark]", "language and colours", "idioma y colores"],
    ["classic · exit", "classic view (everything at once)", "vista clásica (todo de golpe)"],
    ["reboot · shutdown", "restart the system (the shell starts from scratch)", "reiniciar el sistema (la shell empieza de cero)"],
  ];
  const CMDS = {
    help: () => print(`<div class="help">${HELP.map(([c, en, es_]) => {
      const name = c.split(/[ ·]/)[0];
      return `<span>${run(name)}${esc(c.slice(name.length))}</span><span class="dim">${B(en, es_)}</span>`;
    }).join("")}</div>`),
    whoami: () => user === "root" ? print("root") : print(`<strong>Gabriel Martí</strong> <span class="dim">(@gabimarti)</span>\n${html("#c-role")}`),
    id: () => pre(user === "root" ? "uid=0(root) gid=0(root) groups=0(root)" : "uid=1337(gabimarti) gid=31337(reversers) groups=31337(reversers),80(web),73(hamradio)"),
    pwd: () => print(esc(cwd)),
    ls: args => {
      const all = args.some(a => /^-\w*a/.test(a)), arg = args.find(a => !a.startsWith("-")), p = resolve(arg);
      if (denied(p)) return err(`ls: ${B("cannot open directory", "no se puede abrir el directorio")} '${esc(arg || p)}': ${B("Permission denied", "Permiso denegado")}`);
      if (isFile(p)) return print(esc(p.split("/").pop()));
      if (!isDir(p)) return err(`ls: ${B("cannot access", "no se puede acceder a")} '${esc(arg)}': ${B("No such file or directory", "No existe el fichero o directorio")}`);
      if (p === HOME + "/contact") return print(html("#c-contact"));
      if (p === HOME + "/skills") return print(html("#c-skills") + `\n<span class="dim">+ </span>${item("hint.txt", p)}`);
      const names = p === "/bin" ? Object.keys(CMDS).sort() : D[p].filter(n => all || !n.startsWith("."));
      print([...(all ? [".", ".."] : []), ...names.map(n => p === "/bin" ? run(n) : item(n, p))].join("  ") || " ");
    },
    cd: args => {
      const p = resolve(args[0] || (user === "root" ? "/root" : HOME));
      if (denied(p)) return err(`cd: ${esc(args[0])}: ${B("Permission denied", "Permiso denegado")}`);
      if (isDir(p)) { cwd = p; setPrompt(); return; }
      err(`cd: ${esc(args[0])}: ${isFile(p) ? B("Not a directory", "No es un directorio") : B("No such file or directory", "No existe el fichero o directorio")}`);
    },
    cat: async args => {
      if (!args.length) return err(B("usage: cat <file>   (try 'ls')", "uso: cat <fichero>   (prueba 'ls')"));
      for (const a of args) {
        const p = resolve(a);
        if (denied(p)) err(`cat: ${esc(a)}: ${B("Permission denied", "Permiso denegado")}`);
        else if (isFile(p)) { try { const h = await F[p](); PRE_FILES.has(p) ? pre(h) : print(h); } catch (e) { err(`cat: ${esc(a)}: ${B("I/O error (offline?)", "error de E/S (¿sin conexión?)")}`); } }
        else if (isDir(p)) err(`cat: ${esc(a)}: ${B("Is a directory", "Es un directorio")}`);
        else err(`cat: ${esc(a)}: ${B("No such file or directory", "No existe el fichero o directorio")}`);
      }
    },
    open: args => {
      const k = ({ twitter: "x", mail: "email" })[(args[0] || "").toLowerCase()] || (args[0] || "").toLowerCase(), i = CONTACTS.indexOf(k);
      if (i < 0) return err(B("usage: open <x|linkedin|github|medium|email>", "uso: open <x|linkedin|github|medium|email>"));
      print(B("Opening ", "Abriendo ") + html(`#c-contact li:nth-child(${i + 1}) a`) + " …");
      window.open($(`#c-contact li:nth-child(${i + 1}) a`).href, "_blank", "noopener");
    },
    neofetch: () => {
      const logo = [" ██████  ███    ███", "██       ████  ████", "██   ███ ██ ████ ██", "██    ██ ██  ██  ██", " ██████  ██      ██"];
      const info = [
        `<strong>${user}</strong>@<strong>${HOST}</strong>`, "--------------------",
        `<span class="dim">OS:</span> GMOS 1.0.59 (reverse-engineered)`,
        `<span class="dim">Host:</span> ${HOST}`,
        `<span class="dim">Kernel:</span> 6.6.6-curiosity`,
        `<span class="dim">Uptime:</span> ${B("35+ years in IT", "más de 35 años en informática")}`,
        `<span class="dim">Shell:</span> gmsh 0.5`,
        `<span class="dim">${B("Languages", "Lenguajes")}:</span> Python, C, Delphi, ASM`,
        `<span class="dim">${B("Tools", "Herramientas")}:</span> Ghidra, Burp Suite, Wazuh`,
        `<span class="dim">CPU:</span> ${B("human brain @ coffee GHz", "cerebro humano @ café GHz")}`,
      ];
      pre(info.map((l, i) => `<span class="ok">${esc((logo[i] || "").padEnd(22))}</span>${l}`).join("\n"));
    },
    fingerprint, myip, ping, dig, ifconfig, traceroute, nmap,
    netstat: () => pre(`Proto Local Address          Foreign Address        State
tcp   10.13.37.42:51337      github.com:443         ESTABLISHED
tcp   10.13.37.42:51338      medium.com:443         ESTABLISHED
${pickN(NETSTAT_SITES, 1 + rnd(2)).map(h => `tcp   10.13.37.42:${50000 + rnd(15000)}      ${(h + ":443").padEnd(23)}${["ESTABLISHED", "TIME_WAIT", "SYN_SENT"][rnd(3)]}`).join("\n")}
tcp   127.0.0.1:31337        0.0.0.0:*              LISTEN
<span class="dim">${B("# simulated", "# simulado")}</span>`),
    mem: () => pre(`              total        used        free
Mem:           640K        637K          3K
Swap:            0B          0B          0B
<span class="dim">${B("# 640K ought to be enough for anybody.", "# 640K deberían bastar para cualquiera.")}</span>`),
    df: () => pre(`Filesystem      Size   Used  Avail Use% Mounted on
/dev/brain      100T    97T     3T  97% /
/dev/coffee     500M   499M     1M  99% /var/caffeine
/dev/ghidra      64G    42G    22G  66% /opt/reversing
/dev/hacking    1337G  1336G     1G  99% /opt/redteam
tmpfs            16K     1K    15K   7% /tmp/ideas`),
    dh: () => pre(`${B("SMART health check", "Comprobación SMART")}: <strong>PASSED</strong>
  ${B("Reallocated sectors", "Sectores reasignados")}:   0
  ${B("Pending ideas", "Ideas pendientes")}:         42
  ${B("Power-on hours", "Horas encendido")}:        306600 (~35 ${B("years", "años")})
  ${B("Temperature", "Temperatura")}:           36.6 °C`),
    du: () => pre(`4.0K\tabout.txt\n4.0K\tsummary.txt\n4.0K\tinterests.txt\n4.0K\tarticles.txt\n12K\tavatar.txt\n4.0K\thint.txt\n32K\tskills/\n20K\tcontact/\n<strong>84K\ttotal</strong>`),
    ds: () => {
      const bytes = [...new TextEncoder().encode("gabimarti :: reverser :: developer :: always learning\0\x13\x37\xde\xad\xbe\xef")]; let t = "";
      for (let i = 0; i < bytes.length; i += 16) {
        const row = bytes.slice(i, i + 16);
        t += (0x7ffde4a0 + i).toString(16).padStart(12, "0") + "  " + row.map(b => b.toString(16).padStart(2, "0")).join(" ").padEnd(47)
          + "  |" + row.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("") + "|\n";
      }
      pre(`<span class="dim">${B("stack dump @ rsp", "volcado de pila @ rsp")}</span>\n` + esc(t.trimEnd()));
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
    uptime: () => pre(`${new Date().toTimeString().slice(0, 8)} up 35+ ${B("years", "años")}, ${Math.round((Date.now() - t0) / 1000)}s ${B("on this page", "en esta página")}, 1 user, load average: 0.42, 0.13, 0.37`),
    uname: args => pre(args.includes("-a") ? `GMOS ${HOST} 6.6.6-curiosity #1 SMP x86_64 GNU/Linux` : "GMOS"),
    date: () => print(esc(new Date().toString())),
    hostname: () => print(HOST),
    echo: args => print(esc(args.join(" "))),
    history: () => pre(hist.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join("\n")),
    clear: () => { out.innerHTML = ""; },
    su: () => su(),
    sudo: args => {
      if (["su", "-i", "-s"].includes(args[0])) return su();
      if (user === "root" && args.length) return exec(args.join(" "), true);
      err(B("gabimarti is not in the sudoers file. This incident will be reported. 😉  (hint: 'sudo su')", "gabimarti no está en el fichero sudoers. Se informará de este incidente. 😉  (pista: 'sudo su')"));
    },
    rm: () => err(user === "root" ? B("rm: nope. Not even as root. 🙂", "rm: no. Ni siquiera como root. 🙂") : B("rm: permission denied — nice try.", "rm: permiso denegado — buen intento.")),
    lang: args => { if (!["en", "es"].includes(args[0])) return err(B("usage: lang <en|es>", "uso: lang <en|es>")); GM.setLang(args[0], true); },
    theme: args => {
      if (args[0] && !["light", "dark"].includes(args[0])) return err(B("usage: theme [light|dark]", "uso: theme [light|dark]"));
      args[0] ? GM.setTheme(args[0]) : GM.toggleTheme();
      print(`theme: ${GM.isLight() ? "light" : "dark"}`);
    },
    classic: () => GM.setMode("classic"),
    exit: () => {
      if (user === "root") { user = "gabimarti"; cwd = HOME; setPrompt(); return print("logout"); }
      GM.setMode("classic");
    },
    reboot: async () => {
      pre(B("Broadcast message: the system is going down for reboot NOW!", "Mensaje global: ¡el sistema se reinicia AHORA!"));
      await sleep(GM.reduce ? 0 : 900); reset(); GM.showBoot();
    },
    shutdown: async () => {
      pre(B("Broadcast message: the system is going down for poweroff NOW!", "Mensaje global: ¡el sistema se apaga AHORA!"));
      await sleep(GM.reduce ? 0 : 900); reset();
      GM.halt(B("System halted.<br>It's now safe to turn off your computer.<br><br><small>press any key to boot</small>",
        "Sistema detenido.<br>Ya puede apagar el ordenador con seguridad.<br><br><small>pulsa una tecla para arrancar</small>"));
    },
    man: args => { const h = HELP.find(([c]) => c.split(/ · | /).includes(args[0])); h ? print(`${esc(h[0])}  ${B(h[1], h[2])}`) : err(B(`No manual entry for ${esc(args[0] || "")}`, `No hay entrada de manual para ${esc(args[0] || "")}`)); },
    curl: args => /^(https?:\/\/)?(ifconfig\.me|icanhazip\.com|ipinfo\.io)\/?$/.test(args.find(a => !a.startsWith("-")) || "") ? myip()
      : err(B("curl: (1) sandboxed — only 'curl ifconfig.me' works here", "curl: (1) entorno limitado — aquí solo funciona 'curl ifconfig.me'")),
  };
  Object.assign(CMDS, {
    free: CMDS.mem, top: CMDS.ps, ll: () => CMDS.ls(["-la"]), hint: () => CMDS.cat(["~/hint.txt"]), contact: () => CMDS.ls(["~/contact"]),
    ip: CMDS.ifconfig, nslookup: CMDS.dig, logout: CMDS.exit, quit: CMDS.exit, poweroff: CMDS.shutdown, halt: CMDS.shutdown,
  });
  Object.assign(CMDS, {
  });

  async function exec(line, silent = false) {
    if (!silent) print(`${promptHtml()} ${esc(line)}`, "echo");
    const [cmd, ...args] = line.trim().split(/\s+/);
    if (!cmd) return;
    if (!silent) { hist.push(line.trim()); hpos = hist.length; }
    const f = Object.hasOwn(CMDS, cmd) && CMDS[cmd], lower = cmd.toLowerCase();
    if (f) await f(args);
    else if (cmd !== lower && Object.hasOwn(CMDS, lower)) {    // Linux is case-sensitive, and grumpy about it
      const [en, es_] = SHOUT[rnd(SHOUT.length)];
      err(`gmsh: ${esc(cmd)}: ${B(en, es_)} ${B(`Try '${esc(lower)}'.`, `Prueba '${esc(lower)}'.`)}`);
    }
    else err(`gmsh: ${B("command not found", "comando no encontrado")}: ${esc(cmd)} — ${B("type 'help'", "escribe 'help'")}`);
  }

  function reset() {                       // reboot/shutdown: next time the shell starts like a fresh system
    user = "gabimarti"; cwd = HOME; cv = null; hist.length = 0; hpos = 0; started = false;
    if (pending) endPassword();
    out.innerHTML = ""; input.value = ""; setPrompt();
  }

  // ---------- input ----------
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const v = input.value; input.value = ""; GM.sfx.key();
    if (pending) { const cb = pending; print(esc(promptEl.textContent), "echo"); endPassword(); await cb(v); return; }
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

  GM.shell = {
    open() {
      if (!started) {
        started = true; setPrompt();
        type(print(""), es()
          ? "gmsh 0.5 — gabimarti.github.io\nEscribe 'help' para ver los comandos, o empieza por 'cat hint.txt'.\n"
          : "gmsh 0.5 — gabimarti.github.io\nType 'help' for the list of commands, or start with 'cat hint.txt'.\n", 10);
      }
      input.focus({ preventScroll: true });
    },
  };
})();
