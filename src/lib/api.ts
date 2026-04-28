// Server-side API client. Reads the per-request user token from the httpOnly
// cookie set by /api/session; falls back to a service-account login if the
// caller is anonymous (e.g. /login page or middleware-bypassed routes).

import { cookies } from "next/headers";
import { COOKIE_ACCESS } from "./session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";
const SVC_EMAIL = process.env.COOLOPS_API_EMAIL || "admin@coolops.vn";
const SVC_PASSWORD = process.env.COOLOPS_API_PASSWORD || "Admin@123";

let svcCache: { token: string; expiresAt: number } | null = null;

async function serviceToken(): Promise<string> {
  if (svcCache && svcCache.expiresAt > Date.now()) return svcCache.token;
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SVC_EMAIL, password: SVC_PASSWORD }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Service auth failed: ${res.status}`);
  const json = (await res.json()) as { data: { accessToken: string } };
  svcCache = { token: json.data.accessToken, expiresAt: Date.now() + 14 * 60 * 1000 };
  return json.data.accessToken;
}

async function pickToken(): Promise<string> {
  // Try the user's session cookie first; fall back to service token.
  try {
    const c = await cookies();
    const fromCookie = c.get(COOKIE_ACCESS)?.value;
    if (fromCookie) return fromCookie;
  } catch {
    // cookies() throws outside request scope (e.g. seed scripts) — ignore.
  }
  return serviceToken();
}

interface ApiResult<T> {
  success: boolean;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; cache?: RequestCache; retry?: boolean } = {},
): Promise<ApiResult<T>> {
  const token = await pickToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? "no-store",
  });

  // 401 → user cookie expired; force service-token retry once so the page
  // doesn't blow up before the user re-logs in.
  if (res.status === 401 && opts.retry !== false) {
    svcCache = null;
    const fresh = await serviceToken();
    const retry = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: { Authorization: `Bearer ${fresh}`, "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: opts.cache ?? "no-store",
    });
    const text = await retry.text();
    const json = text ? (JSON.parse(text) as ApiResult<T>) : ({ success: retry.ok, data: null as T } as ApiResult<T>);
    if (!retry.ok || !json.success) {
      throw new Error(`API ${opts.method ?? "GET"} ${path} failed ${retry.status}: ${json.message ?? "unknown"}`);
    }
    return json;
  }

  const text = await res.text();
  const json = text ? (JSON.parse(text) as ApiResult<T>) : ({ success: res.ok, data: null as T } as ApiResult<T>);
  if (!res.ok || !json.success) {
    throw new Error(`API ${opts.method ?? "GET"} ${path} failed ${res.status}: ${json.message ?? "unknown"}`);
  }
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path).then((r) => r.data),
  list: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }).then((r) => r.data),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body }).then((r) => r.data),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }).then((r) => r.data),
};

// === BE types ===
export interface BeUser {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  role: string;
}

export interface BeTechnician {
  id: string;
  userId: string;
  user: BeUser;
  skill?: string;
  rating: string | number;
  jobsMonth: number;
  status: "available" | "traveling" | "onsite" | "break" | "offline";
  lat?: string | number | null;
  lng?: string | number | null;
}

export interface BeCustomer {
  id: string;
  type: "company" | "individual";
  name: string;
  phone?: string;
  address: string;
  taxCode?: string;
  devices?: BeDevice[];
  notes?: string;
  createdAt?: string;
}

export interface BeDevice {
  id: string;
  customerId: string;
  name: string;
  brand?: string;
  model?: string;
  room?: string;
  warrantyUntil?: string;
  lastServiceAt?: string;
}

export interface BeJobEvent {
  id: string;
  jobId: string;
  action: string;
  detail?: string;
  createdAt: string;
  actor?: BeUser;
}

export interface BeJob {
  id: string;
  code: string;
  title: string;
  type: string;
  priority: string;
  status:
    | "new"
    | "assigned"
    | "en_route"
    | "onsite"
    | "in_progress"
    | "paused"
    | "completed"
    | "cancelled";
  amount: string | number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationMin?: number;
  notes?: string;
  customer: BeCustomer;
  device?: BeDevice;
  technician?: BeTechnician;
  events?: BeJobEvent[];
}

export interface BePart {
  id: string;
  sku?: string;
  name: string;
  unit: string;
  stockQty: number;
  minStock: number;
  unitPrice: string | number;
  isActive: boolean;
}
