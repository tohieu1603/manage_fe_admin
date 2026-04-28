"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notif {
  id: string;
  title: string;
  body?: string;
  link?: string;
  kind: string;
  createdAt: string;
  readAt?: string;
}

// SSE handles live updates. We still poll on a slow interval as a fallback
// so a dropped stream doesn't leave the UI stale forever.
const FALLBACK_POLL_MS = 60_000;

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const popRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { data: { items: Notif[]; unread: number } };
      setItems(json.data.items ?? []);
      setUnread(json.data.unread ?? 0);
    } catch {
      // network blip — next tick will retry
    }
  }

  useEffect(() => {
    // Initial pull — covers SSE warm-up + anything that happened pre-connect.
    load();

    // Live stream. Browser auto-reconnects on drop using the BE's retry hint;
    // we listen for "notification" events and prepend to the list.
    const es = new EventSource("/api/notifications/stream");
    es.addEventListener("notification", (e) => {
      try {
        const n = JSON.parse((e as MessageEvent).data) as Notif;
        setItems((arr) => [n, ...arr.filter((x) => x.id !== n.id)].slice(0, 30));
        setUnread((u) => u + 1);
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(n.title, { body: n.body, tag: n.id });
          }
        }
      } catch {
        // ignore malformed payloads
      }
    });

    // Slow poll fallback — covers any blips in the SSE pipe.
    const t = setInterval(load, FALLBACK_POLL_MS);

    return () => {
      es.close();
      clearInterval(t);
    };
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/mark-read", { method: "POST" });
    setUnread(0);
    setItems((arr) => arr.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    router.refresh();
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-ink-100 transition-colors"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5 text-ink-600" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-ink-150 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
            <div className="font-semibold text-sm">Thông báo</div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-brand-600 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-[11px] text-ink-500 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-ink-500">
                Không có thông báo nào.
              </div>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b border-ink-100 hover:bg-ink-50 transition-colors ${
                    !n.readAt ? "bg-brand-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.readAt && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-800">{n.title}</div>
                      {n.body && <div className="text-xs text-ink-500 mt-0.5 truncate">{n.body}</div>}
                      <div className="text-[10px] text-ink-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
