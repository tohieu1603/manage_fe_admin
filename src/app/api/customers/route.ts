import { beForward } from "@/lib/be-fetch";

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  return beForward(`/customers${qs}`, { method: "GET" });
}

export async function POST(req: Request) {
  return beForward("/customers", { method: "POST", body: await req.json().catch(() => ({})) });
}
