'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useScrollVelocity } from './SmoothScrollProvider';
import { getAssetPath } from '@/lib/basePath';

interface WebGLLitStageProps {
  imageSrc: string;
  depthSrc?: string;
  alt?: string;
  className?: string;
  assetTitle?: string;
  assetCategory?: string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1"
}

// Custom Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  uniform float u_velocity;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Subtle optical inertia on vertical axis during high velocity scroll
    float stretch = clamp(u_velocity * 0.0008, -0.06, 0.06);
    pos.y += stretch * (uv.y - 0.5);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Custom Fragment Shader with Brushed-Copper Key Light, Luminance Specular, Velocity Dispersion, and 35mm Grain
const fragmentShader = `
  uniform sampler2D u_texture;
  uniform sampler2D u_depthTexture;
  uniform bool u_hasDepth;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_velocity;
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;
  varying vec2 vUv;

  // Ultra-fine 35mm analog film grain
  float randomGrain(vec2 p, float t) {
    vec2 K1 = vec2(
      23.14069263277926, // e^pi (transcendental)
      2.665144142690225 // 2^sqrt(2) (algebraic)
    );
    return fract(cos(dot(p + vec2(t * 0.012, t * 0.007), K1)) * 12345.6789);
  }

  void main() {
    // Preserve aspect ratio inside plane (cover behavior)
    vec2 ratio = vec2(
      min((u_resolution.x / u_resolution.y) / (u_imageResolution.x / u_imageResolution.y), 1.0),
      min((u_resolution.y / u_resolution.x) / (u_imageResolution.y / u_imageResolution.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    // Subtle scroll velocity chromatic aberration & optical micro edge blur
    float vel = clamp(abs(u_velocity) * 0.0006, 0.0, 0.012);
    vec4 colR = texture2D(u_texture, uv + vec2(0.0, vel * 0.4));
    vec4 colG = texture2D(u_texture, uv);
    vec4 colB = texture2D(u_texture, uv - vec2(0.0, vel * 0.4));
    vec4 texColor = vec4(colR.r, colG.g, colB.b, colG.a);

    // Calculate luminance
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

    // Brushed copper color (#C27D4B -> rgb(0.761, 0.490, 0.294))
    vec3 copperColor = vec3(0.761, 0.490, 0.294);

    // Tight, ultra-subtle cursor-driven specular glint
    // Capped around 0.08–0.11, tight radius, blended strictly onto bright metallic highlights
    vec2 lightPos = u_mouse * 0.5 + 0.5; // map -1..1 to 0..1
    float dist = length(uv - lightPos);

    // Tight specular beam with rapid falloff
    float tightGlint = pow(max(0.0, 1.0 - dist * 2.2), 14.0);

    // Luminance masking: only active on bright metallic chrome/paint highlights, ZERO shadow wash
    float highlightMask = smoothstep(0.40, 0.85, luminance);
    float glintFactor = tightGlint * highlightMask * 0.12;

    // Combine sampled texture with subtle copper glint
    vec3 litColor = texColor.rgb + (copperColor * glintFactor);

    // 1. Color Management (Linear to sRGB Gamma Correction):
    // Three.js r174 texture sampler decodes sRGB textures into linear space (x^2.2).
    // In a custom ShaderMaterial without post-processing, failing to convert back to sRGB (x^(1/2.2))
    // causes double-gamma dark crushing where midtones and vehicle shadows drop into pure black.
    vec3 srgbColor = pow(max(litColor, vec3(0.0)), vec3(1.0 / 2.2));

    // 2. Architectural Studio Shadow Detail Recovery:
    // Gently lifts shadowed coachwork, car doors, wheel spokes, and machine chassis
    // while keeping pure obsidian background black anchored (0.0 remains 0.0).
    srgbColor = pow(srgbColor, vec3(0.84));

    // 3. Ultra-fine 35mm film grain (delicate 1.4% tactile overlay)
    float grain = (randomGrain(uv * u_resolution * 0.35, u_time) - 0.5) * 0.014;
    srgbColor += vec3(grain);

    // Output with crisp punchy contrast
    srgbColor = clamp(srgbColor, 0.0, 1.0);
    gl_FragColor = vec4(srgbColor, texColor.a);
  }
`;

