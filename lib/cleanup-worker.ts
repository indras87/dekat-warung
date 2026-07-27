import { cancelStaleOrders } from "@/lib/actions/order";
import { CLEANUP_INTERVAL_MS } from "@/lib/constants";

/**
 * Cleanup worker — interval-based auto-cancel untuk order PENDING stale.
 * Menggunakan globalThis guard agar hanya satu instance per proses.
 */
declare global {
  // eslint-disable-next-line no-var
  var __dwCleanup: boolean | undefined;
}

/**
 * Memulai worker periodik yang membatalkan order PENDING yang stale.
 * Dilindungi guard `globalThis` agar hanya satu instance aktif per proses.
 */
export function startCleanupWorker(): void {
  // Guard: pastikan hanya satu instance per proses
  if (globalThis.__dwCleanup) {
    return;
  }

  globalThis.__dwCleanup = true;

  // Jalankan cleanup pertama kali, lalu interval
  cancelStaleOrders().catch((err) =>
    console.error("[cleanup-worker] First run failed:", err),
  );

  const intervalId = setInterval(async () => {
    try {
      const count = await cancelStaleOrders();
      if (count > 0) {
        console.log(`[cleanup-worker] Cancelled ${count} stale orders`);
      }
    } catch (err) {
      console.error("[cleanup-worker] Cleanup failed:", err);
    }
  }, CLEANUP_INTERVAL_MS);

  // Optional: cleanup saat process shutdown (untuk produksi multi-replica)
  process.on("beforeExit", () => {
    clearInterval(intervalId);
  });
}
