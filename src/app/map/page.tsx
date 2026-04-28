import { db } from "@/lib/data";
import { PageHeader, Avatar, TechStatusChip } from "@/components/ui";

export default async function MapPage() {
  const techs = await db.technician.findMany();
  const jobs = await db.job.findMany({ include: { customer: true } });
  return (
    <div>
      <PageHeader title="Bản đồ đội ngũ" subtitle="Vị trí KTV và công việc đang hoạt động" />
      <div className="p-6 flex gap-4 h-[calc(100vh-8rem-64px)]">
        <div className="w-80 card overflow-y-auto">
          <div className="p-4 border-b border-ink-150 font-semibold">Kỹ thuật viên ({techs.length})</div>
          <div className="divide-y divide-ink-100">
            {techs.map((t) => (
              <div key={t.id} className="p-4 flex items-center gap-3 hover:bg-ink-25">
                <Avatar initials={t.initials} color={t.color} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-ink-500 truncate">{t.location}</div>
                  <div className="mt-1"><TechStatusChip status={t.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 card relative overflow-hidden" style={{ background: "linear-gradient(135deg, #E6F3FF 0%, #F0F9FF 100%)" }}>
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {techs.map((t, i) => {
            const x = 15 + (i % 4) * 22 + Math.random() * 5;
            const y = 20 + Math.floor(i / 4) * 30 + Math.random() * 10;
            return (
              <div key={t.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                <div className="relative">
                  <Avatar initials={t.initials} color={t.color} size={44} />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: t.status === "available" ? "#10B981" : t.status === "onsite" ? "#2556EB" : "#F59E0B" }} />
                </div>
                <div className="mt-1 px-2 py-0.5 bg-white rounded shadow text-[10px] font-semibold whitespace-nowrap">{t.initials}</div>
              </div>
            );
          })}
          <div className="absolute top-4 left-4 card p-3 text-xs">
            <div className="font-semibold mb-1">Chú giải</div>
            <div className="flex items-center gap-2 mb-0.5"><div className="w-2 h-2 rounded-full bg-ok-500" /> Sẵn sàng</div>
            <div className="flex items-center gap-2 mb-0.5"><div className="w-2 h-2 rounded-full bg-brand-600" /> Đang làm</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warn-500" /> Nghỉ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
