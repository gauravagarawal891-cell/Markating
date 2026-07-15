"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function ClientScene() {
  const portalRef = useRef<THREE.Mesh>(null);
  const clientGroupRef = useRef<THREE.Group>(null);

  const clientCount = 12;

  // Initialize paths for clients to travel on (converging towards [0, 0, 0])
  const clients = useMemo(() => {
    return Array.from({ length: clientCount }, (_, i) => {
      const angle = (i / clientCount) * Math.PI * 2 + Math.random() * 0.4;
      const startRadius = 3.0 + Math.random() * 1.5;
      const speed = 0.4 + Math.random() * 0.5;
      return { angle, startRadius, radius: startRadius, speed, yOffset: Math.random() * 0.1 };
    });
  }, []);

  // Update client position coordinates along converging lines
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Portal rotation and size pulse
    if (portalRef.current) {
      portalRef.current.rotation.y = time * 1.2;
      const pulse = 1.0 + Math.sin(time * 6) * 0.05;
      portalRef.current.scale.set(pulse, 1, pulse);
    }

    // Move client indicators along the radial paths towards center
    if (clientGroupRef.current) {
      const children = clientGroupRef.current.children;
      clients.forEach((client, index) => {
        const mesh = children[index] as THREE.Mesh;
        if (mesh) {
          // Shrink radius (move closer to center portal)
          client.radius -= client.speed * delta;
          
          // Reset client once they reach the portal core
          if (client.radius < 0.35) {
            client.radius = client.startRadius;
          }

          // Calculate 3D position
          const x = Math.cos(client.angle) * client.radius;
          const z = Math.sin(client.angle) * client.radius;
          
          mesh.position.set(x, -0.4 + client.yOffset, z);
          // Scale client down as they near the portal
          const scale = Math.min(client.radius / 2.0, 1.0) * 0.15;
          mesh.scale.set(scale, scale * 2.5, scale);
        }
      });
    }
  });

  return (
    <group>
      {/* Cool cyber cyan environment light */}
      <ambientLight intensity={0.06} color="#00ffcc" />

      {/* Glowing Cyber Grid Floor */}
      <gridHelper args={[12, 24, "#00ffcc", "#122a28"]} position={[0, -0.5, 0]} />

      {/* Central Brand Portal/Gateway */}
      <group position={[0, -0.5, 0]}>
        {/* Glow column */}
        <mesh ref={portalRef}>
          <cylinderGeometry args={[0.3, 0.35, 1.2, 16, 1, true]} />
          <meshBasicMaterial
            color="#00f5ff"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Spotlighting client conversion */}
        <pointLight position={[0, 0.5, 0]} intensity={2.5} distance={4} color="#00f5ff" />
      </group>

      {/* Flowing client nodes */}
      <group ref={clientGroupRef}>
        {clients.map((_, index) => (
          <mesh key={index} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#00f5ff"
              emissive="#0055aa"
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Connective data paths */}
      {clients.map((client, index) => {
        const xStart = Math.cos(client.angle) * client.startRadius;
        const zStart = Math.sin(client.angle) * client.startRadius;
        return (
          <Line
            key={`line-${index}`}
            points={[
              [xStart, -0.48, zStart],
              [0, -0.48, 0],
            ]}
            color="#005566"
            lineWidth={1.5}
            transparent
            opacity={0.5}
          />
        );
      })}
    </group>
  );
}
