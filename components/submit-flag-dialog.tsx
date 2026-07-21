"use client";

import { useState } from "react";
import { Loader2, Spade } from "lucide-react";

import type { CtfChallenge, FlagSubmitResult } from "@/lib/api";
import { submitFlag } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  challenge: CtfChallenge;
  onSuccess?: (result: FlagSubmitResult) => void;
  triggerClassName?: string;
};

export function SubmitFlagDialog({
  challenge,
  onSuccess,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await submitFlag(challenge.id, {
        name: name.trim(),
        email: email.trim(),
        reg_no: regNo.trim(),
        flag: flag.trim(),
      });

      if (result.status) {
        setMessage({
          type: "ok",
          text: result.msg || "Correct! Flag rotated for the next solver.",
        });
        setFlag("");
        onSuccess?.(result);
      } else {
        setMessage({
          type: "err",
          text: result.msg || "Incorrect flag.",
        });
      }
    } catch (err) {
      setMessage({
        type: "err",
        text: err instanceof Error ? err.message : "Submission failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setMessage(null);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("play-hand-btn", triggerClassName)}
      >
        <Spade className="size-4 shrink-0" aria-hidden />
        <span>Play hand</span>
      </button>

      <DialogContent className="w-full max-w-none gap-3 border-2 border-balatro-gold/40 bg-[#0e181a] shadow-[0_0_60px_rgba(222,68,59,0.2)] sm:max-w-md">
        {/* Drag handle affordance on mobile sheet */}
        <div
          className="mx-auto mb-1 h-1 w-10 shrink-0 rounded-full bg-balatro-gold/35 sm:hidden"
          aria-hidden
        />

        <DialogHeader className="pr-8 text-left">
          <p className="font-display text-xs tracking-[0.35em] text-balatro-gold">
            SUBMIT FLAG
          </p>
          <DialogTitle className="font-display text-2xl tracking-wide text-balatro-cream sm:text-3xl">
            {challenge.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ante up your details and the flag. No login — one shared table.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-3 sm:gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor={`name-${challenge.id}`} className="text-balatro-cream/80">
              Name
            </Label>
            <Input
              id={`name-${challenge.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              enterKeyHint="next"
              placeholder="Your name"
              className="min-h-11 border-balatro-gold/25 bg-black/40 text-base text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold sm:text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`email-${challenge.id}`} className="text-balatro-cream/80">
              Email
            </Label>
            <Input
              id={`email-${challenge.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              enterKeyHint="next"
              inputMode="email"
              placeholder="you@example.com"
              className="min-h-11 border-balatro-gold/25 bg-black/40 text-base text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold sm:text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`reg-${challenge.id}`} className="text-balatro-cream/80">
              Reg no
            </Label>
            <Input
              id={`reg-${challenge.id}`}
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              enterKeyHint="next"
              placeholder="Registration number"
              className="min-h-11 border-balatro-gold/25 bg-black/40 text-base text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold sm:text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`flag-${challenge.id}`} className="text-balatro-cream/80">
              Flag
            </Label>
            <Input
              id={`flag-${challenge.id}`}
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              required
              autoComplete="off"
              enterKeyHint="done"
              placeholder="flag{...}"
              className="min-h-11 border-balatro-red/40 bg-black/50 font-mono text-base text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-red sm:text-sm"
            />
          </div>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300"
                  : "rounded-md border border-balatro-red/50 bg-red-950/40 px-3 py-2 text-sm text-red-300"
              }
            >
              {message.text}
            </p>
          )}

          <DialogFooter className="sticky bottom-0 -mx-1 mt-1 bg-[#0e181a] pt-2">
            <Button
              type="submit"
              variant="destructive"
              disabled={loading}
              className="min-h-12 w-full text-base sm:w-auto sm:text-sm"
            >
              {loading && <Loader2 className="animate-spin" />}
              Cash out
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
