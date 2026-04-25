"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProjectMutation } from "@/features/project/queries";
import type { JoinPolicy, ProjectVisibility } from "@/services/types";

type ProjectCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const initialState = {
  name: "",
  projectKey: "",
  description: "",
  visibility: "PRIVATE" as ProjectVisibility,
  joinPolicy: "INVITE_ONLY" as JoinPolicy,
};

export function ProjectCreateDialog({ open, onClose }: ProjectCreateDialogProps) {
  const [formData, setFormData] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const createProjectMutation = useCreateProjectMutation();

  const normalizedKey = useMemo(
    () => formData.projectKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
    [formData.projectKey],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await createProjectMutation.mutateAsync({
        name: formData.name.trim(),
        projectKey: normalizedKey,
        description: formData.description.trim(),
        visibility: formData.visibility,
        joinPolicy: formData.joinPolicy,
      });

      setFormData(initialState);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "创建项目失败");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-[#e6eaf2] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#8b95a7]">创建项目</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">新建一个可协作的研发项目</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">项目名称</label>
            <Input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="例如：B519-PMP 第三阶段"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">项目标识</label>
            <Input
              value={formData.projectKey}
              onChange={(event) => setFormData((prev) => ({ ...prev, projectKey: event.target.value }))}
              placeholder="例如：B519_PMP"
              required
            />
            <p className="text-xs text-[#8b95a7]">将自动规范为大写字母、数字与下划线：{normalizedKey || "未填写"}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">项目描述</label>
            <Textarea
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="补充项目目标、阶段范围和交付预期"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">项目可见性</label>
              <Select
                value={formData.visibility}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, visibility: event.target.value as ProjectVisibility }))
                }
              >
                <option value="PRIVATE">私密</option>
                <option value="MEMBERS_VISIBLE">成员可见</option>
                <option value="ORG_VISIBLE">组织内可见</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">加入方式</label>
              <Select
                value={formData.joinPolicy}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, joinPolicy: event.target.value as JoinPolicy }))
                }
              >
                <option value="INVITE_ONLY">仅邀请</option>
                <option value="REQUEST_APPROVAL">申请审批</option>
                <option value="OPEN">可直接加入</option>
              </Select>
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "创建中..." : "创建项目"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
