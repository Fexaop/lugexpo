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
  /**
   * When true (default), only this card reacts while the pointer is over it.
   * When false, tracks window mouse like the stock React Bits demo.
   */
  hoverOnly?: boolean;
  className?: string;
  textClassName?: string;
  children?: ReactNode;
}

/**
 * React Bits — Decay Card
 * https://reactbits.dev/components/decay-card
 *
 * Outer frame stays fixed (border + layout box). Transform + displacement
 * apply only to the inner media layer so motion stays clipped inside the card.
 */
const DecayCard: React.FC<DecayCardProps> = ({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 520,
  movementBound = 28,
  hoverOnly = true,
  className = "",
  textClassName = "",
  children,
}) => {
  const filterId = useId().replace(/:/g, "");
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const activeRef = useRef(!hoverOnly);

  const cursor = useRef({ x: 0, y: 0 });
  const cachedCursor = useRef({ x: 0, y: 0 });
  const winsize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;

    cursor.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    cachedCursor.current = { ...cursor.current };
    winsize.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    activeRef.current = !hoverOnly;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const map = (x: number, a: number, b: number, c: number, d: number) =>
      ((x - a) * (d - c)) / (b - a) + c;
    const distance = (x1: number, x2: number, y1: number, y2: number) =>
      Math.hypot(x1 - x2, y1 - y2);

    const handleResize = () => {
      winsize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    const handleMouseMove = (ev: MouseEvent) => {
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    const handlePointerMove = (ev: PointerEvent) => {
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    const release = () => {
      if (!hoverOnly) return;
      activeRef.current = false;
      // Snap motion back so the card never stays shifted over UI below
      cursor.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };

    const onEnter = (ev: PointerEvent) => {
      activeRef.current = true;
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };
    const onLeave = () => {
      release();
    };
    // Touch: release on lift so the frame never "sticks" active over the CTA
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerType === "touch" || ev.pointerType === "pen") {
        release();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    if (hoverOnly) {
      frame.addEventListener("pointerenter", onEnter);
      frame.addEventListener("pointerleave", onLeave);
      frame.addEventListener("pointermove", handlePointerMove);
      frame.addEventListener("pointerup", onUp);
      frame.addEventListener("pointercancel", release);
    }

    const imgValues = {
      imgTransforms: { x: 0, y: 0, rz: 0 },
      displacementScale: 0,
    };

    let rafId = 0;

    const render = () => {
      const active = activeRef.current;
      const w = winsize.current.width || 1;
      const h = winsize.current.height || 1;

      // Gentler travel so motion stays readable inside the clipped frame
      let targetX = active
        ? lerp(
            imgValues.imgTransforms.x,
            map(cursor.current.x, 0, w, -movementBound * 1.4, movementBound * 1.4),
            0.1
          )
        : lerp(imgValues.imgTransforms.x, 0, 0.16);
      let targetY = active
        ? lerp(
            imgValues.imgTransforms.y,
            map(cursor.current.y, 0, h, -movementBound * 1.4, movementBound * 1.4),
            0.1
          )
        : lerp(imgValues.imgTransforms.y, 0, 0.16);
      let targetRz = active
        ? lerp(
            imgValues.imgTransforms.rz,
            map(cursor.current.x, 0, w, -8, 8),
            0.1
          )
        : lerp(imgValues.imgTransforms.rz, 0, 0.16);

      // Hard clamp — never leave the frame box
      targetX = Math.max(-movementBound, Math.min(movementBound, targetX));
      targetY = Math.max(-movementBound, Math.min(movementBound, targetY));

      imgValues.imgTransforms.x = targetX;
      imgValues.imgTransforms.y = targetY;
      imgValues.imgTransforms.rz = targetRz;

      // Transform only the media layer — frame / layout box stay put
      gsap.set(media, {
        x: imgValues.imgTransforms.x,
        y: imgValues.imgTransforms.y,
        rotateZ: imgValues.imgTransforms.rz,
      });

      const cursorTravelledDistance = active
        ? distance(
            cachedCursor.current.x,
            cursor.current.x,
            cachedCursor.current.y,
            cursor.current.y
          )
        : 0;

      imgValues.displacementScale = lerp(
        imgValues.displacementScale,
        active
          ? map(cursorTravelledDistance, 0, 200, 0, maxDisplacement)
          : 0,
        0.06
      );

      if (displacementMapRef.current) {
        gsap.set(displacementMapRef.current, {
          attr: { scale: imgValues.displacementScale },
        });
      }

      cachedCursor.current = { ...cursor.current };
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      frame.removeEventListener("pointerenter", onEnter);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("pointermove", handlePointerMove);
      frame.removeEventListener("pointerup", onUp);
      frame.removeEventListener("pointercancel", release);
      gsap.set(media, { clearProps: "transform" });
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
      ref={frameRef}
      className={`relative isolate overflow-hidden rounded-xl border-2 border-balatro-gold/55 bg-black/40 shadow-[0_12px_32px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(245,197,66,0.12)] ${className}`}
      style={style}
    >
      {/* Moving media — clipped by frame overflow */}
      <div
        ref={mediaRef}
        className="absolute inset-0"
        style={{ willChange: "transform" }}
      >
        <svg
          viewBox="-60 -75 720 900"
          preserveAspectRatio="xMidYMid slice"
          className="block h-full w-full"
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
      </div>

      {/* Text overlay stays fixed relative to the frame (readable) */}
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
