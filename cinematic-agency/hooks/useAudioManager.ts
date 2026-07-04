"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioManager() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const lastScrollYRef = useRef(0);
  const velocityRef = useRef(0);

  // Initialize the procedural Web Audio synthesizer
  const initAudio = () => {
    if (audioCtxRef.current) return;

    // Create Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Main Gain / Master Volume Control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    // Smoothly fade in volume to prevent pop sounds
    masterGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Filter Node (gives a warm, cinematic analog sweep)
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, ctx.currentTime); // moody, dark tone to start
    filter.Q.setValueAtTime(4.0, ctx.currentTime); // resonant peak
    filter.connect(masterGain);
    filterRef.current = filter;

    // Oscillator 1 (Low Fundamental Note F1 - 43.65 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(43.65, ctx.currentTime);
    osc1.connect(filter);
    osc1.start();
    osc1Ref.current = osc1;

    // Oscillator 2 (Overtones/Fifth C2 - 65.41 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth"; // Richer harmonic content
    osc2.frequency.setValueAtTime(65.41, ctx.currentTime);
    
    // Sub-gain to blend Oscillator 2
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.06, ctx.currentTime);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    
    osc2.start();
    osc2Ref.current = osc2;

    setAudioEnabled(true);
  };

  // Toggle master audio volume
  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
      return;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 0.3);
      }
      setAudioEnabled(true);
    } else {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.3);
      }
      setTimeout(() => {
        if (audioCtxRef.current && gainNodeRef.current && gainNodeRef.current.gain.value === 0) {
          audioCtxRef.current.suspend();
        }
      }, 350);
      setAudioEnabled(false);
    }
  };

  // Monitor scroll movements to sweep filters and adjust synth pitches
  useEffect(() => {
    const handleScrollAndInteraction = () => {
      // Auto-initialize soundscape on first user scroll interaction if they have clicked once
      if (!audioCtxRef.current && audioEnabled) {
        initAudio();
      }

      const currentScrollY = window.scrollY;
      const diff = Math.abs(currentScrollY - lastScrollYRef.current);
      velocityRef.current = diff;
      lastScrollYRef.current = currentScrollY;

      if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;

      const ctx = audioCtxRef.current;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? currentScrollY / totalHeight : 0;

      // 1. Dynamic Filter Frequency Sweep based on scroll speed (Opens up on scroll)
      if (filterRef.current) {
        const sweepFreq = 180 + Math.min(velocityRef.current * 2.8, 1100);
        filterRef.current.frequency.setTargetAtTime(sweepFreq, ctx.currentTime, 0.1);
      }

      // 2. Narrative Pitch/Chord progression as they scroll from Basement to Empire
      if (osc1Ref.current && osc2Ref.current) {
        let fundamental = 43.65; // F1 (Humble beginnings)
        let overtone = 65.41;    // C2 (Fifth)

        if (progress > 0.35 && progress <= 0.7) {
          // Breakthrough & Photo phase: Pitch shifts to G1 (49.00 Hz) / D2 (73.42 Hz)
          fundamental = 49.00;
          overtone = 73.42;
        } else if (progress > 0.7) {
          // Empire & Global leadership: Pitch resolves upward to a bright C2 (65.41 Hz) / G2 (98.00 Hz)
          fundamental = 65.41;
          overtone = 98.00;
        }

        osc1Ref.current.frequency.setTargetAtTime(fundamental, ctx.currentTime, 0.4);
        osc2Ref.current.frequency.setTargetAtTime(overtone, ctx.currentTime, 0.4);
      }
    };

    window.addEventListener("scroll", handleScrollAndInteraction, { passive: true });
    window.addEventListener("click", initAudio, { once: true });

    return () => {
      window.removeEventListener("scroll", handleScrollAndInteraction);
      window.removeEventListener("click", initAudio);
    };
  }, [audioEnabled]);

  return { audioEnabled, toggleAudio, initAudio };
}
