// FE → BE proxy for job mutations. Client components POST here; this
// route attaches the user's bearer token from cookies before forwarding.

import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

export async function POST(req: Request) {
  const { accessToken } = await readSession();
  if (!accessToken) return NextResponse.json({ success: false, message: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, message: "Body trống" }, { status: 400 });

  const beRes = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await beRes.json().catch(() => ({}));
  return NextResponse.json(json, { status: beRes.status });
}
