"use client";

import { Field, TextInput } from "@/components/modal";
import { EditAction, DeleteAction } from "@/components/row-actions";

interface PartLite {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
  price: number;
}

export default function PartRowActions({ part }: { part: PartLite }) {
  return (
    <div className="flex gap-1">
      <EditAction
        title={`Sửa: ${part.name}`}
        url={`/api/parts/${part.id}`}
        initial={{
          name: part.name,
          unit: part.unit,
          minStock: part.min,
          unitPrice: part.price,
        }}
        render={(s, set) => (
          <>
            <Field label="Tên" required>
              <TextInput
                required
                value={String(s.name ?? "")}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Đơn vị">
                <TextInput
                  value={String(s.unit ?? "")}
                  onChange={(e) => set("unit", e.target.value)}
                />
              </Field>
              <Field label="Đơn giá (VND)">
                <TextInput
                  type="number"
                  min={0}
                  value={String(s.unitPrice ?? "")}
                  onChange={(e) => set("unitPrice", Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="Ngưỡng tối thiểu" hint="Cảnh báo khi tồn dưới ngưỡng này">
              <TextInput
                type="number"
                min={0}
                value={String(s.minStock ?? "")}
                onChange={(e) => set("minStock", Number(e.target.value))}
              />
            </Field>
          </>
        )}
      />
      <DeleteAction
        url={`/api/parts/${part.id}`}
        message={
          <>
            Xoá <b>{part.name}</b>? Vật tư bị deactivate, lịch sử nhập/xuất vẫn giữ.
          </>
        }
      />
    </div>
  );
}
