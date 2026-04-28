"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Generic pagination control. Reads/writes ?page=N to the URL while
// preserving other params (search, filter). Pages render data with the
// page number already applied via searchParams on the server.
export function Pagination({
  page,
  totalPages,
  total,
  limit,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(n: number) {
    const next = new URLSearchParams(params.toString());
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    router.replace(`${pathname}?${next.toString()}`);
  }

  if (totalPages <= 1) {
    return (
      <div className="px-4 py-3 text-xs text-ink-500 border-t border-ink-100 flex justify-end">
        {total} bản ghi
      </div>
    );
  }

  // Build a compact page list: 1 … 4 5 [6] 7 8 … N
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1, page - 2, page + 2]);
  const visible = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const fromIdx = (page - 1) * limit + 1;
  const toIdx = Math.min(page * limit, total);

  return (
    <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between text-sm">
      <div className="text-xs text-ink-500">
        {fromIdx}–{toIdx} / {total}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {visible.map((p, i) => {
          const showEllipsis = i > 0 && p - visible[i - 1] > 1;
          return (
            <span key={p} className="flex items-center">
              {showEllipsis && <span className="px-1.5 text-ink-400">…</span>}
              <button
                onClick={() => go(p)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-medium ${
                  p === page
                    ? "bg-brand-600 text-white"
                    : "text-ink-600 hover:bg-ink-100"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
