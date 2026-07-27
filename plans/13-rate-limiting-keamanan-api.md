# Plan 13 — Rate Limiting & Keamanan API

- **Prioritas:** P3
- **Estimasi usaha:** Ringan–Sedang
- **Slug branch:** `feat/rate-limiting-keamanan-api`

---

## 1. Konteks & Tujuan

Seluruh route `/api/*` saat ini publik tanpa auth dan tanpa rate limiting (verifikasi
grep: tidak ada modul rate limit). Rentan penyalahgunaan — pembeli spam order, brute-
force endpoint, atau overload polling/SSE. Tujuan MVP: tambah rate limiter in-memory
token bucket (zero-dependency) yang membungkus handler API, plus prinsip-prinsip
hardening dasar.

---

## 2. Prasyarat

Tidak ada (paralel di Fase B). Bekerja baik bersama plan 01 (auth) untuk identifikasi
klien per user, dan plan 03 (SSE) untuk pembatasan koneksi.

---

## 3. Perubahan Schema

Tidak ada.

---

## 4. File Terlibat

**Modifikasi:**
- Semua `app/api/**/route.ts` — bungkus handler dengan `withRateLimit(...)`.
- `lib/actions/order.ts` (`createOrder`) — validasi input ketat (panjang catatan,
  jumlah item, total > 0).

**Buat baru:**
- `lib/ratelimit.ts` — token bucket in-memory + helper `withRateLimit`.
- `lib/security.ts` — helper kecil: `getClientIp(req)`, `assertJsonBody`, sanitasi.

---

## 5. Langkah Implementasi

1. Buat `lib/ratelimit.ts`:
   ```ts
   type Bucket = { tokens: number; last: number };
   const buckets = new Map<string, Bucket>();
   // periodik bersihkan bucket idle tiap 5 menit (jaga memori)

   export function take(key: string, capacity: number, refillPerSec: number): boolean {
     const now = Date.now();
     const b = buckets.get(key) ?? { tokens: capacity, last: now };
     const elapsed = (now - b.last) / 1000;
     b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
     b.last = now;
     if (b.tokens < 1) { buckets.set(key, b); return false; }
     b.tokens -= 1; buckets.set(key, b); return true;
   }

   export function withRateLimit(opts: { capacity: number; refillPerSec: number },
     handler: (req: Request, ctx: any) => Promise<Response>) {
     return async (req: Request, ctx: any) => {
       const ip = getClientIp(req);
       const key = `${ip}:${new URL(req.url).pathname}`;
       if (!take(key, opts.capacity, opts.refillPerSec)) {
         return new Response(JSON.stringify({ error: "Too many requests" }), {
           status: 429, headers: { "Retry-After": "1", "Content-Type": "application/json" },
         });
       }
       return handler(req, ctx);
     };
   }
   ```

2. Tentukan kuota per endpoint (di `lib/constants.ts`):
   - Order create: `capacity 5, refill 0.5/s` (5 burst, refill 1 per 2 dtk).
   - SSE stream: `capacity 3, refill 0.2/s`.
   - Upload: `capacity 10, refill 0.5/s`.
   - Search/cleanup: `capacity 20, refill 1/s`.

3. Bungkus tiap handler API. Contoh:
   ```ts
   export const POST = withRateLimit(
     { capacity: 5, refillPerSec: 0.5 },
     async (req) => { /* ... */ },
   );
   ```

4. Buat `lib/security.ts`:
   - `getClientIp(req)`: baca `x-forwarded-for` (ambil token pertama) atau fallback
     `"anonymous"`.
   - Helper validasi body JSON & batasan input (mis. `customNote` ≤ 500 karakter,
     `quantity` ≤ 99).

5. Terapkan validasi di `createOrder`:
   - Total > 0, jumlah item ≥ 1, `buyerName` ≤ 80 karakter, `customNote` ≤ 500.
   - Tolak bila `serviceType`/`paymentMethod` tidak valid enum.

---

## 6. Kriteria Penerimaan

- Spam request ke endpoint dibatasi → respons `429` setelah kuota terlampaui, dengan
  header `Retry-After`.
- Limit dihitung per IP + path.
- Input tidak valid pada `createOrder` ditolak dengan `400` + pesan jelas.
- Tidak ada handler API yang lolos tanpa rate limit (kecuali webhook eksternal yang
  memiliki secret sendiri).

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: `for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/orders; done`
— harus muncul campuran 200/400/429.

---

## 8. Edge Cases & Jebakan

- **Multi-instance:** token bucket in-memory per-proses — di balik beberapa replica,
  limit efektif berlipat. Untuk MVP satu container tidak masalah; dokumentasikan bahwa
  produksi multi-instance butuh Redis (`@upstash/ratelimit` + `@upstash/redis`) —
  antarmuka `withRateLimit` dirancang agar tinggal swap implementasi `take`.
- **`x-forwarded-for` palsu:** bila aplikasi langsung expose tanpa proxy tepercaya,
  klien bisa memanipulasi header. Bila di balik nginx/Vercel tepercaya, aman. Untuk
  hardening, konfigurasikan trusted proxy atau andalkan identitas user (plan 01).
- **SSE & long-poll:** hitung limit saat koneksi dibuka, bukan tiap event — sekarang
  sudah demikian karena `GET` dipanggil sekali.
- Jangan rate-limit endpoint cron (memakai secret sendiri) atau healthcheck.

---

## 9. Pesan Commit

```
feat(security): in-memory token-bucket rate limiting + input validation
```
