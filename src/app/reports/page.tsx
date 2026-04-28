import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { fmtVND } from "@/lib/utils";

export default async function Reports() {
  const [jobs, techs] = await Promise.all([db.job.findMany(), db.technician.findMany()]);

  // Revenue is only counted from completed work — booking amount on
  // pending jobs hasn't materialised yet.
  const doneJobs = jobs.filter((j) => j.status === "done");
  const revenue = doneJobs.reduce((s, j) => s + j.amount, 0);
  const completionRate = jobs.length ? Math.round((doneJobs.length / jobs.length) * 100) : 0;
  const avgPerJob = doneJobs.length ? Math.round(revenue / doneJobs.length) : 0;

  const typeCount: Record<string, number> = {};
  jobs.forEach((j) => (typeCount[j.type] = (typeCount[j.type] || 0) + 1));
  const typeColors: Record<string, string> = {
    "Lắp đặt": "#3B75F6",
    "Sửa chữa": "#F59E0B",
    "Bảo dưỡng": "#8B5CF6",
    "Tháo dỡ": "#64748B",
    "Nạp gas": "#10B981",
  };

  // 8-week revenue series ending this week. Bucket by job.completedAt
  // (fallback scheduledAt). Empty weeks render as zero — accurate, not faked.
  const now = new Date();
  const startOfWeek = (d: Date) => {
    const x = new Date(d);
    const day = x.getDay() || 7;
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - (day - 1));
    return x;
  };
  const thisWeek = startOfWeek(now);
  const weeks: { label: string; total: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(thisWeek);
    d.setDate(d.getDate() - i * 7);
    weeks.push({ label: `T${d.getDate()}/${d.getMonth() + 1}`, total: 0 });
  }
  for (const j of doneJobs) {
    const ref = j.completedAt || j.scheduledAt;
    if (!ref) continue;
    const d = new Date(ref);
    if (Number.isNaN(d.getTime())) continue;
    const wkStart = startOfWeek(d);
    const offsetWeeks = Math.round((thisWeek.getTime() - wkStart.getTime()) / (7 * 86_400_000));
    if (offsetWeeks >= 0 && offsetWeeks < 8) weeks[7 - offsetWeeks].total += j.amount;
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.total));

  const subtitle = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <div>
      <PageHeader title="Báo cáo" subtitle={subtitle} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Doanh thu (đã hoàn tất)", value: fmtVND(revenue) },
            { label: "Tổng số đơn", value: jobs.length.toString() },
            { label: "Giá trị TB/đơn done", value: fmtVND(avgPerJob) },
            { label: "Tỷ lệ hoàn tất", value: `${completionRate}%` },
          ].map((k) => (
            <div key={k.label} className="card p-5">
              <div className="text-sm text-ink-500">{k.label}</div>
              <div className="text-2xl font-bold mt-1">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="font-semibold mb-4">Doanh thu 8 tuần gần nhất</div>
            <div className="flex items-end gap-3 h-48">
              {weeks.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-brand-500 rounded-t"
                    style={{ height: `${(w.total / maxWeek) * 100}%`, minHeight: w.total > 0 ? 4 : 0 }}
                    title={fmtVND(w.total)}
                  />
                  <div className="text-[10px] text-ink-500">{w.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="font-semibold mb-4">Phân loại công việc</div>
            <div className="space-y-3">
              {Object.entries(typeCount).map(([t, n]) => {
                const pct = Math.round((n / jobs.length) * 100);
                return (
                  <div key={t}>
                    <div className="flex justify-between text-sm mb-1"><span>{t}</span><span className="font-semibold">{n} ({pct}%)</span></div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: typeColors[t] }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-4">Xếp hạng KTV</div>
          <table className="w-full text-sm">
            <thead className="text-ink-500 text-left"><tr><th className="py-2">#</th><th>KTV</th><th>Việc tháng</th><th>Đánh giá</th><th>Chuyên môn</th></tr></thead>
            <tbody>
              {techs.sort((a, b) => b.jobsMonth - a.jobsMonth).map((t, i) => (
                <tr key={t.id} className="border-t border-ink-100">
                  <td className="py-3 font-bold text-ink-400">#{i + 1}</td>
                  <td>{t.name}</td>
                  <td className="font-mono">{t.jobsMonth}</td>
                  <td>⭐ {t.rating}</td>
                  <td>{t.skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
