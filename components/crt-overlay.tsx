"use client";

import { useSyncExternalStore, type CSSProperties } from "react";

/**
 * CRT screen overlay — scanlines, phosphor flicker, vignette, RGB fringe.
 *
 * Disabled on touch / coarse-pointer devices: iOS Safari has paint bugs with
 * mix-blend-mode + full-screen fixed layers (content under them can stay
 * invisible until a reflow such as focusing an input / typing).
 */
function subscribeFinePointer(cb: () => void) {
  const q = window.matchMedia("(hover: hover) and (pointer: fine)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

function isDesktopFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function CrtOverlay({
  intensity = 1,
  className = "",
}: {
  intensity?: number;
  className?: string;
}) {
  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    isDesktopFinePointer,
    () => false
  );

  if (!enabled) return null;

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
