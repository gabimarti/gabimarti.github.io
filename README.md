# gabimarti.github.io

Personal site of Gabriel Martí ([@gabimarti](https://github.com/gabimarti)): cybersecurity consultant, reverser and developer.

🌐 **https://gabimarti.github.io/**

## What's inside

A static site styled as a retro terminal, with no frameworks, no build step, no cookies and no trackers.

- **Boot menu**: typewriter-style 80s BIOS screen that offers two modes.
- **Classic view**: everything on one page. It's also what you get without JavaScript, so search engines see the full content.
- **Interactive shell** (`gmsh`, loaded only when chosen): a fake Linux terminal. Try `help`, `whoami`, `ls -a`, `cat avatar.txt`, `neofetch`, `myip`, `dig`… There are two flags to find, and a root challenge (`su`) that unlocks an encrypted CV.
- Bilingual (EN/ES), light/dark theme toggle, fixed-size window, mobile-friendly, WCAG AA/AAA contrast.

Direct links: [`?mode=classic`](https://gabimarti.github.io/?mode=classic) · [`?mode=shell`](https://gabimarti.github.io/?mode=shell) · [`#avatar`](https://gabimarti.github.io/#avatar)

## Files

| File | Purpose |
|---|---|
| `index.html` | Content (classic view, also what search engines index) |
| `style.css` | Styles |
| `site.js` | Language, theme, boot menu and modes |
| `shell.js` | Interactive shell, loaded on demand |
| `vault.json` | Encrypted CV (AES-256-GCM, PBKDF2) and data for the `su` challenge |
| `og-image.png` | Social share card (1200×630) |
| `robots.txt` | Allows search engines, blocks AI training crawlers |
| `.well-known/security.txt` | Security contact ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)) |
| `google*.html` | Google Search Console ownership verification |
| `_config.yml` | GitHub Pages / Jekyll settings |

## Contact

[X @310hkc41b](https://x.com/310hkc41b) · [LinkedIn](https://www.linkedin.com/in/gabimarti/) · contact@gabimarti.slmail.me
