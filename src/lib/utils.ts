import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtVND = (n: number) => n.toLocaleString("vi-VN") + "₫";
export const timeOf = (dt: string) => (dt || "").split(" ")[1] || "";
export const dateOf = (dt: string) => {
  const d = (dt || "").split(" ")[0];
  return d ? d.split("-").reverse().join("/") : "";
};

export const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
  pending:     { label: "Chờ xếp",     cls: "bg-warn-50 text-warn-700",     dot: "#F59E0B" },
  scheduled:   { label: "Đã lên lịch", cls: "bg-brand-50 text-brand-600",   dot: "#3B82F6" },
  traveling:   { label: "Đang đến",    cls: "bg-violet-50 text-violet-600", dot: "#8B5CF6" },
  in_progress: { label: "Đang làm",    cls: "bg-brand-50 text-brand-700",   dot: "#2556EB" },
  done:        { label: "Hoàn tất",    cls: "bg-ok-50 text-ok-700",         dot: "#10B981" },
  cancelled:   { label: "Đã huỷ",      cls: "bg-danger-50 text-danger-700", dot: "#EF4444" },
};

export const techStatusMap: Record<string, { label: string; cls: string }> = {
  available:  { label: "Sẵn sàng",       cls: "bg-ok-50 text-ok-700" },
  traveling:  { label: "Đang di chuyển", cls: "bg-violet-50 text-violet-600" },
  onsite:     { label: "Tại hiện trường",cls: "bg-brand-50 text-brand-700" },
  break:      { label: "Nghỉ",           cls: "bg-warn-50 text-warn-700" },
  offline:    { label: "Offline",        cls: "bg-ink-100 text-ink-700" },
};

export const priorityMap: Record<string, { label: string; dot: string }> = {
  high: { label: "Cao",         dot: "bg-danger-500" },
  med:  { label: "Trung bình",  dot: "bg-warn-500" },
  low:  { label: "Thấp",        dot: "bg-ink-300" },
};

export const typeMap: Record<string, { cls: string }> = {
  "Lắp đặt":  { cls: "bg-brand-50 text-brand-600" },
  "Sửa chữa": { cls: "bg-warn-50 text-warn-700" },
  "Bảo dưỡng":{ cls: "bg-violet-50 text-violet-600" },
};
