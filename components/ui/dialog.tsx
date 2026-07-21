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
 * Keep the sheet inside the *visual* viewport (above the iOS keyboard).
 * Sets CSS vars on the dialog element itself.
 */
function useVisualViewportSheet(
  openEl: HTMLElement | null,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!enabled || !openEl) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const apply = () => {
      // Distance from layout bottom to visual viewport bottom
      const bottomInset = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      openEl.style.setProperty("--sheet-bottom", `${bottomInset}px`);
      openEl.style.setProperty("--sheet-max-h", `${Math.floor(vv.height * 0.96)}px`);
      openEl.style.setProperty("--vv-top", `${vv.offsetTop}px`);
      openEl.style.setProperty("--vv-h", `${vv.height}px`);
    };

    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, [openEl, enabled]);
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);

  const setRefs = React.useCallback(
    (el: HTMLDivElement | null) => {
      localRef.current = el;
      setNode(el);
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref]
  );

  // Mobile sheet tracks visual viewport (keyboard-safe)
  useVisualViewportSheet(node, true);

  // When an input is focused, scroll it into view inside the sheet
  React.useEffect(() => {
    const el = node;
    if (!el) return;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") return;
      // Wait for keyboard / visualViewport to settle
      window.setTimeout(() => {
        t.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 120);
    };
    el.addEventListener("focusin", onFocusIn);
    return () => el.removeEventListener("focusin", onFocusIn);
  }, [node]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className={cn(
          // Mobile: bottom sheet, keyboard-aware via --sheet-* vars
          "fixed z-[200] grid w-full gap-4 border border-border bg-background p-5 shadow-lg outline-none",
          "left-0 right-0 mx-auto",
          "bottom-[var(--sheet-bottom,0px)] top-auto translate-x-0 translate-y-0",
          "max-h-[var(--sheet-max-h,92dvh)] overflow-y-auto overscroll-contain",
          "rounded-t-2xl rounded-b-none border-b-0",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
          // Desktop: centered modal
          "sm:bottom-auto sm:left-[50%] sm:right-auto sm:top-[50%] sm:max-h-[min(90vh,720px)]",
          "sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:rounded-xl sm:border-b sm:p-6 sm:pb-6",
          className
        )}
        // Prevent iOS from scrolling the page under the dialog when focusing inputs
        onOpenAutoFocus={(e) => {
          // Don't auto-focus first field — stops keyboard popping under a mid-screen dialog
          e.preventDefault();
          props.onOpenAutoFocus?.(e);
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm p-1.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
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
      "flex flex-col space-y-1.5 text-center sm:text-left",
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
