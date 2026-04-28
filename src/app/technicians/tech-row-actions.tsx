"use client";

import { Field, TextInput } from "@/components/modal";
import { EditAction, DeleteAction } from "@/components/row-actions";

interface TechLite {
  id: string;
  name: string;
  phone?: string;
  skill?: string;
}

export default function TechRowActions({ tech }: { tech: TechLite }) {
  return (
    <div className="flex gap-1">
      <EditAction
        title={`Sửa: ${tech.name}`}
        url={`/api/technicians/${tech.id}`}
        initial={{ name: tech.name, phone: tech.phone ?? "", skill: tech.skill ?? "" }}
        render={(s, set) => (
          <>
            <Field label="Họ tên" required>
              <TextInput
                required
                value={String(s.name ?? "")}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="SĐT">
              <TextInput
                value={String(s.phone ?? "")}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={20}
              />
            </Field>
            <Field label="Chuyên môn">
              <TextInput
                value={String(s.skill ?? "")}
                onChange={(e) => set("skill", e.target.value)}
                placeholder="VD: Lắp đặt, sửa board"
              />
            </Field>
          </>
        )}
      />
      <DeleteAction
        url={`/api/technicians/${tech.id}`}
        message={
          <>
            Vô hiệu hoá KTV <b>{tech.name}</b>? Tài khoản sẽ không thể đăng nhập.
          </>
        }
      />
    </div>
  );
}
