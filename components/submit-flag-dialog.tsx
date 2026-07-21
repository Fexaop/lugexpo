"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
};

export function SubmitFlagDialog({ challenge, onSuccess }: Props) {
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
        <Button className="w-full">Submit flag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{challenge.name}</DialogTitle>
          <DialogDescription>
            Enter your details and the flag. No login required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`name-${challenge.id}`}>Name</Label>
            <Input
              id={`name-${challenge.id}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`email-${challenge.id}`}>Email</Label>
            <Input
              id={`email-${challenge.id}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`reg-${challenge.id}`}>Reg no</Label>
            <Input
              id={`reg-${challenge.id}`}
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              placeholder="Registration number"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`flag-${challenge.id}`}>Flag</Label>
            <Input
              id={`flag-${challenge.id}`}
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              required
              autoComplete="off"
              placeholder="flag{...}"
              className="font-mono"
            />
          </div>

          {message && (
            <p
              className={
                message.type === "ok"
                  ? "text-sm text-emerald-400"
                  : "text-sm text-red-400"
              }
            >
              {message.text}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
