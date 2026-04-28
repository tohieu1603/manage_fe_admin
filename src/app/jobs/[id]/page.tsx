import { db } from "@/lib/data";
import { PageHeader, StatusChip, TypeChip, PriorityChip, Avatar } from "@/components/ui";
import { fmtVND, timeOf, dateOf } from "@/lib/utils";
import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import JobActions from "./job-actions";

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, techs] = await Promise.all([
    db.job.findUnique({
      where: { id },
      include: { customer: true, technician: true, events: { orderBy: { order: "asc" } } },
    }),
    db.technician.findMany(),
  ]);
  if (!job) notFound();

  return (
    <div>
      <PageHeader
        title={`${job.code} — ${job.title}`}
        subtitle={`${job.customer?.name ?? ""} · ${job.address}`}
      />
      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <StatusChip status={job.status} />
              <TypeChip type={job.type} />
              <PriorityChip p={job.priority} />
            </div>
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <div className="text-ink-500 text-xs mb-1">Lịch hẹn</div>
                <div className="font-medium">
                  {job.scheduledAt
                    ? `${dateOf(job.scheduledAt)} · ${timeOf(job.scheduledAt)}`
                    : "Chưa lên lịch"}
                </div>
              </div>
              <div>
                <div className="text-ink-500 text-xs mb-1">Thời lượng</div>
                <div className="font-medium">{job.duration}</div>
              </div>
              <div>
                <div className="text-ink-500 text-xs mb-1">Mã công việc</div>
                <div className="font-mono font-medium">{job.code}</div>
              </div>
              <div>
                <div className="text-ink-500 text-xs mb-1">Giá trị</div>
                <div className="font-mono font-medium">{fmtVND(job.amount)}</div>
              </div>
            </div>
            {job.notes && (
              <div className="mt-4 p-3 bg-ink-50 rounded-lg text-sm text-ink-600">{job.notes}</div>
            )}
          </div>

          <div className="card">
            <div className="p-5 border-b border-ink-150 font-semibold">
              Lịch sử công việc ({job.events.length})
            </div>
            <div className="p-5">
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-ink-150" />
                {job.events.map((e) => (
                  <div key={e.id} className="relative">
                    <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
                    <div className="text-xs text-ink-500">
                      {e.time} · {e.actor}
                    </div>
                    <div className="text-sm font-medium mt-0.5">{e.action}</div>
                    {e.detail && <div className="text-sm text-ink-600">{e.detail}</div>}
                  </div>
                ))}
                {job.events.length === 0 && (
                  <div className="text-sm text-ink-500">Chưa có sự kiện nào.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <JobActions
            jobId={job.id}
            beStatus={job.beStatus}
            currentTechId={job.technicianId}
            technicians={techs.map((t) => ({ id: t.id, name: t.name }))}
          />

          <div className="card p-5">
            <div className="font-semibold mb-3">Khách hàng</div>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{job.customer?.name}</div>
              <div className="flex items-center gap-2 text-ink-600">
                <MapPin className="w-4 h-4" />
                {job.customer?.address}
              </div>
              {job.customer?.phone && (
                <div className="flex items-center gap-2 text-ink-600">
                  <Phone className="w-4 h-4" />
                  {job.customer.phone}
                </div>
              )}
            </div>
          </div>

          {job.technician && (
            <div className="card p-5">
              <div className="font-semibold mb-3">Kỹ thuật viên</div>
              <div className="flex items-center gap-3">
                <Avatar initials={job.technician.initials} color={job.technician.color} size={44} />
                <div>
                  <div className="font-semibold">{job.technician.name}</div>
                  <div className="text-xs text-ink-500">{job.technician.phone}</div>
                  <div className="text-xs text-ink-500">
                    ⭐ {job.technician.rating} · {job.technician.jobsMonth} việc/tháng
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
