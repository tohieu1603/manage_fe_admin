import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { readSession } from "@/lib/session";
import { beRoleToKey } from "@/lib/roles";
import { buildNav } from "@/lib/nav";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "CoolOps — Hệ thống quản lý dịch vụ điều hòa",
  description: "Quản lý vận hành công ty dịch vụ điều hòa",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await readSession();
  if (!user) {
    return (
      <html lang="vi">
        <body className={inter.className}>{children}</body>
      </html>
    );
  }
  const role = beRoleToKey(user.role);
  const nav = await buildNav(role, user.id);
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppShell user={user} nav={nav}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
