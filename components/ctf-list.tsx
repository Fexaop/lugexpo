"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Loader2,
  RefreshCw,
  Server,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import type { CtfChallenge } from "@/lib/api";
import { listCtfs } from "@/lib/api";
import { balatroCardFace } from "@/lib/balatro-card-face";
import { SubmitFlagDialog } from "@/components/submit-flag-dialog";
import DecayCard from "@/components/react-bits/decay-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function connectionLine(c: CtfChallenge): string | null {
  if (c.static_url) return c.static_url;
  if (c.ports?.length) {
    return c.ports.map((p) => `${c.host}:${p}`).join(" · ");
  }
  return null;
}

export function CtfList() {
  const [challenges, setChallenges] = useState<CtfChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCtfs();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalPoints = useMemo(
    () => challenges.reduce((sum, c) => sum + (c.points || 0), 0),
    [challenges]
  );
  const totalSolves = useMemo(
    () => challenges.reduce((sum, c) => sum + (c.solves || 0), 0),
    [challenges]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header — casino chip / ante board */}
      <header className="felt-panel mb-10 overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-balatro-gold/40 bg-balatro-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-balatro-gold">
                <Sparkles className="size-3" />
                Open table
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-balatro-red/40 bg-balatro-red/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-200">
                No login · shared flags
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-none tracking-wide text-balatro-cream sm:text-6xl md:text-7xl">
              LUG EXPO{" "}
              <span className="text-balatro-gold">CTF</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Draw a challenge, crack it, cash the flag. Every solve rotates the
              flag for the rest of the table — play fair, play fast.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <StatChip
                icon={<Trophy className="size-3.5 text-balatro-gold" />}
                label="Deck"
                value={String(challenges.length)}
              />
              <StatChip
                icon={<Sparkles className="size-3.5 text-balatro-gold" />}
                label="Pool"
                value={`${totalPoints}`}
              />
              <StatChip
                icon={<Users className="size-3.5 text-balatro-gold" />}
                label="Solves"
                value={String(totalSolves)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Reshuffle
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-balatro-red/50 bg-red-950/50 px-4 py-3 text-sm text-red-200 shadow-[0_0_30px_rgba(222,68,59,0.15)]">
          {error}
        </div>
      )}

      {loading && challenges.length === 0 ? (
        <div className="felt-panel flex items-center justify-center gap-3 rounded-2xl py-28 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-balatro-gold" />
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-widest text-balatro-cream/80">
            DEALING CARDS…
          </span>
        </div>
      ) : challenges.length === 0 ? (
        <div className="felt-panel rounded-2xl border-dashed px-6 py-20 text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-balatro-cream/70">
            EMPTY DECK
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No challenges yet. Seed them from the pwncore admin API.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 pb-16 pt-4">
          {challenges.map((c, i) => {
            const conn = connectionLine(c);
            const face = balatroCardFace(c.id + i, c.name, c.points);
            return (
              <div
                key={c.id}
                className="group relative flex flex-col items-center"
                style={{ zIndex: challenges.length - i }}
              >
                {/* React Bits DecayCard */}
                <DecayCard
                  width={280}
                  height={370}
                  image={face}
                  seed={c.id * 7 + 3}
                  maxDisplacement={90}
                  movementBound={22}
                  baseFrequency={0.012}
                  textClassName="pointer-events-none absolute inset-0 flex flex-col justify-between p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge className="border border-balatro-gold/50 bg-black/55 font-mono text-[10px] text-balatro-gold backdrop-blur-sm">
                      #{c.id}
                    </Badge>
                    <Badge
                      className={
                        c.running
                          ? "border border-emerald-400/40 bg-emerald-950/70 text-[10px] uppercase tracking-wider text-emerald-300"
                          : "border border-zinc-500/40 bg-black/60 text-[10px] uppercase tracking-wider text-zinc-400"
                      }
                    >
                      {c.running ? "Live" : "Down"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {c.name}
                    </p>
                    <p className="line-clamp-2 text-xs text-white/75 drop-shadow">
                      {c.description}
                    </p>
                  </div>
                </DecayCard>

                {/* Interactive panel under the floating card */}
                <div className="relative z-20 -mt-8 w-[260px] rounded-xl border border-balatro-gold/30 bg-[#0a1213]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md transition group-hover:border-balatro-gold/55">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      by{" "}
                      <span className="font-medium text-balatro-cream">
                        {c.author}
                      </span>
                    </span>
                    <span className="font-mono text-balatro-gold">
                      {c.solves} solves
                    </span>
                  </div>
                  <div className="mb-3 flex items-start gap-2 rounded-md border border-white/10 bg-black/50 px-2.5 py-2 font-mono text-[10px] leading-snug text-zinc-300">
                    <Server className="mt-0.5 size-3 shrink-0 text-balatro-blue" />
                    <span className="break-all">
                      {c.running
                        ? conn || "Running (no published ports)"
                        : "Not running"}
                    </span>
                  </div>
                  <SubmitFlagDialog
                    challenge={c}
                    onSuccess={() => load()}
                    triggerClassName="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="pb-8 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
        LUG Expo · Balatro table · Play your hand
      </footer>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[72px] rounded-xl border border-balatro-gold/25 bg-black/40 px-3 py-2 text-center">
      <div className="mb-0.5 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-[family-name:var(--font-display)] text-2xl leading-none text-balatro-cream">
        {value}
      </div>
    </div>
  );
}
