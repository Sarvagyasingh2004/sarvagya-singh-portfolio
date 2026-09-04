"use client";

import { useEffect, useRef } from "react";

/**
 * Custom pointer: a dot, a hollow ring that trails it, and an ink trail that
 * draws where you move and fades out over ~2.5s.
 *
 * The trail is drawn on a full-screen <canvas> rather than with DOM nodes —
 * a fading stroke needs per-point alpha, which would otherwise mean hundreds
 * of elements being created and destroyed every second.
 *
 * The lamp/bulb was removed in favour of this. To bring it back, restore the
 * `.cursor-bulb` layer and its rAF term; nothing else depended on it.
 */
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], .tech-card, .card';
const TRAIL_MS = 2500;
const MAX_POINTS = 320;

type Pt = { x: number; y: number; t: number };

const CursorFX = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    root.classList.add("has-cursor-fx");

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let raf = 0;
    const pts: Pt[] = [];

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      const last = pts[pts.length - 1];
      // Skip near-duplicate samples so a stationary pointer doesn't pile up
      // hundreds of identical points.
      if (!last || Math.hypot(tx - last.x, ty - last.y) > 2.5) {
        pts.push({ x: tx, y: ty, t: performance.now() });
        if (pts.length > MAX_POINTS) pts.shift();
      }
    };

    // Read the trail colour from CSS so it follows the theme automatically.
    const trailColor = () =>
      getComputedStyle(root).getPropertyValue("--cursor-trail").trim() || "139,92,246";

    const tick = () => {
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;

      const now = performance.now();
      while (pts.length && now - pts[0].t > TRAIL_MS) pts.shift();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (pts.length > 1) {
        const rgb = trailColor();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Each segment gets its own alpha and width from its age, so the
        // stroke thins and fades from tail to head like drying ink.
        // Glow pass first, then the core stroke on top — one pass alone
        // reads as a thin scratch rather than ink.
        ctx.shadowColor = `rgba(${rgb}, 0.9)`;
        ctx.shadowBlur = 12;
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 1; i < pts.length; i++) {
            const life = 1 - (now - pts[i].t) / TRAIL_MS;
            if (life <= 0) continue;
            // Ease the fade so the tail lingers instead of dropping linearly.
            const a = life * life;
            ctx.strokeStyle =
              pass === 0 ? `rgba(${rgb}, ${a * 0.35})` : `rgba(${rgb}, ${a * 0.95})`;
            ctx.lineWidth = pass === 0 ? 1.5 + life * 7 : 1 + life * 3;
            ctx.beginPath();
            ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
            ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
      }

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
    const onLeave = () => root.classList.add("cursor-hidden");
    const onEnter = () => root.classList.remove("cursor-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointerout", onOut, true);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      root.classList.remove("has-cursor-fx", "cursor-active", "cursor-hidden");
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CursorFX;
