// gabimarti.github.io — language, theme, boot menu and modes. The shell (shell.js) is loaded on demand.
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
  function setTheme(t) { root.dataset.theme = t; store("theme", t); themeIcon(); }
  const toggleTheme = () => setTheme(isLight() ? "dark" : "light");

  // ---------- typewriter ----------
  let skip = false, typing = false;
  async function type(el, text, ms = 16) {
    for (let i = 0; i < text.length; i++) {
      if (skip || reduce) { el.append(text.slice(i)); return; }
      el.append(text[i]);
      await sleep(text[i] === "\n" ? ms * 8 : text[i] === "." ? ms * 3 : ms);
    }
  }
  // counter from..to (step) shown in a span, e.g. memory test or loading %
  async function count(el, from, to, step, fmt, ms) {
    const span = document.createElement("span"); el.append(span);
    for (let v = from; v <= to; v += step) {
      span.textContent = fmt(v);
      if (skip || reduce) { span.textContent = fmt(to); return; }
      await sleep(ms);
    }
  }

  // ---------- boot menu ----------
  let boot, bootOut, bootOpts, shellEl;
  const T = {
    en: { mem: "Memory test ......... ", load: "Loading profile ..... ", hello: "Hello, I'm Gabriel Martí — cybersecurity consultant, reverser & developer.\nHow would you like to explore this site?" },
    es: { mem: "Test de memoria ..... ", load: "Cargando perfil ..... ", hello: "Hola, soy Gabriel Martí — consultor de ciberseguridad, reverser y desarrollador.\n¿Cómo quieres explorar este sitio?" },
  };
  const OK = () => { const s = document.createElement("span"); s.className = "ok"; s.textContent = "[✓]"; return s; };
  let bootRun = 0;
  async function bootSeq(run) {
    const t = T[root.lang] || T.en, alive = () => run === bootRun;
    bootOut.textContent = "";
    await type(bootOut, "GM-80 ROM BIOS v1.0    (C) 1986-2026 gabimarti\n"); if (!alive()) return;
    await type(bootOut, t.mem); if (!alive()) return;
    await count(bootOut, 8, 640, 8, v => String(v).padStart(3) + "K", 14); if (!alive()) return;
    bootOut.append(" OK\n");
    await type(bootOut, t.load); if (!alive()) return;
    await count(bootOut, 0, 100, 2, v => String(v).padStart(3) + "%", 18); if (!alive()) return;
    bootOut.append(" ", OK(), "\n\n");
    await type(bootOut, t.hello);
  }
  async function showBoot() {
    const run = ++bootRun;
    root.classList.remove("mode-classic", "mode-shell");
    shellEl.hidden = true; boot.hidden = false; bootOpts.hidden = true;
    skip = false; typing = true; setUrl(null);
    await bootSeq(run);
    if (run !== bootRun) return;
    typing = false; bootOpts.hidden = false;
    bootOpts.querySelector("button").focus({ preventScroll: true });
  }
  async function redrawBoot() {          // finished boot text in the new language
    if (!boot || boot.hidden || bootOut.querySelector(".halt")) return;
    const run = ++bootRun; skip = true; typing = true;
    await bootSeq(run);
    if (run === bootRun) { typing = false; bootOpts.hidden = false; }
  }

  function setUrl(mode) {
    const u = new URL(location.href);
    mode ? u.searchParams.set("mode", mode) : u.searchParams.delete("mode");
    if (!mode) u.hash = "";
    history.replaceState(null, "", u);
  }

  // ---------- modes ----------
  let shellReady = null;
  const loadShell = () => shellReady ||= new Promise((ok, ko) => {
    const s = document.createElement("script"); s.src = "shell.js"; s.onload = ok; s.onerror = ko; document.head.append(s);
  });
  async function setMode(mode) {
    bootRun++; skip = true; typing = false; boot.hidden = true;
    root.classList.remove("mode-classic", "mode-shell");
    root.classList.add("mode-" + mode);
    if (!location.hash) setUrl(mode);
    $("main").scrollTop = 0;
    if (mode === "shell") {
      shellEl.hidden = false;
      try { await loadShell(); skip = false; api.shell.open(); }
      catch (e) { $("#sh-out").textContent = "shell.js failed to load — try the classic view."; }
    } else shellEl.hidden = true;
  }
  // "shutdown": message until a key/click, then boot again
  async function halt(msg) {
    bootRun++; root.classList.remove("mode-classic", "mode-shell");
    shellEl.hidden = true; boot.hidden = false; bootOpts.hidden = true;
    bootOut.innerHTML = `<div class="halt">${msg}</div>`;
    typing = false; await sleep(400);
    const again = () => { removeEventListener("keydown", again); removeEventListener("click", again); showBoot(); };
    addEventListener("keydown", again); addEventListener("click", again);
  }

  const api = { $, B, esc, sleep, reduce, type, setLang, toggleTheme, setTheme, isLight, setMode, showBoot, halt, shell: null };

  // ---------- start ----------
  document.addEventListener("DOMContentLoaded", () => {
    boot = $("#boot"); bootOut = $("#boot-out"); bootOpts = $("#boot-opts"); shellEl = $("#shell");
    setLang(pick(new URLSearchParams(location.search).get("lang")) || pick(load("lang")) || pick(navigator.language.slice(0, 2)) || "en", false);
    document.querySelectorAll("[data-set-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.setLang, true)));
    document.addEventListener("langchange", redrawBoot);
    $(".theme").addEventListener("click", toggleTheme); themeIcon();

    document.addEventListener("click", e => {
      const m = e.target.closest("[data-mode]");
      if (m) { e.preventDefault(); setMode(m.dataset.mode); return; }
      if (!boot.hidden && typing) skip = true;
    });
    document.addEventListener("keydown", e => {
      if (boot.hidden || bootOut.querySelector(".halt")) return;
      if (typing) { skip = true; return; }
      if (e.key === "1") setMode("classic");
      if (e.key === "2") setMode("shell");
    });

    const mode = new URLSearchParams(location.search).get("mode");
    if (location.hash === "#avatar" || mode === "classic") setMode("classic");
    else if (mode === "shell") setMode("shell");
    else showBoot();
  });
  return api;
})();
