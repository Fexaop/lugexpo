"use client";

import React, {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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

function subscribeMedia(cb: () => void) {
  const q1 = window.matchMedia("(hover: hover) and (pointer: fine)");
  const q2 = window.matchMedia("(prefers-reduced-motion: reduce)");
  q1.addEventListener("change", cb);
  q2.addEventListener("change", cb);
  return () => {
    q1.removeEventListener("change", cb);
    q2.removeEventListener("change", cb);
  };
}

function getDesktopFxEnabled() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * React Bits — Decay Card
 * https://reactbits.dev/components/decay-card
 *
 * Desktop: SVG turbulence + displacement inside a fixed clipped frame.
 * Touch / coarse pointer (iPhone): plain clipped image — Safari SVG filters
 * paint outside overflow:hidden and can cover the CTA under the card.
 */
const DecayCard: React.FC<DecayCardProps> = ({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 520,
  movementBound = 22,
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
  /** Desktop fine-pointer only — false on iPhone (SSR-safe) */
  const useEffectFx = useSyncExternalStore(
    subscribeMedia,
    getDesktopFxEnabled,
    () => false
  );

  const cursor = useRef({ x: 0, y: 0 });
  const cachedCursor = useRef({ x: 0, y: 0 });
  const winsize = useRef({ width: 0, height: 0 });


  useEffect(() => {
    if (!useEffectFx) return;

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
      cursor.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };

    const onEnter = (ev: PointerEvent) => {
      activeRef.current = true;
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    if (hoverOnly) {
      frame.addEventListener("pointerenter", onEnter);
      frame.addEventListener("pointerleave", release);
      frame.addEventListener("pointermove", handlePointerMove);
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

      let targetX = active
        ? lerp(
            imgValues.imgTransforms.x,
            map(cursor.current.x, 0, w, -movementBound * 1.2, movementBound * 1.2),
            0.1
          )
        : lerp(imgValues.imgTransforms.x, 0, 0.16);
      let targetY = active
        ? lerp(
            imgValues.imgTransforms.y,
            map(cursor.current.y, 0, h, -movementBound * 1.2, movementBound * 1.2),
            0.1
          )
        : lerp(imgValues.imgTransforms.y, 0, 0.16);
      const targetRz = active
        ? lerp(
            imgValues.imgTransforms.rz,
            map(cursor.current.x, 0, w, -6, 6),
            0.1
          )
        : lerp(imgValues.imgTransforms.rz, 0, 0.16);

      targetX = Math.max(-movementBound, Math.min(movementBound, targetX));
      targetY = Math.max(-movementBound, Math.min(movementBound, targetY));

      imgValues.imgTransforms.x = targetX;
      imgValues.imgTransforms.y = targetY;
      imgValues.imgTransforms.rz = targetRz;

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
      frame.removeEventListener("pointerleave", release);
      frame.removeEventListener("pointermove", handlePointerMove);
      gsap.set(media, { clearProps: "transform" });
    };
  }, [maxDisplacement, movementBound, hoverOnly, useEffectFx]);

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
  };
  if (height !== "auto") {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden rounded-xl border-2 border-balatro-gold/55 bg-[#0a0e10] shadow-[0_12px_32px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(245,197,66,0.12)] ${className}`}
      style={style}
    >
      {/* Clip layer — double-wrap so iOS can't paint SVG filters outside the border */}
      <div className="absolute inset-0 overflow-hidden rounded-[10px]">
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={useEffectFx ? { willChange: "transform" } : undefined}
        >
          {useEffectFx ? (
            <svg
              viewBox="0 0 600 750"
              preserveAspectRatio="xMidYMid slice"
              className="block h-full w-full"
              aria-hidden
            >
              <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  type="turbulence"
                  baseFrequency={baseFrequency}
                  numOctaves={numOctaves}
                  seed={seed}
                  stitchTiles="stitch"
                  result="turbulence1"
                />
                <feDisplacementMap
                  ref={displacementMapRef}
                  in="SourceGraphic"
                  in2="turbulence1"
                  scale="0"
                  xChannelSelector="R"
                  yChannelSelector="B"
                  result="displacementMap3"
                />
              </filter>
              <image
                href={image}
                x="0"
                y="0"
                width="600"
                height="750"
                filter={`url(#${filterId})`}
                preserveAspectRatio="xMidYMid slice"
              />
            </svg>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              draggable={false}
              className="h-full w-full object-cover select-none"
            />
          )}
        </div>
      </div>

      <div
        className={
          textClassName ||
          "pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end p-5"
        }
      >
        {children}
      </div>
    </div>
  );
};

export default DecayCard;
