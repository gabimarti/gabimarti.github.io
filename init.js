// Runs before first paint (blocking, in <head>): JS flag + language + start mode + saved theme.
// The quick view is the home page: it shows from the first paint unless the URL asks for the retro PC (?mode=pc) or the shell.
// Kept as a file instead of inline so the Content-Security-Policy can forbid inline scripts.
{
const R = document.documentElement;
R.classList.add("js");
// language comes from the URL: /en/ and /ca/ have their own page, / is Spanish; ?lang= still works on / (old links)
try { const p = location.pathname.match(/^\/(en|ca)(\/|$)/), q = new URLSearchParams(location.search).get("lang");
  R.lang = p ? p[1] : ["en", "es", "ca"].includes(q) ? q : R.lang || "es"; } catch (e) {}
try { if (!["pc", "shell"].includes(new URLSearchParams(location.search).get("mode"))) R.classList.add("mode-classic"); } catch (e) { R.classList.add("mode-classic"); }
try { const t = localStorage.getItem("theme"); if (t === "light" || t === "dark") R.dataset.theme = t; } catch (e) {}
}
