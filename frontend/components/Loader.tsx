"use client";

import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 3000;
const HARD_CAP_MS = 6000;
const FADE_MS = 420;

const NAME = "SARVAGYA SINGH".split("");
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

    const crawl = () => {
      const byTime = Math.min(1, performance.now() / MIN_VISIBLE_MS);
      value = Math.max(value, loaded ? byTime : Math.min(byTime, 0.9));

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
            src="/brand/mark-256.webp"
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
