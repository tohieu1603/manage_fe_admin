// POST /api/session  — login (proxy to BE, then set httpOnly cookies)
// DELETE /api/session — logout (clear cookies)
// Keeping the BE token + user info on the server side (httpOnly) prevents
// XSS-driven token theft and avoids leaking secrets to the client bundle.

import { NextResponse } from "next/server";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_USER, type SessionUser } from "@/lib/session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ success: false, message: "Thiếu email/password" }, { status: 400 });
  }

  const beRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
    cache: "no-store",
  });
  const beJson = (await beRes.json().catch(() => ({}))) as {
    success?: boolean;
    data?: { user: SessionUser; accessToken: string; refreshToken: string };
    message?: string;
  };

  if (!beRes.ok || !beJson.success || !beJson.data) {
    return NextResponse.json(
      { success: false, message: beJson.message ?? "Đăng nhập thất bại" },
      { status: beRes.status || 401 },
    );
  }

  const { user, accessToken, refreshToken } = beJson.data;
  const res = NextResponse.json({ success: true, data: { user } });

  const isProd = process.env.NODE_ENV === "production";
  const common = { httpOnly: true, sameSite: "lax" as const, secure: isProd, path: "/" };
  // Access ~15m, refresh ~7d — match BE TTLs.
  res.cookies.set(COOKIE_ACCESS, accessToken, { ...common, maxAge: 60 * 15 });
  res.cookies.set(COOKIE_REFRESH, refreshToken, { ...common, maxAge: 60 * 60 * 24 * 7 });
  // Non-sensitive minimal user blob for SSR/UI; not httpOnly so client can
  // hydrate the avatar/name without an extra round trip.
  res.cookies.set(
    COOKIE_USER,
    encodeURIComponent(
      JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }),
    ),
    { ...common, httpOnly: false, maxAge: 60 * 60 * 24 * 7 },
  );

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_USER]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}
