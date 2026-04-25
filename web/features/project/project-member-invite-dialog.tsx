"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useInviteProjectMemberMutation } from "@/features/project/queries";

import type { ProjectRole } from "@/services/types";

type ProjectMemberInviteDialogProps = {
  open: boolean;
  projectId: string;
  onClose: () => void;
};

const roleOptions: Array<{ value: Exclude<ProjectRole, "OWNER">; label: string }> = [
  { value: "MEMBER", label: "成员" },
  { value: "ADMIN", label: "管理员" },
  { value: "GUEST", label: "访客" },
];

export function ProjectMemberInviteDialog({
  open,
  projectId,
  onClose,
}: ProjectMemberInviteDialogProps) {
  const inviteMutation = useInviteProjectMemberMutation(projectId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<ProjectRole, "OWNER">>("MEMBER");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmail("");
    setRole("MEMBER");
    setErrorMessage("");
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await inviteMutation.mutateAsync({
        email: email.trim(),
        role,
      });
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "邀请失败");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f172a]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-[#e6eaf2] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#8b95a7]">邀请成员</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">把成员拉进项目协作</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">邮箱</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="输入已注册用户邮箱"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">成员角色</label>
            <Select value={role} onChange={(event) => setRole(event.target.value as Exclude<ProjectRole, "OWNER">)}>
              {roleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "邀请中..." : "发送邀请"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
