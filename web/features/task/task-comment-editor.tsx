"use client";

import { useMemo } from "react";
import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { ProjectMember } from "@/services/types";

type TaskCommentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  members?: ProjectMember[];
  onMentionSelect?: (memberId: string) => void;
  isPending?: boolean;
  submitLabel?: string;
  placeholder?: string;
  onCancel?: () => void;
};

function getMentionQuery(value: string) {
  const match = value.match(/(?:^|\s)@([^\s@]*)$/);
  return match?.[1] ?? null;
}

export function TaskCommentEditor({
  value,
  onChange,
  onSubmit,
  members = [],
  onMentionSelect,
  isPending = false,
  submitLabel = "发送评论",
  placeholder = "补充上下文、结论或协作备注",
  onCancel,
}: TaskCommentEditorProps) {
  const mentionQuery = getMentionQuery(value);
  const suggestions = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    const keyword = mentionQuery.trim().toLowerCase();
    return members
      .filter((member) => member.status === "ACTIVE")
      .filter((member) => !keyword || member.user.name.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [members, mentionQuery]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none bg-[#fbfcff]"
        />
        {suggestions.length ? (
          <div className="rounded-[18px] border border-[#e8edf4] bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            {suggestions.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onMentionSelect?.(member.user.id)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#1f2329] transition hover:bg-[#f7f9fc]"
              >
                <span>{member.user.name}</span>
                <span className="text-xs text-[#8b95a7]">{member.role}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
            取消
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !value.trim()}
        >
          <SendHorizonal className="mr-2 h-4 w-4" />
          {isPending ? "提交中..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
