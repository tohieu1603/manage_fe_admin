import { beForward } from "@/lib/be-fetch";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return beForward(`/notifications/${id}/read`, { method: "POST" });
}
