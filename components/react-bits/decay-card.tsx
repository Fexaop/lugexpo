"use client";

import React, { useEffect, useId, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

interface DecayCardProps {
  width?: number | string;
  height?: number | string;
  image?: string;
  baseFrequency?: number;
  numOctaves?: number;
  seed?: number;
  maxDisplacement?: number;
  movementBound?: number;
  /** Only animate when pointer is over this card (default true). */
  hoverOnly?: boolean;
  className?: string;
  textClassName?: string;
  children?: ReactNode;
}

/** React Bits — Decay Card (https://reactbits.dev/components/decay-card) */
const DecayCard: React.FC<DecayCardProps> = ({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 100,
  movementBound = 24,
  hoverOnly = true,
  className = "",
  textClassName = "",
  children,
}) => {
  const filterId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const activeRef = useRef(false);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const prevPointer = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Skip heavy motion on touch-primary devices
    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const imgValues = {
      x: 0,
      y: 0,
      rz: 0,
      displacementScale: 0,
    };

    const setActive = (on: boolean) => {
      activeRef.current = on;
      if (!on) {
        // Reset pointer delta so displacement eases out
        prevPointer.current = { ...pointer.current };
      }
    };

    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);

    const onMove = (ev: PointerEvent) => {
      if (hoverOnly && !activeRef.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      pointer.current = {
        x: (ev.clientX - rect.left) / rect.width,
        y: (ev.clientY - rect.top) / rect.height,
      };
      if (!hoverOnly) setActive(true);
    };

    if (!reduceMotion) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointermove", onMove);
    }

    let rafId = 0;

    const render = () => {
      const active = !reduceMotion && activeRef.current;

      // Local tilt from pointer position inside the card (0–1 → -bound…bound)
      const targetX = active
        ? (pointer.current.x - 0.5) * 2 * movementBound
        : 0;
      const targetY = active
        ? (pointer.current.y - 0.5) * 2 * movementBound
        : 0;
      const targetRz = active ? (pointer.current.x - 0.5) * 2 * 6 : 0;

      imgValues.x = lerp(imgValues.x, targetX, 0.12);
      imgValues.y = lerp(imgValues.y, targetY, 0.12);
      imgValues.rz = lerp(imgValues.rz, targetRz, 0.12);

      gsap.set(el, {
        x: imgValues.x,
        y: imgValues.y,
        rotateZ: imgValues.rz,
      });

      const dx = (pointer.current.x - prevPointer.current.x) * 400;
      const dy = (pointer.current.y - prevPointer.current.y) * 400;
      const travel = active ? Math.hypot(dx, dy) : 0;
      const targetDisp = Math.min(
        maxDisplacement,
        (travel / 200) * maxDisplacement
      );

      imgValues.displacementScale = lerp(
        imgValues.displacementScale,
        targetDisp,
        0.08
      );

      if (displacementMapRef.current) {
        gsap.set(displacementMapRef.current, {
          attr: { scale: imgValues.displacementScale },
        });
      }

      prevPointer.current = { ...pointer.current };
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [maxDisplacement, movementBound, hoverOnly]);

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
  };
  if (height !== "auto") {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={`relative touch-manipulation ${className}`}
      style={style}
      ref={rootRef}
    >
      <svg
        viewBox="-60 -75 720 900"
        preserveAspectRatio="xMidYMid slice"
        className="relative block h-full w-full will-change-transform"
      >
        <filter id={filterId}>
          <feTurbulence
            type="turbulence"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={seed}
            stitchTiles="stitch"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            result="turbulence1"
          />
          <feDisplacementMap
            ref={displacementMapRef}
            in="SourceGraphic"
            in2="turbulence1"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="B"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            result="displacementMap3"
          />
        </filter>
        <g>
          <image
            href={image}
            x="0"
            y="0"
            width="600"
            height="750"
            filter={`url(#${filterId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
      <div
        className={
          textClassName ||
          "pointer-events-none absolute inset-0 flex flex-col justify-end p-5"
        }
      >
        {children}
      </div>
    </div>
  );
};

export default DecayCard;
