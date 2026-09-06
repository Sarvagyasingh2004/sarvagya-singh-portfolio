"use client";

import { useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThemeName } from "@/lib/useTheme";
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Room(props) {
  const { nodes, materials } = useGLTF("/models/optimized-room.glb");
  const isDay = useThemeName() === "light";
  const screensRef = useRef();
  const matcapTexture = useTexture("/images/textures/mat1.png");

  // All seven materials in ONE memo.
  //
  // Constructing these in the render body builds
  // seven brand-new material objects that three.js swapped onto every mesh in
  // the room. That swap is the flicker — much bigger than the single light
  // that was fixed earlier, and the reason it persisted after that fix.
  const materials2 = useMemo(
    () => ({
      curtain: new THREE.MeshPhongMaterial({ color: "#d90429" }),
      body: new THREE.MeshPhongMaterial({ map: matcapTexture }),
      table: new THREE.MeshPhongMaterial({ color: "#582f0e" }),
      radiator: new THREE.MeshPhongMaterial({ color: "#fff" }),
      // The monitors read as self-lit. At night that glow is the point; in
      // daylight the same white surface takes the full ambient on top of it
      // and blows out to a flat white slab. Dimmer and slightly warm by day.
      comp: new THREE.MeshStandardMaterial({
        color: isDay ? "#9fb2c9" : "#fff",
        roughness: isDay ? 0.55 : 0.3,
      }),
      pillow: new THREE.MeshPhongMaterial({ color: "#8338ec" }),
      chair: new THREE.MeshPhongMaterial({ color: "#000" }),
    }),
    [matcapTexture, isDay]
  );

  const curtainMaterial = materials2.curtain;
  const bodyMaterial = materials2.body;
  const tableMaterial = materials2.table;
  const radiatorMaterial = materials2.radiator;
  const compMaterial = materials2.comp;
  const pillowMaterial = materials2.pillow;
  const chairMaterial = materials2.chair;

  return (
    <group {...props} dispose={null}>
      {/* <ambientLight intensity={0.2} /> */}
      <directionalLight position={[5, 5, 5]} intensity={0.2} />
      <EffectComposer>
        <SelectiveBloom
          // NOTE: no `lights` prop, matching the original template. This logs
          // "SelectiveBloom requires lights to work" and applies no bloom.
          // Passing lights={[ref]} is NOT the fix — SelectiveBloom reads
          // .layers off the light during the first render, when the ref is
          // still null, which throws and takes the whole scene down. Making
          // bloom actually work needs the composer gated behind a mounted
          // check, and would change how the scene looks.
          selection={screensRef}
          intensity={1.5} // Strength of the bloom
          luminanceThreshold={0.2} // Minimum luminance needed
          luminanceSmoothing={0.9} // Smooth transition
          blendFunction={BlendFunction.ADD} // How it blends
        />
      </EffectComposer>
      <mesh
        geometry={nodes._________6_blinn1_0.geometry}
        material={curtainMaterial}
      />
      <mesh geometry={nodes.body1_blinn1_0.geometry} material={bodyMaterial} />
      <mesh geometry={nodes.cabin_blinn1_0.geometry} material={tableMaterial} />
      <mesh
        geometry={nodes.chair_body_blinn1_0.geometry}
        material={chairMaterial}
      />
      <mesh geometry={nodes.comp_blinn1_0.geometry} material={compMaterial} />
      <mesh
        ref={screensRef}
        geometry={nodes.emis_lambert1_0.geometry}
        material={materials.lambert1}
      />
      <mesh
        geometry={nodes.handls_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.keyboard_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.kovrik_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.lamp_bl_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.lamp_white_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.miuse_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.monitor2_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.monitor3_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.pCylinder5_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.pillows_blinn1_0.geometry}
        material={pillowMaterial}
      />
      <mesh
        geometry={nodes.polySurface53_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.radiator_blinn1_0.geometry}
        material={radiatorMaterial}
      />
      <mesh
        geometry={nodes.radiator_blinn1_0001.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.railing_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.red_bttns_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.red_vac_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.stylus_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh geometry={nodes.table_blinn1_0.geometry} material={tableMaterial} />
      <mesh
        geometry={nodes.tablet_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.triangle_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.vac_black_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.vacuum1_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.vacuumgrey_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.vires_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.window_blinn1_0.geometry}
        material={materials.blinn1}
      />
      <mesh
        geometry={nodes.window4_phong1_0.geometry}
        material={materials.phong1}
      />
    </group>
  );
}

useGLTF.preload("/models/optimized-room.glb");
