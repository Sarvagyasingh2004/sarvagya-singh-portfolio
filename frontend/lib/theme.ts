export type Theme = "dark" | "light";
export const THEME_KEY = "sarvagya-theme";

/** Local to the browser's own timezone — no geo lookup, no permission prompt. */
export const isDaytime = (d = new Date()) => d.getHours() >= 6 && d.getHours() < 18;

export const localZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone";
  } catch {
    return "your timezone";
  }
};

// Runs before hydration so the first paint is already correct.
export const themeInitScript = `
(function(){
  try{
    var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var h=new Date().getHours();
    var t=(s==="dark"||s==="light")?s:((h>=6&&h<18)?"light":"dark");
    document.documentElement.dataset.theme=t;
  }catch(e){document.documentElement.dataset.theme="dark";}
})();`.trim();
