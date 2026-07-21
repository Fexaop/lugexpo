"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
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

/** Normalize backend URLs / host:port into browser-openable hrefs. */
function toHref(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
  // host:port or bare host → http
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
      // host may already be a URL; avoid double scheme
      const base = c.host.replace(/\/$/, "");
      const href = /^[a-z][a-z0-9+.-]*:\/\//i.test(base)
        ? `${base}:${p}`
        : `http://${base}:${p}`;
      push(label, href);
    }
  }
  return links;
}

const MIN_LOAD_MS = 1600;

export function CtfList() {
  const [challenges, setChallenges] = useState<CtfChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** True only for the first deal (full-screen pick-hand). */
  const [initialDeal, setInitialDeal] = useState(true);

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

  if (loading && initialDeal) {
    return <BalatroLoading title="PICKING HAND" fullscreen />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-10 lg:px-6 xl:px-8">
      {/* Header */}
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
              LUG EXPO{" "}
              <span className="text-balatro-gold">CTF</span>
            </h1>
            <p className="font-desc mt-3 max-w-xl sm:mt-4 sm:text-[0.95rem]">
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
              onClick={load}
              disabled={loading}
              className="w-full shrink-0 sm:w-auto"
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

      {loading && !initialDeal ? (
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
        // 1 col phone · all 5 in one row from lg up
        <div className="grid grid-cols-1 justify-items-center gap-8 pb-12 lg:grid-cols-5 lg:items-start lg:gap-3 xl:gap-4">
          {challenges.map((c, i) => {
            const links = challengeLinks(c);
            const face = jokerForChallenge(c.id, i);
            return (
              <article
                key={c.id}
                className="group flex w-full max-w-[300px] flex-col items-center lg:max-w-none"
              >
                <DecayCard
                  width="100%"
                  height="auto"
                  className="pixel-shadow aspect-[280/360] w-full max-w-[300px] lg:max-w-none"
                  image={face}
                  seed={i + 1}
                  maxDisplacement={560}
                  movementBound={58}
                  hoverOnly
                  baseFrequency={0.018}
                  numOctaves={6}
                  textClassName="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-3.5 lg:p-2.5 xl:p-3"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <Badge className="border border-balatro-gold/50 bg-black/70 font-mono text-[9px] text-balatro-gold backdrop-blur-sm lg:text-[9px] xl:text-[10px]">
                      #{c.id}
                    </Badge>
                    <Badge
                      className={
                        c.running
                          ? "border border-emerald-400/40 bg-emerald-950/80 text-[9px] uppercase tracking-wider text-emerald-300 lg:px-1.5"
                          : "border border-zinc-500/40 bg-black/70 text-[9px] uppercase tracking-wider text-zinc-400 lg:px-1.5"
                      }
                    >
                      {c.running ? "Live" : "Down"}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-gradient-to-t from-black/85 via-black/55 to-transparent px-0.5 pb-0.5 pt-6 lg:pt-5">
                    <p className="font-display text-2xl leading-none tracking-wide text-balatro-cream drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] lg:text-xl xl:text-2xl">
                      {c.name}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] font-bold tracking-wider text-balatro-gold lg:text-[9px] xl:text-[10px]">
                      {c.points} PTS
                    </p>
                  </div>
                </DecayCard>

                <div className="balatro-panel relative z-20 mt-3 w-full p-2.5 lg:p-2 xl:p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-1 font-display text-[11px] tracking-wide text-muted-foreground lg:text-[10px] xl:text-[11px]">
                    <span className="min-w-0 truncate">
                      by{" "}
                      <span className="text-balatro-cream">
                        {c.author}
                      </span>
                    </span>
                    <span className="shrink-0 text-balatro-gold">
                      {c.solves} SOLVES
                    </span>
                  </div>

                  {c.description ? (
                    <p className="font-desc mb-2.5">
                      {c.description}
                    </p>
                  ) : null}

                  <div className="mb-2.5 space-y-1.5 lg:mb-2">
                    {!c.running ? (
                      <p className="font-display rounded-md border-2 border-black bg-[#2a2a32] px-2 py-1.5 text-[11px] text-zinc-300 shadow-[0_2px_0_#000]">
                        NOT RUNNING
                      </p>
                    ) : links.length === 0 ? (
                      <p className="font-display rounded-md border-2 border-black bg-[#2a2a32] px-2 py-1.5 text-[11px] text-zinc-300 shadow-[0_2px_0_#000]">
                        NO LINKS
                      </p>
                    ) : (
                      links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="balatro-link"
                        >
                          <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                          <span className="min-w-0">
                            <span className="font-link block text-[11px] leading-none tracking-wider sm:text-xs">
                              OPEN
                            </span>
                            <span className="mt-0.5 block break-all font-mono text-[10px] leading-snug text-sky-100/95 sm:text-[11px]">
                              {link.label}
                            </span>
                          </span>
                        </a>
                      ))
                    )}
                  </div>

                  <SubmitFlagDialog
                    challenge={c}
                    onSuccess={() => load()}
                    triggerClassName="w-full"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="pb-6 text-center font-body text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70 sm:pb-8 sm:text-[11px] sm:tracking-[0.3em]">
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
