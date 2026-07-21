"use client";

import type { CSSProperties } from "react";

/**
 * CRT screen overlay — scanlines, phosphor flicker, vignette, RGB fringe.
 * Full-viewport, pointer-events none so UI stays clickable.
 * Enabled on all devices (including phone).
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
      <div className="crt-vignette absolute inset-0" />
      <div className="crt-scanlines absolute inset-0" />
      <div className="crt-grille absolute inset-0" />
      <div className="crt-roll absolute inset-x-0 h-24" />
      <div className="crt-flicker absolute inset-0" />
      <div className="crt-chroma absolute inset-0" />
      <div className="crt-glass absolute inset-0" />
    </div>
  );
}
