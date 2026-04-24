"use client";

import { create } from "zustand";

type TaskDrawerState = {
  isOpen: boolean;
  projectId: string | null;
  taskId: string | null;
  openDrawer: (params: { projectId: string; taskId: string }) => void;
  closeDrawer: () => void;
};

export const useTaskDrawerStore = create<TaskDrawerState>((set) => ({
  isOpen: false,
  projectId: null,
  taskId: null,
  openDrawer: ({ projectId, taskId }) =>
    set({
      isOpen: true,
      projectId,
      taskId,
    }),
  closeDrawer: () =>
    set({
      isOpen: false,
      projectId: null,
      taskId: null,
    }),
}));
