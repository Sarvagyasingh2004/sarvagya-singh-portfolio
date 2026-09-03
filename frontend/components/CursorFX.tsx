"use client";

import { useEffect } from "react";

/**
 * Custom pointer + spotlight.
 *
 * Three layers, all driven from ONE rAF loop and one pointermove listener:
 *
 *  1. `.cursor-dot`  — tracks the pointer exactly. `mix-blend-mode: difference`
 *                      so it inverts whatever is underneath and stays visible
 *                      on both themes and over the 3D scenes.
 *  2. `.cursor-ring` — lags behind with eased follow, and expands over
 *                      anything interactive.
 *  3. `.cursor-bulb` — a soft lamp that sits BEHIND the content (z-index 0),
 *                      not over it. An earlier version painted on top and
 *                      washed out the canvases.
 *
 * Skipped entirely for coarse pointers (touch) and reduced-motion.
 */
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], .tech-card, .card';

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
    let rx = tx;
    let ry = ty;
    let bx = tx;
    let by = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const tick = () => {
      // Ring follows quickly, bulb slowly — that difference in lag is what
      // reads as a physical light being carried around.
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      bx += (tx - bx) * 0.07;
      by += (ty - by) * 0.07;
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
    // Dim the bulb over a canvas so it never washes out the 3D scenes.
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
      root.classList.remove("has-cursor-fx", "cursor-active", "cursor-over-canvas", "cursor-hidden");
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
