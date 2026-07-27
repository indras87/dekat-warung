# Plan 11 — Pencarian & Filter Produk Lintas Warung

- **Prioritas:** P3
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/pencarian-filter-produk`

---

## 1. Konteks & Tujuan

Saat ini pembeli hanya bisa discovery berbasis radius 200m — melihat daftar warung,
lalu membuka etalase satu per satu. Kasus pakai paling umum tidak terlayani: "saya
mau beli Indomie, warung mana yang ada stoknya?". Tujuan: tambahkan pencarian produk
lintas warung dalam radius pengguna, dikelompokkan per warung.

---

## 2. Prasyarat

Tidak ada (paralel di Fase B). Memakai `getNearbyWarungs` & `haversineMeters` yang
sudah ada.

---

## 3. Perubahan Schema

Tidak ada. Pertimbangan performa: untuk skala besar, tambah indeks
`@@index([warungId, nama])` di `Product`. Untuk MVP tidak wajib.

---

## 4. File Terlibat

**Modifikasi:**
- `app/page.tsx` — tambah input pencarian di header (atau tombol ke `/cari`).
- `lib/actions/product.ts` — tambah `searchProducts(query, lat, lng, radiusM)`.

**Buat baru:**
- `app/cari/page.tsx` — halaman hasil pencarian (menerima `?q=`).
- `components/SearchClient.tsx` — UI input + hasil.
- `lib/actions/search.ts` (boleh digabung ke `product.ts`) — query pencarian.

---

## 5. Langkah Implementasi

1. Tambah `searchProducts` di `lib/actions/product.ts`:
   ```ts
   export async function searchProducts(
     query: string, lat: number, lng: number, radiusM = DISCOVERY_RADIUS_M,
   ) {
     // 1. ambil warung dalam radius (reuse getNearbyWarungs, ambil id+distanceM)
     // 2. prisma.product.findMany({
     //      where: { warungId: { in: ids }, nama: { contains: query, mode: "insensitive" } },
     //      include: { warung: true } })
     // 3. petakan ke DTO + lampirkan distanceM dari warung
     // 4. urutkan: kecocokan nama mulai dulu, lalu jarak terdekat
   }
   ```
   Catatan: `mode: "insensitive"` didukung PostgreSQL.

2. Buat `app/cari/page.tsx`:
   - Server component membaca `searchParams.q`, `searchParams.lat/lng` (atau
     gunakan `DEFAULT_BUYER_*`). Render `<SearchClient initialQ=... initialResults=... />`.

3. Buat `components/SearchClient.tsx`:
   - Input teks dengan debounce ~300ms, tombol cari.
   - Ambil koordinat via `navigator.geolocation` sekali saat mount.
   - Panggil `searchProducts`, render hasil **dikelompokkan per warung**: tiap grup
     = kartu warung (nama, badge BUKA/TUTUP, jarak) berisi produk cocok + tombol
     "Lihat Warung" → `/warung/[id]`.
   - Empty state: "Produk tidak ditemukan dalam radius 200m".

4. Tambah input/ikon pencarian di header `app/page.tsx` → navigasi ke `/cari?q=`.

---

## 6. Kriteria Penerimaan

- Mencari "indomie" mengembalikan semua produk bernama serupa dari warung dalam
  radius 200m.
- Hasil dikelompokkan per warung, urut berdasarkan jarak.
- Warung TUTUP tetap muncul tetapi diberi badge (produk tetap bisa dilihat, pesanan
  tidak akan diterima sampai buka).
- Pencarian case-insensitive & setidaknya mendukung substring.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: seed beberapa produk berbeda nama, cari dari koordinat dekat warung
seed, verifikasi hasil & pengelompokan.

---

## 8. Edge Cases & Jebakan

- `mode: "insensitive"` adalah fitur PostgreSQL; bila pernah switch ke SQLite, ini
  akan error — gunakan `equals` lowercase manual sebagai fallback, atau dokumentasikan
  bahwa pencarian butuh Postgres.
- Filter produk `isAvailable = false`? Keputusan produk: tampilkan tetapi beri badge
  "Habis" agar pembeli tahu warung punya barang tapi sedang kosong.
- Pertimbangkan batasi panjang `query` (mis. ≤ 60 karakter) untuk menghindari abuse.
- Untuk skala besar: pindah ke Postgres FTS (`tsvector`) atau trigram; MVP `contains`
  cukup.

---

## 9. Pesan Commit

```
feat(search): cross-warung product search within radius at /cari
```
