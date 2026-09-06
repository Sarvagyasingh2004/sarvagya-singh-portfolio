"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-paint loader.
 *
 * The site's signature moment is the tech-stack constellation: strings run
 * into the monogram and it lights. This is that idea compressed — the mark
 * comes up out of the dark as the page arrives, over a hairline rule. It is
 * built from the brand, not from a generic terminal or spinner.
 *
 * Three things it must never do:
 *
 *  1. Hide the site. It renders server-side so there is no flash of content
 *     first, which also means a JS failure would leave it covering everything.
 *     A pure-CSS animation fades it out at 6s regardless, so the page is
 *     reachable even if this component never runs.
 *  2. Lie. The rule eases toward 90% while the page is still loading and only
 *     completes on `load`. No invented percentage counting to 100.
 *  3. Blink. On a warm cache `load` can fire almost immediately, so it holds
 *     briefly — a loader that flashes for 80ms reads as a glitch.
 */
// Held long enough to read as a loading screen rather than a flicker. On a
// warm local server `load` fires almost immediately, so without a floor the
// whole thing would be gone before anyone saw it.
const MIN_VISIBLE_MS = 3200;
// Second visit in the same tab session: the point has been made, so it just
// covers the paint and goes.
const REPEAT_VISIBLE_MS = 400;
const SESSION_KEY = "sarvagya-loader-seen";
const HARD_CAP_MS = 6000;

const NAME = "SARVAGYA SINGH".split("");
// The hero cycles these four; reusing them keeps one vocabulary across the
// page instead of writing throwaway loader copy.
const LOADER_WORDS = ["Ideas", "Concepts", "Designs", "Code"];

/**
 * How long to hold, decided ONCE per page load.
 *
 * React StrictMode mounts effects twice in development. Reading the session
 * flag inside the effect meant the first run wrote it and the second run read
 * it back, concluded it was a repeat visit and scheduled a 400ms dismissal
 * that beat the real one — measured held=2052 then held=326, and the short
 * timer won. Module scope survives the remount, so both runs share one answer.
 */
let decidedHold: number | null = null;
const holdFor = (reduced: boolean) => {
  if (decidedHold !== null) return decidedHold;
  let seen = false;
  try {
    seen = sessionStorage.getItem(SESSION_KEY) === "1";
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {}
  decidedHold = reduced ? 0 : seen ? REPEAT_VISIBLE_MS : MIN_VISIBLE_MS;
  return decidedHold;
};

const Loader = () => {
  const [progress, setProgress] = useState(0.05);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const start = useRef(Date.now());

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minVisible = holdFor(reduced);
    let raf = 0;
    let finished = false;

    // Ease toward 90% and wait there. The last 10% belongs to `load`.
    const crawl = () => {
      setProgress((p) => (p < 0.9 ? p + (0.9 - p) * 0.012 : p));
      raf = requestAnimationFrame(crawl);
    };
    if (!reduced) raf = requestAnimationFrame(crawl);

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setProgress(1);
      const held = Math.max(0, minVisible - (Date.now() - start.current));
      window.setTimeout(() => setDone(true), held);
      // Unmounted only after the fade, so it cannot pop away mid-transition.
      window.setTimeout(() => setGone(true), held + (reduced ? 0 : 520));
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const cap = window.setTimeout(finish, HARD_CAP_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cap);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="site-loader" data-done={done ? "true" : "false"} aria-hidden="true">
      <div className="site-loader-inner">
        <span className="site-loader-stage">
          {/* Four strings running into the monogram — the tech-stack
              constellation's own gesture, compressed into a loop. Pure CSS on
              purpose: GSAP would be JS the page has to fetch and parse before
              the loader could animate, which is the wrong way round. */}
          <svg className="site-loader-wires" viewBox="0 0 240 240" aria-hidden="true">
            <defs>
              <linearGradient id="loader-wire" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="240">
                <stop offset="0%" stopColor="rgba(196,181,253,0.15)" />
                <stop offset="100%" stopColor="rgba(129,140,248,0.95)" />
              </linearGradient>
            </defs>
            <path d="M14 26 C 64 66, 92 96, 120 120" />
            <path d="M226 26 C 176 66, 148 96, 120 120" />
            <path d="M14 214 C 64 174, 92 144, 120 120" />
            <path d="M226 214 C 176 174, 148 144, 120 120" />
          </svg>
          <img
            src="/brand/mark-256.png"
            alt=""
            width={78}
            height={78}
            className="site-loader-mark"
            draggable={false}
          />
        </span>
        <span className="site-loader-rule">
          <i style={{ transform: `scaleX(${progress})` }} />
        </span>
        {/* The name assembles letter by letter, then the hero's own carousel
            runs underneath it — the same four words the headline cycles, so
            the loader previews the page rather than inventing copy for it. */}
        <span className="site-loader-name">
          {NAME.map((ch, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? "\u00a0" : ch}
            </span>
          ))}
        </span>
        <span className="site-loader-words" aria-hidden="true">
          <i>
            {LOADER_WORDS.map((w) => (
              <b key={w}>{w}</b>
            ))}
            <b>{LOADER_WORDS[0]}</b>
          </i>
        </span>
      </div>
    </div>
  );
};

export default Loader;
