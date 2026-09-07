"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const TechCanvas = ({ active = true }) => (
  <Canvas
    className="tech-shared-canvas"
    dpr={[1, 1.75]}
    // Nothing is on screen when the section is far away, so nothing is drawn.
    // This is the one saving here that costs no image quality: the canvas used
    // to redraw the whole viewport every frame for the entire length of the
    // page, including while the constellation was nowhere near view.
    frameloop={active ? "always" : "never"}
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
