"use client";

import { useState, useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Modal, Btn, ModalFooter } from "./modal";
import { clientFetch } from "@/lib/client-fetch";

// Generic edit-button + modal wrapper. The form lives in `children` and
// calls back with the body to PATCH.
export function EditAction({
  title,
  url,
  initial,
  width = 480,
  render,
}: {
  title: string;
  url: string;
  initial: Record<string, unknown>;
  width?: number;
  render: (
    state: Record<string, unknown>,
    set: (key: string, value: unknown) => void,
  ) => ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, unknown>>(initial);
  const [, startTransition] = useTransition();

  function setField(key: string, value: unknown) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const r = await clientFetch(url, { method: "PATCH", body: state });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Lưu thất bại");
      return;
    }
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setState(initial);
          setOpen(true);
        }}
        className="p-1.5 rounded-md text-ink-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        title="Sửa"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} width={width}>
        <form onSubmit={save} className="space-y-3">
          {render(state, setField)}
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

export function DeleteAction({
  title = "Xác nhận xoá",
  message,
  url,
  onDeleted,
}: {
  title?: string;
  message: ReactNode;
  url: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function remove() {
    setBusy(true);
    setErr(null);
    const r = await clientFetch(url, { method: "DELETE" });
    setBusy(false);
    if (!r.ok) {
      setErr(r.message ?? "Xoá thất bại");
      return;
    }
    setOpen(false);
    if (onDeleted) onDeleted();
    else startTransition(() => router.refresh());
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="p-1.5 rounded-md text-ink-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
        title="Xoá"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} width={400}>
        <div className="text-sm text-ink-700">{message}</div>
        {err && <div className="text-xs text-danger-600 font-medium mt-3">{err}</div>}
        <ModalFooter>
          <Btn type="button" onClick={() => setOpen(false)} disabled={busy}>
            Huỷ
          </Btn>
          <Btn variant="danger" onClick={remove} loading={busy}>
            Xoá
          </Btn>
        </ModalFooter>
      </Modal>
    </>
  );
}
