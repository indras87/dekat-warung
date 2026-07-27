# Plan 09 — Analitik / Laporan Merchant

- **Prioritas:** P3
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/analitik-merchant`

---

## 1. Konteks & Tujuan

Pemilik warung tidak bisa melihat performa bisnis: omzet harian, jumlah pesanan, dan
produk terlaris. Tujuan: tambahkan halaman `/warung-admin/laporan` dengan ringkasan
sederhana berbasis agregasi Prisma, dirender sebagai chart batang CSS tanpa
dependency library chart (hemat bundle, ramah junior).

---

## 2. Prasyarat

**Wajib:** plan 01 (auth) — butuh `warungId` dari session agar laporan ter-scoped
ke warung pemilik yang login.

---

## 3. Perubahan Schema

Tidak ada.

---

## 4. File Terlibat

**Modifikasi:**
- `components/MerchantBottomBar.tsx` — tambah tab "Laporan".

**Buat baru:**
- `lib/actions/laporan.ts` — agregasi: `getDailyRevenue`, `getOrderCountsByStatus`,
  `getTopProducts`.
- `app/warung-admin/laporan/page.tsx` — server component, ambil data, render
  `LaporanClient`.
- `components/LaporanClient.tsx` — kartu KPI + chart batang CSS.
- `components/BarChart.tsx` — komponen batang sederhana (div + persentase tinggi).

---

## 5. Langkah Implementasi

1. Buat `lib/actions/laporan.ts` (semua `"use server"`, kembalikan DTO polos):
   - `getDailyRevenue(warungId, days = 7)`:
     - Saring order `status` di `{ SELESAI }` dalam `days` terakhir, kelompokkan per
       tanggal, jumlahkan `totalAmount`.
     - Hasil: `{ date: "YYYY-MM-DD", total: number }[]`.
   - `getOrderCountsByStatus(warungId)`:
     - `prisma.order.groupBy({ by: ["status"], where: { warungId }, _count: true })`.
   - `getTopProducts(warungId, limit = 5)`:
     - Ambil `OrderItem` untuk order `SELESAI` milik warung, agregasi
       `quantity * price` per `productName` di JS (atau `groupBy` bila productId
       konsisten). Urutkan, ambil `limit`.

2. Buat `app/warung-admin/laporan/page.tsx`:
   - Server component, baca `getCurrentMerchantWarung` (plan 01), ambil tiga dataset,
     teruskan ke `<LaporanClient />`.

3. Buat `components/LaporanClient.tsx`:
   - **KPI baris:** Omzet 7 hari, Jumlah pesanan selesai, AOV (rata-rata order).
   - **Chart batang omzet harian** via `BarChart` (tinggi batang proporsional terhadap
     nilai maksimum, label tanggal di bawah, nilai via `formatRupiah`).
   - **Daftar produk terlaris** dengan rank, nama, qty, kontribusi rupiah.
   - **Distribusi status pesanan** (badge berwarna per status).
   - Empty state bila belum ada order selesai.

4. Buat `components/BarChart.tsx`:
   - Prop: `{ data: { label: string; value: number }[] }`.
   - Render fleksibel: tiap batang `div` dengan `height: ${(value/max)*100}%` di dalam
     container `h-40`, sumbu-Y implisit. Warna batang `bg-lime`.

5. Tambah tautan "Laporan" di `MerchantBottomBar`.

---

## 6. Kriteria Penerimaan

- Halaman menampilkan omzet 7 hari terakhir (hanya order `SELESAI`).
- Batang harian proporsional & berlabel.
- Produk terlaris terurut descending.
- Laporan hanya membaca data warung pemilik yang login (bukan warung lain).

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: pastikan ada beberapa order `SELESAI` (buat via seed atau flow checkout
→ terima → selesai), cek angka & chart akurat.

---

## 8. Edge Cases & Jebakan

- Hanya hitung `SELESAI` untuk omzet — order `BATAL`/`PENDING` tidak masuk.
- `groupBy` Prisma butuh field di `by`; pastikan cast `_count` sesuai tipe.
- Agregasi produk: `OrderItem.productName` adalah snapshot, jadi kelompokkan berdasar
  nama, bukan `productId` (produk mungkin sudah dihapus/diganti nama).
- Untuk skala besar nanti, pindahkan agregasi ke SQL murni (Postgres `date_trunc`)
  lewat `prisma.$queryRaw`; MVP lakukan di JS cukup.

---

## 9. Pesan Commit

```
feat(merchant): sales analytics dashboard at /warung-admin/laporan
```
