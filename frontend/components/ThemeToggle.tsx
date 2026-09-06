"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, isDaytime, localZone, writeStored, type Theme } from "@/lib/theme";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || "dark");
    setTip(`${isDaytime() ? "daytime" : "night"} in ${localZone()}`);
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    window.setTimeout(() => root.classList.remove("theme-switching"), 60);
    try {
      localStorage.setItem(THEME_KEY, writeStored(next));
    } catch {}
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn-surface theme-toggle"
      onClick={() => apply(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={tip ? `${isDark ? "Dark" : "Light"} — ${tip}` : undefined}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <svg className="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.2v2.1M12 19.7v2.1M2.2 12h2.1M19.7 12h2.1M5.1 5.1l1.5 1.5M17.4 17.4l1.5 1.5M18.9 5.1l-1.5 1.5M6.6 17.4l-1.5 1.5" />
        </svg>
        <svg className="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
