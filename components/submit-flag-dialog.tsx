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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  challenge: CtfChallenge;
  onSuccess?: (result: FlagSubmitResult) => void;
  triggerClassName?: string;
};

const fieldClass =
  "box-border w-full min-h-[48px] rounded-lg border border-balatro-gold/30 bg-black/50 px-3 py-3 text-base leading-normal text-balatro-cream outline-none placeholder:text-muted-foreground focus:border-balatro-gold focus:ring-2 focus:ring-balatro-gold/40 disabled:opacity-50";

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
      modal
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("play-hand-btn", triggerClassName)}
      >
        <Spade className="size-4 shrink-0" aria-hidden />
        <span>Play hand</span>
      </button>

      <DialogContent
        // tabIndex so we can focus the panel without focusing an input
        tabIndex={-1}
        className="border-2 border-balatro-gold/40 bg-[#0e181a] p-0 shadow-[0_0_60px_rgba(222,68,59,0.25)] sm:max-w-md sm:p-0"
      >
        {/*
          Layout: header (fixed) + scrollable form + footer (fixed).
          Panel height = visual viewport, so when keyboard opens the scroll
          area shrinks and the focused field can still be reached.
          Native <input> — not wrapped in anything that steals touch/focus.
        */}
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 border-b border-balatro-gold/15 px-4 pb-2.5 pt-3.5 pr-14 text-left sm:pt-4">
            <p className="font-display text-[11px] tracking-[0.35em] text-balatro-gold">
              SUBMIT FLAG
            </p>
            <DialogTitle className="font-display text-2xl tracking-wide text-balatro-cream">
              {challenge.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in your details and the flag.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              data-sheet-scroll
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3 pb-6"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor={`name-${challenge.id}`}
                  className="text-sm text-balatro-cream/90"
                >
                  Name
                </Label>
                <input
                  id={`name-${challenge.id}`}
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  placeholder="Your name"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`email-${challenge.id}`}
                  className="text-sm text-balatro-cream/90"
                >
                  Email
                </Label>
                <input
                  id={`email-${challenge.id}`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="email"
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`reg-${challenge.id}`}
                  className="text-sm text-balatro-cream/90"
                >
                  Reg no
                </Label>
                <input
                  id={`reg-${challenge.id}`}
                  name="reg_no"
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="Registration number"
                  className={fieldClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`flag-${challenge.id}`}
                  className="text-sm text-balatro-cream/90"
                >
                  Flag
                </Label>
                <input
                  id={`flag-${challenge.id}`}
                  name="flag"
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="flag{...}"
                  className={cn(
                    fieldClass,
                    "border-balatro-red/45 font-mono focus:border-balatro-red focus:ring-balatro-red/40"
                  )}
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
            </div>

            <div className="shrink-0 border-t border-balatro-gold/15 bg-[#0e181a] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button
                type="submit"
                variant="destructive"
                disabled={loading}
                className="min-h-12 w-full text-base"
              >
                {loading && <Loader2 className="animate-spin" />}
                Cash out
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
