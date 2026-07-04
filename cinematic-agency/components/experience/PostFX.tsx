"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";

export default function PostFX() {
  const dofRef = useRef<any>(null);
  const caRef = useRef<any>(null);
  const lastScrollYRef = useRef(0);
  const velocityRef = useRef(0);

  // Monitor scroll speed to dynamically scale Chromatic Aberration (fast scrolls distort the edges)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollYRef.current);
      velocityRef.current = THREE.MathUtils.clamp(diff * 0.03, 0, 1.2); // cap maximum distortion
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    // Decay velocity over time to reset chromatic aberration when scroll stops
    velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, 0, 0.08);

    // Apply Chromatic Aberration offset based on scroll velocity
    if (caRef.current && caRef.current.offset) {
      const offsetVal = 0.001 + velocityRef.current * 0.012;
      if (typeof caRef.current.offset.set === "function") {
        caRef.current.offset.set(offsetVal, offsetVal);
      } else {
        caRef.current.offset.x = offsetVal;
        caRef.current.offset.y = offsetVal;
      }
    }

    // Dynamic Depth-of-Field (focal length target changes with scroll progression)
    if (dofRef.current) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      
      // Calculate target focal distance based on camera height
      const targetFocus = 3.5 + Math.sin(progress * Math.PI * 4) * 1.5;
      if (dofRef.current.target && typeof dofRef.current.target.set === "function") {
        dofRef.current.target.set(0, -progress * 105, 0); // Focus on active scene Y offset
      } else {
        dofRef.current.target = new THREE.Vector3(0, -progress * 105, 0);
      }
      dofRef.current.bokehScale = THREE.MathUtils.lerp(dofRef.current.bokehScale, 1.2 + velocityRef.current * 3.5, 0.1);
    }
  });

  return (
    <EffectComposer disableNormalPass>
      {/* Volumetric Neon Glows */}
      <Bloom
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        intensity={1.2}
        mipmapBlur
      />

      {/* Photorealistic Camera Bokeh blur */}
      <DepthOfField
        ref={(el) => { dofRef.current = el; }}
        focusDistance={0.035}
        focalLength={0.04}
        bokehScale={1.5}
      />

      {/* Glitchy offset for high-velocity scrolls */}
      <ChromaticAberration
        ref={(el) => { caRef.current = el; }}
      />
    </EffectComposer>
  );
}
