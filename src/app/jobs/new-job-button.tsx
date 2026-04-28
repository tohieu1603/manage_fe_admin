"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal, Field, TextInput, SelectInput, TextArea } from "@/components/modal";
import { clientFetch } from "@/lib/client-fetch";

interface CustomerOption {
  id: string;
  name: string;
}
interface TechOption {
  id: string;
  name: string;
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

export default function NewJobButton({
  customers,
  technicians,
}: {
  customers: CustomerOption[];
  technicians: TechOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("repair");
  const [priority, setPriority] = useState("medium");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [technicianId, setTechnicianId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setTitle("");
    setType("repair");
    setPriority("medium");
    setTechnicianId("");
    setScheduledAt("");
    setAmount("");
    setNotes("");
    setErr(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch<{ id: string; code: string }>("/api/jobs", {
      method: "POST",
      body: {
        title: title.trim(),
        type,
        priority,
        customerId,
        technicianId: technicianId || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        amount: amount ? Number(amount) : undefined,
        notes: notes.trim() || undefined,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Tạo thất bại");
      return;
    }
    setOpen(false);
    reset();
    router.refresh();
    if (r.data?.id) router.push(`/jobs/${r.data.id}`);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        Tạo công việc
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tạo công việc mới" width={560}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Tiêu đề" required>
            <TextInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lắp điều hòa Daikin 1.5HP phòng khách"
              maxLength={300}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại">
              <SelectInput value={type} onChange={(e) => setType(e.target.value)}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Ưu tiên">
              <SelectInput value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <Field label="Khách hàng" required>
            <SelectInput required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="KTV (tuỳ chọn)">
              <SelectInput value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
                <option value="">— Chưa giao —</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Lịch hẹn">
              <TextInput
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Giá trị (VND)">
            <TextInput
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </Field>

          <Field label="Ghi chú">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </Field>

          {err && <div className="text-xs text-danger-600 font-semibold">{err}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="btn-secondary"
              disabled={busy}
            >
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Đang tạo…" : "Tạo công việc"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
