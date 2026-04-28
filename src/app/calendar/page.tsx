import { db } from "@/lib/data";
import { PageHeader, TypeChip } from "@/components/ui";
import { timeOf } from "@/lib/utils";

// ISO week number for the calendar header.
function isoWeek(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

const VI_DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

export default async function Calendar() {
  const jobs = await db.job.findMany({ include: { customer: true, technician: true } });

  // Compute Monday of the current week + the 7 dates that follow.
  const today = new Date();
  const dow = today.getDay() || 7; // Sunday=7
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow - 1));
  monday.setHours(0, 0, 0, 0);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const todayIdx = weekDates.findIndex((d) => d.toDateString() === today.toDateString());

  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
  const subtitle = `Tuần ${isoWeek(today)} · ${fmt(weekDates[0])} — ${fmt(weekDates[6])}/${weekDates[6].getFullYear()}`;
  const hours = Array.from({ length: 12 }, (_, i) => 7 + i);

  // Bucket jobs by (date, hour) so the grid cell render is O(1).
  const buckets = new Map<string, typeof jobs>();
  for (const j of jobs) {
    if (!j.scheduledAt) continue;
    const d = new Date(j.scheduledAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.toDateString()}|${d.getHours()}`;
    const arr = buckets.get(key) ?? [];
    arr.push(j);
    buckets.set(key, arr);
  }

  return (
    <div>
      <PageHeader title="Lịch làm việc" subtitle={subtitle} />
      <div className="p-6">
        <div className="card overflow-hidden">
          <div className="grid text-xs font-semibold bg-ink-25 border-b border-ink-150" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div className="p-2"></div>
            {VI_DAYS.map((d, i) => (
              <div key={d} className={`p-3 text-center ${i === todayIdx ? "text-brand-600" : ""}`}>
                <div>{d}</div>
                <div className="text-lg">{fmt(weekDates[i])}</div>
              </div>
            ))}
          </div>
          {hours.map((h) => (
            <div key={h} className="grid border-b border-ink-100 min-h-[70px]" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
              <div className="p-2 text-xs text-ink-500 border-r border-ink-100">{h}:00</div>
              {weekDates.map((d, i) => {
                const dayJobs = buckets.get(`${d.toDateString()}|${h}`) ?? [];
                return (
                  <div key={i} className="p-1 border-r border-ink-100 relative">
                    {dayJobs.map((j) => (
                      <div
                        key={j.id}
                        className="mb-1 p-1.5 rounded text-[10px]"
                        style={{
                          background: (j.technician?.color || "#3B75F6") + "22",
                          borderLeft: `3px solid ${j.technician?.color || "#3B75F6"}`,
                        }}
                      >
                        <div className="font-semibold truncate">{j.title}</div>
                        <div className="text-ink-500 truncate">{j.customer?.name}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// timeOf no longer needed — bucketing uses raw Date hours.
void timeOf;
void TypeChip;
