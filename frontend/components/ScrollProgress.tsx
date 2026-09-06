"use client";

import { useEffect, useRef } from "react";

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
        <i className="scroll-progress-spark" />
      </span>
    </div>
  );
};

export default ScrollProgress;
