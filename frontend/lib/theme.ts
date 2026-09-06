export type Theme = "dark" | "light";
export type Period = "day" | "night";
export const THEME_KEY = "sarvagya-theme";

/** Local to the browser's own timezone — no geo lookup, no permission prompt. */
export const isDaytime = (d = new Date()) => d.getHours() >= 6 && d.getHours() < 18;
export const periodNow = (d = new Date()): Period => (isDaytime(d) ? "day" : "night");

/**
 * A manual choice is stored as `theme:period` and only holds for the half of
 * the day it was made in.
 *
 * Storing the theme on its own made one click permanent: localStorage survives
 * a hard refresh, so the time-of-day default never ran again and the site sat
 * in whichever theme was last picked, forever. Tying the choice to its period
 * means "dark at 3pm" lasts the afternoon and then the clock takes over again.
 * Values written in the old format carry no period, so they are ignored — which
 * is what releases anyone already stuck.
 */
export const writeStored = (theme: Theme, d = new Date()) => `${theme}:${periodNow(d)}`;

export const localZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone";
  } catch {
    return "your timezone";
  }
};

// Runs before hydration so the first paint is already correct. Kept as a source
// string rather than importing the helpers above: it has to execute in <head>,
// before any bundle has loaded.
export const themeInitScript = `
(function(){
  var h=new Date().getHours();
  var now=(h>=6&&h<18)?"day":"night";
  var theme=now==="day"?"light":"dark";
  try{
    var p=(localStorage.getItem(${JSON.stringify(THEME_KEY)})||"").split(":");
    if((p[0]==="dark"||p[0]==="light")&&p[1]===now){theme=p[0];}
  }catch(e){}
  document.documentElement.dataset.theme=theme;
})();`.trim();
