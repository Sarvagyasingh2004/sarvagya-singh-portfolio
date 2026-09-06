"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useThemeName } from "@/lib/useTheme";

import Computer from "../Models/Computer";

const ContactExperience = () => {
  const isDay = useThemeName() === "light";

  // Real floor tones: pale oak by day, the same boards unlit at night.
  const floor = isDay ? "#c4b49c" : "#5b4f42";

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 3, 8], fov: 45 }}>
      {isDay ? (
        <>
          <directionalLight
            position={[6, 8, 4]}
            intensity={2.6}
            color="#fff3dd"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <ambientLight intensity={0.85} color="#f3f1ea" />
          <hemisphereLight intensity={0.7} color="#eef4ff" groundColor="#b9a888" />
          <directionalLight position={[-4, 1.5, 3]} intensity={0.45} color="#ffeed6" />
        </>
      ) : (
        <>
          <pointLight
            position={[1.6, 2.6, 1.2]}
            intensity={62}
            distance={20}
            decay={2}
            color="#ffb768"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight
            position={[0, 1.4, -0.6]}
            intensity={14}
            distance={9}
            decay={2}
            color="#8fd8ff"
          />
          <directionalLight position={[-5, 6, -3]} intensity={0.75} color="#b4c7e4" />
          <ambientLight intensity={0.62} color="#8b98b2" />
          <pointLight position={[0, 0.4, 2.5]} intensity={11} distance={13} decay={2} color="#ffd6a8" />
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
