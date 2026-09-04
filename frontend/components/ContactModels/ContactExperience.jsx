"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useThemeName } from "@/lib/useTheme";

import Computer from "../Models/Computer";

/**
 * The contact scene, themed to the site's violet -> indigo ramp.
 *
 * It shipped on the template's orange (#cb7c2e wrapper, #a46b2d ground,
 * #ffd9b3 keys), which was the last thing on the page still wearing a colour
 * from outside the palette. Both the ground plane and the lighting now derive
 * from the same accent as the rest of the site, in both themes.
 */
const ContactExperience = () => {
  const isDay = useThemeName() === "light";

  // Ground reads a shade deeper than the wrapper behind it, so the plane
  // still reads as a floor rather than merging into the panel.
  const ground = isDay ? "#cac7f0" : "#312a5c";
  const keyLight = isDay ? "#ffffff" : "#c9b6ff";
  const fillLight = isDay ? "#e8ecff" : "#8b7fe8";

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 3, 8], fov: 45 }}>
      <ambientLight intensity={isDay ? 1.1 : 0.55} color={fillLight} />

      <directionalLight
        position={[5, 5, 3]}
        intensity={isDay ? 2.2 : 1.9}
        color={keyLight}
      />

      <directionalLight
        position={[5, 9, 1]}
        castShadow
        intensity={isDay ? 2.4 : 2.1}
        color={keyLight}
      />

      {/* A cool counter-light on the opposite side keeps the shadow side from
          going flat black, and echoes the cyan end of the site's ramp. */}
      <directionalLight
        position={[-6, 4, -2]}
        intensity={isDay ? 0.7 : 0.75}
        color={isDay ? "#e4ecff" : "#7b74d8"}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
      />

      <group scale={[1, 1, 1]}>
        <mesh
          receiveShadow
          position={[0, -1.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color={ground} roughness={0.85} />
        </mesh>
      </group>

      <Suspense fallback={null}>
        <group scale={0.03} position={[0, -1.49, -2]} castShadow>
          <Computer />
        </group>
      </Suspense>
    </Canvas>
  );
};

export default ContactExperience;
