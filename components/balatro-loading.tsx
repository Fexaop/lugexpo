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
  "Blinding the blinds…",
  "Stacking the ante…",
  "Rerolling the shop…",
];

const PHASES = [
  "ANTE 1",
  "SMALL BLIND",
  "BIG BLIND",
  "THE HOOK",
  "THE CLUB",
  "FINAL HAND",
];

type Props = {
  title?: string;
  fullscreen?: boolean;
  className?: string;
};

export function BalatroLoading({
  title = "PICKING HAND",
  fullscreen = true,
  className = "",
}: Props) {
  const [tipIdx, setTipIdx] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [dots, setDots] = useState(".");
  const [chipScore, setChipScore] = useState(0);
  const [mult, setMult] = useState(1);

  useEffect(() => {
    const tipTimer = window.setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 1400);
    const phaseTimer = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length);
    }, 2200);
    const dotTimer = window.setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 380);
    const scoreTimer = window.setInterval(() => {
      setChipScore((s) => (s + 17 + Math.floor(Math.random() * 40)) % 9999);
      setMult((m) => (m >= 12 ? 1 : m + 1));
    }, 480);
    return () => {
      window.clearInterval(tipTimer);
      window.clearInterval(phaseTimer);
      window.clearInterval(dotTimer);
      window.clearInterval(scoreTimer);
    };
  }, []);

  return (
    <div
      className={
        fullscreen
          ? `fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${className}`
          : `relative flex min-h-[55vh] items-center justify-center overflow-hidden rounded-2xl ${className}`
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
          contrast={4.2}
          lighting={0.55}
          spinSpeed={10}
          spinAmount={0.4}
          isRotate
          mouseInteraction={false}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(5,8,10,0.92)_100%)]" />
      </div>

      {/* Floating suit confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {["♠", "♥", "♦", "♣", "★"].map((suit, i) => (
          <span
            key={suit + i}
            className="absolute font-display text-2xl text-balatro-gold/25 sm:text-3xl"
            style={{
              left: `${12 + i * 18}%`,
              top: `${15 + (i % 3) * 25}%`,
              animation: `float-suit ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate`,
            }}
          >
            {suit}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-5 text-center">
        {/* Phase chip */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-balatro-red/50 bg-balatro-red/20 px-4 py-1">
          <span className="size-1.5 animate-pulse rounded-full bg-balatro-red" />
          <span className="font-display text-sm tracking-[0.25em] text-red-200">
            {PHASES[phaseIdx]}
          </span>
        </div>

        {/* Fan of all 5 jokers */}
        <div className="relative mb-6 h-36 w-full max-w-[280px]" aria-hidden>
          {JOKER_IMAGES.map((src, i) => {
            const n = JOKER_IMAGES.length;
            const offset = (i - (n - 1) / 2) * 28;
            const rot = (i - (n - 1) / 2) * 8;
            return (
              <div
                key={src}
                className="absolute left-1/2 top-2 h-32 w-[4.25rem] -translate-x-1/2 overflow-hidden rounded-lg border-2 border-balatro-gold/85 bg-black shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                style={{
                  transform: `translateX(calc(-50% + ${offset}px)) rotate(${rot}deg)`,
                  animation: `deal-card 1.05s ease-in-out ${i * 0.1}s infinite alternate`,
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
            );
          })}
        </div>

        <p className="font-display text-xs tracking-[0.4em] text-balatro-gold">
          LUG EXPO · THE TABLE
        </p>
        <h2 className="mt-2 font-display text-4xl tracking-[0.1em] text-balatro-cream sm:text-5xl">
          {title}
          <span className="inline-block w-8 text-left text-balatro-gold">
            {dots}
          </span>
        </h2>

        {/* Chips × Mult scoreboard (Balatro hand score vibe) */}
        <div className="mt-6 flex items-center gap-2 sm:gap-3">
          <div className="rounded-lg border-2 border-sky-400/50 bg-sky-950/60 px-3 py-1.5 sm:px-4">
            <p className="text-[9px] uppercase tracking-widest text-sky-300/80">
              Chips
            </p>
            <p className="font-display text-2xl leading-none text-sky-200 sm:text-3xl">
              {chipScore}
            </p>
          </div>
          <span className="font-display text-2xl text-balatro-gold">×</span>
          <div className="rounded-lg border-2 border-balatro-red/50 bg-red-950/60 px-3 py-1.5 sm:px-4">
            <p className="text-[9px] uppercase tracking-widest text-red-300/80">
              Mult
            </p>
            <p className="font-display text-2xl leading-none text-red-200 sm:text-3xl">
              {mult}
            </p>
          </div>
          <span className="font-display text-xl text-balatro-cream/50">=</span>
          <div className="rounded-lg border-2 border-balatro-gold/50 bg-amber-950/50 px-3 py-1.5 sm:px-4">
            <p className="text-[9px] uppercase tracking-widest text-balatro-gold/80">
              Score
            </p>
            <p className="font-display text-2xl leading-none text-balatro-gold sm:text-3xl">
              {chipScore * mult}
            </p>
          </div>
        </div>

        {/* Chip progress bar */}
        <div className="mt-7 h-2.5 w-full max-w-[240px] overflow-hidden rounded-full border border-balatro-gold/40 bg-black/55">
          <div className="balatro-load-bar h-full rounded-full bg-gradient-to-r from-balatro-red via-balatro-gold to-balatro-blue" />
        </div>

        {/* Poker-chip row */}
        <div className="mt-5 flex items-center justify-center gap-2" aria-hidden>
          {["#DE443B", "#006BB4", "#F5C542", "#3d9b4a", "#a855f7"].map(
            (color, i) => (
              <div
                key={color}
                className="size-7 rounded-full border-2 border-white/25 shadow-md sm:size-8"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #fff6, transparent 45%), ${color}`,
                  animation: `chip-bounce 0.9s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            )
          )}
        </div>

        <p
          key={tipIdx}
          className="mt-5 min-h-[1.25rem] font-body text-sm text-muted-foreground"
        >
          {TIPS[tipIdx]}
        </p>
      </div>
    </div>
  );
}
