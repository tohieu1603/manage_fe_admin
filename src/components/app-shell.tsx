"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import * as Icons from "lucide-react";
import { ROLES, beRoleToKey, initialsOf } from "@/lib/roles";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";

function Icon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const I = (Icons as any)[name] ?? Icons.Circle;
  return <I className={className} strokeWidth={1.75} />;
}

interface NavGroup {
  group: string;
  items: { id: string; label: string; icon: string; badge?: string; hot?: boolean; href: string }[];
}

export function AppShell({
  user,
  nav,
  children,
}: {
  user: SessionUser;
  nav: NavGroup[];
  children: React.ReactNode;
}) {
  const role = beRoleToKey(user.role);
  const r = ROLES[role];
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const initials = initialsOf(user.name);

  async function logout() {
    setBusy(true);
    await fetch("/api/session", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-ink-50">
      <aside className="w-64 shrink-0 bg-white border-r border-ink-150 flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink-150">
          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">C</div>
          <div>
            <div className="font-bold text-ink-800">CoolOps</div>
            <div className="text-[11px] text-ink-500 -mt-0.5">Dịch vụ điều hòa</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {nav.map((g) => (
            <div key={g.group} className="mb-5">
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {g.group}
              </div>
              {g.items.map((it) => {
                const active =
                  pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
                return (
                  <Link
                    key={it.id}
                    href={it.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors",
                      active ? "bg-brand-50 text-brand-700 font-semibold" : "text-ink-600 hover:bg-ink-100",
                    )}
                  >
                    <Icon name={it.icon} className="w-4 h-4" />
                    <span className="flex-1">{it.label}</span>
                    {it.badge && (
                      <span
                        className={cn(
                          "chip px-1.5 py-0 text-[10px]",
                          it.hot ? "bg-danger-500 text-white" : "bg-ink-150 text-ink-600",
                        )}
                      >
                        {it.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-150 relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50 text-left"
          >
            <div
              className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold"
              style={{ background: r.bg, color: r.fg }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-ink-500">{r.role}</div>
            </div>
            <Icons.ChevronUp
              className={cn("w-4 h-4 text-ink-400 transition-transform", !open && "rotate-180")}
            />
          </button>

          {open && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl border border-ink-150 shadow-xl py-1.5 z-50">
              <div className="px-3 py-2 text-[11px] text-ink-500 border-b border-ink-100">
                {user.email ?? "—"}
              </div>
              <button
                onClick={logout}
                disabled={busy}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-ink-50 text-left text-sm text-danger-600"
              >
                <Icons.LogOut className="w-4 h-4" />
                {busy ? "Đang đăng xuất…" : "Đăng xuất"}
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-ink-150 flex items-center px-6 gap-4">
          <div className="flex-1 max-w-md relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              placeholder="Tìm công việc, khách hàng, kỹ thuật viên…"
              className="w-full pl-10 pr-3 py-2 bg-ink-50 rounded-lg text-sm border border-transparent focus:border-brand-500 focus:bg-white focus:outline-none"
            />
          </div>
          <NotificationBell />
          <div
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-ink-200 bg-ink-50/50"
            title="Đổi role bằng cách đăng xuất và đăng nhập tài khoản khác"
          >
            <div
              className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold"
              style={{ background: r.bg, color: r.fg }}
            >
              {initials}
            </div>
            <div className="text-left">
              <div className="text-[11px] text-ink-500 leading-none">Đang đăng nhập</div>
              <div className="text-sm font-semibold text-ink-800 leading-tight">{r.role}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
