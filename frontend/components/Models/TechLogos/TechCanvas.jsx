"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

/**
 * The one WebGL context behind every tech-stack icon.
 *
 * Fixed to the viewport and pointer-events: none, so it never intercepts
 * clicks or scrolling — drei's View.Port scissors each <View> into the box of
 * the element it tracks.
 */
const TechCanvas = () => (
  <Canvas
    className="tech-shared-canvas"
    dpr={[1, 1.75]}
    eventSource={typeof document !== "undefined" ? document.body : undefined}
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
