"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";
import { Modal, Field, TextInput } from "@/components/modal";
import { clientFetch } from "@/lib/client-fetch";

export function NewPartButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("cái");
  const [stockQty, setStockQty] = useState("");
  const [minStock, setMinStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch("/api/parts", {
      method: "POST",
      body: {
        name: name.trim(),
        sku: sku.trim() || undefined,
        unit: unit.trim() || "cái",
        stockQty: stockQty ? Number(stockQty) : 0,
        minStock: minStock ? Number(minStock) : 0,
        unitPrice: unitPrice ? Number(unitPrice) : 0,
      },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Tạo thất bại");
      return;
    }
    setOpen(false);
    setName("");
    setSku("");
    setStockQty("");
    setMinStock("");
    setUnitPrice("");
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        Thêm vật tư
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Thêm vật tư mới">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Tên" required>
            <TextInput required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU">
              <TextInput value={sku} onChange={(e) => setSku(e.target.value)} maxLength={50} />
            </Field>
            <Field label="Đơn vị">
              <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cái / m / kg…" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tồn ban đầu">
              <TextInput type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
            </Field>
            <Field label="Ngưỡng tối thiểu">
              <TextInput type="number" min={0} value={minStock} onChange={(e) => setMinStock(e.target.value)} />
            </Field>
            <Field label="Đơn giá (VND)">
              <TextInput type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
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

export function StockMoveButtons({ partId, name, current }: { partId: string; name: string; current: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState<"in" | "out" | null>(null);
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function move() {
    setBusy(true);
    setErr(null);
    const r = await clientFetch(`/api/parts/${partId}/move`, {
      method: "POST",
      body: { type: open, qty: Number(qty), reason: reason.trim() || undefined },
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Thao tác thất bại");
      return;
    }
    setOpen(null);
    setQty("1");
    setReason("");
    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="flex gap-1.5">
        <button
          onClick={() => setOpen("in")}
          className="p-1.5 rounded text-ok-600 hover:bg-ok-50"
          title="Nhập kho"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setOpen("out")}
          className="p-1.5 rounded text-danger-500 hover:bg-danger-50 disabled:opacity-30"
          disabled={current <= 0}
          title="Xuất kho"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
      <Modal
        open={open !== null}
        onClose={() => {
          setOpen(null);
          setErr(null);
        }}
        title={`${open === "in" ? "Nhập" : "Xuất"} kho — ${name}`}
        width={400}
      >
        <div className="space-y-3">
          <div className="text-xs text-ink-500">
            Tồn hiện tại: <b>{current}</b>
          </div>
          <Field label="Số lượng" required>
            <TextInput type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <Field label="Lý do (tuỳ chọn)">
            <TextInput value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: PO-23, dùng cho job CV-1004…" />
          </Field>
          {err && <div className="text-xs text-danger-600 font-semibold">{err}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(null)} className="btn-secondary" disabled={busy}>
              Huỷ
            </button>
            <button onClick={move} className="btn-primary" disabled={busy || !qty || Number(qty) <= 0}>
              {busy ? "Đang xử lý…" : open === "in" ? "Nhập" : "Xuất"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
