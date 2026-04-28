// Tiny shared helper for FE proxy routes — DRY all the "read cookie, attach
// bearer, forward to BE" boilerplate that every /api/* route needs.

import { NextResponse } from "next/server";
import { readSession } from "./session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

export async function beForward(
  path: string,
  init: { method: string; body?: unknown } = { method: "GET" },
): Promise<NextResponse> {
  const { accessToken } = await readSession();
  if (!accessToken)
    return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  // 204 No Content has no body to parse.
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
