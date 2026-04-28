import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { fmtVND, cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { NewPartButton, StockMoveButtons } from "./inventory-actions";
import PartRowActions from "./part-row-actions";
import { SearchFilter } from "@/components/search-filter";

export default async function Inventory({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lowStock?: string }>;
}) {
  const params = await searchParams;
  const parts = await db.part.findMany();
  const total = parts.reduce((s, p) => s + p.stock * p.price, 0);
  const low = parts.filter((p) => p.stock < p.min);

  const q = params.q?.toLowerCase().trim() ?? "";
  const filtered = parts.filter((p) => {
    if (params.lowStock === "yes" && p.stock >= p.min) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Kho vật tư"
        subtitle={`${parts.length} vật tư · Giá trị tồn ${fmtVND(total)}`}
        actions={<NewPartButton />}
      />
      <div className="p-8 space-y-6">
        {low.length > 0 && (
          <div className="card p-4 border-l-4 border-warn-500 bg-warn-50">
            <div className="flex items-center gap-2 font-semibold text-warn-700">
              <AlertTriangle className="w-4 h-4" />
              Cần nhập thêm {low.length} vật tư
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
          {filtered.length === 0 ? (
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
                {filtered.map((p) => {
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
        </div>
      </div>
    </div>
  );
}
