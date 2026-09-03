"use client";

import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

// useGLTF must be called by a component rendered INSIDE <Canvas>. Called from
// the parent (as it was), the suspension unwinds past the Canvas entirely and
// the canvas mounts with nothing in it — sized, with a live GL context, but
// drawing nothing.
const Model = ({ model }) => {
  const { scene } = useGLTF(model.modelPath);

  useEffect(() => {
    // The three.js logo ships with a dark material that disappears on a dark
    // card, so it gets forced to white. The original guarded on the label
    // "Interactive Developer"; these entries were renamed, so match the model
    // file instead — a rename can't silently break it again.
    if (!model.modelPath.includes("three.js")) return;
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_5") {
        child.material = new THREE.MeshStandardMaterial({ color: "white" });
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
    <Canvas>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls enableZoom={false} enablePan={false} />
      {/* One boundary around everything that loads. <Environment> fetches an
          HDR and suspends too — leaving it outside a boundary was the other
          half of the blank-canvas bug. */}
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Model model={model} />
      </Suspense>
    </Canvas>
  );
};

export default TechIcon;
