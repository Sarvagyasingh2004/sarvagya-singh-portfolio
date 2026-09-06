export type Theme = "dark" | "light";
export type Period = "day" | "night";
export const THEME_KEY = "sarvagya-theme";

/**
 * When the site considers it daytime, in minutes past local midnight.
 *
 * Defined once and interpolated into the pre-hydration script below, because
 * the boundary used to be written out twice — as `h >= 6 && h < 18` here and
 * again inside that script — and two copies of a rule are one edit away from
 * disagreeing with each other.
 *
 * 19:30 rather than 18:00: sunset in Delhi runs from about 17:30 in December
 * to 19:15 in June, so an 18:00 cutoff flipped the site to night while it was
 * still broad daylight for half the year.
 */
export const DAY_START_MIN = 6 * 60; // 06:00
export const DAY_END_MIN = 19 * 60 + 30; // 19:30

/** Local to the browser's own timezone — no geo lookup, no permission prompt. */
export const isDaytime = (d = new Date()) => {
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= DAY_START_MIN && m < DAY_END_MIN;
};
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
// before any bundle has loaded. The boundary is interpolated from the constants
// so there is still only one definition of it.
export const themeInitScript = `
(function(){
  var d=new Date(),m=d.getHours()*60+d.getMinutes();
  var now=(m>=${DAY_START_MIN}&&m<${DAY_END_MIN})?"day":"night";
  var theme=now==="day"?"light":"dark";
  try{
    var p=(localStorage.getItem(${JSON.stringify(THEME_KEY)})||"").split(":");
    if((p[0]==="dark"||p[0]==="light")&&p[1]===now){theme=p[0];}
  }catch(e){}
  document.documentElement.dataset.theme=theme;
})();`.trim();
