import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Balatro title-screen style buttons:
 * solid fill, thick black border, pixel font, hard drop shadow.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-display tracking-[0.12em] uppercase",
    "border-[3px] border-black",
    "rounded-xl",
    "transition-[transform,filter,box-shadow] duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-balatro-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    /* hard pixel shadow like Balatro UI */
    "shadow-[0_4px_0_#0a0a0a,0_6px_0_rgba(0,0,0,0.35)]",
    "hover:brightness-110 hover:-translate-y-0.5",
    "active:translate-y-1 active:shadow-[0_1px_0_#0a0a0a] active:brightness-95",
  ].join(" "),
  {
    variants: {
      variant: {
        /* PLAY — blue */
        default:
          "bg-[#3d8bfd] text-white [text-shadow:2px_2px_0_#0a1a40]",
        /* OPTIONS — amber/brown */
        secondary:
          "bg-[#c47a1a] text-white [text-shadow:2px_2px_0_#3a2200]",
        /* QUIT / destructive — red */
        destructive:
          "bg-[#e23d3d] text-white [text-shadow:2px_2px_0_#4a0000]",
        /* COLLECTION — green */
        success:
          "bg-[#2f9e6b] text-white [text-shadow:2px_2px_0_#0a2e1c]",
        /* MODS — purple/blue */
        mods:
          "bg-[#5b6fd4] text-white [text-shadow:2px_2px_0_#1a1a40]",
        /* gold chip / play hand */
        chip:
          "bg-[#3d8bfd] text-white [text-shadow:2px_2px_0_#0a1a40]",
        outline:
          "border-[3px] border-black bg-[#2a2a32] text-balatro-cream [text-shadow:2px_2px_0_#000] hover:bg-[#3a3a44]",
        ghost:
          "border-transparent bg-transparent shadow-none text-balatro-cream hover:bg-white/10 hover:shadow-none active:shadow-none",
        link:
          "border-transparent bg-transparent shadow-none text-sky-300 underline-offset-4 hover:underline hover:shadow-none active:shadow-none",
      },
      size: {
        default: "h-11 min-h-11 px-5 text-base sm:text-lg",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-14 rounded-2xl px-8 text-xl sm:text-2xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
