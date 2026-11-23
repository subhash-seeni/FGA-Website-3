'use client';

import React, { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import AperturePreloader from '@/components/AperturePreloader';
import Act1Philosophy from '@/components/home/Act1Philosophy';
import Act2ScaleShift from '@/components/home/Act2ScaleShift';
import Act3Configurator from '@/components/home/Act3Configurator';
import Act4Velocity from '@/components/home/Act4Velocity';

export default function HomePage() {
  // Global viewport resize listener to ensure GSAP ScrollTrigger stays razor-sharp
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    // Initial refresh after fonts and textures resolve
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0E0F11] text-[#F4F2EE] selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      {/* 1. Aperture Preloader (sessionStorage gated) */}
      <AperturePreloader />

      {/* 2. Adaptive Navigation */}
      <Navbar />

      {/* 3. ACT I — THE PHILOSOPHY (Limestone -> Obsidian crossfade) */}
      <Act1Philosophy />

      {/* 4. ACT II — THE SCALE SHIFT (Three Worlds pinned 300vh stage) */}
      <Act2ScaleShift />

      {/* 5. ACT III — THE IN-SCROLL LEASE CONFIGURATOR */}
      <Act3Configurator />

      {/* 6. ACT IV — 48-HOUR VELOCITY, FOUNDER'S NOTE & ARCHITECTURAL FOOTER */}
      <Act4Velocity />
    </main>
  );
}
