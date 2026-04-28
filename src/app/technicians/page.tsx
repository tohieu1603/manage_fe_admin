import { db } from "@/lib/data";
import { PageHeader, Avatar } from "@/components/ui";
import { techStatusMap } from "@/lib/utils";
import NewTechButton from "./new-tech-button";
import TechRowActions from "./tech-row-actions";
import { SearchFilter } from "@/components/search-filter";

const STATUS_OPTIONS = [
  { value: "available", label: "Sẵn sàng" },
  { value: "traveling", label: "Đang đi" },
  { value: "onsite", label: "Tại hiện trường" },
  { value: "break", label: "Nghỉ" },
  { value: "offline", label: "Offline" },
];

export default async function Technicians({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const techs = await db.technician.findMany();
  const totalJobs = techs.reduce((s, t) => s + t.jobsMonth, 0);
  const avgRating = techs.length ? techs.reduce((s, t) => s + t.rating, 0) / techs.length : 0;

  const q = params.q?.toLowerCase().trim() ?? "";
  const filtered = techs.filter((t) => {
    if (params.status && t.status !== params.status) return false;
    if (q) {
      const hay = `${t.name} ${t.skill ?? ""} ${t.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Kỹ thuật viên"
        subtitle={`${techs.length} KTV · ${totalJobs} việc tháng · ⭐ ${avgRating.toFixed(1)} TB`}
        actions={<NewTechButton />}
      />
      <div className="p-8">
        <SearchFilter
          placeholder="Tìm theo tên, chuyên môn, SĐT…"
          filters={[{ key: "status", label: "Trạng thái", options: STATUS_OPTIONS }]}
        />
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-sm text-ink-500">Không tìm thấy KTV.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-25 text-ink-500 text-left">
                <tr>
                  <th className="px-5 py-2.5 font-medium">KTV</th>
                  <th className="px-5 py-2.5 font-medium">Trạng thái</th>
                  <th className="px-5 py-2.5 font-medium">Chuyên môn</th>
                  <th className="px-5 py-2.5 font-medium">Đánh giá</th>
                  <th className="px-5 py-2.5 font-medium">Việc tháng</th>
                  <th className="px-5 py-2.5 font-medium">Liên hệ</th>
                  <th className="px-5 py-2.5 font-medium w-24 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const tag = techStatusMap[t.status] ?? { label: t.status, cls: "bg-ink-100" };
                  return (
                    <tr key={t.id} className="border-t border-ink-100 hover:bg-ink-25">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={t.initials} color={t.color} size={32} />
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-[11px] text-ink-500">{t.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`chip ${tag.cls}`}>{tag.label}</span>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{t.skill || "—"}</td>
                      <td className="px-5 py-3">⭐ {t.rating.toFixed(1)}</td>
                      <td className="px-5 py-3 font-mono">{t.jobsMonth}</td>
                      <td className="px-5 py-3 text-ink-500 text-xs">{t.phone || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end">
                          <TechRowActions tech={t} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
