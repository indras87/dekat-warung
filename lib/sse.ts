/**
 * Server-Sent Events (SSE) helper untuk Next.js Route Handler.
 * Menyediakan wrapper ReadableStream dengan header SSE, heartbeat,
 * dan otomatis close saat request.signal abort.
 */

export interface SSEOptions<T> {
  /** Fungsi async yang mengambil data terbaru. Dipanggil tiap tick. */
  fetcher: () => Promise<T>;
  /** Interval polling di server (ms). Gunakan POLL_INTERVAL_MS. */
  tickMs: number;
  /** Interval heartbeat untuk menjaga koneksi tetap hidup (ms). Default ~15 dtk. */
  heartbeatMs?: number;
  /** Signal dari request Next.js untuk mendeteksi disconnect klien. */
  signal: AbortSignal;
}

/**
 * Membuat Response SSE dengan ReadableStream.
 *
 * Contoh:
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const stream = makeSSEStream({
 *     fetcher: () => db.findMany(),
 *     tickMs: POLL_INTERVAL_MS,
 *     signal: req.signal,
 *   });
 *   return stream;
 * }
 * ```
 *
 * Format event SSE: `data: <json>\n\n`
 * Heartbeat: `: ping\n\n` (dikirim tiap heartbeatMs)
 */
export function makeSSEStream<T>(options: SSEOptions<T>): Response {
  const { fetcher, tickMs, signal, heartbeatMs = 15000 } = options;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastHeartbeat = Date.now();

      /**
       * Satu iterasi polling SSE: kirim heartbeat bila perlu, ambil data via
       * fetcher, lalu jadwalkan tick berikutnya sampai klien disconnect.
       */
      async function tick() {
        // Cek abort signal (klien disconnect)
        if (signal.aborted) {
          controller.close();
          return;
        }

        const now = Date.now();
        const sinceHeartbeat = now - lastHeartbeat;

        // Kirim heartbeat bila sudah melewati heartbeatMs
        if (sinceHeartbeat >= heartbeatMs) {
          controller.enqueue(encoder.encode(": ping\n\n"));
          lastHeartbeat = now;
        }

        try {
          const data = await fetcher();
          // Format SSE: data: <json>\n\n
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          // Error DB/(fetcher) — tetap kirim heartbeat untuk menjaga koneksi
          // Next tick akan mencoba lagi
        }

        // Jadwalkan tick berikutnya
        if (!signal.aborted) {
          setTimeout(() => void tick(), tickMs);
        } else {
          controller.close();
        }
      }

      // Mulai loop tick pertama
      await tick();
    },

    cancel(reason) {
      // Dipanggil saat stream dibatalkan (optional)
      console.debug("[SSE] Stream cancelled:", reason);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // X-Accel-Buffering: no untuk nginx (bila di balik reverse proxy)
      "X-Accel-Buffering": "no",
    },
  });
}
