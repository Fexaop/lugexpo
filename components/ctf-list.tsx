"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Server } from "lucide-react";

import type { CtfChallenge } from "@/lib/api";
import { listCtfs } from "@/lib/api";
import { SubmitFlagDialog } from "@/components/submit-flag-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Open CTF
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Challenges
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            All challenges are live. No login. One shared instance each — when
            you solve, the flag rotates for everyone else.
          </p>
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
          Refresh
        </Button>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && challenges.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading challenges…
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No challenges yet. Seed them from the pwncore admin API.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges.map((c) => {
            const conn = connectionLine(c);
            return (
              <Card key={c.id} className="flex flex-col bg-black">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <Badge variant="outline" className="shrink-0 font-mono">
                      {c.points} pts
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {c.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    by <span className="text-foreground">{c.author}</span>
                    {" · "}
                    <span className="font-mono">{c.solves}</span> solves
                  </p>
                  <div className="flex items-start gap-2 rounded-md border border-border bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300">
                    <Server className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="break-all">
                      {c.running
                        ? conn || "Running (no published ports)"
                        : "Not running"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <SubmitFlagDialog challenge={c} onSuccess={() => load()} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
