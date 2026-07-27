/**
 * Helper keamanan untuk validasi input & ekstraksi IP klien.
 */

/**
 * Ekstrak IP klien dari request.
 *
 * Membaca header `x-forwarded-for` (ambil token pertama) untuk environment
 * di balik proxy tepercaya (nginx, Vercel, dll).
 *
 * Fallback ke `"anonymous"` bila tidak dapat ditentukan.
 *
 * Catatan: Bila aplikasi langsung expose tanpa proxy, header ini bisa
 * dimanipulasi oleh klien. Hardening: konfigurasikan trusted proxy atau
 * gunakan identitas user (session auth) sebagai key rate limit.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Format: "client, proxy1, proxy2" — ambil IP pertama
    return forwarded.split(",")[0].trim();
  }

  // Fallback bila tidak ada header (dev env, direct connection)
  return "anonymous";
}

/**
 * Assert bahwa request body adalah JSON valid.
 *
 * @throws Error dengan pesan jelas bila bukan JSON atau parsing gagal.
 */
export async function assertJsonBody(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("Content-Type harus application/json");
  }

  try {
    return await req.json();
  } catch {
    throw new Error("Body JSON tidak valid");
  }
}

/**
 * Validasi panjang string (≤ max).
 *
 * @throws Error bila melebihi batas.
 */
export function assertMaxLength(
  value: string,
  max: number,
  fieldName: string,
): void {
  if (value.length > max) {
    throw new Error(`${fieldName} maksimal ${max} karakter`);
  }
}

/**
 * Validasi nilai numerik dalam range.
 *
 * @throws Error bila di luar range.
 */
export function assertRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} harus antara ${min} dan ${max}`);
  }
}

/**
 * Validasi enum value.
 *
 * @throws Error bila tidak ada di array allowed.
 */
export function assertEnum<T extends string>(
  value: T,
  allowed: readonly T[],
  fieldName: string,
): void {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(
      `${fieldName} harus salah satu: ${(allowed as readonly string[]).join(", ")}`,
    );
  }
}
