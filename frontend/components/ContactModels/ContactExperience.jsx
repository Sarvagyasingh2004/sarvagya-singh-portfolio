"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useThemeName } from "@/lib/useTheme";

import Computer from "../Models/Computer";

/**
 * A real desk in a real room.
 *
 * The GLB already carries accurate materials — wood desk, beige tower, black
 * chair — so nothing needs recolouring. An earlier pass pushed the site's
 * violet ramp through the lights and the floor, which flattened all of that
 * into one monochrome tint. The lighting is neutral again and only the TIME OF
 * DAY changes with the theme:
 *
 *   light — midday sun through a window: warm key, cool sky bounce, pale
 *           floor. Reads as an office in daylight.
 *   dark  — the same room at night: a warm desk lamp as the key, faint cool
 *           moonlight as fill, and a cyan spill from the monitor. Reads as a
 *           room lit from inside, not a purple void.
 */
const ContactExperience = () => {
  const isDay = useThemeName() === "light";

  // Real floor tones: pale oak by day, the same boards unlit at night.
  const floor = isDay ? "#c4b49c" : "#5b4f42";

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 3, 8], fov: 45 }}>
      {isDay ? (
        <>
          {/* Sun. Slightly warm and high, casting the shadows. */}
          <directionalLight
            position={[6, 8, 4]}
            intensity={2.6}
            color="#fff3dd"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Sky fill so the shadow side stays readable without going blue. */}
          <ambientLight intensity={0.85} color="#f3f1ea" />
          <hemisphereLight intensity={0.7} color="#eef4ff" groundColor="#b9a888" />
          {/* Bounce off the floor, back into the underside of the desk. */}
          <directionalLight position={[-4, 1.5, 3]} intensity={0.45} color="#ffeed6" />
        </>
      ) : (
        <>
          {/* Desk lamp — the key light at night, warm and close. */}
          <pointLight
            position={[1.6, 2.6, 1.2]}
            intensity={62}
            distance={20}
            decay={2}
            color="#ffb768"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Monitor spill: cool, low, from where the screen sits. */}
          <pointLight
            position={[0, 1.4, -0.6]}
            intensity={14}
            distance={9}
            decay={2}
            color="#8fd8ff"
          />
          {/* Moonlight through the window — just enough to shape the room. */}
          <directionalLight position={[-5, 6, -3]} intensity={0.75} color="#b4c7e4" />
          {/* Lifted from 0.16: the room read as an unlit void with a floating
              monitor. Enough ambient to see the chair, floor and walls, while
              still clearly night. */}
          <ambientLight intensity={0.62} color="#8b98b2" />
          {/* Warm bounce off the desk surface back into the room. */}
          <pointLight position={[0, 0.4, 2.5]} intensity={11} distance={13} decay={2} color="#ffd6a8" />
          {/* A ceiling bulb overhead, so the room is lit from inside rather
              than only by the desk. */}
          <pointLight position={[0, 5, 0]} intensity={18} distance={17} decay={1.7} color="#ffe4bd" />
        </>
      )}

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
          <meshStandardMaterial color={floor} roughness={0.9} metalness={0} />
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
