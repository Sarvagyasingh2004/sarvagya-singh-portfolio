export type Theme = "dark" | "light";
export type Period = "day" | "night";
export const THEME_KEY = "sarvagya-theme";

export const DAY_START_MIN = 6 * 60; // 06:00
export const DAY_END_MIN = 19 * 60 + 30; // 19:30

/** Local to the browser's own timezone — no geo lookup, no permission prompt. */
export const isDaytime = (d = new Date()) => {
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= DAY_START_MIN && m < DAY_END_MIN;
};
export const periodNow = (d = new Date()): Period => (isDaytime(d) ? "day" : "night");

export const writeStored = (theme: Theme, d = new Date()) => `${theme}:${periodNow(d)}`;

export const localZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone";
  } catch {
    return "your timezone";
  }
};

export const themeInitScript = `
(function(){
  try{
    if("scrollRestoration" in history){history.scrollRestoration="manual";}
    window.addEventListener("load",function(){window.scrollTo(0,0);},{once:true});
  }catch(e){}
})();
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
