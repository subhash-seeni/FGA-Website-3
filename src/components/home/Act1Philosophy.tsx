'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import DaylightShaderBackground from '@/components/DaylightShaderBackground';
import WebGLLitStage from '@/components/WebGLLitStage';

gsap.registerPlugin(ScrollTrigger);

export default function Act1Philosophy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const daylightRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bottomStripRef = useRef<HTMLDivElement>(null);
  const obsidianLayerRef = useRef<HTMLDivElement>(null);
  const stageRevealRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pinWrapper = pinWrapperRef.current;
      const headline = headlineRef.current;
      const bottomStrip = bottomStripRef.current;
      const obsidianLayer = obsidianLayerRef.current;
      const stageReveal = stageRevealRef.current;

      if (!pinWrapper || !headline || !obsidianLayer || !stageReveal) return;

      let lastTheme: 'light' | 'dark' = 'light';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: pinWrapper,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const isDark = self.progress > 0.4;
            const nextTheme = isDark ? 'dark' : 'light';
            if (nextTheme !== lastTheme) {
              lastTheme = nextTheme;
              if (containerRef.current) {
                containerRef.current.setAttribute('data-nav-theme', nextTheme);
              }
              window.dispatchEvent(new CustomEvent('nav-theme-change', { detail: nextTheme }));
            }
          },
        },
      });

      // 1. Bottom strip fades out first
      tl.to(
        bottomStrip,
        {
          opacity: 0,
          y: -20,
          duration: 0.2,
          ease: 'power1.out',
        },
        0
      );

      // 2. Headline scales up dramatically and tracks out
      tl.to(
        headline,
        {
          scale: 1.6,
          letterSpacing: '0.04em',
          opacity: 0.15,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        0.1
      );

      // 3. Obsidian layer crossfades in
      tl.to(
        obsidianLayer,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        0.2
      );

      // 4. Rolls-Royce Ghost WebGL Stage emerges from darkness
      tl.fromTo(
        stageReveal,
        {
          opacity: 0,
          scale: 1.15,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.45
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#F4F2EE] text-[#0E0F11] select-none"
      id="philosophy"
      data-nav-theme="light"
    >
      {/* Pinned Viewport Container */}
      <div
        ref={pinWrapperRef}
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* Layer 1: Limestone Canvas with DaylightShaderBackground */}
        <div ref={daylightRef} className="absolute inset-0 z-0">
          <DaylightShaderBackground className="w-full h-full" intensity={0.9}>
            <div className="w-full h-full" />
          </DaylightShaderBackground>
        </div>

        {/* Content Layer (Limestone Hero) */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 md:p-16 max-w-7xl mx-auto">
          {/* Top Eyebrow */}
          <div className="flex items-center justify-between pt-16 md:pt-14 text-xs font-mono uppercase tracking-[0.25em] text-[#0E0F11]/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
              <span className="font-semibold text-[#0E0F11]">AHMEDABAD · GUJARAT · INDIA</span>
            </div>
            <div className="hidden sm:block text-[11px] tracking-[0.2em] text-[#C27D4B]">
              OPERATING LEASE PLATFORM
            </div>
          </div>

          {/* Center Oversized Editorial Display Headline */}
          <div
            ref={headlineRef}
            className="my-auto text-center flex flex-col items-center justify-center transform-gpu will-change-transform"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C27D4B] mb-4">
              Firstgen Assets Private Limited
            </div>
            <h1 className="font-sans font-bold text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] tracking-tighter text-[#0E0F11] leading-[0.92]">
              Assets That Work.
              <br />
              <span className="text-[#C27D4B] font-light">Capital That Stays.</span>
            </h1>
            <p className="mt-6 max-w-xl text-xs sm:text-sm font-mono tracking-wider text-[#0E0F11]/60 uppercase">
              Operating Leases for High-Value Corporate Fleets, Heavy Machinery & IT Compute
            </p>
          </div>

          {/* Minimalist Bottom Strip with 4 Hairline-Divided Figures */}
          <div
            ref={bottomStripRef}
            className="w-full border-t border-[#0E0F11]/12 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left"
          >
            <div className="md:border-r border-[#0E0F11]/12 pr-4">
              <div className="font-mono text-xs sm:text-sm font-bold text-[#0E0F11] tracking-wider uppercase">
                06+ ASSET CATEGORIES
              </div>
              <div className="text-[10px] font-mono text-[#0E0F11]/50 uppercase tracking-widest mt-0.5">
                Luxury · Heavy · Enterprise
              </div>
            </div>

            <div className="md:border-r border-[#0E0F11]/12 pr-4">
              <div className="font-mono text-xs sm:text-sm font-bold text-[#C27D4B] tracking-wider uppercase">
                48 HRS DELIVERY
              </div>
              <div className="text-[10px] font-mono text-[#0E0F11]/50 uppercase tracking-widest mt-0.5">
                Western India Priority SLA
              </div>
            </div>

            <div className="md:border-r border-[#0E0F11]/12 pr-4">
              <div className="font-mono text-xs sm:text-sm font-bold text-[#0E0F11] tracking-wider uppercase">
                ₹0 DOWN PAYMENT
              </div>
              <div className="text-[10px] font-mono text-[#0E0F11]/50 uppercase tracking-widest mt-0.5">
                True Off-Balance Sheet
              </div>
            </div>

            <div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#C27D4B] tracking-wider uppercase">
                100% DIGITAL
              </div>
              <div className="text-[10px] font-mono text-[#0E0F11]/50 uppercase tracking-widest mt-0.5">
                eSign & eNACH Protocol
              </div>
            </div>
          </div>
        </div>

        {/* Layer 2: Warm Obsidian (#0E0F11) Crossfade Curtain */}
        <div
          ref={obsidianLayerRef}
          className="absolute inset-0 z-20 bg-[#0E0F11] text-[#F4F2EE] opacity-0 pointer-events-none flex items-center justify-center p-6 md:p-12 overflow-hidden"
        >
          {/* Subtle architectural grid lines */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #C27D4B 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Emerging Stage Reveal */}
          <div
            ref={stageRevealRef}
            className="relative z-30 w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-6"
          >
            <div className="flex items-center justify-between w-full text-[11px] font-mono uppercase tracking-[0.25em] text-[#C27D4B] border-b border-[#C27D4B]/20 pb-3">
              <span>FLAGSHIP LUXURY FLEET</span>
              <span className="text-[#F4F2EE]/50">Rolls-Royce Ghost Extended V12</span>
            </div>

            {/* WebGL 2.5D Lit Stage showing Rolls-Royce Ghost emerging under copper rim-light */}
            <div className="w-full max-w-4xl shadow-2xl border border-[#C27D4B]/30">
              <WebGLLitStage
                imageSrc="/images/rolls-royce-ghost.webp"
                alt="Rolls-Royce Ghost Operating Lease"
                assetTitle="Rolls-Royce Ghost Extended V12"
                assetCategory="Luxury Corporate Fleet"
                aspectRatio="16/9"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-xs font-mono text-[#F4F2EE]/70">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C27D4B] animate-pulse" />
                <span>Zero Capex Debt • 100% Tax Deductible OPEX under Sec 37(1)</span>
              </div>
              <div className="text-[#C27D4B] uppercase tracking-wider font-semibold">
                SCROLL TO EXPLORE ↓
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
