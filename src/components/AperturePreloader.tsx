'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface AperturePreloaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function AperturePreloader({ onComplete, forceShow = false }: AperturePreloaderProps) {
  // Start with true immediately so the opaque preloader renders on initial paint/SSR
  // preventing any flash of the underlying hero banner
  const [shouldRender, setShouldRender] = useState(() => {
    if (forceShow) return true;
    if (typeof window !== 'undefined') {
      try {
        return !sessionStorage.getItem('fga_aperture_seen');
      } catch {
        return true;
      }
    }
    return true;
  });
  const [hours, setHours] = useState('00.00');
  const [progressPercent, setProgressPercent] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const topShutterRef = useRef<HTMLDivElement>(null);
  const bottomShutterRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If not in forceShow mode, check sessionStorage
    try {
      const seen = sessionStorage.getItem('fga_aperture_seen');
      if (seen && !forceShow) {
        setShouldRender(false);
        if (onComplete) onComplete();
        return;
      }
    } catch {
      // ignore storage errors
    }
  }, [forceShow, onComplete]);

  useEffect(() => {
    if (!shouldRender) return;

    // Prevent body scroll during preloader
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const counterObj = { val: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem('fga_aperture_seen', 'true');
          } catch {
            // ignore
          }
          document.body.style.overflow = originalOverflow;
          if (onComplete) onComplete();
          // Fade out and remove from DOM
          gsap.to(containerRef.current, {
            display: 'none',
            duration: 0.1,
          });
        },
      });

      // Progress animation (takes ~1.8 seconds)
      tl.to(counterObj, {
        val: 48,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const currentVal = counterObj.val;
          const formatted = currentVal.toFixed(2).padStart(5, '0');
          setHours(formatted);
          setProgressPercent(Math.min(100, (currentVal / 48) * 100));
        },
      });

      // Brief hold at 48.00 HRS
      tl.to({}, { duration: 0.18 });

      // Fade out content details
      tl.to(
        contentRef.current,
        {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: 'power2.in',
        },
        '+=0.05'
      );

      // Line expand & flash
      tl.to(
        lineRef.current,
        {
          scaleY: 2,
          opacity: 0.8,
          duration: 0.2,
          ease: 'power1.out',
        },
        '-=0.2'
      );

      // Aperture split: top panel moves up, bottom panel moves down
      tl.to(
        topShutterRef.current,
        {
          yPercent: -100,
          duration: 0.85,
          ease: 'expo.inOut',
        },
        'shutter'
      );

      tl.to(
        bottomShutterRef.current,
        {
          yPercent: 100,
          duration: 0.85,
          ease: 'expo.inOut',
        },
        'shutter'
      );

      tl.to(
        lineRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
        },
        'shutter'
      );
    }, containerRef);

    return () => {
      document.body.style.overflow = originalOverflow;
      ctx.revert();
    };
  }, [shouldRender, onComplete]);

  if (!shouldRender) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden bg-[#0E0F11]"
      style={{ zIndex: 99999, backgroundColor: '#0E0F11' }}
      aria-label="Aperture Preloader"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Shutter Half */}
      <div
        ref={topShutterRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#0E0F11] border-b border-[#C27D4B]/20 will-change-transform z-10 flex flex-col justify-between p-6 sm:p-10"
      >
        <div className="flex justify-between items-start text-[10px] tracking-widest text-[#F4F2EE]/50 font-mono uppercase">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-[#C27D4B]" />
            <span>Firstgen Assets Pvt. Ltd.</span>
          </div>
          <span className="hidden sm:inline">Ahmedabad • Gujarat</span>
        </div>
        <div className="text-[10px] tracking-[0.2em] text-[#C27D4B] font-mono uppercase">
          Operating Lease Infrastructure
        </div>
      </div>

      {/* Center 1px Brushed Copper Progress Line */}
      <div
        ref={lineRef}
        className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 z-30 pointer-events-none bg-[#17191D]"
      >
        <div
          className="h-full bg-[#C27D4B] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(194,125,75,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Bottom Shutter Half */}
      <div
        ref={bottomShutterRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#0E0F11] border-t border-[#C27D4B]/20 will-change-transform z-10 flex flex-col justify-between p-6 sm:p-10"
      >
        <div className="text-[10px] tracking-[0.2em] text-[#F4F2EE]/40 font-mono uppercase">
          Protocol: Off-Balance Sheet Capital
        </div>
        <div className="flex justify-between items-end text-[10px] tracking-widest text-[#F4F2EE]/40 font-mono uppercase">
          <span>Gujarat State Jurisdiction</span>
          <span className="text-[#C27D4B]">SLA Window: 48.00 HRS</span>
        </div>
      </div>

      {/* Central Counter and Status Content (sits in the middle across both shutters) */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none text-center px-6"
      >
        <div className="mb-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#C27D4B] uppercase">
            Deployment Protocol
          </span>
        </div>

        {/* Monospace 48.00 HRS counter */}
        <div className="flex items-baseline gap-2 font-mono text-4xl sm:text-6xl md:text-7xl font-light text-[#F4F2EE] tracking-tight">
          <span>{hours}</span>
          <span className="text-sm sm:text-base tracking-[0.2em] text-[#C27D4B] font-mono font-medium uppercase">
            HRS
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] font-mono text-[#F4F2EE]/60 tracking-wider">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C27D4B] animate-pulse" />
          <span>Synchronizing Operating Fleet Telemetry</span>
          <span className="text-[#C27D4B]">[{Math.round(progressPercent)}%]</span>
        </div>
      </div>
    </div>
  );
}
