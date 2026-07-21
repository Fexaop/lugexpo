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

/**
 * Pin an element to the visual viewport (the area above the iOS keyboard).
 * When the keyboard opens, height shrinks — form stays usable and inputs
 * remain focusable so the keyboard can open.
 */
function usePinToVisualViewport(el: HTMLElement | null) {
  React.useLayoutEffect(() => {
    if (!el) return;

    // Desktop: clear any mobile pin styles, let CSS handle centering
    const mq = window.matchMedia("(min-width: 640px)");
    const vv = window.visualViewport;

    const clearDesktop = () => {
      el.style.top = "";
      el.style.left = "";
      el.style.width = "";
      el.style.height = "";
      el.style.maxHeight = "";
      el.style.bottom = "";
      el.style.right = "";
      el.style.transform = "";
      el.style.borderRadius = "";
    };

    const pinMobile = () => {
      if (!vv) {
        el.style.top = "0px";
        el.style.left = "0px";
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.maxHeight = "100%";
        el.style.bottom = "auto";
        el.style.right = "auto";
        el.style.transform = "none";
        el.style.borderRadius = "0";
        return;
      }
      // Exact visual viewport box — never under the keyboard
      el.style.top = `${vv.offsetTop}px`;
      el.style.left = `${vv.offsetLeft}px`;
      el.style.width = `${vv.width}px`;
      el.style.height = `${vv.height}px`;
      el.style.maxHeight = `${vv.height}px`;
      el.style.bottom = "auto";
      el.style.right = "auto";
      el.style.transform = "none";
      el.style.borderRadius = "0";
    };

    const apply = () => {
      if (mq.matches) clearDesktop();
      else pinMobile();
    };

    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    mq.addEventListener("change", apply);

    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      mq.removeEventListener("change", apply);
      clearDesktop();
    };
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

  usePinToVisualViewport(node);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className={cn(
          // Mobile: full visual-viewport panel (inline styles set top/height)
          "fixed z-[200] flex w-full flex-col gap-0 border border-border bg-background p-0 shadow-lg outline-none",
          "left-0 top-0 h-full max-h-full overflow-hidden",
          // Desktop: classic centered modal
          "sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[min(90vh,720px)] sm:w-full sm:max-w-lg",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:p-6",
          className
        )}
        // Don't auto-focus an <input> (that forces the keyboard + jumps the sheet).
        // Focus the panel itself so the trap is happy; user taps a field to type.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const panel = e.currentTarget as HTMLElement;
          if (panel && typeof panel.focus === "function") {
            panel.focus({ preventScroll: true });
          }
          onOpenAutoFocus?.(e);
        }}
        onCloseAutoFocus={(e) => {
          // Prevent scroll-jump / focus fighting on iOS when closing
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
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-left",
      className
    )}
    {...props}
  />
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
