"use client";

import { Field, TextInput } from "@/components/modal";
import { EditAction, DeleteAction } from "@/components/row-actions";

interface DeviceLite {
  id: string;
  name: string;
  room: string;
  warranty: string; // already adapted ("YYYY-MM-DD" or "—")
}

export default function DeviceRowActions({
  customerId,
  device,
}: {
  customerId: string;
  device: DeviceLite;
}) {
  const url = `/api/customers/${customerId}/devices/${device.id}`;
  return (
    <div className="flex gap-1">
      <EditAction
        title={`Sửa thiết bị: ${device.name}`}
        url={url}
        initial={{
          name: device.name,
          room: device.room === "—" ? "" : device.room,
          warrantyUntil: /^\d{4}-\d{2}-\d{2}/.test(device.warranty) ? device.warranty : "",
        }}
        render={(s, set) => (
          <>
            <Field label="Tên thiết bị" required>
              <TextInput
                required
                value={String(s.name ?? "")}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Phòng / vị trí">
              <TextInput
                value={String(s.room ?? "")}
                onChange={(e) => set("room", e.target.value)}
              />
            </Field>
            <Field label="Bảo hành đến">
              <TextInput
                type="date"
                value={String(s.warrantyUntil ?? "")}
                onChange={(e) => set("warrantyUntil", e.target.value)}
              />
            </Field>
          </>
        )}
      />
      <DeleteAction
        url={url}
        message={
          <>
            Xoá thiết bị <b>{device.name}</b>?
          </>
        }
      />
    </div>
  );
}
