import type { TaskRecord, TaskStatus } from "@/services/types";

export const BOARD_STATUS_ORDER = ["TODO", "IN_PROGRESS", "DONE"] as const satisfies readonly TaskStatus[];

export const BOARD_STATUS_META: Record<
  (typeof BOARD_STATUS_ORDER)[number],
  {
    label: string;
    accent: string;
  }
> = {
  TODO: {
    label: "Todo",
    accent: "bg-[#5b8ff9]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    accent: "bg-[#ffb020]",
  },
  DONE: {
    label: "Done",
    accent: "bg-[#00b578]",
  },
};

export function groupTasksByStatus(tasks: TaskRecord[]) {
  return BOARD_STATUS_ORDER.reduce<Record<(typeof BOARD_STATUS_ORDER)[number], TaskRecord[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    },
  );
}
