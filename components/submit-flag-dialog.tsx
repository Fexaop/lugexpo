"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Loader2, Spade, X } from "lucide-react";

import type { CtfChallenge, FlagSubmitResult } from "@/lib/api";
import { submitFlag } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  challenge: CtfChallenge;
  onSuccess?: (result: FlagSubmitResult) => void;
  triggerClassName?: string;
};

const fieldClass =
  "box-border w-full min-h-[48px] rounded-lg border border-balatro-gold/35 bg-black/60 px-3 py-3 text-base text-balatro-cream outline-none placeholder:text-zinc-500 focus:border-balatro-gold focus:ring-2 focus:ring-balatro-gold/35";

/** Client-only gate for portals (SSR-safe). */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Fullscreen scrollable form — no visualViewport math, no bottom-sheet hacks.
 * iOS can always see it (fixed inset:0 + overflow scroll) and will scroll
 * focused fields into view with extra bottom padding for the keyboard.
 */
export function SubmitFlagDialog({
  challenge,
  onSuccess,
  triggerClassName,
}: Props) {
  const titleId = useId();
  const isClient = useIsClient();
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevBodyOverflow = useRef("");
  const prevBodyFilter = useRef("");

  // Lock page scroll + drop body filter while open (filter breaks fixed UI on iOS)
  useEffect(() => {
    if (!open) return;

    prevBodyOverflow.current = document.body.style.overflow;
    prevBodyFilter.current = document.body.style.filter;
    document.body.style.overflow = "hidden";
    document.body.style.filter = "none";

    return () => {
      document.body.style.overflow = prevBodyOverflow.current;
      document.body.style.filter = prevBodyFilter.current;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setMessage(null);
  }

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

  /** Keep the active field visible above the keyboard by scrolling the panel. */
  function onFieldFocus(e: React.FocusEvent<HTMLInputElement>) {
    const field = e.currentTarget;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Let the keyboard animate, then scroll field toward the upper half
    const scroll = () => {
      const scRect = scroller.getBoundingClientRect();
      const fRect = field.getBoundingClientRect();
      const targetY = scRect.top + scRect.height * 0.28;
      const delta = fRect.top - targetY;
      if (Math.abs(delta) > 8) {
        scroller.scrollBy({ top: delta, behavior: "smooth" });
      }
    };
    window.setTimeout(scroll, 100);
    window.setTimeout(scroll, 300);
    window.setTimeout(scroll, 500);
  }

  const panel =
    open && isClient
      ? createPortal(
          <div
            className="fixed inset-0 z-[300] flex flex-col bg-[#070b0c]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            {/* Sticky top bar — always visible */}
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-balatro-gold/25 bg-[#0e181a] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div className="min-w-0 pt-1">
                <p className="font-display text-[11px] tracking-[0.35em] text-balatro-gold">
                  SUBMIT FLAG
                </p>
                <h2
                  id={titleId}
                  className="font-display mt-1 text-2xl tracking-wide text-balatro-cream"
                >
                  {challenge.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Fill in your details and the flag.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="mt-0.5 shrink-0 rounded-lg border border-white/10 bg-black/40 p-2.5 text-balatro-cream active:bg-white/10"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </header>

            {/* Scrollable form — extra bottom pad so fields clear the keyboard */}
            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4"
              style={{
                WebkitOverflowScrolling: "touch",
                // Big bottom space: keyboard covers lower screen; user can scroll up
                paddingBottom: "max(12rem, 45vh)",
              }}
            >
              <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`name-${challenge.id}`}
                    className="block text-sm text-balatro-cream/90"
                  >
                    Name
                  </label>
                  <input
                    id={`name-${challenge.id}`}
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={onFieldFocus}
                    required
                    autoComplete="name"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Your name"
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`email-${challenge.id}`}
                    className="block text-sm text-balatro-cream/90"
                  >
                    Email
                  </label>
                  <input
                    id={`email-${challenge.id}`}
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={onFieldFocus}
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
                  <label
                    htmlFor={`reg-${challenge.id}`}
                    className="block text-sm text-balatro-cream/90"
                  >
                    Reg no
                  </label>
                  <input
                    id={`reg-${challenge.id}`}
                    name="reg_no"
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    onFocus={onFieldFocus}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Registration number"
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`flag-${challenge.id}`}
                    className="block text-sm text-balatro-cream/90"
                  >
                    Flag
                  </label>
                  <input
                    id={`flag-${challenge.id}`}
                    name="flag"
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    onFocus={onFieldFocus}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="flag{...}"
                    className={cn(
                      fieldClass,
                      "border-balatro-red/50 font-mono focus:border-balatro-red focus:ring-balatro-red/35"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-balatro-red px-4 text-base font-semibold text-white shadow-[0_4px_0_#8b1e18] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Cash out
                </button>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("play-hand-btn", triggerClassName)}
      >
        <Spade className="size-4 shrink-0" aria-hidden />
        <span>Play hand</span>
      </button>
      {panel}
    </>
  );
}
