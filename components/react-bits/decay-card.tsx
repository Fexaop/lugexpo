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

function subscribeReducedMotion(cb: () => void) {
  const q = window.matchMedia("(prefers-reduced-motion: reduce)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * React Bits — Decay Card
 * https://reactbits.dev/components/decay-card
 *
 * Works on desktop + phone. Outer gold frame stays fixed; transform +
 * displacement apply only to the inner media so motion stays inside the border.
 * Touch: drag finger on the card to drive the decay/tilt (same as hover).
 */
const DecayCard: React.FC<DecayCardProps> = ({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 420,
  movementBound = 18,
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
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );

  const cursor = useRef({ x: 0, y: 0 });
  const cachedCursor = useRef({ x: 0, y: 0 });
  const winsize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (reduceMotion) return;

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

    const onDown = (ev: PointerEvent) => {
      // Touch / pen: press to engage the effect
      if (ev.pointerType === "touch" || ev.pointerType === "pen") {
        activeRef.current = true;
        cursor.current = { x: ev.clientX, y: ev.clientY };
        try {
          frame.setPointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
      }
    };

    const onMove = (ev: PointerEvent) => {
      if (!activeRef.current && hoverOnly) return;
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerType === "touch" || ev.pointerType === "pen") {
        release();
        try {
          frame.releasePointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    if (hoverOnly) {
      frame.addEventListener("pointerenter", onEnter);
      frame.addEventListener("pointerleave", release);
      frame.addEventListener("pointerdown", onDown);
      frame.addEventListener("pointermove", onMove);
      frame.addEventListener("pointerup", onUp);
      frame.addEventListener("pointercancel", onUp);
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
            map(cursor.current.x, 0, w, -movementBound * 1.15, movementBound * 1.15),
            0.12
          )
        : lerp(imgValues.imgTransforms.x, 0, 0.16);
      let targetY = active
        ? lerp(
            imgValues.imgTransforms.y,
            map(cursor.current.y, 0, h, -movementBound * 1.15, movementBound * 1.15),
            0.12
          )
        : lerp(imgValues.imgTransforms.y, 0, 0.16);
      const targetRz = active
        ? lerp(
            imgValues.imgTransforms.rz,
            map(cursor.current.x, 0, w, -7, 7),
            0.12
          )
        : lerp(imgValues.imgTransforms.rz, 0, 0.16);

      // Hard clamp — stay inside the frame
      targetX = Math.max(-movementBound, Math.min(movementBound, targetX));
      targetY = Math.max(-movementBound, Math.min(movementBound, targetY));

      imgValues.imgTransforms.x = targetX;
      imgValues.imgTransforms.y = targetY;
      imgValues.imgTransforms.rz = targetRz;

      gsap.set(media, {
        x: targetX,
        y: targetY,
        rotateZ: targetRz,
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
      frame.removeEventListener("pointerdown", onDown);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerup", onUp);
      frame.removeEventListener("pointercancel", onUp);
      gsap.set(media, { clearProps: "transform" });
    };
  }, [maxDisplacement, movementBound, hoverOnly, reduceMotion]);

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
  };
  if (height !== "auto") {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      ref={frameRef}
      className={`card-face-frame relative touch-none ${className}`}
      style={style}
    >
      <div className="card-face-clip">
        <div
          ref={mediaRef}
          className="absolute inset-0"
          style={reduceMotion ? undefined : { willChange: "transform" }}
        >
          {reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              draggable={false}
              className="h-full w-full object-cover select-none"
            />
          ) : (
            <svg
              viewBox="0 0 600 750"
              preserveAspectRatio="xMidYMid slice"
              className="block h-full w-full"
              aria-hidden
            >
              <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
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
