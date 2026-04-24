import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-[#e5e6eb] bg-white px-4 py-3 text-sm text-[#1f2329] outline-none transition placeholder:text-[#86909c] focus:border-[#b9ccff] focus:ring-4 focus:ring-[#3370ff]/10",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
