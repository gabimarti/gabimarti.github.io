// THE CURIOSITY BBS: a fictional 1997 bulletin board reached with TELNET from MS-DOS (dos.js). Loaded on demand.
// Everything is scripted and offline: news, message base, file area, a "guess the number" door game and a chat with
// the SYSOP, a keyword bot (no AI, no network). io comes from dos.js: host, print, err, askLine, sleep, esc, sfx, cls, reduce.
"use strict";
(() => {
  const C = (cls, s) => `<span class="${cls}">${s}</span>`;     // ANSI-style colours (style.css .dos .c-*)
  const LOGO = [
    "  ____ _   _ ____  ___ ___  ____ ___ _______   __",
    " / ___| | | |  _ \\|_ _/ _ \\/ ___|_ _|_   _\\ \\ / /",
    "| |   | | | | |_) || | | | \\___ \\| |  | |  \\ V / ",
    "| |___| |_| |  _ < | | |_| |___) | |  | |   | |  ",
    " \\____|\\___/|_| \\_\\___\\___/|____/___| |_|   |_|  ",
    "                 B B S   ·   est. 1993",
  ].join("\n");
  const NEWS = [
    ["05-11-97", "IBM's Deep Blue beats Kasparov. Our SYSOP still loses to Minesweeper."],
    ["07-04-97", "Mars Pathfinder lands on Mars. Its modem is faster than ours."],
    ["09-15-97", "Somebody registers a domain called google.com. Silly name, it'll never catch on."],
    ["10-01-97", "Internet Explorer 4 is out. The browser wars are ON. Netscape users: stay strong."],
    ["11-30-97", "Tamagotchi ban at the local school. Three of ours died during exams."],
    ["12-09-97", "Quake II released. Productivity on this node: -100%."],
    ["12-19-97", "Titanic in cinemas. Spoiler: there's a door. There was room."],
  ];
  const MSGS = [
    ["NEO", "ALL", "Re: is the year 2000 going to break everything?", "Only if we write dates with 2 digits. Who would do that?"],
    ["ACIDBURN", "SYSOP", "Upload ratio", "Uploaded 3 ZIPs, can I get more download credits? My 14k4 is crying."],
    ["GABIMARTI", "ALL", "LOCKED.COM", "Wrote a little password program back in 1986. XOR is encryption, right? ...right?"],
    ["ZEROCOOL", "ALL", "Hack the planet", "Hack the planet! (please don't, it's the only one we have)"],
  ];
  const FILES = [["PKZ204G.EXE", 202574, "PKZIP 2.04g, the one and only"], ["DOOM1_9S.ZIP", 2354016, "DOOM shareware 1.9 (4 disks)"],
    ["WINAMP10.ZIP", 271104, "It really whips the llama's a..."], ["QBASIC.ZIP", 194309, "Gorillas and Nibbles included"],
    ["CV_GABI.TXT", 4338, "The CV of an old SYSOP friend (try the quick view instead)"]];
  const WHO = [["1", "YOU", "28800", "Main menu"], ["2", "SYSOP", "Local", "Waiting for a chat"], ["3", "GABIMARTI", "14400", "Idle since 1999"], ["4", "NEO", "33600", "Downloading DOOM1_9S.ZIP"]];

  // the SYSOP: keyword rules, then ELIZA-style fallbacks
  const RULES = [
    [/\b(hi|hello|hey|hola|bon dia|buenas|ey)\b/i, ["Hi there! Welcome to my little BBS. What brings you here?", "Hello, caller! Pull up a chair, the modem is warm."]],
    [/\b(who|what) are you\b|\bbot\b|\b(ai|gpt|chatbot)\b/i, ["I'm the SYSOP. Well, a 1997 script pretending to be one. No AI here: just good manners and a big IF.", "AI? In 1997 we had ELIZA and patience. I'm closer to ELIZA."]],
    [/\b(cv|resume|curriculum|job|hire|work|contract)\b/i, ["Looking for Gabriel? His CV is on this very machine: type CV at the C:\\> prompt, or exit to the quick view.", "Gabriel does cybersecurity, reversing and dev. The quick view has it all, CV.BAT too if you like batch files."]],
    [/\b(flag|password|passwd|crack|hack|root|locked)\b/i, ["Passwords? On MY board? Rumour says LOCKED.COM talks too much when you look at it under DEBUG.", "I never give out passwords. But programs that only XOR things... they're chatty."]],
    [/\b(bios|setup|cmos|del key)\b/i, ["The BIOS on this PC has more menus than it shows. Old techs knew which keys to hold while asking for help.", "Ever tried a 90s master password in a BIOS? Asking for a friend."]],
    [/\b(music|song|tune|speaker|midi)\b/i, ["The PC speaker on this machine knows a few tunes. The BIOS hides a test for it.", "Music? Try the BIOS. Then ask yourself where a DOS PC would keep its MIDI files."]],
    [/\b(linux|debian|shell|unix)\b/i, ["There's a Debian box on this machine too. Two flags, one root account, and an admin who writes too many notes.", "Linux? Reboot and pick Debian. Real hackers use 'ls -a' over there."]],
    [/\b(modem|baud|bps|dial)\b/i, ["My modem is a 28.8k. On a good day. When nobody picks up the phone.", "Ah, the handshake sound. Music to my ears."]],
    [/\b(thanks|thank you|gracias|merci|gràcies|gracies)\b/i, ["Anytime. That's what SYSOPs are for.", "You're welcome. Don't forget to upload something!"]],
    [/\b(y2k|2000|millennium)\b/i, ["Y2K? Relax. It's only every computer on Earth.", "I'm stocking up on canned food and floppy disks."]],
    [/\?$/, ["Good question. What do you think?", "Hmm. Ask me again after my coffee.", "That's classified. Level 3 users only."]],
  ];
  const FALLBACK = ["Tell me more.", "Why do you say that?", "Interesting. Go on.", "I see. And how does that make you feel?", "Fascinating. My modem agrees.", "Hold on, someone is picking up the phone... ok, go on."];
  const pick = a => a[(Math.random() * a.length) | 0];
  function reply(line) {
    for (const [re, answers] of RULES) if (re.test(line)) return pick(answers);
    const w = line.match(/\b(i|i'm|im|my) ([a-z' ]{3,30})/i);
    return w && Math.random() < .5 ? `Why do you say "${w[0].toLowerCase()}"?` : pick(FALLBACK);
  }

  GM.bbs = {
    async run(io) {
      const { print, askLine, sleep, esc, sfx, cls } = io;
      const wait = ms => sleep(io.reduce ? 10 : ms);
      const pre = h => print(`<pre class="bbs">${h}</pre>`);
      const ask = async label => (await askLine(label)).trim();
      const host = io.host.slice(0, 40);
      // connect
      print(`Trying ${esc(host)}...`); await wait(700);
      print(`Connected to ${esc(host)}.<br>Escape character is '^]'.`);
      print(`<span class="dim">(TELNET on MS-DOS 3.10? This PC peeked at the future again.)</span>`); await wait(500);
      sfx.ok(); cls();
      pre(`${C("c-cy", esc(LOGO))}\n${C("c-ye", "  Node 1 of 4 · 28800 bps · 24h · Barcelona")}\n`);
      const handle = (await ask("Enter your handle (or ENTER for GUEST): ")).toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 12) || "GUEST";
      print(`Welcome, ${C("c-gr", esc(handle))}! First call? We like new faces. Your time left today: ${C("c-ye", "60 min")}.`);
      await wait(400);
      for (;;) {
        pre(`\n${C("c-ma", "═══ MAIN MENU ═══")}
 ${C("c-ye", "[N]")} News 1997      ${C("c-ye", "[M]")} Messages      ${C("c-ye", "[F]")} Files
 ${C("c-ye", "[C]")} Chat w/ SYSOP  ${C("c-ye", "[D]")} Door games    ${C("c-ye", "[W]")} Who's online
 ${C("c-ye", "[G]")} Goodbye (log off)`);
        const k = (await ask("Your choice: ")).toUpperCase()[0];
        if (k === "N") pre(`${C("c-cy", "── NEWS ──────────────────────────────────────────────")}\n` + NEWS.map(([d, t]) => `${C("c-ye", d)}  ${esc(t)}`).join("\n"));
        else if (k === "M") {
          pre(`${C("c-cy", "── MESSAGE BASE: GENERAL ─────────────────────────────")}\n` + MSGS.map(([f, t, s, b], i) =>
            `${C("c-ye", `#${i + 1}`)} From: ${C("c-gr", f)}  To: ${t}  Subj: ${esc(s)}\n    ${esc(b)}`).join("\n\n"));
          const m = await ask("Leave a message? (Y/N) ");
          if (/^y/i.test(m)) { await ask("Your message: "); print(`Saved. It will be read by the SYSOP... in about ${2026 - 1997} years.`); }
        } else if (k === "F") {
          pre(`${C("c-cy", "── FILE AREA ─────────────────────────────────────────")}\n` + FILES.map(([n, s, d], i) =>
            `${C("c-ye", String(i + 1))}. ${n.padEnd(13)} ${String(s).padStart(8)}  ${esc(d)}`).join("\n"));
          const n = +(await ask("Download which file (number, ENTER to skip)? "));
          const f = FILES[n - 1];
          if (f) {
            print(`Starting Zmodem download of ${f[0]}...`);
            const bar = print("");
            for (let p = 0; p <= 100; p += 10) { bar.innerHTML = `<pre class="bbs">[${"█".repeat(p / 10)}${"░".repeat(10 - p / 10)}] ${p}%  ${Math.round(f[1] * p / 100)} bytes  ~${Math.ceil(f[1] / 3600 * (1 - p / 100))}s left</pre>`; sfx.tick(); await wait(220); }
            print(`Download complete: ${C("c-ye", "0 bytes")} saved. This BBS lives in your browser, and so do its files.`);
          }
        } else if (k === "C") {
          print(`${C("c-ma", "*** Paging SYSOP... ***")}`); sfx.post(); await wait(1200);
          print(`${C("c-gr", "SYSOP has joined the chat.")} Type ${C("c-ye", "/bye")} to go back to the menu.`);
          print(`${C("c-cy", "SYSOP:")} ${reply("hello")}`);
          for (;;) {
            const line = await ask(`${handle}: `);
            if (!line) continue;
            print(`${C("c-gr", esc(handle) + ":")} ${esc(line)}`);
            if (/^\/?(bye|quit|exit|q)$/i.test(line)) { print(`${C("c-cy", "SYSOP:")} See you around, ${esc(handle)}. Keep your bits clean.`); break; }
            const t = print(`<span class="dim">SYSOP is typing...</span>`); await wait(500 + Math.random() * 900); t.remove();
            sfx.key(); print(`${C("c-cy", "SYSOP:")} ${esc(reply(line))}`);
          }
        } else if (k === "D") {
          pre(`${C("c-cy", "── DOOR: GUESS THE NUMBER (1-100) ───────────────────")}\nI'm thinking of a number. You have 7 tries.`);
          const n = 1 + ((Math.random() * 100) | 0);
          let won = false;
          for (let i = 1; i <= 7 && !won; i++) {
            const g = parseInt(await ask(`Try ${i}/7: `), 10);
            if (isNaN(g)) { print("A number, please. This is a door game, not a poetry contest."); i--; continue; }
            if (g === n) { won = true; sfx.ok(); print(`${C("c-gr", `Got it in ${i}!`)} You win 10 extra minutes online. (They're not real either.)`); }
            else print(g < n ? "Higher." : "Lower.");
          }
          if (!won) print(`Out of tries. It was ${n}. The door closes with a creak.`);
        } else if (k === "W") {
          pre(`${C("c-cy", "── WHO'S ONLINE ──────────────────────────────────────")}\nNode  User        Speed  Doing\n` + WHO.map(([n, u, s, d]) => `${n.padEnd(5)} ${(u === "YOU" ? handle : u).padEnd(11)} ${s.padEnd(6)} ${d}`).join("\n"));
        } else if (k === "G") {
          print(`Goodbye, ${esc(handle)}! Thanks for calling THE CURIOSITY BBS.`); await wait(600);
          sfx.err(); print(C("c-rd", "NO CARRIER")); await wait(400);
          print("Connection closed by foreign host.");
          return;
        } else print("Unknown option. The SYSOP sighs loudly.");
      }
    },
  };
})();
