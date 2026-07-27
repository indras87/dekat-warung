import { NextRequest } from "next/server";
import { getOrdersForWarung, getNewestPendingOrder } from "@/lib/actions/order";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { makeSSEStream } from "@/lib/sse";

// SSE butuh runtime Node.js (Prisma + ReadableStream)
export const runtime = "nodejs";

/**
 * SSE feed untuk pesanan warung merchant.
 *
 * Mengirim:
 * - Daftar pesanan aktif (PENDING, DIPROSES, SIAP)
 * - Flag `newPending` bila ada order PENDING yang belum di-ack
 *
 * Klien (MerchantTerminalClient) langganan endpoint ini untuk update realtime.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: warungId } = await params;

  const stream = makeSSEStream({
    fetcher: async () => {
      // Ambil pesanan aktif + pesanan PENDING terbaru
      const activeOrders = await getOrdersForWarung(warungId, true);
      const newestPending = await getNewestPendingOrder(warungId);

      return {
        orders: activeOrders,
        newPending: newestPending ? newestPending.id : null,
      };
    },
    tickMs: POLL_INTERVAL_MS,
    signal: req.signal,
  });

  return stream;
}
