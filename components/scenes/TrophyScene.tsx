"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function TrophyScene() {
  const trophyRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);

  // Magnetic rotation: trophy rotates towards the cursor
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const targetX = state.pointer.x * 0.8;
    const targetY = state.pointer.y * 0.5;

    if (trophyRef.current) {
      // Lerping rotation towards cursor position
      trophyRef.current.rotation.y = THREE.MathUtils.lerp(
        trophyRef.current.rotation.y,
        targetX + time * 0.25, // Auto-rotate + cursor tilt
        0.08
      );
      trophyRef.current.rotation.x = THREE.MathUtils.lerp(
        trophyRef.current.rotation.x,
        -targetY,
        0.08
      );
      
      // Idle float
      trophyRef.current.position.y = Math.sin(time * 2) * 0.08;
    }
  });

  return (
    <group>
      {/* Dim ambient for high contrast */}
      <ambientLight intensity={0.05} color="#0c0d1c" />

      {/* Spotlighting the trophy from top-right */}
      <spotLight
        ref={spotlightRef}
        position={[3, 4, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={5.0}
        color="#ffeaa7"
        castShadow
      />

      {/* Polished Black Marble Pedestal */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 32]} />
        <meshStandardMaterial
          color="#0a0a0c"
          roughness={0.05}
          metalness={0.9}
        />
      </mesh>
      
      {/* Decorative Gold Rim on Pedestal */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.51, 0.51, 0.03, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Interactive 3D Gold Creator Play Button Trophy Group */}
      <group ref={trophyRef} position={[0, 0, 0]}>
        {/* Play Button Outer Triangular Frame */}
        <mesh castShadow>
          <dodecahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.12}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Center Glass/Chrome Emblem */}
        <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.08, 3]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.99}
            roughness={0.02}
          />
        </mesh>
        
        {/* Small surrounding particles (glowing dust) */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  Array.from({ length: 120 }, () => (Math.random() - 0.5) * 1.5)
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.04} color="#d4af37" transparent opacity={0.8} />
        </points>
      </group>
    </group>
  );
}
