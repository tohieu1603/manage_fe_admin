import { db } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import Link from "next/link";
import { Building2, User } from "lucide-react";
import { NewCustomerButton, EditDeleteCustomer } from "./customer-actions";
import { SearchFilter } from "@/components/search-filter";
import { Pagination } from "@/components/pagination";

const TYPE_OPTIONS = [
  { value: "Cá nhân", label: "Cá nhân" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

const PAGE_SIZE = 12;

export default async function Customers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await db.customer.findPaginated({
    page,
    limit: PAGE_SIZE,
    search: params.q?.trim() || undefined,
  });

  // Type filter is FE-only (adapter exposes adapted "Cá nhân"/"Doanh nghiệp")
  // and the BE customer list endpoint doesn't take a type param yet, so we
  // narrow the page slice — accept that this skews count when filtering.
  const customers = params.type ? result.data.filter((c) => c.type === params.type) : result.data;

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        subtitle={`${result.total} khách hàng`}
        actions={<NewCustomerButton />}
      />
      <div className="p-8">
        <SearchFilter
          placeholder="Tìm theo tên, địa chỉ, SĐT…"
          filters={[{ key: "type", label: "Loại", options: TYPE_OPTIONS }]}
        />
        {customers.length === 0 ? (
          <div className="card p-16 text-center text-sm text-ink-500">
            Không tìm thấy khách hàng phù hợp.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {customers.map((c) => (
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
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="card mt-4">
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                limit={result.limit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
