"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Float, Html } from "@react-three/drei";
import * as THREE from "three";

export default function HumbleScene() {
  const bulbRef = useRef<THREE.PointLight>(null);
  const screenRef = useRef<THREE.MeshBasicMaterial>(null);

  // Animate the flickering bulb and computer screen glow
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Flickering bulb intensity animation
    if (bulbRef.current) {
      const noise = Math.sin(time * 10) * Math.cos(time * 7) * 0.4;
      // Emulate a struggling, flickering bulb
      bulbRef.current.intensity = 1.8 + (Math.random() > 0.98 ? -1.5 : noise);
    }

    // Screen scanline glow flicker
    if (screenRef.current) {
      screenRef.current.opacity = 0.85 + Math.sin(time * 20) * 0.05;
    }
  });

  return (
    <group>
      {/* Ambient environment light (moody dark blue) */}
      <ambientLight intensity={0.03} color="#0c0d1a" />

      {/* Hanging Flickering Bulb */}
      <group position={[0, 4, 0]}>
        {/* Cord */}
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 2.5, 8]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
        
        {/* Socket */}
        <mesh position={[0, -1.25, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Bulb Glass */}
        <mesh position={[0, -1.45, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#ffeedd" transparent opacity={0.9} />
        </mesh>

        {/* Point light casting shadows & flickers */}
        <pointLight
          ref={bulbRef}
          position={[0, -1.5, 0]}
          intensity={2}
          distance={12}
          color="#ffb86c"
          castShadow
          shadow-bias={-0.001}
        />
      </group>

      {/* Desk and Computer Setup */}
      <group position={[0, -1.2, 0]} rotation={[0, -Math.PI / 12, 0]}>
        {/* Wooden Desk Top */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.08, 1.4]} />
          <meshStandardMaterial color="#302015" roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Desk Legs */}
        {[-1.4, 1.4].map((x, i) => (
          <group key={i} position={[x, 0.3, 0]}>
            {/* Left and Right leg panels */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.06, 0.6, 1.2]} />
              <meshStandardMaterial color="#151210" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Pile of unpaid bills / papers */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
          <mesh position={[-0.8, 0.65, 0.3]} rotation={[0, 0.3, 0.1]} castShadow>
            <boxGeometry args={[0.22, 0.04, 0.3]} />
            <meshStandardMaterial color="#cccccc" roughness={0.9} />
          </mesh>
          <mesh position={[-0.82, 0.67, 0.28]} rotation={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.2, 0.02, 0.28]} />
            <meshStandardMaterial color="#b5b5b5" roughness={0.9} />
          </mesh>
        </Float>

        {/* Crumpled paper ball on the floor */}
        <mesh position={[0.7, -0.5, 0.5]} rotation={[0.4, 0.1, 0.8]} castShadow>
          <dodecahedronGeometry args={[0.08, 0]} />
          <meshStandardMaterial color="#dcdcdc" roughness={0.95} />
        </mesh>

        {/* Cold Coffee Mug */}
        <mesh position={[0.9, 0.68, -0.2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
          <meshStandardMaterial color="#4f3824" roughness={0.4} />
        </mesh>
        
        {/* Retro CRT Monitor */}
        <group position={[0, 1.0, -0.1]} rotation={[0, 0.05, 0]}>
          {/* Monitor Outer Shell */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.7, 0.8]} />
            <meshStandardMaterial color="#2c2a29" roughness={0.65} metalness={0.2} />
          </mesh>

          {/* Screen Border/Bezel */}
          <mesh position={[0, 0, 0.405]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.02]} />
            <meshStandardMaterial color="#1e1c1b" roughness={0.7} />
          </mesh>

          {/* Glass Curved Screen */}
          <mesh position={[0, 0, 0.415]}>
            <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]} />
            <meshBasicMaterial
              ref={screenRef}
              color="#00ff66"
              transparent
              opacity={0.9}
            />
            {/* Blue Screen Glow PointLight */}
            <pointLight position={[0, 0, 0.2]} intensity={0.8} distance={3} color="#00ff66" />
          </mesh>

          {/* Scrolling Terminal Code HTML overlay */}
          <Html
            transform
            occlude
            position={[0, 0, 0.42]}
            scale={0.065}
            distanceFactor={8}
            className="select-none pointer-events-none"
          >
            <div className="w-[120px] h-[90px] bg-[#021005]/95 border border-[#00ff55]/20 p-1.5 font-mono text-[5px] text-[#00ff55] overflow-hidden leading-tight">
              <div className="text-[6px] font-bold border-b border-[#00ff55]/30 pb-0.5 mb-1 text-center select-none uppercase tracking-wide">
                SYS_ERR_REPORT
              </div>
              <div className="animate-pulse text-[#ff3333]">CRITICAL: 0 LEADS IN</div>
              <div>&gt; query_funnel()</div>
              <div className="text-amber-400">&gt; WARNING: budget low</div>
              <div>&gt; test_run_fail_404</div>
              <div>&gt; retry_count=59</div>
              <div>&gt; ping database... fail</div>
              <div className="text-zinc-500 font-sans mt-2 animate-bounce">Scroll Down to Begin</div>
            </div>
          </Html>

          {/* Monitor Base */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
            <meshStandardMaterial color="#232120" roughness={0.7} />
          </mesh>
        </group>

        {/* Retro Keyboard */}
        <mesh position={[0.05, 0.62, 0.4]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.03, 0.22]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
