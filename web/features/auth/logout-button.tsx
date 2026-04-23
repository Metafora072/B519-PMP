"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch(buildApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
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

