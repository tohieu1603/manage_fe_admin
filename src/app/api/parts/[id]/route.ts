import { beForward } from "@/lib/be-fetch";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return beForward(`/parts/${id}`, { method: "PATCH", body: await req.json().catch(() => ({})) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return beForward(`/parts/${id}`, { method: "DELETE" });
}
