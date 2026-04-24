"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

type AuthMode = "login" | "register";

const initialFormState = {
  email: "",
  name: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLabel = mode === "login" ? "登录进入工作台" : "注册并进入平台";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await apiRequest(`/api/auth/${mode}`, {
        method: "POST",
        body:
          mode === "login"
            ? {
                email: formData.email,
                password: formData.password,
              }
            : formData,
      });

      setSuccessMessage(mode === "login" ? "登录成功，正在跳转..." : "注册成功，正在跳转...");
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "请求失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#3370ff]">认证模块</p>
          <h2 className="text-[30px] font-semibold tracking-tight text-[#1f2329]">
            {mode === "login" ? "登录到项目工作台" : "创建你的平台账号"}
          </h2>
          <p className="text-sm leading-6 text-[#646a73]">
            第一阶段先提供邮箱密码登录，后续再扩展飞书 OAuth 与 GitHub OAuth。
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl bg-[#f5f7fa] p-1">
          {[
            { label: "登录", value: "login" },
            { label: "注册", value: "register" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setMode(item.value as AuthMode);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`rounded-[14px] px-4 py-2 text-sm font-medium transition ${
                mode === item.value ? "bg-white text-[#1f2329] shadow-sm" : "text-[#646a73]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">邮箱</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>

          {mode === "register" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1f2329]">姓名</label>
              <Input
                type="text"
                placeholder="输入姓名"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1f2329]">密码</label>
            <Input
              type="password"
              placeholder="至少 8 位密码"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>

          {errorMessage ? <p className="text-sm text-[#f53f3f]">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-[#3370ff]">{successMessage}</p> : null}

          <Button className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : submitLabel}
          </Button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl bg-[#f7f9fc] p-4">
        <p className="text-sm font-medium text-[#1f2329]">阶段说明</p>
        <p className="mt-2 text-sm leading-6 text-[#646a73]">
          本页已完成登录与注册表单，登录成功后通过 HttpOnly Cookie 进入首页骨架。
        </p>
      </div>
    </div>
  );
}
