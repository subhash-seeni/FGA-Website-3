'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface SmoothScrollContextType {
  velocityRef: React.MutableRefObject<number>;
  lenisRef: React.MutableRefObject<Lenis | null>;
  scrollTo: (target: string | number | HTMLElement, options?: Record<string, unknown>) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);

export function useScrollVelocity(): React.MutableRefObject<number> {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    // Provide a fallback dummy ref if used outside provider
    const dummyRef = { current: 0 };
    return dummyRef;
  }
  return ctx.velocityRef;
}

export function useSmoothScroll(): SmoothScrollContextType {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error('useSmoothScroll must be used within SmoothScrollProvider');
  }
  return ctx;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const velocityRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.01 : 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
    });

    lenisRef.current = lenis;

    // Connect Lenis scroll to ScrollTrigger and update shared velocity ref
    lenis.on('scroll', (e: { velocity: number }) => {
      ScrollTrigger.update();
      velocityRef.current = typeof e.velocity === 'number' ? e.velocity : 0;
    });

    // Sync GSAP ticker with Lenis raf
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      velocityRef.current = 0;
    };
  }, []);

  // Reset scroll and refresh ScrollTrigger on route transition
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  const scrollTo = (target: string | number | HTMLElement, options?: Record<string, unknown>) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ velocityRef, lenisRef, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
