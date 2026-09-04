"use client";

import { Environment, Float, OrbitControls, PerspectiveCamera, View, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

/**
 * One <View> per card, all sharing a SINGLE WebGL context.
 *
 * Each card used to mount its own <Canvas>. With the hero and the contact
 * scene that made 7 live contexts on one page. Browsers cap concurrent WebGL
 * contexts in the mid-teens and silently drop the oldest — so with other tabs
 * open, some canvases simply fail to acquire a context and Chrome paints its
 * broken-content glyph. drei's <View> renders many viewports through one
 * shared renderer, taking the page from 7 contexts to 2.
 */
const Model = ({ model }) => {
  const { scene } = useGLTF(model.modelPath);

  useEffect(() => {
    // The three.js logo ships with a near-black material that vanishes on the
    // dark card. Forcing it white fixed that but made it vanish on the light
    // one instead, so it gets a mid-tone slate that holds contrast against
    // both grounds. Matched on the model file rather than the card label, so
    // renaming a card can't silently break it.
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

  return (
    <Float speed={5.5} rotationIntensity={0.5} floatIntensity={0.9}>
      <group scale={model.scale} rotation={model.rotation}>
        <primitive object={scene} />
      </group>
    </Float>
  );
};

const TechIcon = ({ model }) => {
  return (
    // <View> renders its own element and tracks itself — the earlier version
    // paired it with a separate anchor div, so the tracked box was the View's
    // own unsized element and every viewport scissored to zero.
    <View className="tech-view">
        <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} />
        {/* Environment fetches an HDR and suspends, so it shares the boundary
            with the model rather than sitting outside it. */}
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Model model={model} />
        </Suspense>
    </View>
  );
};

export default TechIcon;
