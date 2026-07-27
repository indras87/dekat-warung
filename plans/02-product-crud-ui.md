# Plan 02 — Product CRUD UI untuk Merchant

- **Prioritas:** P0
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/product-crud-ui`

---

## 1. Konteks & Tujuan

Schema sudah memiliki `Product` & `Category`. Server action `createProduct` ada di
`lib/actions/product.ts:32`, tetapi **tidak ada UI** untuk menambah, mengedit, atau
menghapus produk. Merchant saat ini hanya bisa toggle status stok di
`/warung-admin/stok`. Tanpa CRUD produk, warung tidak bisa mengelola etalase — ini
memblokir penggunaan sungguhan.

Tujuan: sediakan halaman `/warung-admin/produk` untuk CRUD produk + kelola kategori,
dengan UX selevel Terminal Warung yang sudah ada (Wise Design tokens, `rounded-pill`).

---

## 2. Prasyarat

Tidak ada. Bekerja paralel dengan plan lain di Fase B. Catatan: bila plan 01
(auth) sudah merge, kunci `warungId` dari session; bila belum, pakai warung default
sementara agar bisa dikembangkan mandiri.

---

## 3. Perubahan Schema

Tambah field opsional untuk gambar produk (baru dipakai penuh di plan 07, tetapi
disiapkan di sini):
```prisma
model Product {
  // ... existing ...
  imageUrl   String?   // URL gambar produk (diisi via plan 07 nanti)
}
```
Jalankan `npm run db:push`.

---

## 4. File Terlibat

**Modifikasi:**
- `lib/actions/product.ts` — tambah `updateProduct`, `deleteProduct`,
  `createCategory`, `deleteCategory`, `getCategoriesByWarung`.
- `components/MerchantBottomBar.tsx` — tambah tab/tautan "Produk".

**Buat baru:**
- `app/warung-admin/produk/page.tsx` — server component, ambil produk + kategori,
  render `ProdukClient`.
- `components/ProdukClient.tsx` — UI CRUD: list produk, form tambah, modal edit,
  konfirmasi hapus, manajer kategori sederhana.

---

## 5. Langkah Implementasi

1. Perluas `lib/actions/product.ts`:
   - `updateProduct(id, data: { nama?; harga?; categoryId?; imageUrl? })`.
   - `deleteProduct(id)`.
   - `createCategory(warungId, nama)`, `deleteCategory(id)`,
     `getCategoriesByWarung(warungId)`.
   - Semua kembalikan DTO polos (lihat pola `toDTO` yang sudah ada).

2. Buat `app/warung-admin/produk/page.tsx`:
   - Server component, baca warung aktif (default atau session bila 01 sudah ada),
     `await getProductsByWarung`, `await getCategoriesByWarung`, render
     `<ProdukClient warungId=... initialProducts=... initialCategories=... />`.

3. Buat `components/ProdukClient.tsx` (`"use client"`) dengan bagian:
   - **Form tambah produk:** input `nama`, `harga` (rupiah), select `kategori`
      (opsional), tombol "Tambah". Setelah submit → panggil `createProduct`, refresh
      list optimistik.
   - **Daftar produk:** tiap item tampilkan nama, harga, badge kategori, dan dua
      tombol: Edit (buka modal) & Hapus (dengan konfirmasi `confirm()`).
   - **Modal Edit:** reuse form, submit `updateProduct`.
   - **Manajer kategori (collapsible):** tambah/hapus kategori.
   - Pakai `useTransition`/`useActionState` dari React 19 agar UI non-blocking.
   - Gaya: kartu `bg-canvas-pure rounded-pill border-2 border-ink`, CTA
     `bg-lime text-ink font-black`, tombol hapus `text-negative`.

4. Tambah tautan "Produk" di `MerchantBottomBar.tsx` (route `/warung-admin/produk`).

5. Pertahankan halaman `/stok` yang lama (quick toggle) — jangan dihapus, karena
   memang punya tujuan berbeda (flip cepat).

---

## 6. Kriteria Penerimaan

- Merchant bisa menambah produk baru (nama + harga) dan langsung muncul di etalase
  pembeli (`/warung/[id]`).
- Edit nama/harga berhasil tersimpan; perubahan tercermin saat refresh.
- Hapus produk menghilangkannya dari etalase (perhatikan `OrderItem.productId`
  nullable — produk lama yang sudah dipesan tidak boleh rusak; pertimbangkan
  soft-delete bila perlu, tapi untuk MVP hapus permanen sudah cukup karena
  `OrderItem.productName` tersimpan snapshot).
- Kategori bisa dibuat & dihapus; produk bisa di-assign ke kategori.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
npm run db:push
```
Uji manual via `npm run dev`: tambah/edit/hapus produk, cek etalase pembeli.

---

## 8. Edge Cases & Jebakan

- `deleteProduct` yang masih punya `OrderItem` aktif: karena `OrderItem.productId`
  nullable dan `productName` adalah snapshot, hapus aman. Namun pastikan tidak ada
  `onDelete: Restrict`. Cek relasi di schema — saat ini tidak ada relasi hard dari
  `OrderItem` ke `Product`, jadi aman.
- Validasi `harga` harus integer positif; tolak input non-numerik di sisi klien.
- `imageUrl` untuk sekarang biarkan kosong (input URL opsional); plan 07 akan
  menyediakan uploader.
- Jaga agar form tetap dapat diakses (label `<label>`, `aria-label`, fokus otomatis).

---

## 9. Pesan Commit

```
feat(merchant): add product + category CRUD UI at /warung-admin/produk
```
