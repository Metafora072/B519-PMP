import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME ?? "pmp_access_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-4">
        <AppSidebar />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col overflow-hidden rounded-[24px] border border-[#e5e6eb] bg-white shadow-card">
          <AppHeader />
          <div className="flex-1 overflow-auto bg-[#fbfcfe] p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

