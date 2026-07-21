"use client";

import { useEffect, useState } from "react";
import Balatro from "@/components/react-bits/balatro";
import { JOKER_IMAGES } from "@/lib/balatro-card-face";

const TIPS = [
  "Shuffling the deck…",
  "Dealing jokers…",
  "Counting chips…",
  "Warming the felt…",
  "Picking your hand…",
];

const LOAD_JOKERS = JOKER_IMAGES.slice(0, 3);

type Props = {
  /** Main title under the spinner */
  title?: string;
  /** Show as full-viewport overlay */
  fullscreen?: boolean;
  className?: string;
};

export function BalatroLoading({
  title = "PICKING HAND",
  fullscreen = true,
  className = "",
}: Props) {
  const [tipIdx, setTipIdx] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const tipTimer = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 1600);
    const dotTimer = window.setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 400);
    return () => {
      window.clearInterval(tipTimer);
      window.clearInterval(dotTimer);
    };
  }, []);

  return (
    <div
      className={
        fullscreen
          ? `fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${className}`
          : `relative flex min-h-[50vh] items-center justify-center overflow-hidden rounded-2xl ${className}`
      }
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Balatro
          className="h-full w-full"
          color1="#DE443B"
          color2="#006BB4"
          color3="#0a1213"
          contrast={4}
          lighting={0.5}
          spinSpeed={9}
          spinAmount={0.35}
          isRotate
          mouseInteraction={false}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,8,10,0.9)_100%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
        {/* Fan of real joker cards */}
        <div className="relative mb-8 h-32 w-44" aria-hidden>
          {LOAD_JOKERS.map((src, i) => (
            <div
              key={src}
              className="absolute left-1/2 top-2 h-28 w-[4.5rem] -translate-x-1/2 overflow-hidden rounded-lg border-2 border-balatro-gold/80 bg-black shadow-lg"
              style={{
                transform: `translateX(calc(-50% + ${(i - 1) * 20}px)) rotate(${(i - 1) * 12}deg)`,
                animation: `deal-card 1.1s ease-in-out ${i * 0.12}s infinite alternate`,
                zIndex: i,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <p className="font-display text-xs tracking-[0.4em] text-balatro-gold">
          LUG EXPO
        </p>
        <h2 className="mt-2 font-display text-4xl tracking-[0.12em] text-balatro-cream sm:text-5xl">
          {title}
          <span className="inline-block w-8 text-left text-balatro-gold">
            {dots}
          </span>
        </h2>

        {/* Chip progress bar */}
        <div className="mt-8 h-2 w-full max-w-[220px] overflow-hidden rounded-full border border-balatro-gold/40 bg-black/50">
          <div className="balatro-load-bar h-full rounded-full bg-gradient-to-r from-balatro-red via-balatro-gold to-balatro-blue" />
        </div>

        <p
          key={tipIdx}
          className="mt-5 min-h-[1.25rem] font-body text-sm text-muted-foreground transition-opacity"
        >
          {TIPS[tipIdx]}
        </p>
      </div>
    </div>
  );
}
