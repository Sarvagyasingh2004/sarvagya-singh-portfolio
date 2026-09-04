"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

const Particles = ({ count = 200 }) => {
  const mesh = useRef();

  // The starting positions AND the buffer are built together, once.
  //
  // The flicker: `new Float32Array(count * 3)` used to sit in the render body.
  // Every re-render produced a fresh array holding the ORIGINAL start
  // positions, R3F saw a new `array` prop on <bufferAttribute>, and the whole
  // snowfall snapped back to the top — which reads as flickering.
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 10 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.005 + Math.random() * 0.001;
    }
    return { positions, speeds };
  }, [count]);

  useFrame(() => {
    // Guard: the points can unmount mid-frame when the canvas is torn down.
    if (!mesh.current) return;
    const attr = mesh.current.geometry.attributes.position;
    const arr = attr.array;
    for (let i = 0; i < count; i++) {
      const y = i * 3 + 1;
      arr[y] -= speeds[i];
      if (arr[y] < -2) arr[y] = Math.random() * 10 + 5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.05}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
