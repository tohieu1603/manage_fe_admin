// SSE proxy. The browser opens an EventSource to this same-origin endpoint;
// we forward to the BE with the user's bearer token (read from the httpOnly
// cookie the browser can't see) and pipe the response body straight back.
// Same-origin keeps cookie auth happy and dodges CORS preflight on streams.

import { readSession } from "@/lib/session";

const API_URL = process.env.COOLOPS_API_URL || "http://localhost:4000/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const { accessToken } = await readSession();
  if (!accessToken) return new Response("Unauthorized", { status: 401 });

  const upstream = await fetch(`${API_URL}/notifications/stream`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Long-lived stream — never cache, never time out from our side.
    cache: "no-store",
    // @ts-expect-error — Node 20 fetch supports duplex; type lib lags.
    duplex: "half",
  });
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream unavailable", { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
