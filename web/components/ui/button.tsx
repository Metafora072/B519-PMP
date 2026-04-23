import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#3370ff] text-white hover:bg-[#245bdb]",
        outline: "border border-[#e5e6eb] bg-white text-[#1f2329] hover:bg-[#f7f9fc]",
        ghost: "bg-transparent text-[#646a73] hover:bg-[#f7f9fc]",
        secondary: "bg-[#f0f5ff] text-[#3370ff] hover:bg-[#e3edff]",
        warning: "bg-[#fff3e8] text-[#ff7d00] hover:bg-[#ffe9d1]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-2xl px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = "Button";