export default function WebGLLitStage({
  imageSrc,
  depthSrc,
  alt = 'Firstgen Asset Photography',
  className = '',
  assetTitle,
  assetCategory,
  aspectRatio = '16/10',
}: WebGLLitStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityRef = useScrollVelocity();

  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to generate procedural matte-obsidian architectural placeholder
  const createPlaceholderTexture = useCallback((title?: string, category?: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Matte obsidian base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#121417');
      bgGrad.addColorStop(0.5, '#0E0F11');
      bgGrad.addColorStop(1, '#08090A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Subtle architectural studio rim-light gradient at top edge
      const rimGrad = ctx.createLinearGradient(0, 0, 0, 320);
      rimGrad.addColorStop(0, 'rgba(194, 125, 75, 0.28)');
      rimGrad.addColorStop(0.3, 'rgba(194, 125, 75, 0.08)');
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(0, 0, canvas.width, 320);

      // 3. Architectural grid lines
      ctx.strokeStyle = 'rgba(194, 125, 75, 0.12)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 4. Hairline decorative technical crosshairs
      ctx.strokeStyle = '#C27D4B';
      ctx.lineWidth = 1.5;
      const drawCross = (cx: number, cy: number, size = 14) => {
        ctx.beginPath();
        ctx.moveTo(cx - size, cy);
        ctx.lineTo(cx + size, cy);
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx, cy + size);
        ctx.stroke();
      };
      drawCross(120, 120);
      drawCross(canvas.width - 120, 120);
      drawCross(120, canvas.height - 120);
      drawCross(canvas.width - 120, canvas.height - 120);

      // 5. Typography specs
      ctx.fillStyle = '#C27D4B';
      ctx.font = '500 20px monospace';
      ctx.fillText('FIRSTGEN ASSETS PRIVATE LIMITED', 120, 180);

      ctx.fillStyle = 'rgba(244, 242, 238, 0.45)';
      ctx.font = '400 16px monospace';
      ctx.fillText(
        `OPERATING LEASE SPECIFICATION · ${category ? category.toUpperCase() : 'ASSET INFRASTRUCTURE'}`,
        120,
        215
      );

      ctx.fillStyle = '#F4F2EE';
      ctx.font = '600 48px sans-serif';
      ctx.fillText(title || 'CORPORATE ASSET SPECIFICATION', 120, canvas.height / 2);

      ctx.fillStyle = 'rgba(244, 242, 238, 0.6)';
      ctx.font = '400 18px monospace';
      ctx.fillText('FIRSTGEN ASSETS · AHMEDABAD FLEET INVENTORY', 120, canvas.height / 2 + 50);

      // 6. Bottom footer telemetry
      ctx.fillStyle = '#C27D4B';
      ctx.font = '400 15px monospace';
      ctx.fillText('AHMEDABAD HUB • GUJARAT JURISDICTION • 48-HR SLA DISPATCH', 120, canvas.height - 140);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch {
      setHasWebGLError(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Uniforms
    const uniforms = {
      u_texture: { value: null as THREE.Texture | null },
      u_depthTexture: { value: null as THREE.Texture | null },
      u_hasDepth: { value: false },
      u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
      u_time: { value: 0 },
      u_velocity: { value: 0 },
      u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      u_imageResolution: { value: new THREE.Vector2(16, 10) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Texture Loader with placeholder fallback
    const loader = new THREE.TextureLoader();
    let isDisposed = false;

    const applyTexture = (texture: THREE.Texture, width: number, height: number) => {
      if (isDisposed) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      uniforms.u_texture.value = texture;
      uniforms.u_imageResolution.value.set(width, height);
      material.needsUpdate = true;
      setIsLoaded(true);
    };

    // Attempt to load provided imageSrc
    loader.load(
      getAssetPath(imageSrc),
      (tex) => {
        applyTexture(tex, tex.image.width || 16, tex.image.height || 10);
      },
      undefined,
      () => {
        // Fallback: create refined procedural matte-obsidian canvas texture
        const placeholderTex = createPlaceholderTexture(assetTitle, assetCategory);
        applyTexture(placeholderTex, 1600, 1000);
      }
    );

    // Optional Depth Texture
    if (depthSrc) {
      loader.load(
        getAssetPath(depthSrc),
        (depthTex) => {
          if (isDisposed) return;
          uniforms.u_depthTexture.value = depthTex;
          uniforms.u_hasDepth.value = true;
        },
        undefined,
        () => {
          uniforms.u_hasDepth.value = false;
        }
      );
    }

    // Mouse pointer tracking
    const targetMouse = new THREE.Vector2(0, 0);
    const currentMouse = new THREE.Vector2(0, 0);

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.set(normX, normY);
    };

    const handlePointerLeave = () => {
      targetMouse.set(0, 0);
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    // Resize handling
    const resize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height, false);
      uniforms.u_resolution.value.set(width, height);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    // Render loop with IntersectionObserver to pause offscreen stages
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let currentVelocity = 0;
    let isVisible = true;

    const render = () => {
      if (!isVisible || isDisposed) return;

      const elapsedTime = clock.getElapsedTime();
      uniforms.u_time.value = elapsedTime;

      // Mouse lerp
      if (!prefersReducedMotion) {
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08;
        uniforms.u_mouse.value.copy(currentMouse);

        // Velocity lerp
        const targetVelocity = velocityRef.current;
        currentVelocity += (targetVelocity - currentVelocity) * 0.1;
        uniforms.u_velocity.value = currentVelocity;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !isDisposed) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { rootMargin: '100px' }
    );
    intersectionObserver.observe(container);

    render();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);

      if (uniforms.u_texture.value) {
        uniforms.u_texture.value.dispose();
      }
      if (uniforms.u_depthTexture.value) {
        uniforms.u_depthTexture.value.dispose();
      }
      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [imageSrc, depthSrc, assetTitle, assetCategory, createPlaceholderTexture, velocityRef]);

  // Graceful degradation fallback if WebGL fails
  if (hasWebGLError) {
    return (
      <div
        className={`relative overflow-hidden bg-[#0E0F11] border border-[#C27D4B]/20 ${className}`}
        style={{ aspectRatio }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getAssetPath(imageSrc)}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image and keep dark obsidian container
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#C27D4B] uppercase tracking-widest">
          {assetTitle || 'Firstgen Asset Photography'}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#0E0F11] border border-[#C27D4B]/20 select-none group ${className}`}
      style={{ aspectRatio }}
      aria-label={alt}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Subtle hairline frame corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#C27D4B]/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#C27D4B]/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#C27D4B]/60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#C27D4B]/60 pointer-events-none" />

      {/* Loading state indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0E0F11] flex items-center justify-center text-xs font-mono text-[#C27D4B] tracking-widest">
          LOADING ASSET...
        </div>
      )}
    </div>
  );
}
