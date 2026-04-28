import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { Phone, Clock, Star } from "lucide-react";
import CskhCreateForm from "./cskh-create-form";

export default async function CSKH() {
  const [jobs, customers] = await Promise.all([
    db.job.findMany({ take: 50 }),
    db.customer.findMany({ take: 100 }),
  ]);

  // Reviews surface = completed jobs that have a note. Real signal beats
  // hardcoded testimonials.
  const reviews = jobs
    .filter((j) => j.status === "done" && j.notes)
    .slice(0, 3)
    .map((j) => ({
      name: j.customer?.name ?? "Khách hàng",
      stars: 5,
      text: j.notes,
      date: j.completedAt ? new Date(j.completedAt).toLocaleDateString("vi-VN") : "",
    }));

  // Pending queue = jobs awaiting dispatch (status=new/assigned).
  const queue = jobs
    .filter((j) => j.status === "pending")
    .slice(0, 5)
    .map((j) => ({
      name: j.customer?.name ?? "Khách hàng",
      phone: j.customer?.phone ?? "—",
      title: j.title,
      hot: j.priority === "urgent" || j.priority === "high",
    }));

  return (
    <div>
      <PageHeader title="Trung tâm CSKH" subtitle="Tiếp nhận yêu cầu & chăm sóc khách hàng" />
      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="font-semibold mb-4">Tạo yêu cầu mới</div>
            <CskhCreateForm
              customers={customers.map((c) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                address: c.address,
              }))}
            />
          </div>

          <div className="card">
            <div className="p-5 border-b border-ink-150 font-semibold">
              Phản hồi gần đây ({reviews.length})
            </div>
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-500">
                Chưa có phản hồi nào — sẽ hiện ở đây sau khi job được hoàn tất kèm ghi chú.
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {reviews.map((r, i) => (
                  <div key={i} className="p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-ink-500">{r.date}</div>
                    </div>
                    <div className="flex items-center gap-0.5 my-1">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <Star
                          key={k}
                          className={`w-3.5 h-3.5 ${
                            k < r.stars ? "fill-warn-500 text-warn-500" : "text-ink-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-ink-600">{r.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-ink-150 font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-600" />
            Hàng chờ xử lý ({queue.length})
          </div>
          {queue.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Không có yêu cầu nào đang chờ xếp.
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {queue.map((c, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 grid place-items-center">
                    <Phone className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    <div className="text-xs text-ink-500 truncate">{c.title}</div>
                  </div>
                  <div className={`text-xs ${c.hot ? "text-danger-600 font-semibold" : "text-ink-500"}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {c.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
