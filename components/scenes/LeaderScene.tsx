"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function LeaderScene() {
  const globeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  const satelliteCount = 6;

  // Generate satellite positions and speeds
  const satellites = useMemo(() => {
    return Array.from({ length: satelliteCount }, (_, i) => {
      const theta = (i / satelliteCount) * Math.PI * 2;
      const phi = (Math.random() - 0.5) * (Math.PI / 3); // Narrow latitude band
      const radius = 1.6;
      const speed = 0.3 + Math.random() * 0.4;
      return { theta, phi, radius, speed };
    });
  }, []);

  // Animate globe and satellites
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rotate the main globe
    if (globeRef.current) {
      globeRef.current.rotation.y = time * 0.15;
      globeRef.current.rotation.x = time * 0.05;
    }

    // Orbit the satellites
    if (ringRef.current) {
      ringRef.current.rotation.y = -time * 0.2;
      
      const children = ringRef.current.children;
      satellites.forEach((sat, index) => {
        const mesh = children[index] as THREE.Mesh;
        if (mesh) {
          // Increment angle over time
          sat.theta += sat.speed * delta;
          
          // Calculate spherical coordinates to Cartesian
          const x = sat.radius * Math.sin(sat.theta) * Math.cos(sat.phi);
          const y = sat.radius * Math.sin(sat.phi);
          const z = sat.radius * Math.cos(sat.theta) * Math.cos(sat.phi);
          
          mesh.position.set(x, y, z);
          // Auto-rotate satellite meshes
          mesh.rotation.y = time * 1.5;
        }
      });
    }
  });

  return (
    <group>
      {/* Golden leadership ambient */}
      <ambientLight intensity={0.05} color="#fff1cc" />
      <pointLight position={[0, 0, 0]} intensity={3.0} distance={5} color="#d4af37" />

      {/* Rotating Wireframe Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#241b05"
          wireframe
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating Orbital Satellites representing clients */}
      <group ref={ringRef}>
        {satellites.map((_, index) => (
          <group key={index}>
            {/* Satellite Mesh */}
            <mesh castShadow>
              <octahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#d4af37"
                emissiveIntensity={0.6}
                metalness={0.9}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Connection grid lines between satellites and globe */}
      {satellites.map((sat, index) => (
        <group key={`link-${index}`}>
          {/* Orbital path ring */}
          <mesh rotation={[sat.phi, 0, 0]}>
            <torusGeometry args={[sat.radius, 0.005, 4, 64]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.15} />
          </mesh>
        </group>
      ))}

      {/* Subtle outer glowing particle ring */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                Array.from({ length: 240 }, () => (Math.random() - 0.5) * 6)
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#d4af37" transparent opacity={0.6} />
      </points>
    </group>
  );
}
