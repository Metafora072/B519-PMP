import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#e5e6eb] bg-white px-4 py-2 text-sm text-[#1f2329] outline-none transition placeholder:text-[#86909c] focus:border-[#b9ccff] focus:ring-4 focus:ring-[#3370ff]/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

