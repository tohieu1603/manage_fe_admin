import { db } from "@/lib/data";
import { PageHeader, StatusChip, TypeChip, PriorityChip, Avatar } from "@/components/ui";
import { fmtVND, timeOf, dateOf } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";
import NewJobButton from "./new-job-button";
import JobRowActions from "./job-row-actions";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";

// Filter values use BE-native enums so the FE doesn't have to map both ways.
const STATUS_OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "assigned", label: "Đã giao" },
  { value: "en_route", label: "Đang đến" },
  { value: "onsite", label: "Đã đến hiện trường" },
  { value: "in_progress", label: "Đang làm" },
  { value: "paused", label: "Tạm dừng" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

const PAGE_SIZE = 20;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  // Pagination + filter pushed to BE — no more client-side .filter() so
  // total counts and page jumps stay accurate even on big datasets.
  const [jobsResult, customers, techs] = await Promise.all([
    db.job.findPaginated({
      page,
      limit: PAGE_SIZE,
      search: params.q?.trim() || undefined,
      status: params.status || undefined,
    }),
    db.customer.findMany(),
    db.technician.findMany(),
  ]);

  const jobs = jobsResult.data;

  return (
    <div>
      <PageHeader
        title="Công việc"
        subtitle={`${jobsResult.total} công việc`}
        actions={
          <NewJobButton
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
            technicians={techs.map((t) => ({ id: t.id, name: t.name }))}
          />
        }
      />
      <div className="p-8">
        <SearchFilter
          placeholder="Tìm theo mã, tiêu đề hoặc khách hàng…"
          filters={[{ key: "status", label: "Trạng thái", options: STATUS_OPTIONS }]}
        />

        <div className="card overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-16 text-center text-sm text-ink-500">
              Không tìm thấy công việc nào.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-25 text-ink-500">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-medium">Mã</th>
                  <th className="px-4 py-2.5 font-medium">Công việc</th>
                  <th className="px-4 py-2.5 font-medium">Loại</th>
                  <th className="px-4 py-2.5 font-medium">Ưu tiên</th>
                  <th className="px-4 py-2.5 font-medium">KTV</th>
                  <th className="px-4 py-2.5 font-medium">Thời gian</th>
                  <th className="px-4 py-2.5 font-medium">Giá trị</th>
                  <th className="px-4 py-2.5 font-medium">Trạng thái</th>
                  <th className="px-4 py-2.5 font-medium w-32 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-ink-100 hover:bg-ink-25">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/jobs/${j.id}`} className="text-brand-600 hover:underline">
                        {j.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-xs text-ink-500">
                        {j.customer?.name} · {j.address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TypeChip type={j.type} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityChip p={j.priority} />
                    </td>
                    <td className="px-4 py-3">
                      {j.technician ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={j.technician.initials}
                            color={j.technician.color}
                            size={24}
                          />
                          <span className="text-xs">{j.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-400">Chưa giao</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{dateOf(j.scheduledAt)}</div>
                      <div className="text-ink-500">
                        {timeOf(j.scheduledAt)} · {j.duration}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{fmtVND(j.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={j.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/jobs/${j.id}`}
                          className="p-1.5 rounded-md text-ink-500 hover:text-brand-600 hover:bg-brand-50"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <JobRowActions
                          job={{
                            id: j.id,
                            code: j.code,
                            title: j.title,
                            type: j.type,
                            priority: j.priority,
                            amount: j.amount,
                            notes: j.notes,
                            scheduledAt: j.scheduledAt,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination
            page={jobsResult.page}
            totalPages={jobsResult.totalPages}
            total={jobsResult.total}
            limit={jobsResult.limit}
          />
        </div>
      </div>
    </div>
  );
}
