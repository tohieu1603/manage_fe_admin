// FE → BE proxy for jobs collection. GET forwards query string for
// list/filter, POST forwards JSON body for create.

import { beForward } from "@/lib/be-fetch";

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  return beForward(`/jobs${qs}`, { method: "GET" });
}

export async function POST(req: Request) {
  return beForward("/jobs", { method: "POST", body: await req.json().catch(() => ({})) });
}
