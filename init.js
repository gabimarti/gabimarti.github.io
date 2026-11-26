// Runs before first paint (blocking, in <head>): JS flag + start mode + saved theme.
// The quick view is the home page: it shows from the first paint unless the URL asks for the retro PC (?mode=pc) or the shell.
// Kept as a file instead of inline so the Content-Security-Policy can forbid inline scripts.
{
const R = document.documentElement;
R.classList.add("js");
try { if (!["pc", "shell"].includes(new URLSearchParams(location.search).get("mode"))) R.classList.add("mode-classic"); } catch (e) { R.classList.add("mode-classic"); }
try { const t = localStorage.getItem("theme"); if (t === "light" || t === "dark") R.dataset.theme = t; } catch (e) {}
}
