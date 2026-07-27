# Plan 12 — Auto-Cancel Pesanan Stale

- **Prioritas:** P3
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/auto-cancel-stale-orders`

---

## 1. Konteks & Tujuan

Pesanan `PENDING` yang tidak diterima merchant (warung tutup mendadak, admin
istirahat) saat ini menggantung selamanya — pembeli menunggu tanpa kepastian. Tujuan:
batalkan otomatis pesanan `PENDING` yang melewati batas waktu (default 5 menit),
beri notifikasi/indikasi ke pembeli. Jalankan via endpoint cron yang dipicu internal
atau eksternal.

---

## 2. Prasyarat

Tidak ada (paralel di Fase B). Bekerja baik dengan plan 03 (SSE) untuk update
realtime saat auto-cancel.

---

## 3. Perubahan Schema

```prisma
model Order {
  // ... existing ...
  expiresAt DateTime?   // di-set saat create untuk order PENDING
}
```
Tambah konstanta di `lib/constants.ts`:
```ts
export const ORDER_PENDING_TTL_MS = 5 * 60 * 1000; // 5 menit
export const CLEANUP_INTERVAL_MS = 60 * 1000;      // cek tiap 1 menit
```
Jalankan `npm run db:push`.

Tambah env (`.env` + `.env.example`):
```
CRON_SECRET=<string-acak>
```

---

## 4. File Terlibat

**Modifikasi:**
- `lib/actions/order.ts` (`createOrder`) — set `expiresAt = new Date(now +
  ORDER_PENDING_TTL_MS)` untuk order baru.
- `lib/actions/order.ts` — tambah `cancelStaleOrders()`.

**Buat baru:**
- `app/api/cron/cleanup-stale/route.ts` — POST, validasi header `Authorization:
  Bearer <CRON_SECRET>`, jalankan `cancelStaleOrders`.
- `lib/cleanup-worker.ts` — worker latar belakang berbasis `setInterval` (fallback
  bila tidak ada cron eksternal).

---

## 5. Langkah Implementasi

1. Tambah field & konstanta di atas, jalankan `db:push`.

2. Tambah `cancelStaleOrders()` di `lib/actions/order.ts`:
   ```ts
   export async function cancelStaleOrders(): Promise<number> {
     const result = await prisma.order.updateMany({
       where: { status: "PENDING", expiresAt: { lt: new Date() } },
       data: { status: "BATAL" },
     });
     return result.count;
   }
   ```

3. Di `createOrder`, set `expiresAt`. Saat merchant `Terima` (status jadi
   `DIPROSES`), bersihkan `expiresAt = null` (tidak lagi rentan auto-cancel).

4. Buat `app/api/cron/cleanup-stale/route.ts`:
   ```ts
   export const runtime = "nodejs";
   export async function POST(req: Request) {
     const auth = req.headers.get("authorization");
     if (auth !== `Bearer ${process.env.CRON_SECRET}`) return new Response("unauthorized", { status: 401 });
     const count = await cancelStaleOrders();
     return Response.json({ cancelled: count });
   }
   ```

5. Buat `lib/cleanup-worker.ts`:
   - Fungsi `startCleanupWorker()` yang `setInterval(cancelStaleOrders,
     CLEANUP_INTERVAL_MS)`.
   - Gunakan guard global (`globalThis.__dwCleanup`) agar hanya satu instance per
     proses (polanya sama seperti singleton Prisma di `lib/prisma.ts`).

6. Mulai worker dari `instrumentation.ts` (Next hook):
   ```ts
   export async function register() {
     if (process.env.NEXT_RUNTIME === "nodejs") {
       const { startCleanupWorker } = await import("./lib/cleanup-worker");
       startCleanupWorker();
     }
   }
   ```
   Tambah `"instrumentationHook": true` bila Next 15 belum aktif default (cek
   dokumentasi Context7 untuk Next 15 — biasanya sudah otomatis).

---

## 6. Kriteria Penerimaan

- Order `PENDING` baru memiliki `expiresAt` = waktu buat + 5 menit.
- Setelah 5 menit tanpa aksi merchant, status menjadi `BATAL` otomatis.
- Order yang diterima (`DIPROSES`) kebal terhadap auto-cancel (`expiresAt = null`).
- Endpoint `/api/cron/cleanup-stale` menolak tanpa secret; mengembalikan jumlah
  dibatalkan bila benar.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
npm run db:push
```
Uji manual: (a) buat order, tunggu (atau sementara turunkan TTL ke 30 detik di dev),
verifikasi jadi `BATAL`; (b) curl endpoint dengan & tanpa secret.

---

## 8. Edge Cases & Jebakan

- **Multi-instance:** `setInterval` berjalan per-proses; di deploy multi-replica,
  beberapa instance akan menjalankan cleanup serempak — idempoten karena
  `updateMany` + filter status, jadi aman. Untuk produksi, andalkan cron eksternal
  (Vercel Cron / systemd timer / Docker healthcheck) yang memukul endpoint secret.
- `instrumentation.ts` berjalan sekali saat start; pastikan tidak double-register
  pada hot-reload dev lewat guard `globalThis`.
- Saat auto-cancel, pertimbangkan kirim push (plan 08) ke pembeli & merchant —
  tandai TODO bila 08 belum merge.
- Backfill: order `PENDING` lama tanpa `expiresAt` akan diabaikan (filter `lt`
  null-safe? Tidak — `lt: null` menghasilkan false di Postgres, jadi aman). Untuk
  bersih, jalankan satu kali `updateMany` backfill mengisi `expiresAt` order
  pending lama.

---

## 9. Pesan Commit

```
feat(orders): auto-cancel stale pending orders via cleanup worker + cron route
```
