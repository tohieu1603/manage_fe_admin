// Tiny client-side helper. Returns { ok, message, data } and never throws —
// keeps form components flat (no try/catch sprinkled everywhere).

export interface ClientResult<T = unknown> {
  ok: boolean;
  message?: string;
  data?: T;
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
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      data?: T;
    };
    if (!res.ok || json.success === false) {
      return { ok: false, message: json.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, message: json.message, data: json.data };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}
