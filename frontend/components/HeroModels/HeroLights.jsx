"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useThemeName } from "@/lib/useTheme";

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
        <spotLight
          position={[6, 7, 8]}
          angle={0.6}
          penumbra={0.85}
          intensity={190}
          color="#ffeacd"
        />
        <ambientLight intensity={1.25} color="#f2e6d8" />
        <hemisphereLight
          intensity={1.0}
          color="#fff3e2"
          groundColor="#d8c3a5"
        />
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
      <pointLight
        position={[0.5, 6.2, -0.5]}
        intensity={22}
        distance={14}
        decay={1.8}
        color="#ffdca8"
      />
      <spotLight
        position={[3, 2.2, 0.5]}
        angle={0.6}
        penumbra={1}
        intensity={26}
        distance={12}
        color="#4cc9f0"
      />
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
