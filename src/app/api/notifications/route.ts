import { beForward } from "@/lib/be-fetch";

export async function GET() {
  return beForward("/notifications", { method: "GET" });
}
