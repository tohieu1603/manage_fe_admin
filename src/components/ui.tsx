import { cn, statusMap, typeMap, priorityMap, techStatusMap } from "@/lib/utils";

export function StatusChip({ status }: { status: string }) {
  const s = statusMap[status] ?? { label: status, cls: "bg-ink-100 text-ink-700", dot: "#888" };
  return (
    <span className={cn("chip", s.cls)}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />{s.label}
    </span>
  );
}
export function TypeChip({ type }: { type: string }) {
  const t = typeMap[type] ?? { cls: "bg-ink-100 text-ink-700" };
  return <span className={cn("chip", t.cls)}>{type}</span>;
}
export function PriorityChip({ p }: { p: string }) {
  const pr = priorityMap[p] ?? { label: p, dot: "bg-ink-300" };
  return <span className="chip bg-ink-100 text-ink-700"><span className={cn("w-1.5 h-1.5 rounded-full", pr.dot)} />{pr.label}</span>;
}
export function TechStatusChip({ status }: { status: string }) {
  const t = techStatusMap[status] ?? { label: status, cls: "bg-ink-100 text-ink-700" };
  return <span className={cn("chip", t.cls)}>{t.label}</span>;
}
export function Avatar({ initials, color, size = 32 }: { initials: string; color: string; size?: number }) {
  return (
    <div className="rounded-full grid place-items-center text-white font-semibold" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-8 py-6 border-b border-ink-150 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-ink-800">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
