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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <DialogTrigger asChild>
        <Button variant="default" className={triggerClassName ?? "w-full"}>
          <Spade className="size-4" />
          Play hand
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[3px] border-black bg-[#12161c] sm:max-w-md shadow-[0_8px_0_#000,0_0_60px_rgba(61,139,253,0.2)]">
        <DialogHeader>
          <p className="font-display text-xs tracking-[0.35em] text-balatro-gold">
            SUBMIT FLAG
          </p>
          <DialogTitle className="font-display text-3xl tracking-wide text-balatro-cream">
            {challenge.name}
          </DialogTitle>
          <DialogDescription className="font-desc text-muted-foreground">
            Ante up your details and the flag. No login — one shared table.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`name-${challenge.id}`} className="text-balatro-cream/80">
              Name
            </Label>
            <Input
              id={`name-${challenge.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
              className="border-balatro-gold/25 bg-black/40 text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold"
            />
          </div>
          <div className="grid gap-2">
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
              placeholder="you@example.com"
              className="border-balatro-gold/25 bg-black/40 text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`reg-${challenge.id}`} className="text-balatro-cream/80">
              Reg no
            </Label>
            <Input
              id={`reg-${challenge.id}`}
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              placeholder="Registration number"
              className="border-balatro-gold/25 bg-black/40 text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-gold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`flag-${challenge.id}`} className="text-balatro-cream/80">
              Flag
            </Label>
            <Input
              id={`flag-${challenge.id}`}
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              required
              autoComplete="off"
              placeholder="flag{...}"
              className="border-balatro-red/40 bg-black/50 font-mono text-balatro-cream placeholder:text-muted-foreground focus-visible:ring-balatro-red"
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

          <DialogFooter>
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="w-full sm:w-auto"
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
