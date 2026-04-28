import { beForward } from "@/lib/be-fetch";

export async function POST(req: Request) {
  return beForward("/customers", { method: "POST", body: await req.json().catch(() => ({})) });
}
