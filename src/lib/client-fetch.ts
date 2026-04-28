// Tiny client-side helper. Returns { ok, message, data } and never throws —
// keeps form components flat (no try/catch sprinkled everywhere).
//
// On Zod validation errors the BE sends `details.fieldErrors`; we flatten
// them into a Vietnamese-labelled string so the existing forms can just
// render `r.message` and still tell the user *which field* is wrong.

export interface ClientResult<T = unknown> {
  ok: boolean;
  message?: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}

// Mirror of common DTO field names → Vietnamese labels. Falls back to the
// raw field name when not in the table.
const FIELD_LABEL: Record<string, string> = {
  title: "Tiêu đề",
  type: "Loại",
  priority: "Ưu tiên",
  status: "Trạng thái",
  customerId: "Khách hàng",
  technicianId: "Kỹ thuật viên",
  deviceId: "Thiết bị",
  scheduledAt: "Lịch hẹn",
  amount: "Giá trị",
  notes: "Ghi chú",
  note: "Ghi chú",
  email: "Email",
  password: "Mật khẩu",
  phone: "Số điện thoại",
  name: "Tên",
  address: "Địa chỉ",
  sku: "Mã SKU",
  unit: "Đơn vị",
  unitPrice: "Đơn giá",
  stockQty: "Tồn kho",
  minStock: "Tồn tối thiểu",
  qty: "Số lượng",
  reason: "Lý do",
  brand: "Hãng",
  model: "Model",
  room: "Phòng",
  capacityBtu: "Công suất (BTU)",
  warrantyUntil: "Bảo hành đến",
  skill: "Chuyên môn",
  rating: "Đánh giá",
  lat: "Vĩ độ",
  lng: "Kinh độ",
};

interface BeError {
  success?: boolean;
  message?: string;
  data?: unknown;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
}

// Cheap translation of the most common Zod messages the BE forwards. We
// keep the originals as fallback so we don't hide unfamiliar errors.
function viErr(msg: string): string {
  if (msg === "Required") return "bắt buộc";
  if (msg === "Invalid uuid") return "không hợp lệ";
  if (msg === "Invalid date") return "không hợp lệ";
  if (msg.startsWith("String must contain at least")) return "không được để trống";
  if (msg.startsWith("String must contain at most")) return "quá dài";
  if (msg.startsWith("Expected number")) return "phải là số";
  if (msg.startsWith("Number must be greater than or equal to 0")) return "không được âm";
  if (msg.startsWith("Number must be less than or equal to")) return "vượt quá giới hạn";
  if (msg.startsWith("Invalid enum value")) return "giá trị không hợp lệ";
  return msg;
}

function formatFieldErrors(details?: BeError["details"]): string | undefined {
  if (!details) return undefined;
  const lines: string[] = [];
  for (const e of details.formErrors ?? []) lines.push(e);
  for (const [field, errs] of Object.entries(details.fieldErrors ?? {})) {
    const label = FIELD_LABEL[field] ?? field;
    lines.push(`${label}: ${errs.map(viErr).join(", ")}`);
  }
  return lines.length ? lines.join(" · ") : undefined;
}

export async function clientFetch<T = unknown>(
  url: string,
  init: { method: string; body?: unknown } = { method: "GET" },
): Promise<ClientResult<T>> {
  try {
    const res = await fetch(url, {
      method: init.method,
      headers: { "Content-Type": "application/json" },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
    if (res.status === 204) return { ok: true };
    const json = (await res.json().catch(() => ({}))) as BeError & { data?: T };
    if (!res.ok || json.success === false) {
      const fieldMsg = formatFieldErrors(json.details);
      // Prefer per-field detail when present — much more actionable than
      // the generic "Invalid input" the BE returns for Zod errors.
      return {
        ok: false,
        message: fieldMsg ?? json.message ?? `HTTP ${res.status}`,
        fieldErrors: json.details?.fieldErrors,
      };
    }
    return { ok: true, message: json.message, data: json.data };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}
