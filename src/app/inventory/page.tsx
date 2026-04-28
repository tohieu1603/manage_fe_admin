import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { fmtVND, cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { NewPartButton, StockMoveButtons } from "./inventory-actions";
import PartRowActions from "./part-row-actions";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";

const PAGE_SIZE = 20;

export default async function Inventory({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lowStock?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  // We pull two slices: the BE-paginated page (for the table) and a small
  // aggregate fetch for the summary card. Aggregates need every part so
  // they're not affected by pagination / filter.
  const [result, allParts] = await Promise.all([
    db.part.findPaginated({
      page,
      limit: PAGE_SIZE,
      search: params.q?.trim() || undefined,
    }),
    db.part.findMany(),
  ]);

  const totalValue = allParts.reduce((s, p) => s + p.stock * p.price, 0);
  const lowAll = allParts.filter((p) => p.stock < p.min);

  // BE doesn't have a low-stock filter, so apply it within the page.
  const parts = params.lowStock === "yes" ? result.data.filter((p) => p.stock < p.min) : result.data;

  return (
    <div>
      <PageHeader
        title="Kho vật tư"
        subtitle={`${result.total} vật tư · Giá trị tồn ${fmtVND(totalValue)}`}
        actions={<NewPartButton />}
      />
      <div className="p-8 space-y-6">
        {lowAll.length > 0 && (
          <div className="card p-4 border-l-4 border-warn-500 bg-warn-50">
            <div className="flex items-center gap-2 font-semibold text-warn-700">
              <AlertTriangle className="w-4 h-4" />
              Cần nhập thêm {lowAll.length} vật tư
            </div>
          </div>
        )}

        <SearchFilter
          placeholder="Tìm theo tên vật tư…"
          filters={[
            {
              key: "lowStock",
              label: "Lọc",
              options: [{ value: "yes", label: "Chỉ vật tư dưới ngưỡng" }],
            },
          ]}
        />

        <div className="card overflow-hidden">
          {parts.length === 0 ? (
            <div className="p-16 text-center text-sm text-ink-500">Không tìm thấy vật tư.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-ink-25 text-ink-500 text-left">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Tên vật tư</th>
                  <th className="px-5 py-2.5 font-medium">Tồn</th>
                  <th className="px-5 py-2.5 font-medium">Tối thiểu</th>
                  <th className="px-5 py-2.5 font-medium">Đơn giá</th>
                  <th className="px-5 py-2.5 font-medium">Giá trị</th>
                  <th className="px-5 py-2.5 font-medium w-44 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => {
                  const isLow = p.stock < p.min;
                  return (
                    <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-25">
                      <td className="px-5 py-3 font-medium">{p.name}</td>
                      <td className={cn("px-5 py-3 font-semibold", isLow && "text-danger-600")}>
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-5 py-3 text-ink-500">
                        {p.min} {p.unit}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{fmtVND(p.price)}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {fmtVND(p.price * p.stock)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <StockMoveButtons partId={p.id} name={p.name} current={p.stock} />
                          <PartRowActions part={p} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            limit={result.limit}
          />
        </div>
      </div>
    </div>
  );
}
