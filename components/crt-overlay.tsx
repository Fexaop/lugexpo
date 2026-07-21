"use client";

import type { CSSProperties } from "react";

/**
 * CRT screen overlay — scanlines, phosphor flicker, vignette, RGB fringe.
 * Full-viewport, pointer-events none so UI stays clickable.
 */
export function CrtOverlay({
  intensity = 1,
  className = "",
}: {
  /** 0–1 strength */
  intensity?: number;
  className?: string;
}) {
  const a = Math.min(1, Math.max(0, intensity));

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] overflow-hidden ${className}`}
      aria-hidden
      style={{ "--crt-a": a } as CSSProperties}
    >
      {/* Barrel / curved glass dark edges */}
      <div className="crt-vignette absolute inset-0" />

      {/* Horizontal scanlines */}
      <div className="crt-scanlines absolute inset-0" />

      {/* RGB subpixel grid (fine aperture grille) */}
      <div className="crt-grille absolute inset-0" />

      {/* Rolling bright scan bar */}
      <div className="crt-roll absolute inset-x-0 h-24" />

      {/* Phosphor flicker */}
      <div className="crt-flicker absolute inset-0" />

      {/* Soft chromatic fringe on edges */}
      <div className="crt-chroma absolute inset-0" />

      {/* Screen glass reflection */}
      <div className="crt-glass absolute inset-0" />
    </div>
  );
}
