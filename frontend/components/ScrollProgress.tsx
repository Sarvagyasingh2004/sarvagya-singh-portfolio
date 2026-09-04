"use client";

import { useEffect, useRef } from "react";

/**
 * Smooth scroll progress bar.
 *
 * Drives `transform: scaleX()` — a compositor-only property — and eases toward
 * the target inside one rAF loop. Animating `width` with a CSS transition
 * fights every scroll event and visibly stutters.
 */
const ScrollProgress = () => {
  const bar = useRef<HTMLSpanElement>(null);
  const target = useRef(0);
  const value = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const spark = el.querySelector<HTMLElement>(".scroll-progress-spark");

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    measure();

    if (reduced) {
      const onScroll = () => {
        measure();
        el.style.transform = `scaleX(${target.current})`;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    value.current = target.current;
    const tick = () => {
      // Follow 12% of the remaining distance per frame — critically damped,
      // so it glides rather than snapping between scroll positions.
      value.current += (target.current - value.current) * 0.12;
      if (Math.abs(target.current - value.current) < 0.0001) value.current = target.current;
      el.style.transform = `scaleX(${value.current})`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={bar} className="scroll-progress-fill">
        {/* Sits at the leading edge of the fill and travels with it, so the
            spark is always exactly where the progress ends. */}
        <i className="scroll-progress-spark" />
      </span>
    </div>
  );
};

export default ScrollProgress;
