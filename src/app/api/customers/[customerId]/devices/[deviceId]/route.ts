import { beForward } from "@/lib/be-fetch";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ customerId: string; deviceId: string }> },
) {
  const { customerId, deviceId } = await ctx.params;
  return beForward(`/customers/${customerId}/devices/${deviceId}`, {
    method: "PATCH",
    body: await req.json().catch(() => ({})),
  });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ customerId: string; deviceId: string }> },
) {
  const { customerId, deviceId } = await ctx.params;
  return beForward(`/customers/${customerId}/devices/${deviceId}`, { method: "DELETE" });
}
