/**
 * API Route POST /api/push/unsubscribe
 * Menghapus subscription push notification.
 */
import { unsubscribeUser } from "@/lib/push";
import { withRateLimit } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface UnsubscribeRequest {
  endpoint: string;
}

async function handler(req: Request) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = (await req.json()) as UnsubscribeRequest;

    if (!body.endpoint) {
      return NextResponse.json(
        { error: "Invalid request: endpoint required" },
        { status: 400 },
      );
    }

    await unsubscribeUser(body.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[push/unsubscribe] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Bungkus dengan rate limit: 10 request per menit per IP
export const POST = withRateLimit(
  { capacity: 10, refillPerSec: 10 / 60 },
  handler,
);
