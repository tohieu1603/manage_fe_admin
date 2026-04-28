import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { fmtVND } from "@/lib/utils";
import { TrendingUp, Users, Award, AlertTriangle } from "lucide-react";

export default async function Owner() {
  const [jobs, techs, customers, parts] = await Promise.all([
    db.job.findMany(),
    db.technician.findMany(),
    db.customer.findMany(),
    db.part.findMany(),
  ]);
  // Real revenue = sum of completed jobs' amounts.
  const revenue = jobs
    .filter((j) => j.status === "done")
    .reduce((s, j) => s + (j.amount ?? 0), 0);
  const envTarget = Number(process.env.COOLOPS_REVENUE_TARGET);
  const target = Number.isFinite(envTarget) && envTarget > 0 ? envTarget : Math.max(revenue * 1.2, 1);
  const done = jobs.filter((j) => j.status === "done").length;
  const cancelled = jobs.filter((j) => j.status === "cancelled").length;
  const lowStockCount = parts.filter((p) => p.stock < p.min).length;

  // Quarter label from current date (Q1..Q4 / year).
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const subtitle = `Quý ${quarter}/${now.getFullYear()} · Điều hành cấp cao`;

  // Aggregate revenue by month over the last 12 calendar months. Uses
  // jobs.completedAt where available; falls back to scheduledAt.
  const months: { label: string; total: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: `T${d.getMonth() + 1}`, total: 0 });
  }
  for (const j of jobs) {
    if (j.status !== "done") continue;
    const ref = j.completedAt || j.scheduledAt;
    const d = ref ? new Date(ref) : null;
    if (!d || Number.isNaN(d.getTime())) continue;
    const offset = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (offset >= 0 && offset < 12) months[11 - offset].total += j.amount ?? 0;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // Average rating across techs as a quick proxy for NPS-ish signal.
  const avgRating = techs.length
    ? techs.reduce((s, t) => s + (t.rating ?? 0), 0) / techs.length
    : 0;
  const npsLike = Math.round(avgRating * 20); // 0-5 → 0-100

  // Operations health: completion rate, on-time-ish (non-cancelled), tech
  // utilisation (non-offline / total).
  const completionRate = jobs.length ? Math.round((done / jobs.length) * 100) : 0;
  const onTimeRate = jobs.length ? Math.round(((jobs.length - cancelled) / jobs.length) * 100) : 0;
  const activeTech = techs.filter((t) => t.status !== "offline").length;
  const utilization = techs.length ? Math.round((activeTech / techs.length) * 100) : 0;
  return (
    <div>
      <PageHeader title="Tổng quan doanh nghiệp" subtitle={subtitle} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: `Doanh thu Q${quarter}`, value: fmtVND(revenue), sub: `${Math.round((revenue / target) * 100)}% mục tiêu`, icon: TrendingUp, color: "ok" },
            { label: "Khách hàng", value: customers.length.toString(), sub: `${done} đơn hoàn tất`, icon: Users, color: "brand" },
            { label: "Đánh giá KTV (TB)", value: avgRating.toFixed(1), sub: `~ NPS ${npsLike}`, icon: Award, color: "violet" },
            { label: "Cảnh báo kho", value: lowStockCount.toString(), sub: lowStockCount > 0 ? "vật tư dưới ngưỡng" : "kho ổn định", icon: AlertTriangle, color: lowStockCount > 0 ? "warn" : "ok" },
          ].map((k) => (
            <div key={k.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-ink-500">{k.label}</div>
                  <div className="text-2xl font-bold mt-1">{k.value}</div>
                  <div className="text-xs text-ink-500 mt-1">{k.sub}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg grid place-items-center bg-${k.color}-50`}>
                  <k.icon className={`w-5 h-5 text-${k.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <div className="font-semibold mb-4">Doanh thu 12 tháng gần nhất</div>
          <div className="flex items-end gap-2 h-48">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand-500 rounded-t transition-[height]"
                  style={{ height: `${maxMonth ? (m.total / maxMonth) * 100 : 0}%`, minHeight: m.total > 0 ? 4 : 0 }}
                  title={fmtVND(m.total)}
                />
                <div className="text-[10px] text-ink-500">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="font-semibold mb-4">Top kỹ thuật viên (tháng này)</div>
            <div className="space-y-3">
              {techs.sort((a, b) => b.jobsMonth - a.jobsMonth).slice(0, 5).map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-6 text-sm font-bold text-ink-400">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-ink-500">⭐ {t.rating}</div>
                  </div>
                  <div className="text-sm font-mono">{t.jobsMonth} việc</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="font-semibold mb-4">Sức khoẻ vận hành</div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Tỉ lệ hoàn tất", pct: completionRate, tone: completionRate >= 80 ? "ok" : completionRate >= 50 ? "warn" : "danger" },
                { label: "Tỉ lệ không huỷ", pct: onTimeRate, tone: onTimeRate >= 90 ? "ok" : "warn" },
                { label: "KTV đang hoạt động", pct: utilization, tone: utilization >= 70 ? "ok" : utilization >= 40 ? "warn" : "danger" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span>{row.label}</span>
                    <span className={`font-semibold text-${row.tone}-600`}>{row.pct}%</span>
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${row.tone}-500`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
