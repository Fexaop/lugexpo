"use client";

import { useSyncExternalStore } from "react";
import { CtfList } from "@/components/ctf-list";
import Balatro from "@/components/react-bits/balatro";

function subscribeFinePointer(cb: () => void) {
  const q = window.matchMedia("(hover: hover) and (pointer: fine)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

function isDesktopFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * WebGL Balatro bg is desktop-only.
 * On iPhone, a full-viewport WebGL canvas under filtered/blended layers
 * commonly breaks compositing (UI unpainted until typing reflow).
 */
export default function Home() {
  const desktop = useSyncExternalStore(
    subscribeFinePointer,
    isDesktopFinePointer,
    () => false
  );

  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {desktop ? (
          <Balatro
            className="h-full w-full"
            color1="#DE443B"
            color2="#006BB4"
            color3="#0a1213"
            contrast={3.8}
            lighting={0.45}
            spinSpeed={5.5}
            spinAmount={0.28}
            isRotate={false}
            mouseInteraction
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_30%_20%,#3a1520_0%,transparent_50%),radial-gradient(ellipse_at_70%_80%,#0a2a40_0%,transparent_45%),linear-gradient(165deg,#0a1213_0%,#05080a_100%)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,10,0.55)_70%,rgba(5,8,10,0.88)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <CtfList />
      </div>
    </main>
  );
}
