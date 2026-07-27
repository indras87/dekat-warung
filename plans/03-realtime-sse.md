# Plan 03 — Realtime via Server-Sent Events (menggantikan polling)

- **Prioritas:** P1
- **Estimasi usaha:** Sedang–Tinggi
- **Slug branch:** `feat/realtime-sse`

---

## 1. Konteks & Tujuan

PRD §5 mensyaratkan push event realtime ("NEW_ORDER", update status). Saat ini
seluruh realtime memakai HTTP `setInterval` polling setiap `POLL_INTERVAL_MS`
(`lib/constants.ts:50` = 4000ms) di tiga tempat: `MerchantTerminalClient`,
`MerchantAlertModal`, dan `app/order/[id]/page.tsx`. Akibatnya latensi pesanan baru
bisa sampai 4 detik dan membebani server dengan request berulang.

Tujuan: ganti polling dengan **Server-Sent Events (SSE)** — push satu arah dari
server ke klien. SSE dipilih (bukan WebSocket) karena:
- Berjalan native di Next.js Route Handler (`ReadableStream`), tanpa server/proses
  tambahan.
- Pas untuk kebutuhan satu arah (status order, alert pesanan baru).
- Tetap satu port dengan aplikasi (ramah container & reverse proxy).

> Catatan PRD: dokumen menyebut WebSocket. SSE secara fungsional memenuhi tujuan
> "push realtime". Bila tim tetap menginginkan WebSocket literal, lihat §8.

---

## 2. Prasyarat

Tidak ada. Bekerja paralel di Fase B.

---

## 3. Perubahan Schema

Tidak ada.

---

## 4. File Terlibat

**Modifikasi:**
- `components/MerchantAlertModal.tsx` — ganti `setInterval` + `fetch` dengan
  `EventSource`.
- `components/MerchantTerminalClient.tsx` — langganan SSE feed pesanan.
- `app/order/[id]/page.tsx` — ganti polling dengan SSE per order.

**Buat baru:**
- `app/api/events/warung/[id]/route.ts` — SSE stream pesanan untuk merchant
  (PENDING baru + perubahan status).
- `app/api/events/order/[id]/route.ts` — SSE stream status satu order untuk pembeli.
- `lib/sse.ts` — helper `makeSSEStream({ send, heartbeatMs, fetcher })` untuk
  menghindari duplikasi boilerplate stream.

---

## 5. Langkah Implementasi

1. Buat `lib/sse.ts`:
   - Helper mengembalikan `Response` dengan header
     `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`,
     `Connection: keep-alive`.
   - Body `ReadableStream` yang tiap `tickMs` (mulai dari `POLL_INTERVAL_MS`) memanggil
     `fetcher()`, mengirim `data: <json>\n\n`, plus heartbeat `: ping\n\n` setiap
     ~15 detik untuk menjaga koneksi tetap hidup.
   - Hentikan stream saat `request.signal` abort (klien tutup).

2. Buat `app/api/events/warung/[id]/route.ts`:
   ```ts
   export const runtime = "nodejs";
   export async function GET(req, { params }) { /* makeSSEStream + getOrdersForWarung */ }
   ```
   Kirim event berkala berisi daftar pesanan aktif + flag `newPending` bila ada
   order `PENDING` yang belum di-ack.

3. Buat `app/api/events/order/[id]/route.ts`:
   - `getOrderById` tiap tick, kirim status terbaru. Klien bandingkan dengan status
     lokal untuk memicu animasi.

4. Refactor `MerchantAlertModal.tsx`:
   - Ganti `useEffect` polling dengan `new EventSource(url)`.
   - `onmessage`: parse, deteksi order `PENDING` baru (bandingkan id terakhir),
     picu alarm Web-Audio yang sudah ada (`startAlarm`/`stopAlarm`).
   - `onerror`: EventSource auto-reconnect bawaan; tetap pertahankan fallback timer
     untuk resume AudioContext pasca gestur.

5. Refactor `MerchantTerminalClient.tsx` & `app/order/[id]/page.tsx` serupa.

6. Tandai `POLL_INTERVAL_MS` di `constants.ts` sebagai interval SSE internal server
   (tidak lagi polling klien) — perbarui komentar.

---

## 6. Kriteria Penerimaan

- Pesanan baru dari pembeli muncul di alert modal merchant **< 1 detik** setelah
  disimpan (rasakan bedanya vs polling 4 dtk).
- Pembeli melihat perubahan status (mis. DIPROSES → SIAP) nyaris instan.
- Koneksi terputus lalu tersambung kembali otomatis tanpa reload.
- Tidak ada error memory leak; tab ditutup → stream dihentikan di server.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji dua tab: satu sebagai pembeli (checkout), satu sebagai merchant terminal.
Bandingkan latensi vs cabang polling.

---

## 8. Edge Cases & Jebakan

- **Edge Runtime:** SSE butuh `runtime = "nodejs"` di route handler (Prisma & stream
  API butuh Node).
- **Reverse proxy / buffering:** bila di balik nginx, matikan buffering
  (`proxy_buffering off;` pada path `/api/events/*`) agar event tidak ditahan.
  Catat di README bila perlu.
- **Auth pada stream:** SSE cookie dikirim otomatis (same-origin), tetapi tidak bisa
  menambah header kustom. Bila plan 01 sudah merge, validasi session via cookie di
  handler — jangan andalkan query param token yang ter-log.
- **Max koneksi per browser:** batas ~6 koneksi HTTP/1.1 per origin. Untuk MVP tidak
  masalah, tetapi pertimbangkan HTTP/2 atau satu stream gabungan bila bertambah.
- **Alternatif WebSocket:** bila diwajibkan, gunakan `socket.io` dengan server
  terpisah (port 3001) + adapter Redis untuk multi-instance. Lebih kompleks & butuh
  perubahan container — tidak direkomendasikan untuk MVP.

---

## 9. Pesan Commit

```
feat(realtime): replace polling with Server-Sent Events
```
