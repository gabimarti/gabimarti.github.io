# gabimarti.github.io

Personal site of Gabriel Martí ([@gabimarti](https://github.com/gabimarti)): cybersecurity consultant, reverser and developer.

🌐 **https://gabimarti.github.io/**

## What's inside

A static site styled as a retro terminal, with no frameworks, no build step, no cookies and no trackers.

- **Boot**: 90s-style BIOS POST (memory test, drive detection, system summary) with synthesized retro sounds (mute with 🔊) — press DEL (or tap it) for the BIOS Setup, which hides a few easter eggs —, then a GRUB boot menu (Quick view, Debian boot → shell, MS-DOS 3.10, memtest86+) that auto-boots the Quick view.
- **Quick view**: everything on one page. It's also what you get without JavaScript, so search engines see the full content.
- **Interactive shell** (`gmsh`, loaded only when chosen): a fake Linux terminal. Try `help`, `whoami`, `ls -a`, `cat avatar.txt`, `neofetch`, `myip`, `dig`… There are two flags to find, and a root challenge (`su`) that unlocks an encrypted CV.
- Strict Content-Security-Policy (only own scripts and styles, no inline code).
- Bilingual (EN/ES), light/dark theme toggle, fixed-size window, mobile-friendly, WCAG AA/AAA contrast.

Direct links: [`?mode=classic`](https://gabimarti.github.io/?mode=classic) · [`?mode=shell`](https://gabimarti.github.io/?mode=shell) · [`#avatar`](https://gabimarti.github.io/#avatar)

## Files

| File | Purpose |
|---|---|
| `index.html` | Content (quick view, also what search engines index) |
| `style.css` | Styles |
| `site.js` | Language, theme, boot menu and modes |
| `shell.js` | Interactive shell, loaded on demand |
| `bios.js` | Award-style CMOS Setup (press DEL during the POST), loaded on demand |
| `debian.js` | 1998 Debian boot log (GRUB entry "Debian GNU/Linux") that ends in the shell, loaded on demand |
| `dos.js` | MS-DOS 3.10 (GRUB entry "MS-DOS 3.1"): DOS commands over the same content, and a hidden reversing challenge, loaded on demand |
| `memtest.js` | memtest86+ simulation (GRUB entry "Memory test"), loaded on demand |
| `vault.json` | Encrypted CV (AES-256-GCM, PBKDF2) and data for the `su` and MS-DOS challenges |
| `og-image.png` | Social share card (1200×630) |
| `robots.txt` | Allows search engines, blocks AI training crawlers |
| `.well-known/security.txt` | Security contact ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)) |
| `google*.html` | Google Search Console ownership verification |
| `init.js` | Pre-paint setup (JS flag + saved theme), a file so the CSP can forbid inline scripts |
| `.nojekyll` | Publish files as-is (no Jekyll build) |

## Contact

[X @310hkc41b](https://x.com/310hkc41b) · [LinkedIn](https://www.linkedin.com/in/gabimarti/) · contact@gabimarti.slmail.me
