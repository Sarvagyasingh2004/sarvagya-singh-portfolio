"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useThemeName } from "@/lib/useTheme";

/**
 * A round sprite for the flakes.
 *
 * `pointsMaterial` rasterises each point as a square quad, so without a
 * texture the snow falls as little boxes. This paints one soft disc to a
 * canvas and hands it over as the material's map: solid through the middle so
 * the flake still reads at 2-3px, then a short falloff so the rim is smooth
 * rather than aliased.
 */
const makeFlake = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,1)");
  g.addColorStop(0.72, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

const Particles = ({ count = 200 }) => {
  const mesh = useRef();
  const isDay = useThemeName() === "light";

  // Guarded: this is a client component, but Next still renders it on the
  // server, where there is no canvas to draw into.
  const flake = useMemo(
    () => (typeof document === "undefined" ? null : makeFlake()),
    []
  );
  useEffect(() => () => flake?.dispose(), [flake]);

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
        // White flakes are invisible against a light page, so day mode swaps
        // them for drifting motes lit from the window rather than snow against
        // a night sky. The first pass at that was too polite to notice: a pale
        // slate at 55% read as dust on the screen. Deeper, larger and more
        // opaque, tinted toward the page's own violet so they belong to it.
        color={isDay ? "#4a4a8f" : "#ffffff"}
        size={isDay ? 0.115 : 0.06}
        map={flake}
        alphaTest={0.02}
        sizeAttenuation
        transparent
        opacity={isDay ? 0.85 : 0.9}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
