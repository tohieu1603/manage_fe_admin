import { beForward } from "@/lib/be-fetch";

export async function PATCH(req: Request, ctx: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await ctx.params;
  return beForward(`/customers/${customerId}`, {
    method: "PATCH",
    body: await req.json().catch(() => ({})),
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await ctx.params;
  return beForward(`/customers/${customerId}`, { method: "DELETE" });
}
