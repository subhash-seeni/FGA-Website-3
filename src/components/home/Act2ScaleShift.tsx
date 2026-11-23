'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import WebGLLitStage from '@/components/WebGLLitStage';

gsap.registerPlugin(ScrollTrigger);

interface ChapterData {
  number: string;
  category: string;
  headline: string;
  description: string;
  asset1: { name: string; price: string; tenure: string; image: string };
  asset2: { name: string; price: string; tenure: string; image: string };
  flagshipImage: string;
}

const chapters: ChapterData[] = [
  {
    number: '01',
    category: 'LUXURY FLEET',
    headline: 'Executive Sovereign Presence.',
    description:
      'Curated executive fleet solutions designed for corporate headquarters and diplomatic protocols. Off-balance sheet capital efficiency with comprehensive manufacturer warranty, scheduled maintenance, and white-glove replacement contingencies.',
    asset1: {
      name: 'Mercedes-Benz S-Class Saloon',
      price: 'FROM ₹1,65,000 / MO',
      tenure: '24–36 Months',
      image: '/images/mercedes-benz-s-class.webp',
    },
    asset2: {
      name: 'Audi A8 L Quattro Executive',
      price: 'FROM ₹1,55,000 / MO',
      tenure: '24–48 Months',
      image: '/images/audi-a8-l.jpg',
    },
    flagshipImage: '/images/mercedes-benz-s-class.webp',
  },
  {
    number: '02',
    category: 'CONSTRUCTION & WAREHOUSE',
    headline: 'Heavy Industrial Infrastructure.',
    description:
      'Heavy industrial and earthmoving machinery engineered for major EPC contractors, logistics hubs, and ports across Gujarat and Western India. Zero downtime SLAs backed by dedicated on-site telematics and field technicians.',
    asset1: {
      name: 'Komatsu Excavator PC200',
      price: 'FROM ₹1,10,000 / MO',
      tenure: '18–36 Months',
      image: '/images/komatsu-excavator-pc200.webp',
    },
    asset2: {
      name: 'Toyota 5T Electric Forklift',
      price: 'FROM ₹48,000 / MO',
      tenure: '24–36 Months',
      image: '/images/toyota-5t-forklift.webp',
    },
    flagshipImage: '/images/komatsu-excavator-pc200.webp',
  },
  {
    number: '03',
    category: 'ENTERPRISE IT HARDWARE',
    headline: 'Silicon Compute & Workforces.',
    description:
      'Enterprise compute clusters, NVMe storage arrays, and high-density workforce fleets deployed with SLA-backed replacement. Protect working capital while eliminating electronic equipment obsolescence and e-waste disposal liabilities.',
    asset1: {
      name: 'Dell PowerEdge R750 Server',
      price: 'FROM ₹38,000 / MO',
      tenure: '24–36 Months',
      image: '/images/dell-poweredge-r750-server.webp',
    },
    asset2: {
      name: 'NetApp AFF A250 All-Flash Storage',
      price: 'FROM ₹62,000 / MO',
      tenure: '24–36 Months',
      image: '/images/netapp-aff-a250-storage.webp',
    },
    flagshipImage: '/images/dell-poweredge-r750-server.webp',
  },
];

