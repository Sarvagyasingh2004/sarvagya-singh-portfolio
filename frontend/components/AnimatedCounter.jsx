"use client";

import { useEffect, useRef, useState } from "react";
import { counterItems } from "@/constants";

/**
 * Four outcomes, each as a before and an after.
 *
 * This used to be four counters ticking up to 12, 331, 100 and 3 — numbers that
 * need a paragraph of context before they mean anything. A pair of values with
 * an arrow between them carries its own meaning.
 *
 * Revealed by IntersectionObserver rather than a scroll library: it sits
 * directly under the hero, where the page height is still settling as three
 * WebGL canvases mount, and a ScrollTrigger measured against that has a habit
 * of resolving to the wrong position and leaving everything at opacity 0.
 */
const AnimatedCounter = () => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Fail open: if the observer never fires, show it anyway rather than
    // leaving the strip invisible.
    const failsafe = window.setTimeout(() => setShown(true), 2600);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(node);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      id="counter"
      ref={ref}
      className={`outcome-strip${shown ? " is-in" : ""}`}
      aria-label="Selected results"
    >
      {counterItems.map((item, i) => (
        <article
          className="outcome"
          key={item.label}
          style={{ "--i": i }}
        >
          <header className="outcome-head">
            <span className="outcome-icon">
              <img src={item.icon} alt="" width="16" height="16" loading="lazy" />
            </span>
            <span className="outcome-where">{item.where}</span>
          </header>

          <p className="outcome-metric">
            <span className="outcome-before">{item.before}</span>
            <span className="outcome-arrow" aria-hidden="true" />
            <span className="outcome-after">{item.after}</span>
          </p>

          <p className="outcome-label">{item.label}</p>
        </article>
      ))}
    </div>
  );
};

export default AnimatedCounter;
