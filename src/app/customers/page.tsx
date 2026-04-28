import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { fmtVND } from "@/lib/utils";
import Link from "next/link";
import { Building2, User } from "lucide-react";
import { NewCustomerButton, EditDeleteCustomer } from "./customer-actions";
import { SearchFilter } from "@/components/search-filter";

const TYPE_OPTIONS = [
  { value: "Cá nhân", label: "Cá nhân" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

export default async function Customers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const customers = await db.customer.findMany({ include: { jobs: true } });

  const q = params.q?.toLowerCase().trim() ?? "";
  const filtered = customers.filter((c) => {
    if (params.type && c.type !== params.type) return false;
    if (q) {
      const hay = `${c.name} ${c.address} ${c.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        subtitle={`${filtered.length}/${customers.length} khách hàng`}
        actions={<NewCustomerButton />}
      />
      <div className="p-8">
        <SearchFilter
          placeholder="Tìm theo tên, địa chỉ, SĐT…"
          filters={[{ key: "type", label: "Loại", options: TYPE_OPTIONS }]}
        />
        {filtered.length === 0 ? (
          <div className="card p-16 text-center text-sm text-ink-500">
            Không tìm thấy khách hàng phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((c) => {
              const revenue = c.jobs
                .filter((j) => j.status === "done")
                .reduce((s, j) => s + j.amount, 0);
              return (
                <div
                  key={c.id}
                  className="card p-5 hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute top-3 right-3">
                    <EditDeleteCustomer customer={c} />
                  </div>
                  <Link href={`/customers/${c.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-lg grid place-items-center ${
                          c.type === "Doanh nghiệp"
                            ? "bg-brand-50 text-brand-600"
                            : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        {c.type === "Doanh nghiệp" ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-ink-500">
                          {c.type} · KH từ {c.since}
                        </div>
                        <div className="text-xs text-ink-500 mt-1">{c.address}</div>
                        {c.phone && <div className="text-xs text-ink-500">📞 {c.phone}</div>}
                        <div className="flex gap-4 mt-3 text-xs">
                          <span>
                            <b>{c.units}</b> thiết bị
                          </span>
                          <span>
                            <b>{c.jobs.length}</b> đơn
                          </span>
                          <span className="text-ok-600 font-semibold">{fmtVND(revenue)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
