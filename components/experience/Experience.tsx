"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Import Scene Components
import HumbleScene from "../scenes/HumbleScene";
import ForgeScene from "../scenes/ForgeScene";
import SparkScene from "../scenes/SparkScene";
import SpotlightScene from "../scenes/SpotlightScene";
import TrophyScene from "../scenes/TrophyScene";
import ClientScene from "../scenes/ClientScene";
import EmpireScene from "../scenes/EmpireScene";
import LeaderScene from "../scenes/LeaderScene";
import PostFX from "./PostFX";

// Camera Coordinator inside Canvas context
function CameraManager({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const flashedRef = useRef(false);

  useFrame((state) => {
    const progress = scrollRef.current; // 0 to 1

    // Vertical Y path: 105 units total (8 scenes, 15 units gap per scene)
    const targetY = -progress * 105;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);

    // Coordinate Camera Depth (Z) and pitch tilt based on scroll sections
    let targetZ = 4.2;
    let targetRotX = 0;

    if (progress < 0.14) {
      // Humble: default position
      targetZ = 4.2;
    } else if (progress < 0.28) {
      // Forge: zoom back slightly and tilt down
      const sub = (progress - 0.14) / 0.14;
      targetZ = 4.8;
      targetRotX = sub * 0.18;
    } else if (progress < 0.42) {
      // Spark: close up on the engine core
      targetZ = 3.2;
    } else if (progress < 0.57) {
      // Spotlight: frame photoshoot
      targetZ = 5.2;
      
      // Trigger camera flash event at midpoint (50% scroll)
      const relativeProgress = (progress - 0.42) / 0.15;
      if (relativeProgress >= 0.45 && relativeProgress <= 0.55) {
        if (!flashedRef.current) {
          flashedRef.current = true;
          window.dispatchEvent(new CustomEvent("trigger-photoshoot-flash"));
        }
      } else {
        if (relativeProgress < 0.35 || relativeProgress > 0.65) {
          flashedRef.current = false;
        }
      }
    } else if (progress < 0.71) {
      // Trophy: orbit framing
      targetZ = 4.0;
    } else if (progress < 0.85) {
      // Client: tilt high-angle for grid paths
      const sub = (progress - 0.71) / 0.14;
      targetZ = 5.6;
      targetRotX = -sub * (Math.PI / 4.5);
    } else if (progress < 0.95) {
      // Empire: flat tracking shot through office
      targetZ = 4.4;
    } else {
      // Leader: final static look
      targetZ = 3.6;
    }

    // Apply camera translations
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotX, 0.08);

    // Apply interactive cursor mouse parallax (x axis)
    const targetX = state.pointer.x * 0.45;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -targetX * 0.12, 0.08);
  });

  return null;
}

export default function Experience() {
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        // Safe progression bounds
        scrollRef.current = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
      }
    };
    
    // Read initial scroll
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 150 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="w-full h-full"
    >
      {/* Scroll-Driven Camera Coordinator */}
      <CameraManager scrollRef={scrollRef} />

      {/* Global Lighting (Sun / Shadow caster) */}
      <directionalLight
        position={[4, 5, 6]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* Scene 1: Humble Beginnings (Y = 0) */}
      <group position={[0, 0, 0]}>
        <HumbleScene />
      </group>

      {/* Scene 2: The Forge / Struggles (Y = -15) */}
      <group position={[0, -15, 0]}>
        <ForgeScene />
      </group>

      {/* Scene 3: The Spark (Y = -30) */}
      <group position={[0, -30, 0]}>
        <SparkScene />
      </group>

      {/* Scene 4: The Spotlight Photoshoot (Y = -45) */}
      <group position={[0, -45, 0]}>
        <SpotlightScene />
      </group>

      {/* Scene 5: The Trophy Room (Y = -60) */}
      <group position={[0, -60, 0]}>
        <TrophyScene />
      </group>

      {/* Scene 6: The Influx (Y = -75) */}
      <group position={[0, -75, 0]}>
        <ClientScene />
      </group>

      {/* Scene 7: The Empire (Y = -90) */}
      <group position={[0, -90, 0]}>
        <EmpireScene />
      </group>

      {/* Scene 8: The Finale (Y = -105) */}
      <group position={[0, -105, 0]}>
        <LeaderScene />
      </group>

      {/* Cinematic Post Processing Stack */}
      <PostFX />
    </Canvas>
  );
}
