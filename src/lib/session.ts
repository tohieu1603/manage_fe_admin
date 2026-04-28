// Session helpers — single source of truth for read/write of the auth
// cookies. Used from Server Components, Route Handlers, and middleware.

import { cookies } from "next/headers";

export const COOKIE_ACCESS = "cool_at";
export const COOKIE_REFRESH = "cool_rt";
export const COOKIE_USER = "cool_user";

export interface SessionUser {
  id: string;
  email?: string;
  name: string;
  role: "admin" | "dispatcher" | "owner" | "cskh" | "technician";
}

// Server Component / Route Handler reader.
export async function readSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
}> {
  const c = await cookies();
  const accessToken = c.get(COOKIE_ACCESS)?.value ?? null;
  const refreshToken = c.get(COOKIE_REFRESH)?.value ?? null;
  const userRaw = c.get(COOKIE_USER)?.value;
  let user: SessionUser | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(decodeURIComponent(userRaw)) as SessionUser;
    } catch {
      user = null;
    }
  }
  return { accessToken, refreshToken, user };
}
