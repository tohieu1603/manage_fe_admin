"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal, Field, TextInput } from "@/components/modal";
import { clientFetch } from "@/lib/client-fetch";

export default function AddDeviceButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [room, setRoom] = useState("");
  const [warrantyUntil, setWarrantyUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch(`/api/customers/${customerId}/devices`, {
      method: "POST",
      body: {
        name: name.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        room: room.trim() || undefined,
        warrantyUntil: warrantyUntil || undefined,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Tạo thất bại");
      return;
    }
    setOpen(false);
    setName("");
    setBrand("");
    setModel("");
    setRoom("");
    setWarrantyUntil("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 rounded bg-brand-50 text-brand-600 hover:bg-brand-100 inline-flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Thêm thiết bị
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Thêm thiết bị">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Tên thiết bị" required>
            <TextInput required value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Daikin FTKA25" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hãng">
              <TextInput value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Field>
            <Field label="Model">
              <TextInput value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phòng">
              <TextInput value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Phòng khách / ngủ 1…" />
            </Field>
            <Field label="Bảo hành đến">
              <TextInput type="date" value={warrantyUntil} onChange={(e) => setWarrantyUntil(e.target.value)} />
            </Field>
          </div>
          {err && <div className="text-xs text-danger-600 font-semibold">{err}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary" disabled={busy}>
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
