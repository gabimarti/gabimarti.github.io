// gabimarti.github.io — language, theme, sound, 90s BIOS boot and modes. The shell (shell.js) is loaded on demand.
"use strict";
const GM = (() => {
  const $ = s => document.querySelector(s), root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const B = (en, es = en) => `<span lang="en">${en}</span><span lang="es">${es}</span>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  const load = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  // ---------- language: ?lang= > saved > browser > en ----------
  const LANGS = ["en", "es"], pick = l => LANGS.includes(l) ? l : null;
  function setLang(l, save) {
    root.lang = l;
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.setLang === l));
    if (save) store("lang", l);
    document.dispatchEvent(new Event("langchange"));
  }

  // ---------- theme: saved override, otherwise system preference ----------
  const isLight = () => (root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")) === "light";
  const themeIcon = () => { const b = $(".theme"); if (b) b.textContent = isLight() ? "☾" : "☀"; };
  function setTheme(t) { if (t !== "light" && t !== "dark") return; root.dataset.theme = t; store("theme", t); themeIcon(); }
  const toggleTheme = () => setTheme(isLight() ? "dark" : "light");

  // ---------- sound: synthesized with Web Audio (no files). Browsers only allow it after a key/click. ----------
  const sfx = (() => {
    let ctx = null, fan = null, noiseBuf = null, on = load("sound") !== "off";
    const ready = () => on && ctx && ctx.state === "running";
    function unlock() {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C || !on) return;
      if (!ctx) ctx = new C();
      if (ctx.state === "suspended") ctx.resume();
    }
    function tone(freq, dur, type = "square", vol = .05, at = 0) {
      if (!ready()) return;
      const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + .02);
    }
    function brown() {                                     // brown noise: fan rumble
      if (noiseBuf) return noiseBuf;
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); let last = 0;
      for (let i = 0; i < d.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
      return noiseBuf;
    }
    function noise(dur, vol, freq, at = 0) {
      if (!ready()) return;
      const t = ctx.currentTime + at, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = brown(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 2;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      s.connect(f).connect(g).connect(ctx.destination); s.start(t, Math.random()); s.stop(t + dur + .02);
    }
    function fanStart() {
      if (!ready() || fan) return;
      const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      const hum = ctx.createOscillator(), hg = ctx.createGain();
      s.buffer = brown(); s.loop = true; f.type = "lowpass"; f.frequency.value = 450;
      hum.type = "sine"; hum.frequency.value = 118; hg.gain.value = .015;
      g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(.1, t + 1.5);
      s.connect(f).connect(g).connect(ctx.destination); hum.connect(hg).connect(g);
      s.start(); hum.start(); fan = { s, g, hum };
    }
    function fanStop(fade = 2) {
      if (!fan) return;
      const { s, g, hum } = fan, t = ctx.currentTime; fan = null;
      g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, 1e-4), t);
      g.gain.exponentialRampToValueAtTime(1e-4, t + fade); s.stop(t + fade + .1); hum.stop(t + fade + .1);
    }
    return {
      unlock, fanStart, fanStop,
      get on() { return on; },
      toggle() { on = !on; store("sound", on ? "on" : "off"); on ? unlock() : fanStop(.2); return on; },
      post: () => tone(1000, .25, "square", .06),                                // the classic single POST beep
      tick: () => tone(2100, .01, "square", .015),                               // memory counter
      ok: () => { tone(988, .06, "square", .035); tone(1319, .08, "square", .035, .07); },
      blip: () => tone(660, .06, "triangle", .07),                               // screen change
      key: () => tone(1400, .02, "square", .025),                                // command entered
      err: () => tone(170, .14, "sawtooth", .035),
    };
  })();
  const soundIcon = () => { const b = $(".snd"); if (b) { b.textContent = sfx.on ? "🔊" : "🔇"; b.setAttribute("aria-pressed", sfx.on); } };

  // ---------- typewriter + counters ----------
  let skip = false, typing = false;
  const fast = () => skip;              // boot always animates, even with reduced motion (user choice)
  async function type(el, text, ms = 16) {
    for (let i = 0; i < text.length; i++) {
      if (fast()) { el.append(text.slice(i)); return; }
      el.append(text[i]);
      await sleep(text[i] === "\n" ? ms * 8 : text[i] === "." ? ms * 3 : ms);
    }
  }
  async function count(el, from, to, step, fmt, ms, onStep) {
    const span = document.createElement("span"); el.append(span);
    for (let v = from; v <= to; v += step) {
      span.textContent = fmt(v);
      if (fast()) { span.textContent = fmt(to); return; }
      onStep?.(); await sleep(ms);
    }
  }

  // ---------- 90s BIOS boot (POST screen, then system summary, then the mode menu) ----------
  let boot, bootOut, bootOpts, shellEl;
  const T = {
    en: { load: "Loading profile .......... ", hello: "Hello, I'm Gabriel Martí — cybersecurity consultant, reverser & developer.\nHow would you like to explore this site?" },
    es: { load: "Cargando perfil .......... ", hello: "Hola, soy Gabriel Martí — consultor de ciberseguridad, reverser y desarrollador.\n¿Cómo quieres explorar este sitio?" },
  };
  const CPU = "Curiosity(TM) 486DX2-66MHz";
  const DRIVES = [["Primary Master", "GM-HDD 1986MB"], ["Primary Slave", "None"], ["Secondary Master", "CD-ROM 52X"], ["Secondary Slave", "ZIP 100"]];
  const narrow = matchMedia("(max-width: 640px)");
  // Frame drawn with CSS borders, not box-drawing characters: some fonts (e.g. Android's monospace) lack them.
  function summaryBox() {
    const div = (cls, text) => { const d = document.createElement("div"); d.className = cls; if (text) d.textContent = text; return d; };
    const sec = (...cols) => { const s = div("sec"); s.append(...cols.map(c => div("col", c.join("\n")))); return s; };
    const box = div("sysbox");
    box.append(div("ttl", "System Configurations"));
    if (narrow.matches) box.append(       // phones: one column, so lines never wrap
      sec(["CPU Type     : 486DX2", "Co-Processor : Curiosity", "CPU Clock    : 66MHz", "Base Memory  : 640K", "Ext. Memory  : 64512K", "Cache Memory : 256K"]),
      sec(["Diskette A   : 1.44M, 3.5in", "Pri. Master  : GM-HDD 1986MB", "Sec. Master  : CD-ROM 52X", "Sec. Slave   : ZIP 100", "Display Type : VGA/EGA", "Profile      : gabimarti"]));
    else box.append(
      sec(["CPU Type     : 486DX2", "Co-Processor : Curiosity", "CPU Clock    : 66MHz"],
          ["Base Memory     :   640K", "Extended Memory : 64512K", "Cache Memory    :   256K"]),
      sec(["Diskette A   : 1.44M, 3.5in", "Pri. Master  : GM-HDD 1986MB", "Sec. Master  : CD-ROM 52X", "Sec. Slave   : ZIP 100"],
          ["Display Type    : VGA/EGA", "Serial Port(s) : 3F8 2F8", "Parallel Port  : 378", "Profile        : gabimarti"]));
    return box;
  }
  const OK = () => { const s = document.createElement("span"); s.className = "ok"; s.textContent = "[✓]"; return s; };
  let bootRun = 0;
  async function bootSeq(run) {
    const t = T[root.lang] || T.en, alive = () => run === bootRun, snd = f => { if (!fast()) f(); };
    const say = async (txt, ms = 90) => { bootOut.append(txt); if (!fast()) await sleep(ms); return alive(); };
    bootOut.textContent = "";
    snd(sfx.fanStart); snd(sfx.post);
    if (!await say("GM Modular BIOS v4.51GM, An Energy Star Ally\nCopyright (C) 1986-2026, gabimarti\n\n", 500)) return;
    if (!await say("GM-80 ROM BIOS v1.0 — Profile Edition\n\n", 300)) return;
    if (!await say(`Main Processor : ${CPU}\nMemory Testing : `, 300)) return;
    await count(bootOut, 512, 65536, 512, v => String(v).padStart(6) + "K", 30, sfx.tick);   // ~4 s, like a 486 with 64 MB if (!alive()) return;
    bootOut.append(" OK\n\n"); snd(sfx.ok);
    if (!await say("GM Plug and Play BIOS Extension v1.0A\nInitialize Plug and Play Cards...\nPNP Init Completed\n\n", 400)) return;
    for (const [slot, dev] of DRIVES) {
      snd(sfx.tick);
      if (!await say(`Detecting ${slot.padEnd(16)} ... `, dev === "None" ? 300 : 700)) return;
      bootOut.append(dev + "\n");
    }
    if (!await say("\n" + t.load, 0)) return;
    await count(bootOut, 0, 100, 2, v => String(v).padStart(3) + "%", 18); if (!alive()) return;
    bootOut.append(" ", OK(), "\n\n"); snd(sfx.ok);
    if (!await say("Press DEL to enter SETUP", 3500)) return;
    // ---- screen 2: system summary ----
    bootOut.textContent = ""; snd(sfx.blip);
    bootOut.append(summaryBox());
    if (!await say("\n\n", 700)) return;
    if (!await say("Verifying DMI Pool Data ...... ", 500)) return;
    if (!await say("Update Success\nBoot from GM-HDD .............. ", 400)) return;
    bootOut.append(OK()); snd(sfx.ok); snd(() => sfx.fanStop(3));
    if (!await say("", 900)) return;
    // ---- screen 3: GRUB menu, greeting typed below the box ----
    bootOut.textContent = ""; snd(sfx.blip);
    bootOpts.hidden = false; select(grubSel); $("#grub-help").hidden = true;
    const hello = $("#grub-hello"); hello.textContent = "";
    await type(hello, t.hello); if (!alive()) return;
    $("#grub-help").hidden = false;
  }
  // GRUB: entries without data-mode are shown but not bootable yet. Any key or tap stops the countdown.
  const entries = () => [...bootOpts.querySelectorAll(".grub button")];
  let grubSel = 0, grubLeft = 0;
  function select(i) {
    const e = entries(); grubSel = (i + e.length) % e.length;
    e.forEach((b, j) => b.classList.toggle("sel", j === grubSel));
    e[grubSel].focus({ preventScroll: true });
  }
  function grubTimer(run) {
    const el = $("#grub-timer");
    const tick = () => {
      if (run !== bootRun || !grubLeft) { el.textContent = ""; return; }
      el.innerHTML = B(`The highlighted entry will be executed automatically in ${grubLeft}s.`, `La entrada resaltada se ejecutará automáticamente en ${grubLeft}s.`);
      setTimeout(() => { if (run === bootRun && grubLeft && !--grubLeft) entries()[grubSel].click(); else tick(); }, 1000);
    };
    tick();
  }
  async function showBoot() {
    const run = ++bootRun;
    root.classList.remove("mode-classic", "mode-shell");
    shellEl.hidden = true; boot.hidden = false; bootOpts.hidden = true;
    skip = false; typing = true; setUrl(null); grubSel = 0; grubLeft = 10;
    await bootSeq(run);
    if (run !== bootRun) return;
    typing = false; grubTimer(run);
  }
  async function redrawBoot() {          // finished boot screen in the new language
    if (!boot || boot.hidden || bootOut.querySelector(".halt")) return;
    const run = ++bootRun; skip = true; typing = true;
    await bootSeq(run);
    if (run === bootRun) { typing = false; grubTimer(run); }
  }
  // wait for a key or click (ignoring the title bar buttons); the event doesn't reach other handlers
  const waitKey = () => new Promise(res => {
    const h = e => {
      if (e.type === "click" ? e.target.closest(".bar") : (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab")) return;
      e.stopPropagation(); e.preventDefault();
      removeEventListener("keydown", h, true); removeEventListener("click", h, true); res();
    };
    setTimeout(() => { addEventListener("keydown", h, true); addEventListener("click", h, true); });
  });
  async function screen(msg) {           // full-window message (power on / halted), then boot
    bootRun++; root.classList.remove("mode-classic", "mode-shell");
    shellEl.hidden = true; boot.hidden = false; bootOpts.hidden = true; typing = false; setUrl(null);
    bootOut.innerHTML = `<div class="halt"><div>${msg}</div></div>`;
    await waitKey(); sfx.unlock(); showBoot();
  }
  const powerOn = () => screen(`<svg class="pwr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/></svg><br><br>${B("Press any key or click to power on", "Pulsa una tecla o haz clic para encender")}<br><br><small class="dim">${B("this site makes retro sounds · 🔊 to mute", "este sitio hace sonidos retro · 🔊 para silenciar")}</small>`);
  const halt = msg => { sfx.fanStop(.5); return screen(msg); };

  function setUrl(mode) {
    const u = new URL(location.href);
    mode ? u.searchParams.set("mode", mode) : u.searchParams.delete("mode");
    if (!mode) u.hash = "";
    history.replaceState(null, "", u);
  }

  // ---------- modes ----------
  let shellReady = null;
  const loadShell = () => shellReady ||= new Promise((ok, ko) => {
    const s = document.createElement("script"); s.src = "shell.js?v=0.10"; s.onload = ok; s.onerror = ko; document.head.append(s);
  });
  async function setMode(mode) {
    bootRun++; skip = true; typing = false; boot.hidden = true;
    sfx.fanStop(.6); sfx.blip();
    root.classList.remove("mode-classic", "mode-shell");
    root.classList.add("mode-" + mode);
    if (!location.hash) setUrl(mode);
    $("main").scrollTop = 0;
    if (mode === "shell") {
      shellEl.hidden = false;
      try { await loadShell(); skip = false; api.shell.open(); }
      catch (e) { $("#sh-out").textContent = "shell.js failed to load — try the quick view."; }
    } else shellEl.hidden = true;
  }

  const api = { $, B, esc, sleep, reduce, type, sfx, setLang, toggleTheme, setTheme, isLight, setMode, showBoot, halt, shell: null };

  // ---------- start ----------
  document.addEventListener("DOMContentLoaded", () => {
    boot = $("#boot"); bootOut = $("#boot-out"); bootOpts = $("#boot-opts"); shellEl = $("#shell");
    setLang(pick(new URLSearchParams(location.search).get("lang")) || pick(load("lang")) || pick(navigator.language.slice(0, 2)) || "en", false);
    document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.setLang, true)));
    document.addEventListener("langchange", redrawBoot);
    narrow.addEventListener("change", redrawBoot);   // phone rotated -> redraw the summary box
    $(".theme").addEventListener("click", toggleTheme); themeIcon();
    $(".snd").addEventListener("click", () => { sfx.toggle(); soundIcon(); }); soundIcon();
    addEventListener("pointerdown", sfx.unlock); addEventListener("keydown", sfx.unlock);
    addEventListener("hashchange", sfx.blip);                 // classic view <-> avatar

    document.addEventListener("click", e => {
      const g = e.target.closest(".grub button");
      if (g) { grubLeft = 0; select(entries().indexOf(g)); }
      if (e.target.closest("[data-reboot]")) { e.preventDefault(); showBoot(); return; }
      const m = e.target.closest("[data-mode]");
      if (m) { e.preventDefault(); setMode(m.dataset.mode); return; }
      if (!boot.hidden && typing) skip = true;
    });
    document.addEventListener("keydown", e => {
      if (root.classList.contains("mode-classic") && e.key === "Enter" && !e.target.closest("a, button, input")) { showBoot(); return; }
      if (boot.hidden || bootOut.querySelector(".halt")) return;
      if (typing) { skip = true; return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      grubLeft = 0;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); select(grubSel + (e.key === "ArrowDown" ? 1 : -1)); }
      else if (e.key === "Enter") { e.preventDefault(); entries()[grubSel].click(); }
      else if (e.key >= "1" && e.key <= String(entries().length)) select(+e.key - 1);
    });

    const mode = new URLSearchParams(location.search).get("mode");
    if (location.hash === "#avatar" || mode === "classic") setMode("classic");
    else if (mode === "shell") setMode("shell");
    else powerOn();
  });
  return api;
})();
