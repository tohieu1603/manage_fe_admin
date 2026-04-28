import { beForward } from "@/lib/be-fetch";

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  // Lists active technicians by default — same as the BE convention used
  // throughout the data adapter.
  return beForward(`/technicians/active${qs}`, { method: "GET" });
}

export async function POST(req: Request) {
  return beForward("/technicians", { method: "POST", body: await req.json().catch(() => ({})) });
}
