import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_#a67c12] hover:brightness-110 active:translate-y-0.5 active:shadow-none",
        destructive:
          "bg-balatro-red text-accent-foreground shadow-[0_4px_0_#8b1e18] hover:brightness-110 active:translate-y-0.5 active:shadow-none",
        outline:
          "border-2 border-balatro-gold/50 bg-black/40 text-balatro-cream shadow-sm hover:border-balatro-gold hover:bg-balatro-gold/10",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/10 shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-white/5 hover:text-balatro-gold",
        link: "text-balatro-gold underline-offset-4 hover:underline",
        chip:
          "chip-glow border-2 border-balatro-gold bg-gradient-to-b from-[#ffe08a] to-[#f5c542] text-[#1a1000] shadow-[0_4px_0_#a67c12] hover:brightness-105 active:translate-y-0.5 active:shadow-none touch-manipulation",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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
