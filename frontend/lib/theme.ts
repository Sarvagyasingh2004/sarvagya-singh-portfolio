export type Theme = "dark" | "light";

export const THEME_KEY = "sarvagya-theme";

/**
 * Is it daytime where this visitor actually is?
 *
 * `new Date().getHours()` is already local to the browser's timezone, so this
 * works for a recruiter in San Francisco, Berlin or Delhi with no geo lookup,
 * no IP database and no permission prompt.
 */
export function isDaytime(now: Date = new Date()): boolean {
  const hour = now.getHours();
  return hour >= 6 && hour < 18;
}

/** The visitor's IANA timezone, for the toggle's tooltip. */
export function localZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your timezone";
  } catch {
    return "your timezone";
  }
}

/**
 * Dark is the product default. On a first visit we soften that to match the
 * visitor's local time of day — light while the sun is up where they are.
 * Once someone picks a theme themselves, that choice wins permanently.
 */
export function resolveInitialTheme(stored: string | null): Theme {
  if (stored === "dark" || stored === "light") return stored;
  return isDaytime() ? "light" : "dark";
}
