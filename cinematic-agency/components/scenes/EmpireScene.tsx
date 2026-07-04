"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function EmpireScene() {
  const chartRef = useRef<THREE.Line>(null);
  const officeGroupRef = useRef<THREE.Group>(null);

  // Generate coordinates for the golden exponential growth chart line
  const chartPoints = useMemo(() => {
    const points = [];
    const count = 30;
    for (let i = 0; i <= count; i++) {
      const x = (i / count) * 4.0 - 2.0; // Range -2 to 2
      // Exponential curve: y = x^3 or similar
      const normX = i / count;
      const y = Math.pow(normX, 3.2) * 1.8 - 0.6; // Scale curves nicely
      const z = -0.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(chartPoints);
  }, [chartPoints]);

  // Animate the office meshes and the growth chart glow
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Floating animation for the chart line
    if (chartRef.current) {
      chartRef.current.position.y = Math.sin(time * 2.0) * 0.04;
    }

    // Slow corporate office orbit parallax
    if (officeGroupRef.current) {
      officeGroupRef.current.rotation.y = Math.sin(time * 0.1) * 0.08;
    }
  });

  return (
    <group>
      {/* Warm Golden Hour Ambient */}
      <ambientLight intensity={0.15} color="#ffe5cc" />
      <directionalLight position={[-4, 2, -2]} intensity={2.5} color="#ff8844" />

      {/* Curved Sunset City Backdrop */}
      <mesh position={[0, 1.0, -4.0]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial
          color="#ff7f50" // Coral Warm Sunset Base
          side={THREE.DoubleSide}
        >
          {/* Custom sunset gradient shader can be implemented here, using plain color for efficiency */}
        </meshBasicMaterial>
      </mesh>

      {/* Floating Exponential Growth Chart */}
      <group position={[0, 0.5, 0.5]}>
        <line ref={chartRef} geometry={lineGeometry}>
          <lineBasicMaterial color="#d4af37" linewidth={4} />
        </line>
        
        {/* Floating growth milestones (spheres) */}
        {chartPoints.filter((_, idx) => idx % 6 === 0 || idx === chartPoints.length - 1).map((pt, index) => (
          <group key={index} position={[pt.x, pt.y, pt.z]}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#d4af37" />
            </mesh>
            <pointLight intensity={1.5} distance={1.5} color="#d4af37" />
          </group>
        ))}
      </group>

      {/* Luxury Corporate Office Layout */}
      <group ref={officeGroupRef} position={[0, -0.6, -1.0]}>
        {/* Sleek Glossy Executive Desk */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.08, 1.2]} />
          <meshStandardMaterial color="#111115" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Desk Support Panels */}
        {[-1.9, 1.9].map((x, i) => (
          <mesh key={i} position={[x, -0.3, 0]} castShadow>
            <boxGeometry args={[0.1, 0.6, 1.0]} />
            <meshStandardMaterial color="#222" roughness={0.5} />
          </mesh>
        ))}

        {/* Triple Desktop Setup */}
        {[-1.1, 0, 1.1].map((x, i) => (
          <group key={i} position={[x, 0.4, -0.2]} rotation={[0, -x * 0.15, 0]}>
            {/* Monitor Shell */}
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.48, 0.04]} />
              <meshStandardMaterial color="#2a2a2f" roughness={0.5} />
            </mesh>
            {/* Screen displaying analytics */}
            <mesh position={[0, 0, 0.021]}>
              <planeGeometry args={[0.86, 0.44]} />
              <meshBasicMaterial color="#d4af37" transparent opacity={0.85} />
            </mesh>
            {/* Base Stand */}
            <mesh position={[0, -0.32, -0.05]} castShadow>
              <boxGeometry args={[0.15, 0.18, 0.15]} />
              <meshStandardMaterial color="#111" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Office Chairs (Minimalist low-poly blocks) */}
        <group position={[0, -0.1, 0.8]} rotation={[0, Math.PI, 0]}>
          {/* Seat Cushion */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.08, 0.6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
          {/* Chair Back */}
          <mesh position={[0, 0.4, -0.26]} castShadow>
            <boxGeometry args={[0.56, 0.6, 0.08]} />
            <meshStandardMaterial color="#111" roughness={0.6} />
          </mesh>
          {/* Pedestal Stand */}
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#444" metalness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
