"use client";

import { useEffect } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toast-store";

export function ToastViewport() {
  const items = useToastStore((state) => state.items);
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const timers = items.map((item) =>
      window.setTimeout(() => {
        dismissToast(item.id);
      }, 3600),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismissToast, items]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto rounded-[22px] border border-[#e6eaf2] bg-white px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {item.tone === "error" ? (
                <CircleAlert className="h-5 w-5 text-[#d83931]" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-[#00a870]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1f2329]">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-[#646a73]">{item.description}</p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 rounded-full p-0"
              onClick={() => dismissToast(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
