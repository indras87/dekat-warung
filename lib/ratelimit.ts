/**
 * Rate limiter in-memory dengan algoritma token bucket.
 * Zero-dependency, cocok untuk MVP single-instance.
 *
 * Catatan: Untuk multi-instance production, ganti implementasi `take`
 * dengan Redis-based (Upstash Ratelimit) agar konsisten antar replica.
 */

type Bucket = { tokens: number; last: number };

const buckets = new Map<string, Bucket>();

/** Periodik bersihkan bucket idle tiap 5 menit (jaga memori). */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
  setInterval(() => {
    const now = Date.now();
    const cutoff = now - CLEANUP_INTERVAL_MS;
    for (const [key, b] of buckets.entries()) {
      if (b.last < cutoff) {
        buckets.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Coba ambil satu token dari bucket.
 *
 * @param key - identifier unik (mis. `ip:path`)
 * @param capacity - kapasitas maksimal bucket (burst)
 * @param refillPerSec - kecepatan isi ulang per detik
 * @returns `true` bila token tersedia, `false` bila rate limit terlampaui
 */
export function take(
  key: string,
  capacity: number,
  refillPerSec: number,
): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: capacity, last: now };
  const elapsed = (now - b.last) / 1000;

  // Isi ulang token berdasarkan waktu elapsed
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.last = now;

  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }

  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

/**
 * Bungkus handler API dengan rate limiting.
 *
 * @param opts - kapasitas & refill rate
 * @param handler - Next.js route handler (GET/POST/PATCH/DELETE)
 * @returns wrapped handler yang mengembalikan 429 bila limit terlampaui
 */
export function withRateLimit<T extends Request>(
  opts: { capacity: number; refillPerSec: number },
  handler: (req: T, ctx: any) => Promise<Response>,
) {
  return async (req: T, ctx: any) => {
    const ip = getClientIp(req as Request);
    const pathname = new URL((req as Request).url).pathname;
    const key = `${ip}:${pathname}`;

    if (!take(key, opts.capacity, opts.refillPerSec)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Retry-After": "1",
          "Content-Type": "application/json",
        },
      });
    }

    return handler(req, ctx);
  };
}

/** Import getClientIp untuk di-export juga */
import { getClientIp } from "./security";
export { getClientIp };
