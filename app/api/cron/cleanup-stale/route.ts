import { cancelStaleOrders } from "@/lib/actions/order";
import { NextResponse } from "next/server";

/**
 * Cron endpoint untuk auto-cancel order PENDING stale.
 * Runtime: nodejs (required untuk setInterval/background worker).
 *
 * Authentication: Bearer token via CRON_SECRET env.
 * Bila CRON_SECRET tidak diset, gunakan default dev secret "dev-cron-secret".
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cancelled = await cancelStaleOrders();

  return NextResponse.json({ cancelled });
}
