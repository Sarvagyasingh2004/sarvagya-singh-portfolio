"use client";

import { Float, PerspectiveCamera, View, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";

const Model = ({ model, spin }) => {
  const { scene: cached } = useGLTF(model.modelPath);
  const group = useRef(null);
  const baseY = model.rotation?.[1] ?? 0;

  const scene = useMemo(() => cached.clone(true), [cached]);

  useFrame(() => {
    if (!group.current) return;
    if (!spin.current.dragging) {
      spin.current.velocity *= 0.93;
      if (Math.abs(spin.current.velocity) < 0.0002) spin.current.velocity = 0;
      spin.current.angle += spin.current.velocity;
    }
    group.current.rotation.y = baseY + spin.current.angle;
  });

  return (
    <Float speed={4} rotationIntensity={0.15} floatIntensity={0.7}>
      <group ref={group} scale={model.scale} rotation={model.rotation}>
        <primitive object={scene} />
      </group>
    </Float>
  );
};

const TechIcon = ({ model }) => {
  const spin = useRef({ angle: 0, velocity: 0, dragging: false });
  const lastX = useRef(0);

  const onPointerDown = (e) => {
    spin.current.dragging = true;
    spin.current.velocity = 0;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!spin.current.dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    spin.current.angle += dx * 0.012;
    spin.current.velocity = dx * 0.012;
  };

  const endDrag = (e) => {
    if (!spin.current.dragging) return;
    spin.current.dragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <View
      className="tech-view"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 9.5]} fov={45} />
      {/* Lit directly rather than with drei's <Environment>. That fetches an
          HDR from a third-party CDN and suspends on it, inside the same
          boundary as the model — so when the request did not resolve, all eight
          logos rendered nothing at all. These are flat extruded marks; they do
          not need image-based lighting. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 5, 5]} intensity={1.25} />
      <directionalLight position={[-4, 2, 3]} intensity={0.45} />
      <Suspense fallback={null}>
        <Model model={model} spin={spin} />
      </Suspense>
    </View>
  );
};

export default TechIcon;
