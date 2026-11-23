'use client';

import React from 'react';

interface DaylightShaderBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  intensity?: number;
}

/**
 * Pure Architectural Limestone Canvas
 * Serene, unobstructed Warm Limestone (#F4F2EE) surface with subtle tactile matte paper/stone micro-grain.
 * Zero CPU/GPU rendering overhead, leaving the hero typography to command the space completely.
 */
export default function DaylightShaderBackground({
  children,
  className = '',
}: DaylightShaderBackgroundProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#F4F2EE] ${className}`}
      style={{
        backgroundColor: '#F4F2EE',
      }}
    >
      {/* Ultra-fine tactile matte paper/stone micro-grain (2.5% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
}
