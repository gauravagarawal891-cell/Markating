"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function SparkScene() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate particle coordinate positions for the data stream
  const count = 300;
  const { positions, speeds, initialPositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const initialPos = [];
    for (let i = 0; i < count; i++) {
      // Create spiral trajectories around the core
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2.5;
      const y = (Math.random() - 0.5) * 4;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      spd[i] = 0.5 + Math.random() * 1.5;
      initialPos.push({ angle, radius, y });
    }
    return { positions: pos, speeds: spd, initialPositions: initialPos };
  }, []);

  // Update particles and rotate the core
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rotations
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.8;
      coreRef.current.rotation.x = time * 0.4;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = -time * 0.5;
      ring1Ref.current.rotation.y = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.6;
      ring2Ref.current.rotation.z = time * 0.3;
    }

    // Animate data streams converging into the core
    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      const posAttr = geo.attributes.position;
      
      for (let i = 0; i < count; i++) {
        // Decrease radius to draw particles inward
        const speed = speeds[i] * delta * 0.8;
        initialPositions[i].radius -= speed;
        // Add spiral rotation
        initialPositions[i].angle += speed * 0.5;

        // Reset particle to outer boundary once it hits the core
        if (initialPositions[i].radius < 0.25) {
          initialPositions[i].radius = 3.5 + Math.random() * 1.0;
          initialPositions[i].y = (Math.random() - 0.5) * 4;
        }

        // Calculate 3D coordinates
        posAttr.setX(i, Math.cos(initialPositions[i].angle) * initialPositions[i].radius);
        posAttr.setY(i, initialPositions[i].y);
        posAttr.setZ(i, Math.sin(initialPositions[i].angle) * initialPositions[i].radius);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Cool blue base ambient */}
      <ambientLight intensity={0.05} color="#08142b" />

      {/* Main Core Energy Sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#005577"
          roughness={0.1}
          metalness={0.9}
        />
        {/* Core glow light source */}
        <pointLight intensity={3.5} distance={6} color="#00f5ff" />
      </mesh>

      {/* Orbiting Electronic Track Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.0, 0.02, 8, 64]} />
        <meshBasicMaterial color="#bc34fa" transparent opacity={0.7} />
      </mesh>

      <mesh ref={ring2Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[1.3, 0.015, 8, 64]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.6} />
      </mesh>

      {/* Converging Data Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#00f5ff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Secondary gold/purple particle ring */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 100 }, (_, i) => {
                  const angle = (i / 100) * Math.PI * 2;
                  return [Math.cos(angle) * 1.8, (Math.random() - 0.5) * 0.2, Math.sin(angle) * 1.8];
                }).flat()
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#d4af37" transparent opacity={0.7} />
      </points>
    </group>
  );
}
