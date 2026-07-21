"use client";

import type { CSSProperties } from "react";

/**
 * CRT overlay matching Balatro-style TV options:
 * scanlines, bloom, edge bend (barrel vignette + curved bezel),
 * pixel shadows, RGB fringe, rolling scan.
 */
export function CrtOverlay({
  intensity = 1,
  bloom = true,
  className = "",
}: {
  intensity?: number;
  bloom?: boolean;
  className?: string;
}) {
  const a = Math.min(1, Math.max(0, intensity));

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden ${className}`}
      aria-hidden
      style={{ "--crt-a": a } as CSSProperties}
    >
      {/* SVG barrel / edge warp mask hints + defs used by page shell */}
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter
            id="crt-barrel"
            x="-8%"
            y="-8%"
            width="116%"
            height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="1"
              result="noise"
              seed="2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={6 * a}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <radialGradient id="crt-bend-grad" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>
        </defs>
      </svg>

      {/* Curved CRT bezel (screen bends into dark corners) */}
      <div className="crt-bezel absolute inset-0" />
      <div className="crt-barrel-edge absolute inset-0" />

      {/* CRT Bloom */}
      {bloom && <div className="crt-bloom absolute inset-0" />}

      <div className="crt-vignette absolute inset-0" />
      <div className="crt-scanlines absolute inset-0" />
      <div className="crt-grille absolute inset-0" />
      <div className="crt-roll absolute inset-x-0 h-28" />
      <div className="crt-flicker absolute inset-0" />
      <div className="crt-chroma absolute inset-0" />
      <div className="crt-glass absolute inset-0" />
    </div>
  );
}
