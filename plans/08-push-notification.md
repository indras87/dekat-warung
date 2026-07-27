# Plan 08 — Push Notification (Web Push)

- **Prioritas:** P3
- **Estimasi usaha:** Tinggi
- **Slug branch:** `feat/push-notification`

---

## 1. Konteks & Tujuan

Saat ini pembeli harus tetap membuka tab untuk melihat update status order. PRD
mensyaratkan pembaruan realtime, dan push notification via Web Push API memungkinkan
notifikasi sistem operasi bahkan saat aplikasi tertutup — asalkan browser/HP
mengizinkan dan ada Service Worker (plan 04).

Tujuan: kirim push notification ke pembeli saat status order berubah (DIPROSES, SIAP,
SELESAI, BATAL) dan opsional ke merchant saat pesanan baru masuk.

---

## 2. Prasyarat

**Wajib:** plan 04 (Service Worker) — push butuh SW aktif untuk menerima event
`push`.

---

## 3. Perubahan Schema

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("push_subscriptions")
}
```
Jalankan `npm run db:push`.

Tambah environment (`.env` + `.env.example`):
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@dekatwarung.local
```
Generate dengan `npx web-push generate-vapid-keys`.

---

## 4. File Terlibat

**Modifikasi:**
- `public/sw.js` — handler `push` & `notificationclick`.
- `lib/actions/order.ts` — pada `updateOrderStatus`, kirim push ke `buyerId`.
- `lib/actions/warung.ts` (atau alur pesanan baru) — kirim push ke merchant saat
  order `PENDING` baru.
- `components/Providers.tsx` — daftarkan tombol subscribe.

**Buat baru:**
- `lib/push.ts` — setup `web-push`, `sendPush(userId, payload)`,
  `subscribeUser(sub)`.
- `app/api/push/subscribe/route.ts` — POST simpan subscription.
- `app/api/push/unsubscribe/route.ts` — POST hapus subscription.
- `components/PushOptIn.tsx` — tombol "Aktifkan Notifikasi".

---

## 5. Langkah Implementasi

1. Pasang dependency:
   ```
   npm install web-push
   ```
   Konsultasi Context7 (`web-push-libs/web-push`) bila perlu.

2. Buat `lib/push.ts`:
   - `setVapidDetails` memakai env di atas.
   - `sendPush(userId, { title, body, url })`: cari semua `PushSubscription` milik
     user, panggil `web-push.sendNotification(sub, JSON.stringify(payload))`.
     Tangani error 410/404 dengan menghapus subscription yang kedaluwarsa.

3. Buat route `POST /api/push/subscribe`:
   - Terima `{ endpoint, keys: { p256dh, auth } }`, simpan ke DB dengan `userId`
     dari session.

4. Buat `PushOptIn.tsx`:
   - Tombol meminta `Notification.requestPermission()`, lalu
     `serviceWorkerRegistration.pushManager.subscribe({ applicationServerKey:
     VAPID_PUBLIC_KEY })`.
   - Ekspos `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (tambahkan prefix `NEXT_PUBLIC_` pada env
     publik) dan kirim subscription ke `/api/push/subscribe`.

5. Perbarui `public/sw.js`:
   ```js
   self.addEventListener("push", (e) => {
     const d = e.data.json();
     e.waitUntil(self.registration.showNotification(d.title, { body: d.body, data: d.url }));
   });
   self.addEventListener("notificationclick", (e) => {
     e.notification.close();
     e.waitUntil(clients.openWindow(e.notification.data || "/pesanan-saya"));
   });
   ```

6. Picu push dari `updateOrderStatus`: setelah update DB, jika order punya `buyerId`,
   panggil `sendPush(buyerId, {...})`. Lakukan async (jangan blok response).

---

## 6. Kriteria Penerimaan

- Pembeli menekan "Aktifkan Notifikasi", mengizinkan, subscription tersimpan.
- Saat merchant mengubah status order, pembeli menerima notifikasi OS (browser/HP).
- Klik notifikasi membuka `/pesanan-saya` atau `/order/[id]`.
- Subscription yang gagal dikirim (410/404) otomatis dihapus dari DB.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
npm run start   # butuh HTTPS/localhost produksi build + SW aktif
```
Uji manual: aktifkan notifikasi di Chrome desktop, ubah status dari terminal
merchant, verifikasi notifikasi muncul.

---

## 8. Edge Cases & Jebakan

- Push **hanya** bekerja atas HTTPS (atau localhost) dan butuh SW aktif — tidak
  bisa diuji pada `npm run dev` HTTP biasa tanpa SW.
- iOS Safari baru mendukung Web Push sejak 16.4 dan hanya pada PWA yang sudah
  di-install ke home screen. Catat batasan ini.
- Jangan blok `updateOrderStatus` menunggu push; jalankan secara fire-and-forget
  dengan `catch` senyap agar kegagalan push tidak menggagalkan update order.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (klien) berbeda nama dari `VAPID_PUBLIC_KEY`
  (server) — keduanya boleh memuat nilai publik yang sama, tetapi hanya kunci
  privat yang tetap di server.

---

## 9. Pesan Commit

```
feat(push): web push notifications for order status changes
```
