"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import type { CtfChallenge } from "@/lib/api";
import { listCtfs } from "@/lib/api";
import { jokerForChallenge } from "@/lib/balatro-card-face";
import { BalatroLoading } from "@/components/balatro-loading";
import { SubmitFlagDialog } from "@/components/submit-flag-dialog";
import DecayCard from "@/components/react-bits/decay-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ChallengeLink = { href: string; label: string };

function toHref(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
  return `http://${s}`;
}

function challengeLinks(c: CtfChallenge): ChallengeLink[] {
  const links: ChallengeLink[] = [];
  const seen = new Set<string>();

  const push = (label: string, href: string) => {
    if (!label || !href || seen.has(href)) return;
    seen.add(href);
    links.push({ label, href });
  };

  if (c.static_url) {
    push(c.static_url, toHref(c.static_url));
  }
  if (c.ports?.length && c.host) {
    for (const p of c.ports) {
      const label = `${c.host}:${p}`;
      const base = c.host.replace(/\/$/, "");
      const href = /^[a-z][a-z0-9+.-]*:\/\//i.test(base)
        ? `${base}:${p}`
        : `http://${base}:${p}`;
      push(label, href);
    }
  }
  return links;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const MIN_LOAD_MS = 1600;
const SHUFFLE_OUT_MS = 380;
const SHUFFLE_IN_MS = 520;

type DealPhase = "idle" | "out" | "in";

export function CtfList() {
  const [challenges, setChallenges] = useState<CtfChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDeal, setInitialDeal] = useState(true);
  const [dealPhase, setDealPhase] = useState<DealPhase>("idle");
  const [dealKey, setDealKey] = useState(0);
  const [shuffling, setShuffling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const data = await listCtfs();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challenges");
    } finally {
      const elapsed = Date.now() - started;
      const wait = Math.max(0, MIN_LOAD_MS - elapsed);
      window.setTimeout(() => {
        setLoading(false);
        setInitialDeal(false);
      }, wait);
    }
  }, []);

  useEffect(() => {
    // Initial fetch — intentional mount load
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const started = Date.now();
      try {
        const data = await listCtfs();
        if (!cancelled) setChallenges(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load challenges"
          );
        }
      } finally {
        const elapsed = Date.now() - started;
        const wait = Math.max(0, MIN_LOAD_MS - elapsed);
        window.setTimeout(() => {
          if (cancelled) return;
          setLoading(false);
          setInitialDeal(false);
        }, wait);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reshuffle = useCallback(async () => {
    if (shuffling || loading) return;
    setShuffling(true);
    setError(null);

    setDealPhase("out");
    await new Promise((r) => window.setTimeout(r, SHUFFLE_OUT_MS));

    try {
      const data = await listCtfs();
      setChallenges(shuffleArray(data));
    } catch (err) {
      setChallenges((prev) => shuffleArray(prev));
      setError(err instanceof Error ? err.message : "Failed to load challenges");
    }

    setDealKey((k) => k + 1);
    setDealPhase("in");
    await new Promise((r) => window.setTimeout(r, SHUFFLE_IN_MS));
    setDealPhase("idle");
    setShuffling(false);
  }, [shuffling, loading]);

  const totalPoints = useMemo(
    () => challenges.reduce((sum, c) => sum + (c.points || 0), 0),
    [challenges]
  );
  const totalSolves = useMemo(
    () => challenges.reduce((sum, c) => sum + (c.solves || 0), 0),
    [challenges]
  );

  if (loading && initialDeal) {
    return <BalatroLoading title="PICKING HAND" fullscreen />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-10 lg:px-6 xl:px-8">
      <header className="felt-panel mb-8 overflow-hidden rounded-2xl p-5 sm:mb-10 sm:p-8">
        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-balatro-gold/40 bg-balatro-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-balatro-gold sm:px-3 sm:text-[11px] sm:tracking-[0.28em]">
                <Sparkles className="size-3" />
                Open table
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-balatro-red/40 bg-balatro-red/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                No login · shared flags
              </span>
            </div>
            <h1 className="font-display text-4xl leading-none tracking-wide text-balatro-cream sm:text-5xl md:text-6xl lg:text-7xl">
              LUG EXPO <span className="text-balatro-gold">CTF</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Draw a challenge, crack it, cash the flag. Every solve rotates the
              flag for the rest of the table — play fair, play fast.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-2">
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
              onClick={reshuffle}
              disabled={loading || shuffling || challenges.length === 0}
              className="w-full shrink-0 sm:w-auto"
              aria-busy={shuffling}
            >
              {shuffling ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Reshuffle
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-balatro-red/50 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && !initialDeal && !shuffling ? (
        <BalatroLoading title="RESHUFFLING" fullscreen={false} />
      ) : challenges.length === 0 ? (
        <div className="felt-panel rounded-2xl border-dashed px-6 py-16 text-center sm:py-20">
          <p className="font-display text-2xl tracking-wide text-balatro-cream/70 sm:text-3xl">
            EMPTY DECK
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No challenges yet. Seed them from the pwncore admin API.
          </p>
        </div>
      ) : (
        <div
          key={dealKey}
          className="grid grid-cols-1 justify-items-center gap-8 pb-16 lg:grid-cols-5 lg:items-start lg:gap-3 xl:gap-4"
        >
          {challenges.map((c, i) => {
            const links = challengeLinks(c);
            const face = jokerForChallenge(c.id, i);
            const animClass =
              dealPhase === "out"
                ? "card-shuffle-out"
                : dealPhase === "in"
                  ? "card-shuffle-in"
                  : "";

            return (
              <article
                key={c.id}
                className={`relative flex w-full max-w-[300px] flex-col items-stretch lg:max-w-none ${animClass}`}
                style={
                  {
                    "--deal-i": i,
                    animationDelay:
                      dealPhase === "out"
                        ? `${i * 50}ms`
                        : dealPhase === "in"
                          ? `${i * 65}ms`
                          : undefined,
                  } as CSSProperties
                }
              >
                <DecayCard
                  width="100%"
                  height="auto"
                  className="aspect-[280/360] w-full shrink-0"
                  image={face}
                  seed={i + 1 + dealKey}
                  maxDisplacement={300}
                  movementBound={14}
                  hoverOnly
                  baseFrequency={0.018}
                  numOctaves={5}
                  textClassName="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-between p-3"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <Badge className="border border-balatro-gold/50 bg-black/70 font-mono text-[9px] text-balatro-gold">
                      #{c.id}
                    </Badge>
                    <Badge
                      className={
                        c.running
                          ? "border border-emerald-400/40 bg-emerald-950/80 text-[9px] uppercase tracking-wider text-emerald-300"
                          : "border border-zinc-500/40 bg-black/70 text-[9px] uppercase tracking-wider text-zinc-400"
                      }
                    >
                      {c.running ? "Live" : "Down"}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-black/85 via-black/55 to-transparent px-0.5 pb-0.5 pt-6">
                    <p className="font-display text-2xl leading-none tracking-wide text-balatro-cream drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] lg:text-xl xl:text-2xl">
                      {c.name}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] font-bold tracking-wider text-balatro-gold">
                      {c.points} PTS
                    </p>
                  </div>
                </DecayCard>

                <div className="card-info-panel">
                  {/* Play hand FIRST so it's always in view under the card on iPhone */}
                  <SubmitFlagDialog
                    challenge={c}
                    onSuccess={() => load()}
                  />

                  <div className="mt-3 mb-2 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                    <span className="min-w-0 truncate">
                      by{" "}
                      <span className="font-medium text-balatro-cream">
                        {c.author}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-balatro-gold">
                      {c.solves} solves
                    </span>
                  </div>

                  {c.description ? (
                    <p className="mb-2.5 text-[11px] leading-relaxed text-balatro-cream/85">
                      {c.description}
                    </p>
                  ) : null}

                  <div className="space-y-1.5">
                    {!c.running ? (
                      <p className="rounded-md border border-white/10 bg-black/50 px-2 py-1.5 text-[10px] text-zinc-400">
                        Not running
                      </p>
                    ) : links.length === 0 ? (
                      <p className="rounded-md border border-white/10 bg-black/50 px-2 py-1.5 text-[10px] text-zinc-400">
                        Running (no published links)
                      </p>
                    ) : (
                      links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-1.5 rounded-md border border-balatro-blue/40 bg-black/50 px-2 py-1.5 font-mono text-[9px] leading-snug text-sky-300 active:bg-balatro-gold/10"
                        >
                          <ExternalLink className="mt-0.5 size-3 shrink-0" />
                          <span className="break-all">{link.label}</span>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="pb-8 text-center font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70 sm:pb-10 sm:text-[11px]">
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
    <div className="min-w-0 rounded-xl border border-balatro-gold/25 bg-black/40 px-2 py-2 text-center sm:px-3">
      <div className="mb-0.5 flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">
        {icon}
        {label}
      </div>
      <div className="font-display text-xl leading-none text-balatro-cream sm:text-2xl">
        {value}
      </div>
    </div>
  );
}
