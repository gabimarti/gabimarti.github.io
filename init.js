// Runs before first paint (blocking, in <head>): JS flag (hides the classic view until a mode is chosen) + saved theme.
// Kept as a file instead of inline so the Content-Security-Policy can forbid inline scripts.
document.documentElement.classList.add("js");
try { const t = localStorage.getItem("theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch (e) {}
