"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// BE state machine — mirror of be_job/src/services/job.service.ts TRANSITIONS.
// Keys are the RAW BE status (not the Prisma alias) so we don't collapse
// distinct states like "new"/"assigned" into the same bucket.
const TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  new: [
    { value: "assigned", label: "Đánh dấu đã giao" },
    { value: "cancelled", label: "Huỷ" },
  ],
  assigned: [
    { value: "en_route", label: "Đang đến nơi" },
    { value: "new", label: "Bỏ giao" },
    { value: "cancelled", label: "Huỷ" },
  ],
  en_route: [
    { value: "onsite", label: "Đã đến nơi" },
    { value: "cancelled", label: "Huỷ" },
  ],
  onsite: [
    { value: "in_progress", label: "Bắt đầu thực hiện" },
    { value: "cancelled", label: "Huỷ" },
  ],
  in_progress: [
    { value: "paused", label: "Tạm dừng" },
    { value: "completed", label: "Hoàn tất" },
    { value: "cancelled", label: "Huỷ" },
  ],
  paused: [
    { value: "in_progress", label: "Tiếp tục" },
    { value: "cancelled", label: "Huỷ" },
  ],
  completed: [],
  cancelled: [],
};

export default function JobActions({
  jobId,
  beStatus,
  technicians,
  currentTechId,
}: {
  jobId: string;
  /** Raw BE status — see prisma.ts adapter beStatus field. */
  beStatus: string;
  technicians: { id: string; name: string }[];
  currentTechId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [techPick, setTechPick] = useState(currentTechId ?? technicians[0]?.id ?? "");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function call(path: string, body: unknown, okMsg: string) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setFeedback({ ok: false, msg: json.message ?? "Thao tác thất bại" });
    } else {
      setFeedback({ ok: true, msg: okMsg });
      startTransition(() => router.refresh());
    }
  }

  const transitions = TRANSITIONS[beStatus] ?? [];
  const isFinal = beStatus === "completed" || beStatus === "cancelled";

  return (
    <div className="card p-5 space-y-4">
      <div className="font-semibold">Hành động</div>

      {transitions.length > 0 ? (
        <div>
          <div className="text-xs text-ink-500 mb-1.5">Chuyển trạng thái</div>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <button
                key={t.value}
                disabled={pending}
                onClick={() => call(`/api/jobs/${jobId}/status`, { status: t.value }, `→ ${t.label}`)}
                className="text-xs px-3 py-1.5 rounded-md border border-ink-200 hover:bg-ink-50 disabled:opacity-50"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-xs text-ink-500">
          {isFinal ? "Trạng thái cuối — không thể chuyển tiếp." : "Không có chuyển tiếp khả dụng."}
        </div>
      )}

      {!isFinal && (
        <div>
          <div className="text-xs text-ink-500 mb-1.5">Giao cho KTV</div>
          <div className="flex gap-2">
            <select
              value={techPick}
              onChange={(e) => setTechPick(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 border border-ink-200 rounded-md bg-white"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              disabled={pending || !techPick}
              onClick={() => call(`/api/jobs/${jobId}/assign`, { technicianId: techPick }, "Đã giao việc")}
              className="text-xs px-3 py-1.5 rounded-md bg-brand-600 text-white disabled:opacity-50"
            >
              Giao
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-ink-500 mb-1.5">Thêm ghi chú</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú nội bộ…"
          className="w-full text-xs px-2 py-1.5 border border-ink-200 rounded-md h-16"
          maxLength={2000}
        />
        <button
          disabled={pending || !note.trim()}
          onClick={async () => {
            await call(`/api/jobs/${jobId}/notes`, { note: note.trim() }, "Đã thêm ghi chú");
            setNote("");
          }}
          className="mt-2 text-xs px-3 py-1.5 rounded-md bg-ink-700 text-white disabled:opacity-50"
        >
          Lưu ghi chú
        </button>
      </div>

      {feedback && (
        <div className={`text-xs font-semibold ${feedback.ok ? "text-ok-600" : "text-danger-600"}`}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}
