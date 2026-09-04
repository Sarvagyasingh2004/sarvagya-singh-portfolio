"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useThemeName } from "@/lib/useTheme";

const Particles = ({ count = 200 }) => {
  const mesh = useRef();
  const isDay = useThemeName() === "light";

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          Math.random() * 10 + 5, // higher starting point
          (Math.random() - 0.5) * 10,
        ],
        speed: 0.005 + Math.random() * 0.001,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    const positions = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      let y = positions[i * 3 + 1];
      y -= particles[i].speed;
      if (y < -2) y = Math.random() * 10 + 5;
      positions[i * 3 + 1] = y;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  const positions = new Float32Array(count * 3);
  particles.forEach((p, i) => {
    positions[i * 3] = p.position[0];
    positions[i * 3 + 1] = p.position[1];
    positions[i * 3 + 2] = p.position[2];
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
        // White flakes are invisible against a light page. In day mode they
        // become a soft slate and get bigger, reading as drifting motes lit
        // from the window rather than snow against a night sky.
        color={isDay ? "#6d7fa8" : "#ffffff"}
        size={isDay ? 0.075 : 0.05}
        transparent
        opacity={isDay ? 0.55 : 0.9}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
