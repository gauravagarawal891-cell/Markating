"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

export default function ForgeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Animate warning light pulse and slight group rotation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotating the entire scene slightly to feel disorienting
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15;
      groupRef.current.rotation.x = Math.cos(time * 0.15) * 0.05;
    }

    // Red alert strobe pulse
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(time * 4.5) * 1.0;
    }
  });

  const warnings = [
    { text: "AD ACCOUNT RESTRICTED", sub: "Policy violation detected", pos: [-1.8, 1.2, -1], color: "#ff2222" },
    { text: "CPM: $84.20 (UNSUSTAINABLE)", sub: "Target audience overlap", pos: [1.9, 0.8, -0.5], color: "#ffaa00" },
    { text: "CAMPAIGN PAUSED: OUT OF BUDGET", sub: "Billing threshold reached", pos: [-1.2, -1.0, 0.5], color: "#ff2222" },
    { text: "CTR: 0.12% (CRITICAL)", sub: "Ad creative fatigue alert", pos: [1.4, -1.4, 0], color: "#ff5500" },
    { text: "LEAD CVP: $250.00", sub: "Average CPA exceeding target", pos: [0, 2.2, -1.5], color: "#ff8800" },
  ];

  return (
    <group ref={groupRef}>
      {/* Dark reddish background light */}
      <ambientLight intensity={0.08} color="#2b0808" />
      
      {/* Pulse warning strobe */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 1]}
        intensity={2}
        distance={10}
        color="#ff1111"
      />

      {/* Floating Warning Panels */}
      {warnings.map((warn, index) => (
        <Float
          key={index}
          speed={2 + index * 0.5}
          floatIntensity={0.8}
          rotationIntensity={0.4}
          position={warn.pos as [number, number, number]}
        >
          <group>
            {/* Panel Backplate */}
            <mesh>
              <planeGeometry args={[2.5, 0.8]} />
              <meshBasicMaterial
                color="#0f0202"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Panel Border */}
            <mesh position={[0, 0, 0.01]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(2.5, 0.8)]} />
              <lineBasicMaterial color={warn.color} linewidth={2} />
            </mesh>

            {/* Glowing Panel Backlight */}
            <pointLight position={[0, 0, -0.1]} intensity={0.5} distance={2} color={warn.color} />

            {/* Error Message Text */}
            <Text
              position={[0, 0.12, 0.02]}
              fontSize={0.11}
              color={warn.color}
              anchorX="center"
              anchorY="middle"
            >
              {warn.text}
            </Text>

            {/* Sub-details Text */}
            <Text
              position={[0, -0.18, 0.02]}
              fontSize={0.07}
              color="#8c8282"
              anchorX="center"
              anchorY="middle"
            >
              {warn.sub}
            </Text>

            {/* Glitchy warning icon */}
            <Text
              position={[-1.0, 0.12, 0.02]}
              fontSize={0.14}
              color={warn.color}
              anchorX="center"
              anchorY="middle"
            >
              ⚠️
            </Text>
          </group>
        </Float>
      ))}

      {/* Scattered background particles representing error noise */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 150 }, () => (Math.random() - 0.5) * 8)
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#ff3333" transparent opacity={0.6} />
      </points>
    </group>
  );
}
