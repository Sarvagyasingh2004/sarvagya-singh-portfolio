"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, isDaytime, localZone, type Theme } from "@/lib/theme";

const Sun = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [tip, setTip] = useState("");

  // The head script already applied the theme — read it back rather than
  // overriding it, so there's no flicker on mount.
  useEffect(() => {
    const t = (document.documentElement.dataset.theme as Theme) || "dark";
    setTheme(t);
    setTip(`it's ${isDaytime() ? "daytime" : "night"} in ${localZone()}`);
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private browsing — still applies for this session */
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => apply(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={tip ? `${isDark ? "Dark" : "Light"} — ${tip}` : undefined}
    >
      {/* Icon shows the destination: sun means "switch to light". */}
      <span key={theme} className="theme-icon">{isDark ? <Sun /> : <Moon />}</span>
    </button>
  );
};

export default ThemeToggle;
