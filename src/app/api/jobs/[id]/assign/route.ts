// POST /api/jobs/:id/assign — proxy to BE.
import { NextResponse } from "next/server";
import { readSession } from "@/lib/session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { accessToken } = await readSession();
  if (!accessToken) return NextResponse.json({ success: false }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const beRes = await fetch(`${API_URL}/jobs/${id}/assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await beRes.json().catch(() => ({}));
  return NextResponse.json(json, { status: beRes.status });
}
