"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function SpotlightScene() {
  const modelRef = useRef<THREE.Group>(null);
  const cameraRigRef = useRef<THREE.Group>(null);

  // Animate the avatar model and camera rig rotation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Floating animation for the hero model
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(time * 1.5) * 0.1;
      modelRef.current.rotation.y = time * 0.4;
    }

    // Camera rig floating and pointing towards the center
    if (cameraRigRef.current) {
      cameraRigRef.current.position.x = -2.2 + Math.sin(time) * 0.15;
      cameraRigRef.current.position.y = 0.5 + Math.cos(time * 0.8) * 0.1;
    }
  });

  return (
    <group>
      {/* Dark studio background */}
      <ambientLight intensity={0.1} color="#ffffff" />
      
      {/* Studio backdrop curtain (smooth curved screen) */}
      <mesh position={[0, 0.5, -2.5]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#111115" roughness={0.9} />
      </mesh>

      {/* Floating 3D Silhouette Model / Avatar representation */}
      <group ref={modelRef} position={[0, 0, 0]}>
        {/* Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.2}
            wireframe
            roughness={0.1}
          />
        </mesh>
        
        {/* Torso */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.08, 1.0, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
            wireframe
            roughness={0.1}
          />
        </mesh>

        {/* Halo Ring behind Head */}
        <mesh position={[0, 1.2, -0.1]} rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[0.42, 0.015, 8, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Studio Softbox Lights */}
      {/* Left Softbox */}
      <group position={[-2.5, 1.5, 1]} rotation={[0, Math.PI / 4, 0]}>
        {/* Softbox Stand */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
        {/* Softbox Head Cover */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        {/* Glowing Face */}
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[0.55, 0.75]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <spotLight position={[0, 0, 0.3]} angle={0.6} intensity={2.5} distance={8} color="#ffffff" />
      </group>

      {/* Right Softbox */}
      <group position={[2.5, 1.5, 1]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Softbox Stand */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
        {/* Softbox Head Cover */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        {/* Glowing Face */}
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[0.55, 0.75]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <spotLight position={[0, 0, 0.3]} angle={0.6} intensity={2.5} distance={8} color="#ffffff" />
      </group>

      {/* Stylized Floating Studio Camera Rig */}
      <group ref={cameraRigRef} position={[-2.2, 0.5, 0.5]} rotation={[0.1, Math.PI / 3, 0]}>
        {/* Tripod Stand */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
          <meshStandardMaterial color="#333" metalness={0.7} />
        </mesh>
        {/* Camera body */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.3]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Flashing Light indicator */}
        <mesh position={[0.15, 0.2, 0.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ff2222" />
        </mesh>
      </group>
    </group>
  );
}
