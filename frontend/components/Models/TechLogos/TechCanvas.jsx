"use client";

import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

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
