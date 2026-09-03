import { THEME_KEY } from "./theme";

// Runs before React hydrates, so the correct theme is on <html> for the very
// first paint. Any failure falls back to dark rather than throwing.
export const themeInitScript = `
(function(){
  try {
    var s = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var t = (s === "dark" || s === "light")
      ? s
      : ((new Date().getHours() >= 6 && new Date().getHours() < 18) ? "light" : "dark");
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`.trim();
