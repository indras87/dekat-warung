# Plan 10 — Verifikasi Pembayaran

- **Prioritas:** P3
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/verifikasi-pembayaran`

---

## 1. Konteks & Tujuan

Saat ini `PaymentMethod` (`CASH`/`QRIS`/`TRANSFER`) hanya metadata — tidak ada
konfirmasi pembayaran. Untuk `CASH` ini wajar (bayar saat terima), tetapi `QRIS`/
`TRANSFER` tidak punya jejak konfirmasi. Tujuan MVP: tambah status pembayaran manual
("Saya Sudah Bayar" oleh pembeli, konfirmasi oleh merchant). Integrasi gateway
(Midtrans/Xendit) disiapkan sebagai jalur opsional lewat env.

---

## 2. Prasyarat

Tidak ada (bekerja paralel). Bermanfaat bila plan 03 (SSE) sudah ada agar status
bayar ter-update realtime di kedua sisi.

---

## 3. Perubahan Schema

```prisma
enum PaymentStatus {
  BELUM_BAYAR   // default untuk non-cash
  MENUNGGU      // pembeli klaim sudah bayar
  TERKONFIRMASI // merchant konfirmasi
  DITOLAK       // merchant tolak (bukti tidak valid)
  LUNAS_TUNAI   // untuk CASH, langsung di-set saat selesai
}

model Order {
  // ... existing ...
  paymentStatus  PaymentStatus @default(BELUM_BAYAR)
  paidAt         DateTime?
}
```
Atur default cerdas di lapisan aplikasi: order `CASH` → `LUNAS_TUNAI` saat `SELESAI`;
order `QRIS`/`TRANSFER` → mulai `BELUM_BAYAR`.
Jalankan `npm run db:push`.

---

## 4. File Terlibat

**Modifikasi:**
- `lib/actions/order.ts` — `markPaidByBuyer(orderId)`, `confirmPayment(orderId)`,
  `rejectPayment(orderId)`; set `paidAt` saat konfirmasi.
- `lib/actions/order.ts` (`createOrder`) — set `paymentStatus` awal sesuai metode.
- `components/MerchantTerminalClient.tsx` (`OrderCard`) — tampilkan badge status
  bayar + tombol Konfirmasi/Tolak.
- `app/order/[id]/page.tsx` — tombol "Saya Sudah Bayar" untuk QRIS/TRANSFER + tampil
  instruksi bayar.

**Buat baru:**
- `components/PaymentStatusBadge.tsx` — badge berwarna per `PaymentStatus`.
- `lib/constants.ts` — `PAYMENT_STATUS_LABEL`, `PAYMENT_STATUS_EMOJI`.

---

## 5. Langkah Implementasi

1. Tambah enum & field schema di atas, jalankan `db:push`.

2. Tambah label di `lib/constants.ts`:
   ```ts
   export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
     BELUM_BAYAR: "Belum Bayar",
     MENUNGGU: "Menunggu Verifikasi",
     TERKONFIRMASI: "Lunas",
     DITOLAK: "Ditolak",
     LUNAS_TUNAI: "Tunai",
   };
   ```

3. Di `createOrder`, tetapkan `paymentStatus` awal: `CASH` → `BELUM_BAYAR` (akan
   jadi `LUNAS_TUNAI` saat selesai), lainnya `BELUM_BAYAR`.

4. Tambah server actions:
   - `markPaidByBuyer(orderId)`: hanya untuk non-cash, set `MENUNGGU`.
   - `confirmPayment(orderId)`: set `TERKONFIRMASI`, `paidAt = now`. Khusus merchant.
   - `rejectPayment(orderId)`: set `DITOLAK`.
   - Saat `updateOrderStatus` ke `SELESAI` dan metode `CASH`, set `LUNAS_TUNAI`.

5. UI pembeli (`app/order/[id]/page.tsx`):
   - Untuk QRIS/TRANSFER: tampilkan ringkasan instruksi (nominal, metode) + gambar
     QRIS (bila ada `qrisImageUrl`) + tombol "Saya Sudah Bayar".
   - Tampilkan `PaymentStatusBadge` real-time.

6. UI merchant (`OrderCard`): bila `paymentStatus = MENUNGGU`, tampilkan dua tombol
   "Konfirmasi Bayar" / "Tolak".

---

## 6. Kriteria Penerimaan

- Order QRIS/TRANSFER dimulai dengan status `BELUM_BAYAR`.
- Pembeli klik "Saya Sudah Bayar" → merchant melihat `MENUNGGU`.
- Merchant konfirmasi → status `TERKONFIRMASI`, `paidAt` terisi.
- Order CASH yang `SELESAI` otomatis `LUNAS_TUNAI`.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
npm run db:push
```
Uji manual: alur QRIS → klaim bayar → konfirmasi merchant.

---

## 8. Edge Cases & Jebakan

- Hanya merchant pemilik warung yang boleh konfirmasi/tolak (cek via plan 01).
- Pembeli bisa klik "Saya Sudah Bayar" berkali-kali — idempoten (sudah `MENUNGGU`
  tetap `MENUNGGU`).
- **Integrasi gateway (opsional):** bila `MIDTRANS_SERVER_KEY` ada, integrasikan
  Midtrans Snap untuk QRIS dinamis dengan webhook konfirmasi otomatis. Ini di luar
  MVP — tandai sebagai TODO di README. Jangan implementasikan tanpa key valid.

---

## 9. Pesan Commit

```
feat(payment): manual payment verification flow (QRIS/Transfer)
```