export default function Act2ScaleShift() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const lightSweepRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: Pinned 300vh scrubbed timeline
      mm.add('(min-width: 768px)', () => {
        const pinTarget = pinTargetRef.current;
        const progressLine = progressLineRef.current;
        const lightSweep = lightSweepRef.current;

        if (!pinTarget) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=300%',
            pin: pinTarget,
            scrub: 0.3,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (progressLine) {
                progressLine.style.height = `${p * 100}%`;
              }
              const newIdx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
              setActiveChapterIndex((prev) => (prev !== newIdx ? newIdx : prev));
            },
          },
        });

        // Chapter 1 to 2 transition light sweep
        tl.to({}, { duration: 1 });
        tl.to(lightSweep, {
          opacity: 0.8,
          duration: 0.15,
          yPercent: 0,
          ease: 'power2.in',
        });
        tl.to(lightSweep, {
          opacity: 0,
          duration: 0.25,
          yPercent: 100,
          ease: 'power2.out',
        });

        // Chapter 2 to 3 transition light sweep
        tl.to({}, { duration: 1 });
        tl.fromTo(
          lightSweep,
          { opacity: 0, yPercent: -100 },
          {
            opacity: 0.8,
            duration: 0.15,
            yPercent: 0,
            ease: 'power2.in',
          }
        );
        tl.to(lightSweep, {
          opacity: 0,
          duration: 0.25,
          yPercent: 100,
          ease: 'power2.out',
        });
        tl.to({}, { duration: 1 });
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  const currentChapter = chapters[activeChapterIndex];

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#0E0F11] text-[#F4F2EE] select-none border-b border-[#C27D4B]/20"
      id="verticals"
      data-nav-theme="dark"
    >
      {/* Pinned Desktop Container */}
      <div
        ref={pinTargetRef}
        className="relative w-full min-h-screen flex items-center justify-center p-6 sm:p-10 md:p-16 overflow-hidden"
      >
        {/* Subtle background architectural grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #C27D4B 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Copper Light Sweep Overlay */}
        <div
          ref={lightSweepRef}
          className="absolute inset-0 pointer-events-none z-40 bg-gradient-to-b from-transparent via-[#C27D4B]/20 to-transparent opacity-0 transform -translate-y-full"
        />

        {/* Inner Content Grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Vertical 1px Copper Progress Indicator (Far Left Desktop) */}
          <div className="hidden md:flex md:col-span-1 flex-col items-center justify-between h-[420px] border-r border-[#C27D4B]/20 pr-6">
            <div className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-widest -rotate-90 origin-bottom">
              PORTFOLIOS
            </div>

            {/* Vertical Bar */}
            <div className="relative w-[1px] h-48 bg-white/10 my-4 overflow-hidden">
              <div
                ref={progressLineRef}
                className="w-full bg-[#C27D4B] transition-all duration-100 ease-out shadow-[0_0_8px_#C27D4B]"
                style={{ height: `${(activeChapterIndex / 2) * 100}%` }}
              />
            </div>

            {/* Chapter Indicators */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.number}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`transition-colors font-semibold ${
                    activeChapterIndex === idx ? 'text-[#C27D4B]' : 'text-white/30 hover:text-white'
                  }`}
                >
                  {ch.number}
                </button>
              ))}
            </div>
          </div>

          {/* Left Column: Vertical Narrative & Prices */}
          <div className="md:col-span-5 flex flex-col justify-center">
            {/* Top Chapter Tag */}
            <div className="flex items-center gap-3 text-xs font-mono tracking-[0.25em] text-[#C27D4B] uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C27D4B]" />
              <span>
                {currentChapter.category}
              </span>
            </div>

            <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F4F2EE] leading-tight">
              {currentChapter.headline}
            </h2>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-sans text-[#F4F2EE]/70 leading-relaxed max-w-lg">
              {currentChapter.description}
            </p>

            {/* Mobile-only switcher tabs (Prominently placed above asset cards for fast touch switching) */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2 mt-5">
              {chapters.map((ch, idx) => (
                <button
                  key={ch.number}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`flex-1 min-h-[44px] px-2 py-2.5 text-[11px] font-mono uppercase tracking-wider transition-all border flex items-center justify-center ${
                    activeChapterIndex === idx
                      ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B] shadow-md'
                      : 'bg-[#17191D] text-white/60 border-white/10 active:bg-white/5'
                  }`}
                >
                  {ch.number} {ch.category.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Two Key Assets Featured */}
            <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-[#C27D4B]/20 space-y-3 sm:space-y-4">
              {/* Asset 1 */}
              <div className="p-3.5 sm:p-4 bg-[#17191D] border border-white/[0.08] hover:border-[#C27D4B]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div>
                  <div className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-wider">
                    FLAGSHIP MODEL
                  </div>
                  <div className="font-sans font-semibold text-sm sm:text-base text-[#F4F2EE]">
                    {currentChapter.asset1.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#F4F2EE]/50">
                    Tenure: {currentChapter.asset1.tenure}
                  </div>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 border-white/[0.06] pt-1.5 sm:pt-0">
                  <div className="font-mono text-xs sm:text-sm font-bold text-[#C27D4B]">
                    {currentChapter.asset1.price}
                  </div>
                  <div className="text-[9px] font-mono text-[#F4F2EE]/40 uppercase">
                    Off-Balance Sheet
                  </div>
                </div>
              </div>

              {/* Asset 2 */}
              <div className="p-3.5 sm:p-4 bg-[#17191D] border border-white/[0.08] hover:border-[#C27D4B]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div>
                  <div className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-wider">
                    HIGH-DEMAND FLEET
                  </div>
                  <div className="font-sans font-semibold text-sm sm:text-base text-[#F4F2EE]">
                    {currentChapter.asset2.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#F4F2EE]/50">
                    Tenure: {currentChapter.asset2.tenure}
                  </div>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 border-white/[0.06] pt-1.5 sm:pt-0">
                  <div className="font-mono text-xs sm:text-sm font-bold text-[#C27D4B]">
                    {currentChapter.asset2.price}
                  </div>
                  <div className="text-[9px] font-mono text-[#F4F2EE]/40 uppercase">
                    Zero Capex Down
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: WebGL Lit Stage */}
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#C27D4B] uppercase tracking-widest px-1">
              <span>{currentChapter.category}</span>
              <span className="text-[#F4F2EE]/40">48-Hour SLA</span>
            </div>

            <div className="relative shadow-2xl border border-[#C27D4B]/30 bg-[#17191D] overflow-hidden">
              <WebGLLitStage
                key={currentChapter.flagshipImage}
                imageSrc={currentChapter.flagshipImage}
                alt={currentChapter.headline}
                assetTitle={currentChapter.asset1.name}
                assetCategory={currentChapter.category}
                aspectRatio="16/10"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#F4F2EE]/50 uppercase tracking-widest pt-1">
              <span>Ahmedabad Hub Inventory</span>
              <span className="text-[#C27D4B]">Sec 37(1) Tax Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
