"use client";

import { useEffect, useState } from "react";

/**
 * Reads the current theme from the <html data-theme> attribute and re-renders
 * on change. A MutationObserver rather than React state because the theme is
 * also set by the pre-hydration head script, outside React entirely.
 */
export function useThemeName(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const read = () =>
      setTheme(
        (document.documentElement.dataset.theme as "dark" | "light") || "dark"
      );
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

  return theme;
}
