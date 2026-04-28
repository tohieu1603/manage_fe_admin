"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, TypeChip } from "@/components/ui";
import { timeOf } from "@/lib/utils";
import { clientFetch } from "@/lib/client-fetch";

// Drag-drop dispatch board.
//   - Drag from the "unassigned" column → drop on a tech's hour cell to
//     assign + schedule in one shot.
//   - Drag an already-placed job card → drop on another hour to reschedule
//     (and optionally reassign to a different tech).
// Drop targets are per-hour cells; the BE PATCH endpoint accepts scheduledAt
// and the assign endpoint sets technicianId — we call both when needed.

interface JobLite {
  id: string;
  code: string;
  title: string;
  type: string;
  scheduledAt: string; // "YYYY-MM-DD HH:MM" — Prisma-era format from adapter
  duration: string;
  technicianId: string | null;
  customer: { name: string } | null;
}

interface TechLite {
  id: string;
  name: string;
  skill: string;
  color: string;
  initials: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i);

// Build an ISO Date at `hour:00` on the same calendar day as the original
// scheduled time. Falls back to today when the job had no schedule yet.
function rescheduleAt(originalScheduledAt: string, hour: number): string {
  let base = new Date();
  if (originalScheduledAt) {
    const parsed = new Date(originalScheduledAt.replace(" ", "T"));
    if (!Number.isNaN(parsed.getTime())) base = parsed;
  }
  base.setHours(hour, 0, 0, 0);
  return base.toISOString();
}

