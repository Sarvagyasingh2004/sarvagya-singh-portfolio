"use client";

import { useEffect } from "react";

/**
 * Custom pointer: a dot, a hollow ring that trails it, and a soft lamp behind
 * the content.
 *
 * Three layers, one rAF loop, one pointermove listener:
 *
 *  1. `.cursor-dot`  — tracks the pointer exactly.
 *  2. `.cursor-ring` — lags behind with eased follow, expands over anything
 *                      interactive. Transparent centre so nothing is hidden.
 *  3. `.cursor-bulb` — a lamp at z-index 0, BEHIND the content rather than
 *                      over it, and dimmed over canvases so it never washes
 *                      out the 3D scenes.
 *
 * The ink-trail variant was tried and reverted — the lamp reads better.
 *
 * Skipped entirely for coarse pointers (touch) and reduced-motion.
 */
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], .tech-item, .card';

/** Ring follow speed, 0-1. Higher = tighter. 1 locks it to the dot. */
const RING_FOLLOW = 0.55;
/** Lamp follow speed. Deliberately slow — the drift is the effect. */
const BULB_FOLLOW = 0.07;

const CursorFX = () => {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    const bulb = document.querySelector<HTMLElement>(".cursor-bulb");
    if (!dot || !ring || !bulb) return;

    const root = document.documentElement;
    root.classList.add("has-cursor-fx");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx, ry = ty;
    let bx = tx, by = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // The dot is exact; the ring eases toward it in the rAF loop.
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const tick = () => {
      rx += (tx - rx) * RING_FOLLOW;
      ry += (ty - ry) * RING_FOLLOW;
      bx += (tx - bx) * BULB_FOLLOW;
      by += (ty - by) * BULB_FOLLOW;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      bulb.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      if (t?.closest?.(INTERACTIVE)) root.classList.add("cursor-active");
    };
    const onOut = (e: Event) => {
      const t = e.target as Element | null;
      if (t?.closest?.(INTERACTIVE)) root.classList.remove("cursor-active");
    };
    // Dim the lamp over a canvas so it never washes out the 3D scenes. The
    // dot and ring stay visible — the native grab cursor is not used.
    const onCanvas = (e: Event) => {
      const t = e.target as Element | null;
      root.classList.toggle("cursor-over-canvas", Boolean(t?.closest?.("canvas")));
    };
    const onLeave = () => root.classList.add("cursor-hidden");
    const onEnter = () => root.classList.remove("cursor-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("pointerover", onCanvas, true);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
      document.removeEventListener("pointerover", onCanvas, true);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      root.classList.remove(
        "has-cursor-fx", "cursor-active", "cursor-over-canvas", "cursor-hidden"
      );
    };
  }, []);

  return (
    <>
      <div className="cursor-bulb" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CursorFX;
