"use client";

import { Field, TextInput, SelectInput, TextArea } from "@/components/modal";
import { EditAction, DeleteAction } from "@/components/row-actions";

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

const VI_TO_BE_TYPE: Record<string, string> = {
  "Lắp đặt": "install",
  "Sửa chữa": "repair",
  "Bảo dưỡng": "maintenance",
  "Tháo dỡ": "uninstall",
  "Nạp gas": "gas_charge",
};

interface JobLite {
  id: string;
  code: string;
  title: string;
  type: string; // VI label
  priority: string;
  amount: number;
  notes?: string;
  scheduledAt?: string; // "YYYY-MM-DD HH:MM"
}

export default function JobRowActions({ job }: { job: JobLite }) {
  const typeBe = VI_TO_BE_TYPE[job.type] ?? "repair";
  // Convert "YYYY-MM-DD HH:MM" → "YYYY-MM-DDTHH:MM" for datetime-local input.
  const dtLocal = job.scheduledAt ? job.scheduledAt.replace(" ", "T") : "";

  return (
    <div className="flex gap-1">
      <EditAction
        title={`Sửa: ${job.code}`}
        url={`/api/jobs/${job.id}`}
        width={560}
        initial={{
          title: job.title,
          type: typeBe,
          priority: job.priority,
          amount: job.amount,
          notes: job.notes ?? "",
          scheduledAt: dtLocal,
        }}
        render={(s, set) => (
          <>
            <Field label="Tiêu đề" required>
              <TextInput
                required
                value={String(s.title ?? "")}
                onChange={(e) => set("title", e.target.value)}
                maxLength={300}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Loại">
                <SelectInput
                  value={String(s.type ?? "")}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Ưu tiên">
                <SelectInput
                  value={String(s.priority ?? "")}
                  onChange={(e) => set("priority", e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lịch hẹn">
                <TextInput
                  type="datetime-local"
                  value={String(s.scheduledAt ?? "")}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                />
              </Field>
              <Field label="Giá trị (VND)">
                <TextInput
                  type="number"
                  min={0}
                  value={String(s.amount ?? "")}
                  onChange={(e) => set("amount", Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Ghi chú">
              <TextArea
                value={String(s.notes ?? "")}
                onChange={(e) => set("notes", e.target.value)}
                maxLength={2000}
              />
            </Field>
          </>
        )}
      />
      <DeleteAction
        url={`/api/jobs/${job.id}`}
        message={
          <>
            Xoá công việc <b>{job.code}</b>? Tất cả lịch sử và ghi chú sẽ mất.
          </>
        }
      />
    </div>
  );
}
