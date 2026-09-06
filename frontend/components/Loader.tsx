"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-paint loader.
 *
 * The site's signature moment is the tech-stack constellation: strings run into
 * the monogram and it lights. This is that idea compressed — built from the
 * brand rather than a generic spinner.
 *
 * Three things it must never do:
 *
 *  1. Hide the site. It renders server-side so there is no flash of content
 *     first, which also means a JS failure would leave it covering everything.
 *     A pure-CSS animation fades it out at 6s regardless.
 *  2. Lie. The bar is capped at 90% until the page has actually loaded, so it
 *     cannot read "Ready" over a page that is not.
 *  3. Flicker. It holds the same length on every visit; a splash that only
 *     appears once is just a flash on every load after it.
 */
const MIN_VISIBLE_MS = 3000;
const HARD_CAP_MS = 6000;
const FADE_MS = 420;

const NAME = "SARVAGYA SINGH".split("");
// The hero cycles these four; reusing them keeps one vocabulary across the page
// instead of writing throwaway loader copy.
const LOADER_WORDS = ["Ideas", "Concepts", "Designs", "Code"];

const STATUS: { at: number; label: string }[] = [
  { at: 0, label: "Loading assets" },
  { at: 0.35, label: "Building the scenes" },
  { at: 0.65, label: "Waking the assistant" },
  { at: 0.92, label: "Ready" },
];
const statusFor = (progress: number) => {
  let label = STATUS[0].label;
  for (const step of STATUS) if (progress >= step.at) label = step.label;
  return label;
};

const Loader = () => {
  const barRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState(STATUS[0].label);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let finished = false;
    let loaded = document.readyState === "complete";
    let value = 0.05;

    // Timed from NAVIGATION START, not from mount: this element is in the
    // server-rendered HTML, so it is on screen for roughly a second before
    // React hydrates and this effect runs. performance.now() is already
    // relative to navigation start, so the bar spans the whole time the loader
    // is actually visible instead of leaving that first second frozen.
    const crawl = () => {
      const byTime = Math.min(1, performance.now() / MIN_VISIBLE_MS);
      // Assigned, not eased toward. Per-frame easing is frame-rate dependent:
      // on a busy main thread requestAnimationFrame drops well below 60fps and
      // the bar crawls — it reached 32% where it should have been at 100%.
      // `byTime` is already a smooth function of elapsed time, so tracking it
      // directly is both smoother and independent of frame rate.
      value = Math.max(value, loaded ? byTime : Math.min(byTime, 0.9));

      // Written straight to the node. Calling setState here would re-render on
      // every frame, which React coalesces — the bar visibly lagged its own
      // value, reaching 28% when it should have been near 100%.
      if (barRef.current) barRef.current.style.transform = `scaleX(${value})`;
      // Cheap: React bails out when the label has not changed.
      setStatus(statusFor(value));

      raf = requestAnimationFrame(crawl);
    };
    if (!reduced) raf = requestAnimationFrame(crawl);

    const finish = () => {
      if (finished) return;
      finished = true;
      loaded = true;
      const held = Math.max(0, MIN_VISIBLE_MS - performance.now());
      window.setTimeout(() => {
        cancelAnimationFrame(raf);
        if (barRef.current) barRef.current.style.transform = "scaleX(1)";
        setStatus(STATUS[STATUS.length - 1].label);
        setDone(true);
      }, held);
      window.setTimeout(() => setGone(true), held + (reduced ? 0 : FADE_MS));
    };

    if (loaded) finish();
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
          {/* Four strings running into the monogram — the constellation's own
              gesture, compressed into a loop. Pure CSS: GSAP would be JS the
              page must fetch and parse before the loader could animate. */}
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
          {/* The 256px mark, not the 512px one: a loader whose own artwork is
              523KB shows an empty screen on the slow connection it exists to
              cover. Preloaded in <head>. */}
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
          <i ref={barRef} style={{ transform: "scaleX(0.05)" }} />
        </span>

        {/* The name assembles letter by letter; the hero's own carousel runs
            beneath it, so the loader previews the page rather than inventing
            copy for it. */}
        <span className="site-loader-name">
          {NAME.map((ch, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>

        <span className="site-loader-status" key={status}>
          {status}
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
