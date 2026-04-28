"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Server-component CSKH page passes the customer list down so the form
// can render a real picker without an extra client fetch.
interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
  address: string;
}

const TYPE_OPTIONS = [
  { value: "repair", label: "Sửa chữa" },
  { value: "install", label: "Lắp đặt" },
  { value: "maintenance", label: "Bảo dưỡng" },
  { value: "gas_charge", label: "Nạp gas" },
  { value: "uninstall", label: "Tháo dỡ" },
];

const PRIORITY_OPTIONS = [
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
  { value: "low", label: "Thấp" },
];

export default function CskhCreateForm({ customers }: { customers: CustomerOption[] }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("repair");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      setFeedback({ ok: false, msg: "Vui lòng chọn khách hàng" });
      return;
    }
    if (!title.trim()) {
      setFeedback({ ok: false, msg: "Vui lòng nhập tiêu đề" });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          priority,
          customerId,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ ok: false, msg: json.message ?? "Tạo yêu cầu thất bại" });
        return;
      }
      setFeedback({ ok: true, msg: `Đã tạo ${json.data?.code ?? "yêu cầu"}` });
      setTitle("");
      setNotes("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const selected = customers.find((c) => c.id === customerId);

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <label className="text-ink-600 text-xs">Khách hàng</label>
        <select
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg bg-white"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-ink-600 text-xs">SĐT (auto)</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg bg-ink-50 text-ink-500"
          value={selected?.phone ?? ""}
          readOnly
        />
      </div>
      <div className="col-span-2">
        <label className="text-ink-600 text-xs">Địa chỉ (auto)</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg bg-ink-50 text-ink-500"
          value={selected?.address ?? ""}
          readOnly
        />
      </div>
      <div className="col-span-2">
        <label className="text-ink-600 text-xs">Tiêu đề công việc *</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg"
          placeholder="VD: Bảo dưỡng định kỳ điều hòa phòng khách"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={300}
        />
      </div>
      <div>
        <label className="text-ink-600 text-xs">Loại dịch vụ</label>
        <select
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg bg-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-ink-600 text-xs">Ưu tiên</label>
        <select
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg bg-white"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="text-ink-600 text-xs">Mô tả sự cố</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border border-ink-200 rounded-lg h-20"
          placeholder="Khách mô tả chi tiết…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="col-span-2 flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Đang gửi…" : "Tạo yêu cầu"}
        </button>
        {feedback && (
          <span
            className={`text-xs font-semibold ${
              feedback.ok ? "text-ok-600" : "text-danger-600"
            }`}
          >
            {feedback.msg}
          </span>
        )}
      </div>
    </form>
  );
}
