import { db } from "@/lib/data";
import { PageHeader, StatusChip } from "@/components/ui";
import { timeOf } from "@/lib/utils";
import { MapPin, Camera, CheckCircle2, Play } from "lucide-react";
import { readSession } from "@/lib/session";

export default async function Tech() {
  // If the logged-in user is a technician, show their own jobs; otherwise
  // fall back to the first tech (preview mode for dispatcher/owner).
  const { user } = await readSession();
  const techs = await db.technician.findMany();
  const myTech = user?.role === "technician"
    ? techs.find((t) => t.name === user.name) ?? techs[0]
    : techs[0];
  const jobs = myTech
    ? await db.job.findMany({ where: { technicianId: myTech.id }, include: { customer: true } })
    : [];

  const greetName = (myTech?.name || user?.name || "bạn").split(" ").pop() || "bạn";
  const todayCount = jobs.length;
  const doneCount = jobs.filter((j) => j.status === "done").length;
  const inProgressCount = jobs.filter((j) => j.status === "in_progress" || j.status === "traveling").length;
  const current = jobs.find((j) => j.status === "in_progress") || jobs[0];
  return (
    <div>
      <PageHeader title="App Kỹ thuật viên" subtitle="Mô phỏng giao diện mobile của KTV" />
      <div className="p-8 flex gap-8 justify-center">
        {[current, jobs[1]].filter(Boolean).map((j, idx) => (
          <div key={j.id} className="w-[360px] bg-ink-900 rounded-[40px] p-2.5 shadow-2xl">
            <div className="bg-white rounded-[32px] overflow-hidden" style={{ height: 720 }}>
              <div className="h-10 bg-ink-900 text-white text-xs flex items-center justify-between px-6">
                <span>9:41</span><span>●●●</span>
              </div>
              <div className="p-5 h-full overflow-y-auto">
                {idx === 0 ? (
                  <>
                    <div className="text-xs text-ink-500">Xin chào</div>
                    <div className="text-xl font-bold">{greetName}</div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="card p-2.5 text-center"><div className="text-xl font-bold text-brand-600">{todayCount}</div><div className="text-[10px] text-ink-500">được giao</div></div>
                      <div className="card p-2.5 text-center"><div className="text-xl font-bold text-ok-600">{doneCount}</div><div className="text-[10px] text-ink-500">đã xong</div></div>
                      <div className="card p-2.5 text-center"><div className="text-xl font-bold text-warn-600">{inProgressCount}</div><div className="text-[10px] text-ink-500">đang làm</div></div>
                    </div>
                    <div className="mt-5 font-semibold text-sm">Việc của hôm nay</div>
                    <div className="space-y-2.5 mt-2">
                      {jobs.slice(0, 4).map((jj) => (
                        <div key={jj.id} className="card p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[10px] text-ink-500">{jj.code}</span>
                            <StatusChip status={jj.status} />
                          </div>
                          <div className="font-semibold text-sm">{jj.title}</div>
                          <div className="text-xs text-ink-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{jj.address}</div>
                          <div className="text-xs text-ink-500">{timeOf(jj.scheduledAt)} · {jj.duration}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-ink-500">{j.code}</div>
                    <div className="text-lg font-bold">{j.title}</div>
                    <div className="mt-3 p-3 bg-brand-50 rounded-xl">
                      <div className="text-xs text-ink-500">Đang thực hiện</div>
                      <div className="text-2xl font-mono font-bold text-brand-700">01:24:36</div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="p-3 card flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-ok-500" /><span>Check-in GPS</span></div>
                      <div className="p-3 card flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-ok-500" /><span>Chẩn đoán & chụp ảnh</span></div>
                      <div className="p-3 card flex items-center gap-3 border-brand-500 border-2"><Play className="w-5 h-5 text-brand-600" /><span className="font-semibold">Xử lý sự cố</span></div>
                      <div className="p-3 card flex items-center gap-3 text-ink-400"><div className="w-5 h-5 rounded-full border-2 border-ink-300" /><span>Nghiệm thu khách ký</span></div>
                    </div>
                    <button className="w-full mt-4 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />Chụp ảnh hiện trường
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
