import { beForward } from "@/lib/be-fetch";

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  return beForward(`/parts${qs}`, { method: "GET" });
}

export async function POST(req: Request) {
  return beForward("/parts", { method: "POST", body: await req.json().catch(() => ({})) });
}
