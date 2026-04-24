"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateModuleMutation } from "@/features/project/queries";

type ModuleCreateDialogProps = {
  open: boolean;
  projectId: string;
  onClose: () => void;
};

const COLOR_OPTIONS = ["#3370ff", "#00a870", "#ff7d00", "#f53f3f", "#7b61ff", "#86909c"];

const initialState = {
  name: "",
  description: "",
  color: COLOR_OPTIONS[0],
};

export function ModuleCreateDialog({ open, projectId, onClose }: ModuleCreateDialogProps) {
  const createModuleMutation = useCreateModuleMutation(projectId);
  const [formData, setFormData] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await createModuleMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      });

      setFormData(initialState);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "创建模块失败");
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-[#e6eaf2] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#8b95a7]">创建模块</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#1f2329]">先补模块，再闭环创建任务</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">模块名称</label>
            <Input
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="例如：前端协作看板"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">模块描述</label>
            <Textarea
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="补充模块边界、目标和负责人约定"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[#1f2329]">模块颜色</label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    formData.color === color ? "border-[#1f2329] scale-105" : "border-white"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`选择颜色 ${color}`}
                />
              ))}
            </div>
          </div>

          {errorMessage ? <p className="text-sm text-[#d83931]">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={createModuleMutation.isPending}>
              {createModuleMutation.isPending ? "创建中..." : "创建模块"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
