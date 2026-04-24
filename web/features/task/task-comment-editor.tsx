"use client";

import { SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type TaskCommentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  submitLabel?: string;
  placeholder?: string;
  onCancel?: () => void;
};

export function TaskCommentEditor({
  value,
  onChange,
  onSubmit,
  isPending = false,
  submitLabel = "发送评论",
  placeholder = "补充上下文、结论或协作备注",
  onCancel,
}: TaskCommentEditorProps) {
  return (
    <div className="space-y-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-none bg-[#fbfcff]"
      />
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
