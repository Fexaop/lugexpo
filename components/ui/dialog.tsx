"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[200] bg-black/80", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/** Scroll the focused field into the sheet’s scroll area (above keyboard). */
function scrollFocusedFieldIntoView(sheet: HTMLElement) {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return;
  if (active.tagName !== "INPUT" && active.tagName !== "TEXTAREA") return;
  if (!sheet.contains(active)) return;

  const scroller =
    (sheet.querySelector("[data-sheet-scroll]") as HTMLElement | null) ?? sheet;

  // Prefer scrolling the inner scroller so the sticky header/footer stay put
  const scrollerRect = scroller.getBoundingClientRect();
  const fieldRect = active.getBoundingClientRect();
  const pad = 24;
  let delta = 0;

  if (fieldRect.top < scrollerRect.top + pad) {
    delta = fieldRect.top - scrollerRect.top - pad;
  } else if (fieldRect.bottom > scrollerRect.bottom - pad) {
    delta = fieldRect.bottom - scrollerRect.bottom + pad;
  }

  if (delta !== 0) {
    scroller.scrollBy({ top: delta, behavior: "smooth" });
  }
}

/**
 * Dock the sheet to the bottom of the visual viewport (sits on top of the
 * keyboard). Max-height tracks the visible area so content can scroll.
 */
function useKeyboardAwareSheet(el: HTMLElement | null) {
  React.useLayoutEffect(() => {
    if (!el) return;

    const mq = window.matchMedia("(min-width: 640px)");
    const vv = window.visualViewport;

    const clearDesktop = () => {
      el.style.top = "";
      el.style.left = "";
      el.style.right = "";
      el.style.bottom = "";
      el.style.width = "";
      el.style.height = "";
      el.style.maxHeight = "";
      el.style.transform = "";
      el.style.borderRadius = "";
    };

    const pinMobile = () => {
      // Gap between visual viewport bottom and layout viewport bottom = keyboard
      const offsetTop = vv?.offsetTop ?? 0;
      const vvHeight = vv?.height ?? window.innerHeight;
      const vvWidth = vv?.width ?? window.innerWidth;
      const vvLeft = vv?.offsetLeft ?? 0;
      const keyboardGap = Math.max(
        0,
        window.innerHeight - offsetTop - vvHeight
      );

      // Dock to keyboard; height = visible area so flex scroll works
      const maxH = Math.max(240, Math.floor(vvHeight * 0.96));

      el.style.top = "auto";
      el.style.bottom = `${keyboardGap}px`;
      el.style.left = `${vvLeft}px`;
      el.style.right = "auto";
      el.style.width = `${vvWidth}px`;
      el.style.height = `${maxH}px`;
      el.style.maxHeight = `${maxH}px`;
      el.style.transform = "none";
      el.style.borderRadius = "16px 16px 0 0";

      // After layout settles, keep the focused field in view
      requestAnimationFrame(() => scrollFocusedFieldIntoView(el));
    };

    const apply = () => {
      if (mq.matches) clearDesktop();
      else pinMobile();
    };

    apply();

    // Debounce slightly on vv resize (keyboard animating)
    let raf = 0;
    const onVvChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    vv?.addEventListener("resize", onVvChange);
    vv?.addEventListener("scroll", onVvChange);
    window.addEventListener("resize", apply);
    mq.addEventListener("change", apply);

    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", onVvChange);
      vv?.removeEventListener("scroll", onVvChange);
      window.removeEventListener("resize", apply);
      mq.removeEventListener("change", apply);
      clearDesktop();
    };
  }, [el]);
}

function useAutoScrollOnFocus(el: HTMLElement | null) {
  React.useEffect(() => {
    if (!el) return;

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") return;

      // Wait for keyboard + visualViewport to finish moving
      const run = () => scrollFocusedFieldIntoView(el);
      window.setTimeout(run, 50);
      window.setTimeout(run, 200);
      window.setTimeout(run, 400);
    };

    el.addEventListener("focusin", onFocusIn);
    return () => el.removeEventListener("focusin", onFocusIn);
  }, [el]);
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onOpenAutoFocus, onCloseAutoFocus, ...props }, ref) => {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (el: HTMLDivElement | null) => {
      setNode(el);
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  useKeyboardAwareSheet(node);
  useAutoScrollOnFocus(node);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className={cn(
          // Mobile: bottom sheet (inline styles dock above keyboard)
          "fixed z-[200] flex w-full flex-col gap-0 overflow-hidden border border-border bg-background p-0 shadow-lg outline-none",
          "left-0 bottom-0 top-auto max-h-[92dvh] rounded-t-2xl",
          // Desktop: centered modal
          "sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[min(90vh,720px)] sm:w-full sm:max-w-lg",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border",
          className
        )}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const panel = e.currentTarget as HTMLElement;
          panel?.focus?.({ preventScroll: true });
          onOpenAutoFocus?.(e);
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          onCloseAutoFocus?.(e);
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          type="button"
          className="absolute right-3 top-3 z-10 rounded-sm p-2 opacity-80 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
