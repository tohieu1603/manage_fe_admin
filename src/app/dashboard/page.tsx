import { db } from "@/lib/data";
import { PageHeader, StatusChip, TypeChip, Avatar } from "@/components/ui";
import { fmtVND, timeOf } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Wrench } from "lucide-react";

export default async function Dashboard() {
  const [jobs, techs, parts] = await Promise.all([
    db.job.findMany({ include: { customer: true, technician: true }, orderBy: { scheduledAt: "asc" } }),
    db.technician.findMany(),
    db.part.findMany(),
  ]);
  const today = jobs.length;
  const done = jobs.filter((j) => j.status === "done").length;
  const progress = jobs.filter((j) => j.status === "in_progress" || j.status === "traveling").length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const revenue = jobs.filter((j) => j.status === "done").reduce((s, j) => s + j.amount, 0);
  const lowStock = parts.filter((p) => p.stock < p.min);

  // Sub-text now reflects real ratios derived from data — no fake deltas.
  const completionPct = today > 0 ? Math.round((done / today) * 100) : 0;
  const inProgressPct = today > 0 ? Math.round((progress / today) * 100) : 0;
  const pendingPct = today > 0 ? Math.round((pending / today) * 100) : 0;
  const kpis = [
    { label: "Tổng công việc", value: today, sub: `${pendingPct}% chờ xếp`, icon: Wrench, color: "brand" },
    { label: "Hoàn tất", value: done, sub: `${completionPct}% trên tổng`, icon: CheckCircle2, color: "ok" },
    { label: "Đang thực hiện", value: progress, sub: `${inProgressPct}% live`, icon: Clock, color: "violet" },
    { label: "Doanh thu (đã hoàn tất)", value: fmtVND(revenue), sub: `${done} đơn`, icon: TrendingUp, color: "warn" },
  ];

  // Header subtitle: live timestamp formatted in Vietnamese.
  const now = new Date();
  const wd = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"][now.getDay()];
  const subtitle = `${wd}, ${now.getDate()} tháng ${now.getMonth() + 1} ${now.getFullYear()} — ${now.getHours()} giờ ${String(now.getMinutes()).padStart(2, "0")} phút`;

  return (
    <div>
      <PageHeader title="Tổng quan" subtitle={subtitle} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-ink-500">{k.label}</div>
                  <div className="text-3xl font-bold text-ink-800 mt-1">{k.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg grid place-items-center bg-${k.color}-50`}>
                  <k.icon className={`w-5 h-5 text-${k.color}-600`} strokeWidth={1.75} />
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-500">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 card">
            <div className="flex items-center justify-between p-5 border-b border-ink-150">
              <div className="font-semibold">Việc hôm nay</div>
              <Link href="/jobs" className="text-sm text-brand-600 hover:underline">Xem tất cả →</Link>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-ink-25 text-ink-500">
                <tr className="text-left">
                  <th className="px-5 py-2.5 font-medium">Mã</th>
                  <th className="px-5 py-2.5 font-medium">Công việc</th>
                  <th className="px-5 py-2.5 font-medium">KTV</th>
                  <th className="px-5 py-2.5 font-medium">Giờ</th>
                  <th className="px-5 py-2.5 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 6).map((j) => (
                  <tr key={j.id} className="border-t border-ink-100 hover:bg-ink-25">
                    <td className="px-5 py-3 font-mono text-xs"><Link href={`/jobs/${j.id}`} className="text-brand-600 hover:underline">{j.code}</Link></td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink-800">{j.title}</div>
                      <div className="text-xs text-ink-500">{j.customer.name}</div>
                    </td>
                    <td className="px-5 py-3">
                      {j.technician ? (
                        <div className="flex items-center gap-2">
                          <Avatar initials={j.technician.initials} color={j.technician.color} size={24} />
                          <span className="text-xs">{j.technician.name}</span>
                        </div>
                      ) : <span className="text-xs text-ink-400">Chưa giao</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-600">{timeOf(j.scheduledAt)}</td>
                    <td className="px-5 py-3"><StatusChip status={j.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <div className="font-semibold mb-3">Trạng thái đội ngũ</div>
              <div className="space-y-2">
                {techs.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5">
                    <Avatar initials={t.initials} color={t.color} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[11px] text-ink-500 truncate">{t.location}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ background: t.status === "available" ? "#10B981" : t.status === "onsite" ? "#2556EB" : t.status === "traveling" ? "#8B5CF6" : "#F59E0B" }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warn-600" />
                <div className="font-semibold">Cảnh báo kho</div>
              </div>
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-ink-500">Tối thiểu {p.min} {p.unit}</div>
                    </div>
                    <span className="chip bg-danger-50 text-danger-700">{p.stock} {p.unit}</span>
                  </div>
                ))}
                {lowStock.length === 0 && <div className="text-sm text-ink-500">Kho ổn định</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
