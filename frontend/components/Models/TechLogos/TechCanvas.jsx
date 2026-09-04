"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

/**
 * The single WebGL context behind every tech-stack icon.
 *
 * Two things are load-bearing here:
 *
 *  - `eventSource` points at the document, because the <View> elements live
 *    elsewhere in the DOM than this canvas.
 *  - `eventPrefix="client"` is REQUIRED alongside an external eventSource.
 *    Without it R3F computes pointer coordinates relative to the canvas
 *    instead of the viewport, so they never land inside a View's box and
 *    nothing inside one — OrbitControls included — receives events.
 *
 * The canvas itself stays pointer-events: none so it can't swallow clicks
 * across the whole page; each .tech-view re-enables them over its own box.
 */
const TechCanvas = () => (
  <Canvas
    className="tech-shared-canvas"
    dpr={[1, 1.75]}
    eventSource={typeof document !== "undefined" ? document.documentElement : undefined}
    eventPrefix="client"
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 1,
    }}
  >
    <View.Port />
  </Canvas>
);

export default TechCanvas;
