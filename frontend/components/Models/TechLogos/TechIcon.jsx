"use client";

import { Environment, Float, PerspectiveCamera, View, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * A tech logo rendered through the page's single shared WebGL context.
 *
 * Rotation is driven by pointer events on the DOM element rather than by
 * OrbitControls. Routing events into a <View> means R3F has to map viewport
 * coordinates onto each viewport's box, and in practice the drag never
 * reached the controls — it just selected the label text underneath. Reading
 * pointer deltas directly is deterministic, gives exactly the sideways spin
 * that was asked for, and avoids a second event system entirely.
 */
const Model = ({ model, spin }) => {
  const { scene: cached } = useGLTF(model.modelPath);
  const group = useRef(null);
  const baseY = model.rotation?.[1] ?? 0;

  // Clone per instance. useGLTF caches by path and returns the SAME object,
  // and a three.js Object3D can only belong to one scene graph at a time - so
  // two cards pointing at the same .glb meant the second silently stole the
  // model from the first and one card rendered empty. Cloning makes the list
  // safe to extend with repeated paths.
  const scene = useMemo(() => cached.clone(true), [cached]);

  useEffect(() => {
    // The three.js logo's own material is near-black and vanishes on the dark
    // card; a mid-tone slate reads against both grounds.
    if (!model.modelPath.includes("three.js")) return;
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_5") {
        child.material = new THREE.MeshStandardMaterial({
          color: "#8f9bb0",
          roughness: 0.35,
          metalness: 0.1,
        });
      }
    });
  }, [scene, model.modelPath]);

  useFrame(() => {
    if (!group.current) return;
    // No idle spin: the models rest facing forward so every logo stays
    // readable. An earlier version drifted continuously and, after a few
    // seconds on the page, every model had rotated edge-on to the camera.
    // Momentum after a drag decays rather than stopping dead.
    if (!spin.current.dragging) {
      spin.current.velocity *= 0.93;
      if (Math.abs(spin.current.velocity) < 0.0002) spin.current.velocity = 0;
      spin.current.angle += spin.current.velocity;
    }
    // ADD to the authored rotation rather than replacing it. Several models
    // carry a baked-in Y rotation (Node is -PI/2, Git is -PI/4) that orients
    // them toward the camera; overwriting it turned those edge-on.
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
    } catch {
      /* pointer already released */
    }
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
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1.15} />
      {/* Environment fetches an HDR and suspends, so it shares the boundary
          with the model rather than sitting outside it. */}
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Model model={model} spin={spin} />
      </Suspense>
    </View>
  );
};

export default TechIcon;
