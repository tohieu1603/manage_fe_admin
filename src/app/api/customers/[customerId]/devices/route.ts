import { beForward } from "@/lib/be-fetch";

export async function POST(req: Request, ctx: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await ctx.params;
  return beForward(`/customers/${customerId}/devices`, {
    method: "POST",
    body: await req.json().catch(() => ({})),
  });
}
