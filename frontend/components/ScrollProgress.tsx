"use client";

import { useEffect, useRef } from "react";

/**
 * Smooth scroll progress bar.
 *
 * The previous version animated `width` with a CSS transition, which fought
 * every scroll event and stuttered. This drives `transform: scaleX()` — a
 * compositor-only property — and eases the value toward its target inside a
 * single rAF loop, so it glides the way a loading bar does instead of
 * snapping between discrete scroll positions.
 */
const ScrollProgress = () => {
  const barRef = useRef<HTMLSpanElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      target.current = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    const tick = () => {
      // Critically damped follow: 12% of the remaining distance per frame.
      current.current += (target.current - current.current) * 0.12;
      if (Math.abs(target.current - current.current) < 0.0001) {
        current.current = target.current;
      }
      bar.style.transform = `scaleX(${current.current})`;
      raf.current = requestAnimationFrame(tick);
    };

    measure();
    if (reduced) {
      // No easing loop — just track the value directly.
      const onScroll = () => {
        measure();
        bar.style.transform = `scaleX(${target.current})`;
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    current.current = target.current;
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
      <span ref={barRef} />
    </div>
  );
};

export default ScrollProgress;
