"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      退出登录
    </Button>
  );
}
