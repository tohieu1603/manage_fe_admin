"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal, Field, TextInput } from "@/components/modal";
import { clientFetch } from "@/lib/client-fetch";

export default function NewTechButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [skill, setSkill] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch("/api/technicians", {
      method: "POST",
      body: {
        email: email.trim(),
        name: name.trim(),
        password,
        phone: phone.trim() || undefined,
        skill: skill.trim() || undefined,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Tạo thất bại");
      return;
    }
    setOpen(false);
    setEmail("");
    setName("");
    setPassword("");
    setPhone("");
    setSkill("");
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        Thêm KTV
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Thêm kỹ thuật viên" width={500}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Họ tên" required>
            <TextInput required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" required>
              <TextInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="SĐT">
              <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>
          <Field label="Mật khẩu (tối thiểu 6 ký tự)" required>
            <TextInput
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Chuyên môn">
            <TextInput
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="VD: Lắp đặt treo tường, sửa board"
            />
          </Field>
          {err && <div className="text-xs text-danger-600 font-semibold">{err}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary" disabled={busy}>
              Huỷ
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Đang tạo…" : "Tạo KTV"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
