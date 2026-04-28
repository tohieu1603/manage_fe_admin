"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

// Generic search/filter bar — debounced URL param sync. Pages read
// searchParams from the server side to filter their data.
export function SearchFilter({
  placeholder = "Tìm kiếm…",
  filters,
}: {
  placeholder?: string;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  // Debounce search to URL.
  useEffect(() => {
    const initial = params.get("q") ?? "";
    if (q === initial) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  const hasFilters = filters?.some((f) => params.get(f.key)) || q;

  function clearAll() {
    setQ("");
    startTransition(() => router.replace(pathname));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[260px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 h-9 text-sm bg-white border border-ink-200 rounded-lg outline-none hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {filters?.map((f) => {
        const v = params.get(f.key) ?? "";
        return (
          <div key={f.key} className="relative">
            <select
              value={v}
              onChange={(e) => setFilter(f.key, e.target.value)}
              className="appearance-none pl-3 pr-8 h-9 text-sm bg-white border border-ink-200 rounded-lg outline-none hover:border-ink-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 cursor-pointer"
            >
              <option value="">{f.label}: tất cả</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {f.label}: {o.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}

      {hasFilters && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink-700 px-2 h-9"
        >
          <X className="w-3.5 h-3.5" />
          Xoá lọc
        </button>
      )}
    </div>
  );
}
