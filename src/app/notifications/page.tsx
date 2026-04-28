// Full notifications inbox. Reads BE directly via the bearer-cookie helper
// instead of going through the /api proxy — cheaper, server-side only.

import { headers } from "next/headers";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { SearchFilter } from "@/components/search-filter";
import { readSession } from "@/lib/session";
import { NotificationRow } from "./notification-row";

interface Notif {
  id: string;
  title: string;
  body?: string;
  link?: string;
  kind: string;
  createdAt: string;
  readAt?: string;
}

const KIND_OPTIONS = [
  { value: "job_assigned", label: "Giao việc" },
  { value: "job_status_changed", label: "Đổi trạng thái" },
  { value: "job_note", label: "Ghi chú" },
  { value: "system", label: "Hệ thống" },
];

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

async function loadAll(opts: { kind?: string; unreadOnly?: boolean }): Promise<{
  items: Notif[];
  unread: number;
}> {
  const { accessToken } = await readSession();
  if (!accessToken) return { items: [], unread: 0 };
  const qs = new URLSearchParams({ limit: "100" });
  if (opts.kind) qs.set("kind", opts.kind);
  if (opts.unreadOnly) qs.set("unread", "1");
  const res = await fetch(`${API_URL}/notifications?${qs}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return { items: [], unread: 0 };
  const json = (await res.json()) as { data: { items: Notif[]; unread: number } };
  return json.data;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; unread?: string }>;
}) {
  const params = await searchParams;
  // headers() forces this RSC out of the static cache so SSE pushes show up
  // on refresh without a stale 304.
  await headers();
  const { items, unread } = await loadAll({
    kind: params.kind,
    unreadOnly: params.unread === "1",
  });

  const q = params.q?.toLowerCase().trim() ?? "";
  const filtered = q
    ? items.filter((n) =>
        `${n.title} ${n.body ?? ""}`.toLowerCase().includes(q),
      )
    : items;

  return (
    <div>
      <PageHeader
        title="Thông báo"
        subtitle={`${filtered.length} mục · ${unread} chưa đọc`}
      />
      <div className="p-8">
        <SearchFilter
          placeholder="Tìm theo tiêu đề, nội dung…"
          filters={[
            { key: "kind", label: "Loại", options: KIND_OPTIONS },
            {
              key: "unread",
              label: "Trạng thái",
              options: [{ value: "1", label: "Chưa đọc" }],
            },
          ]}
        />

        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Bell className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <div className="text-sm text-ink-500">Không có thông báo phù hợp.</div>
          </div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {filtered.map((n) => (
              <NotificationRow key={n.id} n={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
