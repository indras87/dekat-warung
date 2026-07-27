/**
 * API Route POST /api/push/subscribe
 * Menerima subscription push notification dari klien.
 * Wajib login (session userId terisi).
 */
import { subscribeUser } from "@/lib/push";
import { getSession } from "@/lib/session";
import { withRateLimit } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface SubscribeRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

async function handler(req: Request) {
  try {
    // Hanya izinkan POST
    if (req.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    // Cek session user
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SubscribeRequest;

    // Validasi input
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 },
      );
    }

    // Simpan subscription
    await subscribeUser(session.userId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[push/subscribe] Error:", error);
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
