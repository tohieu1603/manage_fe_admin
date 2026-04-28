"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Modal,
  Field,
  TextInput,
  SelectInput,
  TextArea,
  ModalFooter,
  Btn,
} from "@/components/modal";
import { EditAction, DeleteAction } from "@/components/row-actions";
import { clientFetch } from "@/lib/client-fetch";

interface CustomerLite {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
}

const TYPE_OPTIONS = [
  { value: "individual", label: "Cá nhân" },
  { value: "company", label: "Doanh nghiệp" },
];

const VI_TO_BE: Record<string, string> = {
  "Doanh nghiệp": "company",
  "Cá nhân": "individual",
};

export function NewCustomerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("individual");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch("/api/customers", {
      method: "POST",
      body: {
        name: name.trim(),
        type,
        phone: phone.trim() || undefined,
        address: address.trim(),
        notes: notes.trim() || undefined,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Tạo thất bại");
      return;
    }
    setOpen(false);
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    router.refresh();
  }

  return (
    <>
      <Btn variant="primary" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        Thêm khách hàng
      </Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="Thêm khách hàng">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Tên" required>
            <TextInput required value={name} onChange={(e) => setName(e.target.value)} />
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
            <Field label="SĐT">
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="09xx xxx xxx"
              />
            </Field>
          </div>
          <Field label="Địa chỉ" required>
            <TextInput required value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="Ghi chú">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </Field>
          {err && <div className="text-xs text-danger-600 font-medium">{err}</div>}
          <ModalFooter>
            <Btn type="button" onClick={() => setOpen(false)} disabled={busy}>
              Huỷ
            </Btn>
            <Btn type="submit" variant="primary" loading={busy}>
              Lưu
            </Btn>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function EditDeleteCustomer({ customer }: { customer: CustomerLite }) {
  return (
    <div className="flex gap-1">
      <EditAction
        title={`Sửa: ${customer.name}`}
        url={`/api/customers/${customer.id}`}
        initial={{
          name: customer.name,
          type: VI_TO_BE[customer.type] ?? "individual",
          phone: customer.phone ?? "",
          address: customer.address,
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
              <Field label="SĐT">
                <TextInput
                  value={String(s.phone ?? "")}
                  onChange={(e) => set("phone", e.target.value)}
                  maxLength={20}
                />
              </Field>
            </div>
            <Field label="Địa chỉ" required>
              <TextInput
                required
                value={String(s.address ?? "")}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
          </>
        )}
      />
      <DeleteAction
        url={`/api/customers/${customer.id}`}
        message={
          <>
            Xoá khách hàng <b>{customer.name}</b>? Hành động không thể hoàn tác và sẽ thất bại nếu khách hàng còn công việc.
          </>
        }
      />
    </div>
  );
}
