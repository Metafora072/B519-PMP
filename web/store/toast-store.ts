"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error";

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastStore = {
  items: ToastItem[];
  pushToast: (toast: Omit<ToastItem, "id">) => number;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  pushToast: (toast) => {
    const id = ++toastId;

    set((state) => ({
      items: [...state.items, { ...toast, id }],
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));
