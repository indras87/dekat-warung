# Plan 07 — Upload Gambar (QRIS & Produk)

- **Prioritas:** P3
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/upload-gambar`

---

## 1. Konteks & Tujuan

Saat ini `qrisImageUrl` hanyalah string URL — merchant harus meng-host gambar QRIS
di tempat lain. Field `imageUrl` pada `Product` (ditambahkan di plan 02) juga belum
punya uploader. Tujuan: sediakan upload file lokal sederhana ke `public/uploads/`
tanpa cloud, cukup untuk MVP & demo. Produksi dapat diganti S3/Cloudinary nanti.

---

## 2. Prasyarat

Tidak ada. Bekerja paralel di Fase B. Bermanfaat bagi plan 02 (gambar produk) dan
`SettingsClient` (QRIS).

---

## 3. Perubahan Schema

Sudah ditangani plan 02 (`Product.imageUrl`). Untuk QRIS, field `Warung.qrisImageUrl`
sudah ada. Tidak ada perubahan schema baru.

---

## 4. File Terlibat

**Modifikasi:**
- `components/SettingsClient.tsx` — ganti input URL QRIS dengan komponen upload.
- `components/ProdukClient.tsx` (dari plan 02) — tambah uploader pada form
  tambah/edit produk.
- `.gitignore` — abaikan `public/uploads/*` (kecuali `.gitkeep`).

**Buat baru:**
- `app/api/upload/route.ts` — POST multipart, simpan file.
- `lib/upload.ts` — helper `saveImageFile(file): Promise<string>` (mengembalikan
  URL publik).
- `components/ImageUpload.tsx` — input + pratinjau, kirim ke `/api/upload`.

---

## 5. Langkah Implementasi

1. Buat `lib/upload.ts`:
   - Validasi: MIME harus `image/png|jpeg|webp`, ukuran maksimum **2 MB**.
   - Hasilkan nama unik (bisa pakai `crypto.randomUUID()` + ekstensi asli).
   - Simpan ke `public/uploads/<nama>`, kembalikan `/uploads/<nama>`.

2. Buat `app/api/upload/route.ts`:
   ```ts
   export const runtime = "nodejs";
   export async function POST(req: Request) {
     const form = await req.formData();
     const file = form.get("file");
     // validasi tipe/ukuran, simpan, kembalikan { url }
   }
   ```
   Kembalikan `400` bila tidak valid, `413` bila terlalu besar.

3. Buat `components/ImageUpload.tsx`:
   - `<input type="file" accept="image/*">`, pratinjau `<img>` bila ada nilai.
   - Saat file dipilih → POST ke `/api/upload`, terima URL, simpan ke state,
     kembalikan URL lewat prop `onChange`.
   - Tunjukkan spinner saat upload & error bila gagal.

4. Integrasikan ke `SettingsClient` (QRIS) & `ProdukClient` (gambar produk) sebagai
   pengganti input URL murni. Pertahankan kemampuan menerima URL manual sebagai
   fallback.

5. Buat `public/uploads/.gitkeep` dan tambah aturan `.gitignore`.

---

## 6. Kriteria Penerimaan

- Merchant bisa upload gambar QRIS; tersimpan & ditampilkan di pengaturan.
- Gambar produk bisa di-upload dan muncul di etalase pembeli.
- File non-gambar atau > 2 MB ditolak dengan pesan jelas.
- File lama tidak menumpuk tanpa batas — (opsional) catat di README bahwa cleanup
  manual diperlukan untuk MVP.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: upload gambar di Settings & Produk, cek file muncul di
`public/uploads/`, dan tampil di UI.

---

## 8. Edge Cases & Jebakan

- **Container:** pada `docker-compose.yml`, `public/uploads` harus berada di volume
  persisten agar tidak hilang saat container rebuild. Tambah bind mount bila perlu
  dan catat di README.
- **Next.js static serving:** file di `public/` dilayani otomatis; tidak perlu
  route tambahan untuk membacanya.
- **Keamanan:** validasi MIME berdasarkan signature, bukan ekstensi saja (cek
  `file.type` dan, idealnya, magic bytes). Untuk MVP cek `file.type` cukup.
- **Produksi:** ganti penyimpanan ke S3/R2/Cloudinary; antarmuka `lib/upload.ts`
  cukup jadi satu titik perubahan.

---

## 9. Pesan Commit

```
feat(upload): local image upload for QRIS + product images
```
