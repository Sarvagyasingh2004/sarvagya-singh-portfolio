import { useEffect } from "react";

// A soft spotlight that trails the cursor. Position is written to CSS custom
// properties inside a rAF so we paint at most once per frame regardless of how
// fast pointermove fires. Skipped entirely for touch input and for anyone who
// has asked for reduced motion.
const PointerGlow = () => {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const root = document.documentElement;
    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const paint = () => {
      frame = 0;
      root.style.setProperty("--glow-x", `${x}px`);
      root.style.setProperty("--glow-y", `${y}px`);
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    root.classList.add("has-pointer-glow");
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove("has-pointer-glow");
    };
  }, []);

  return <div className="pointer-glow" aria-hidden="true" />;
};

export default PointerGlow;
