# Plan 05 — Riwayat Pesanan & Profil Pembeli

- **Prioritas:** P2
- **Estimasi usaha:** Ringan
- **Slug branch:** `feat/riwayat-pembeli`

---

## 1. Konteks & Tujuan

Setelah checkout, identitas pembeli hilang — tidak ada cara melihat pesanan lampau.
`User` dengan role `PEMBELI` sudah disiapkan di schema, dan plan 01 mengisi
`buyerId` pada order ketika pembeli login. Saat ini belum ada halaman "Pesanan Saya".

Tujuan: tambahkan halaman `/pesanan-saya` yang menampilkan daftar pesanan pembeli
yang sedang login, lengkap dengan status terkini (memakai feed dari plan 03 bila
sudah ada, atau polling sebagai fallback).

---

## 2. Prasyarat

**Wajib:** plan 01 (auth) harus sudah merge — butuh `userId` dari session untuk
menyaring order. Bila belum, kembalikan pesan "silakan login" di UI.

---

## 3. Perubahan Schema

Tidak ada (field `buyerId` di `Order` sudah ada, nullable).

---

## 4. File Terlibat

**Modifikasi:**
- `lib/actions/order.ts` — tambah `getOrdersByBuyer(userId, limit?)`.
- `app/page.tsx` (header) — tampilkan tautan "Pesanan Saya" bila pembeli login.

**Buat baru:**
- `app/pesanan-saya/page.tsx` — server component, baca session, ambil order,
  render `RiwayatClient`.
- `components/RiwayatClient.tsx` — daftar kartu pesanan dengan link ke
  `/order/[id]`.

---

## 5. Langkah Implementasi

1. Tambah di `lib/actions/order.ts`:
   ```ts
   export async function getOrdersByBuyer(userId: string, limit = 50): Promise<OrderDTO[]> {
     const list = await prisma.order.findMany({
       where: { buyerId: userId },
       orderBy: { createdAt: "desc" },
       take: limit,
       include: { warung: true, items: true },
     });
     return list.map(toDTO);
   }
   ```

2. Buat `app/pesanan-saya/page.tsx`:
   - Server component. Baca session via `getSession()`.
   - Bila tidak login → render prompt "Login untuk melihat pesanan Anda" + tombol
     ke `/login`.
   - Bila login → `await getOrdersByBuyer(session.userId)`, teruskan ke
     `<RiwayatClient initialOrders={...} />`.

3. Buat `components/RiwayatClient.tsx`:
   - Daftar kartu: nomor order, nama warung, total (`formatRupiah`), `timeAgo`,
     `<StatusBadge>`, tautan "Lacak" → `/order/[id]`.
   - Empty state: "Belum ada pesanan" dengan ilustrasi emoji.
   - Bila plan 03 sudah merge, tambahkan langganan SSE per-order untuk item
     teratas (opsional, hemat koneksi — hanya order aktif).

4. Tambah tautan "Pesanan Saya" di header `app/page.tsx` (hanya untuk PEMBELI yang
   login).

---

## 6. Kriteria Penerimaan

- Pembeli yang login melihat seluruh pesanannya, terurut terbaru di atas.
- Klik kartu → ke halaman tracking `/order/[id]`.
- Pembeli yang belum login mendapat prompt login, bukan halaman kosong.
- Order yang dibuat sebelum login (tanpa `buyerId`) tidak muncul — diterima sebagai
  batasan MVP.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: login sebagai PEMBELI, buat order, cek muncul di `/pesanan-saya`.

---

## 8. Edge Cases & Jebakan

- Jangan bocorkan order milik user lain — selalu saring dengan `buyerId` dari
  session, bukan input klien.
- `include: { warung: true, items: true }` wajib agar `OrderDTO` lengkap; pastikan
  `toDTO` menangani relasi (date serialization).
- Bila plan 03 belum merge, jangan paksa SSE — polling sederhana cukup untuk MVP.

---

## 9. Pesan Commit

```
feat(buyer): add order history page at /pesanan-saya
```
