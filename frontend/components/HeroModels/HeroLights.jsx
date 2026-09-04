"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useThemeName } from "@/lib/useTheme";

/**
 * Two lighting rigs for one room.
 *
 * Dark theme  — night: a warm desk lamp, a cold blue wash from the window,
 *               and a purple fill. The scene reads as a room lit from inside.
 * Light theme — day: a bright neutral key standing in for sun through the
 *               window, high ambient bounce, and a faint warm rim. The same
 *               geometry reads as daylight.
 *
 * Every light object is memoised. Constructing THREE objects in the render
 * body means a fresh object on every re-render, which three.js swaps into the
 * scene and shows as a flicker.
 */
const HeroLights = () => {
  const theme = useThemeName();
  const isDay = theme === "light";

  const areaLight = useMemo(() => {
    const l = new THREE.RectAreaLight(isDay ? "#ffffff" : "#a259ff", 8, 3, 2);
    return l;
  }, [isDay]);

  if (isDay) {
    return (
      <>
        {/* Sun through the window — bright, slightly warm, from outside. */}
        <spotLight
          position={[6, 7, 8]}
          angle={0.55}
          penumbra={0.7}
          intensity={220}
          color="#fff6e5"
        />
        {/* Sky bounce filling the shadows, so nothing goes black in daylight. */}
        <ambientLight intensity={1.5} color="#dceaff" />
        <hemisphereLight
          intensity={1.1}
          color="#eaf3ff"
          groundColor="#c9b9a4"
        />
        {/* Soft warm rim along the desk side. */}
        <directionalLight position={[-4, 5, 4]} intensity={1.2} color="#ffe9c9" />
        <primitive
          object={areaLight}
          position={[1, 3, 4]}
          rotation={[-Math.PI / 4, Math.PI / 4, 0]}
          intensity={6}
        />
      </>
    );
  }

  return (
    <>
      {/* lamp's light */}
      <spotLight
        position={[2, 5, 6]}
        angle={0.15}
        penumbra={0.2}
        intensity={100}
        color="white"
      />
      {/* bluish overhead lamp */}
      <spotLight
        position={[4, 5, 4]}
        angle={0.3}
        penumbra={0.5}
        intensity={40}
        color="#4cc9f0"
      />
      {/* purplish side fill */}
      <spotLight
        position={[-3, 5, 5]}
        angle={0.4}
        penumbra={1}
        intensity={60}
        color="#9d4edd"
      />
      <primitive
        object={areaLight}
        position={[1, 3, 4]}
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        intensity={15}
      />
      <pointLight position={[0, 1, 0]} intensity={10} color="#7209b7" />
      <pointLight position={[1, 2, -2]} intensity={10} color="#0d00a4" />
    </>
  );
};

export default HeroLights;
