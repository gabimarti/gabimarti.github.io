// memtest86+ simulation for gabimarti.github.io (GRUB entry "Memory test"). Loaded on demand by site.js.
// Runs the classic test list in a loop; now and then a (fake) bit flips, for realism. Esc or a tap on "(ESC)Reboot" reboots.
"use strict";
(() => {
  const { esc } = GM;
  const TESTS = [
    "Address test, walking ones", "Address test, own address", "Moving inversions, ones & zeros",
    "Moving inversions, 8 bit pattern", "Moving inversions, random pattern", "Block move, 64 moves",
    "Moving inversions, 32 bit pattern", "Random number sequence", "Modulo 20, ones & zeros", "Bit fade test, 90 min, 2 patterns",
  ];
  const STEPS = 30, MS = 100;                           // each test: 30 steps of 100 ms (3 s), so a pass takes 30 s
  const ERR_P = 1 / 1500;                               // chance of an error per step: ~1 every 2.5 min (~18% of passes)
  const hex = () => Math.floor(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
  const bar = pct => "#".repeat(Math.round(pct / 5));
  const clock = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  let el, live, done, timer, t0, test, step, pass, pattern, errs;
  function render() {
    const tp = Math.round(step / STEPS * 100), pp = Math.round((test * STEPS + step) / (TESTS.length * STEPS) * 100);
    const cell = (h, v) => `<div><span>${h}</span>${esc(v)}</div>`;
    live.innerHTML =
      `<div class="mt-top"><div><span class="mt-ttl">Memtest86+ v1.66</span>
Curiosity 486DX2 66MHz
L1 Cache:    8K    88MB/s
L2 Cache:  256K    44MB/s
Memory  :   64M    22MB/s</div><div>Pass ${String(pp).padStart(3)}% ${bar(pp)}
Test ${String(tp).padStart(3)}% ${bar(tp)}
Test #${test}  [${esc(TESTS[test])}]
Testing:  132K -   64M    64M
Pattern:   ${pattern}</div></div>` +
      `<div class="mt-stats">${cell("WallTime", clock(Math.floor((Date.now() - t0) / 1000)))}${cell("Cached", "64M")}${cell("RsvdMem", "0K")}${cell("MemMap", "e820-Std")}${cell("Cache", "on")}${cell("ECC", "off")}${cell("Test", "Std")}${cell("Pass", String(pass))}${cell("Errors", String(errs.length))}${cell("ECC Errs", "0")}</div>` +
      (errs.length ? `<pre class="mt-err">Tst  Pass   Failing Address          Good       Bad     Err-Bits  Count\n` +
        `---  ----  -----------------------  --------  --------  --------  -----\n${errs.slice(-6).join("\n")}</pre>` : "") +
      (pass && !errs.length ? `<p class="mt-msg">*****Pass complete, no errors, press Esc to exit*****</p>` : "");
  }
  function tick() {
    if (++step > STEPS) { step = 0; if (++test === TESTS.length) { test = 0; pass++; } }
    if (step % 5 === 0) pattern = hex();
    if (Math.random() < ERR_P) {                        // one flipped bit at a random address of the 64 MB
      const addr = Math.floor(Math.random() * 64 * 2 ** 20), good = parseInt(pattern, 16), bit = 2 ** Math.floor(Math.random() * 32);
      const bad = ((good ^ bit) >>> 0).toString(16).padStart(8, "0"), h = n => n.toString(16).padStart(8, "0");
      errs.push(`${String(test).padStart(3)}  ${String(pass).padStart(4)}  ${`${addr.toString(16).padStart(11, "0")} - ${(addr / 2 ** 20).toFixed(1).padStart(4)}MB`.padEnd(23)}  ${pattern}  ${bad}  ${h(bit)}  ${String(errs.length + 1).padStart(5)}`);
    }
    render();
  }
  function exit() {
    clearInterval(timer); document.removeEventListener("keydown", onKey, true); el.removeEventListener("click", onClick);
    done();
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return;
    e.preventDefault(); e.stopPropagation();
    if (e.key === "Escape") exit();
  }
  const onClick = e => { if (e.target.closest("[data-esc]")) exit(); };

  GM.memtest = {
    open(container) {
      el = document.createElement("div"); el.className = "mt"; container.append(el);   // static key line, so taps aren't lost on re-render
      el.innerHTML = `<div></div><p class="mt-keys"><button type="button" data-esc>(ESC)Reboot</button>  (c)configuration  (SP)scroll_lock  (CR)scroll_unlock</p>`;
      live = el.firstChild;
      t0 = Date.now(); test = step = pass = 0; errs = []; pattern = hex(); render();
      timer = setInterval(tick, MS);
      document.addEventListener("keydown", onKey, true); el.addEventListener("click", onClick);
      return new Promise(res => { done = res; });
    },
  };
})();
