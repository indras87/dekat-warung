import { NextRequest } from "next/server";
import { getOrderById } from "@/lib/actions/order";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { makeSSEStream } from "@/lib/sse";

// SSE butuh runtime Node.js (Prisma + ReadableStream)
export const runtime = "nodejs";

/**
 * SSE feed untuk status satu order (pembeli).
 *
 * Mengirim object order lengkap tiap tick.
 * Klien (app/order/[id]/page.tsx) bandingkan status lokal vs remote
 * untuk trigger animasi perubahan status.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: orderId } = await params;

  const stream = makeSSEStream({
    fetcher: async () => {
      const order = await getOrderById(orderId);
      // Null bila order tidak ditemukan (dihapus?) — klien bisa handle 404
      return { order };
    },
    tickMs: POLL_INTERVAL_MS,
    signal: req.signal,
  });

  return stream;
}
