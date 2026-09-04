"use client";

import { useEffect, useRef } from "react";

/**
 * Enter-on-scroll for sections that had no motion at all.
 *
 * IntersectionObserver rather than a scroll listener, and it toggles a class
 * that CSS animates — so no per-frame JS and nothing to clean up beyond the
 * observer itself. `once` by default: a section that re-animates every time
 * you scroll past becomes noise.
 *
 * Motion is motivated here: it sequences the reading order (heading, then
 * copy, then the aside) rather than decorating.
 */
const Reveal = ({ children, as: Tag = "div", delay = 0, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-revealed");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-revealed");
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
