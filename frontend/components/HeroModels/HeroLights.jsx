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
        {/* Warmer and softer than a neutral key — late-morning sun rather
            than overcast daylight, which read as clinical. */}
        <spotLight
          position={[6, 7, 8]}
          angle={0.6}
          penumbra={0.85}
          intensity={190}
          color="#ffeacd"
        />
        {/* Sky bounce filling the shadows, so nothing goes black in daylight. */}
        <ambientLight intensity={1.25} color="#f2e6d8" />
        {/* Warm sky over a warm floor bounce keeps the shadows from going
            blue, which is what made the room feel cold. */}
        <hemisphereLight
          intensity={1.0}
          color="#fff3e2"
          groundColor="#d8c3a5"
        />
        {/* Soft warm rim along the desk side. */}
        <directionalLight position={[-4, 5, 4]} intensity={0.95} color="#ffdfb5" />
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
      {/* Ceiling bulb: directly above the room, aimed down at the floor.
          The originals all sat out in front of the geometry (z = 4-6), which
          lit the room from the camera's side and read as a light source
          outside the screen rather than one hanging in the room. */}
      <spotLight
        position={[0.5, 7.5, -0.5]}
        target-position={[0.5, 0, -0.5]}
        angle={0.75}
        penumbra={0.9}
        intensity={190}
        distance={22}
        decay={1.4}
        color="#fff1d6"
      />
      {/* The bulb's own warm pool, close to the ceiling. */}
      <pointLight
        position={[0.5, 6.2, -0.5]}
        intensity={22}
        distance={14}
        decay={1.8}
        color="#ffdca8"
      />
      {/* Cold spill from the monitors, low and behind the desk. */}
      <spotLight
        position={[3, 2.2, 0.5]}
        angle={0.6}
        penumbra={1}
        intensity={26}
        distance={12}
        color="#4cc9f0"
      />
      {/* Purple bounce off the far wall, kept inside the room. */}
      <pointLight
        position={[-2.5, 3, -1.5]}
        intensity={14}
        distance={13}
        decay={2}
        color="#9d4edd"
      />
      <primitive
        object={areaLight}
        position={[1, 3, 4]}
        rotation={[-Math.PI / 4, Math.PI / 4, 0]}
        intensity={15}
      />
      <pointLight position={[0, 1, 0]} intensity={6} distance={9} color="#7209b7" />
    </>
  );
};

export default HeroLights;
