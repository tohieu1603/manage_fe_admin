"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface Notif {
  id: string;
  title: string;
  body?: string;
  link?: string;
  kind: string;
  createdAt: string;
  readAt?: string;
}

const KIND_LABEL: Record<string, string> = {
  job_assigned: "Giao việc",
  job_status_changed: "Đổi trạng thái",
  job_note: "Ghi chú",
  system: "Hệ thống",
};

const KIND_TONE: Record<string, string> = {
  job_assigned: "bg-brand-50 text-brand-700",
  job_status_changed: "bg-amber-50 text-amber-700",
  job_note: "bg-violet-50 text-violet-700",
  system: "bg-ink-100 text-ink-600",
};

// One row in the inbox. Click the body to navigate (auto-marks read on the
// way), or the check button to mark-read in place. Optimistic — we hide the
// dot the moment the user clicks, then refresh server state.
export function NotificationRow({ n }: { n: Notif }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [readNow, setReadNow] = useState(!!n.readAt);

  async function markRead() {
    if (readNow) return;
    setReadNow(true);
    try {
      await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
    } finally {
      startTransition(() => router.refresh());
    }
  }

  const Body = (
    <div className="flex items-start gap-3 px-5 py-4">
      {!readNow && (
        <span className="mt-2 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded ${KIND_TONE[n.kind] ?? "bg-ink-100"}`}
          >
            {KIND_LABEL[n.kind] ?? n.kind}
          </span>
          <span className="text-[11px] text-ink-400">
            {new Date(n.createdAt).toLocaleString("vi-VN")}
          </span>
        </div>
        <div
          className={`text-sm mt-1 ${readNow ? "text-ink-700" : "font-semibold text-ink-900"}`}
        >
          {n.title}
        </div>
        {n.body && <div className="text-xs text-ink-500 mt-1">{n.body}</div>}
      </div>
      {!readNow && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markRead();
          }}
          className="shrink-0 mt-1 p-1.5 rounded-md text-ink-400 hover:bg-brand-50 hover:text-brand-600"
          title="Đánh dấu đã đọc"
          aria-label="Đánh dấu đã đọc"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return n.link ? (
    <Link
      href={n.link}
      onClick={() => {
        // Fire-and-forget — navigation already happens; we just don't want
        // the server to keep counting this row as unread on next render.
        if (!readNow) {
          setReadNow(true);
          fetch(`/api/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
        }
      }}
      className={`block hover:bg-ink-50 transition-colors ${!readNow ? "bg-brand-50/30" : ""}`}
    >
      {Body}
    </Link>
  ) : (
    <div className={!readNow ? "bg-brand-50/30" : ""}>{Body}</div>
  );
}
