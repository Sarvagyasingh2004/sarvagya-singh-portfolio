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

// Swaps the tab icon with the theme. The <link media> attributes alone follow
// the OS setting, not the toggle on the page, so the choice has to be applied
// here too — and it has to run in <head>, before the first icon is fetched.
export const faviconScript = `
(function(){
  window.__setFavicon=function(theme){
    try{
      var href="/brand/favicon-"+(theme==="light"?"light":"dark")+".png";
      var l=document.querySelector('link[rel="icon"][data-themed]');
      if(!l){
        document.querySelectorAll('link[rel="icon"]').forEach(function(x){x.remove()});
        l=document.createElement("link");
        l.rel="icon"; l.type="image/png"; l.setAttribute("sizes","64x64");
        l.setAttribute("data-themed","");
        document.head.appendChild(l);
      }
      if(l.getAttribute("href")!==href) l.setAttribute("href",href);
      var a=document.querySelector('link[rel="apple-touch-icon"]');
      if(a) a.setAttribute("href","/brand/favicon-"+(theme==="light"?"light":"dark")+"-180.png");
    }catch(e){}
  };
})();`.trim();

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
  if(window.__setFavicon) window.__setFavicon(theme);
})();`.trim();
