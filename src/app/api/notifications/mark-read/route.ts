import { beForward } from "@/lib/be-fetch";

export async function POST() {
  return beForward("/notifications/mark-read", { method: "POST" });
}
