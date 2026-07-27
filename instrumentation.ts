/**
 * Next.js 15 instrumentation hook — dijalankan sekali saat server start.
 * Dipakai untuk mendaftarkan background workers (cleanup, dsb).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCleanupWorker } = await import("./lib/cleanup-worker");
    startCleanupWorker();
  }
}
