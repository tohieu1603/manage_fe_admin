import { beForward } from "@/lib/be-fetch";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return beForward(`/parts/${id}/move`, { method: "POST", body: await req.json().catch(() => ({})) });
}