export default function DispatchBoard({ techs, jobs }: { techs: TechLite[]; jobs: JobLite[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dragJob, setDragJob] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Combined assign + reschedule. Either op is skipped when not needed so
  // we don't kick the BE event log with no-ops.
  async function place(jobId: string, technicianId: string, hour: number) {
    setFeedback(null);
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // 1) Reassign if dropped on a different tech.
    if (job.technicianId !== technicianId) {
      const r = await clientFetch(`/api/jobs/${jobId}/assign`, {
        method: "POST",
        body: { technicianId },
      });
      if (!r.ok) {
        setFeedback({ ok: false, msg: r.message ?? "Giao việc thất bại" });
        return;
      }
    }

    // 2) Patch scheduledAt to the dropped hour.
    const scheduledAt = rescheduleAt(job.scheduledAt, hour);
    const r2 = await clientFetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      body: { scheduledAt },
    });
    if (!r2.ok) {
      setFeedback({ ok: false, msg: r2.message ?? "Đổi giờ thất bại" });
      return;
    }

    setFeedback({
      ok: true,
      msg:
        job.technicianId === technicianId
          ? `Đổi giờ → ${hour}:00`
          : `Đã giao + đặt giờ ${hour}:00`,
    });
    startTransition(() => router.refresh());
  }

  const unassigned = jobs.filter((j) => !j.technicianId);

  return (
    <div className="p-6 space-y-4">
      {feedback && (
        <div
          className={`text-sm font-medium px-3 py-2 rounded-md inline-block ${
            feedback.ok ? "bg-ok-50 text-ok-700" : "bg-danger-50 text-danger-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="flex gap-4">
        <div className="w-64 card p-3 shrink-0">
          <div className="font-semibold mb-2">Việc chưa giao ({unassigned.length})</div>
          <div className="space-y-2">
            {unassigned.map((j) => (
              <div
                key={j.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", j.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDragJob(j.id);
                }}
                onDragEnd={() => setDragJob(null)}
                className={`p-3 bg-warn-50 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${
                  dragJob === j.id ? "border-warn-500 opacity-50" : "border-warn-500/30 hover:border-warn-500/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-ink-500">{j.code}</span>
                  <TypeChip type={j.type} />
                </div>
                <div className="text-sm font-medium">{j.title}</div>
                <div className="text-xs text-ink-500 mt-0.5">{j.customer?.name}</div>
                <div className="text-xs text-ink-500">
                  {timeOf(j.scheduledAt)} · {j.duration}
                </div>
              </div>
            ))}
            {unassigned.length === 0 && (
              <div className="text-xs text-ink-500 py-3">Đã giao hết</div>
            )}
          </div>
          <div className="text-[11px] text-ink-500 mt-3 italic">
            💡 Kéo thẻ vào ô giờ của KTV để giao + đặt lịch.
          </div>
        </div>

        <div className="flex-1 card overflow-auto">
          <div
            className="grid"
            style={{ gridTemplateColumns: "180px repeat(12, minmax(80px, 1fr))" }}
          >
            <div className="sticky left-0 bg-white border-b border-r border-ink-150 px-3 py-2 text-xs font-semibold z-10">
              Kỹ thuật viên
            </div>
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-ink-150 px-2 py-2 text-xs text-ink-500 text-center"
              >
                {h}:00
              </div>
            ))}

            {techs.map((t) => {
              const techJobs = jobs.filter((j) => j.technicianId === t.id);
              return (
                <div key={t.id} className="contents">
                  <div className="sticky left-0 bg-white border-b border-r border-ink-150 px-3 py-4 z-10 flex items-center gap-2">
                    <Avatar initials={t.initials} color={t.color} size={32} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {t.name.split(" ").slice(-2).join(" ")}
                      </div>
                      <div className="text-[10px] text-ink-500">{t.skill}</div>
                    </div>
                  </div>
                  {/* Single wide row spanning all 12 hour columns. Drop hour
                      is computed from the cursor's X position — keeps grid
                      placement simple and lets pills float on top without
                      fighting per-cell layout. */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const hour = 7 + Math.floor(ratio * 12);
                      const cellKey = `${t.id}:${hour}`;
                      if (hoverCell !== cellKey) setHoverCell(cellKey);
                    }}
                    onDragLeave={() =>
                      setHoverCell((c) => (c?.startsWith(`${t.id}:`) ? null : c))
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const hour = 7 + Math.floor(ratio * 12);
                      const jobId = e.dataTransfer.getData("text/plain");
                      setHoverCell(null);
                      setDragJob(null);
                      if (jobId) place(jobId, t.id, hour);
                    }}
                    className="relative h-16 border-b border-ink-150"
                    style={{ gridColumn: "2 / span 12" }}
                  >
                    {/* Hour grid lines + drop-target highlight under cursor. */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {HOURS.map((h) => {
                        const cellKey = `${t.id}:${h}`;
                        return (
                          <div
                            key={h}
                            className={`border-r border-ink-100 transition-colors ${
                              hoverCell === cellKey ? "bg-brand-100/70 ring-2 ring-brand-400 ring-inset" : ""
                            }`}
                          />
                        );
                      })}
                    </div>
                    {techJobs.map((j) => {
                      const [hh, mm] = timeOf(j.scheduledAt).split(":").map(Number);
                      const start = (hh || 7) - 7 + (mm || 0) / 60;
                      const durMatch = j.duration.match(/(\d+)h\s*(\d+)?/);
                      const dur = durMatch
                        ? parseInt(durMatch[1]) + parseInt(durMatch[2] || "0") / 60
                        : 1;
                      return (
                        <div
                          key={j.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", j.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDragJob(j.id);
                          }}
                          onDragEnd={() => setDragJob(null)}
                          className={`absolute top-2 bottom-2 rounded-lg px-2 py-1.5 text-xs text-white overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${
                            dragJob === j.id ? "opacity-40" : ""
                          }`}
                          style={{
                            left: `calc(${(start / 12) * 100}% + 2px)`,
                            width: `calc(${(dur / 12) * 100}% - 4px)`,
                            background: t.color,
                          }}
                          title={`${j.code} · ${j.title} (kéo để đổi giờ)`}
                        >
                          <div className="font-mono text-[9px] opacity-80">{j.code}</div>
                          <div className="font-semibold truncate">{j.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
