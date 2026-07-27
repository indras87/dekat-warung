# Plan 06 — Onboarding Warung Baru

- **Prioritas:** P2
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/onboarding-warung`

---

## 1. Konteks & Tujuan

Saat ini warung hanya bisa dibuat lewat `prisma/seed.mjs`. Tidak ada alur bagi
pemilik warung baru untuk mendaftarkan toko mereka — menyetel nama, lokasi GPS,
tarif antar, dan metode pembayaran. Tanpa onboarding, platform tidak bisa berkembang
melebihi data seed.

Tujuan: sediakan halaman pendaftaran warung `/daftar-warung` yang, setelah plan 01
(auth) aktif, mengubah `User` role `PEMBELI` menjadi `WARUNG` dan membuat entitas
`Warung` miliknya.

---

## 2. Prasyarat

**Wajib:** plan 01 (auth). Butuh `userId` session dan kemampuan mengubah role.

---

## 3. Perubahan Schema

Tidak ada perubahan struktural. Pastikan transisi role `PEMBELI → WARUNG` aman
(tidak ada order yang menggantung sebagai merchant — edge case jarang, abaikan untuk
MVP).

---

## 4. File Terlibat

**Modifikasi:**
- `lib/actions/warung.ts` — tambah `createWarungForUser(ownerId, data)`.
- `lib/actions/auth.ts` (dari plan 01) — `upgradeToWarung` atau refresh session
  setelah role berubah.
- `app/(auth)/login/page.tsx` atau header — tautan "Daftarkan Warung Anda".

**Buat baru:**
- `app/(auth)/daftar-warung/page.tsx` — server component, render form.
- `components/DaftarWarungClient.tsx` — form onboarding.

---

## 5. Langkah Implementasi

1. Tambah `createWarungForUser` di `lib/actions/warung.ts`:
   ```ts
   export async function createWarungForUser(
     ownerId: string,
     data: { namaWarung: string; latitude: number; longitude: number;
             deliveryFee: number; isDeliveryAvailable: boolean;
             acceptCash: boolean; acceptQris: boolean; acceptTransfer: boolean;
             whatsappNumber?: string | null },
   ): Promise<WarungDTO> {
     // 1. update User role -> WARUNG
     // 2. create Warung with ownerId
     // (bungkus dalam prisma.$transaction)
   }
   ```

2. Buat `app/(auth)/daftar-warung/page.tsx`:
   - Baca session; bila user sudah `WARUNG` → redirect `/warung-admin`.
   - Render `<DaftarWarungClient userId=... />`.

3. Buat `components/DaftarWarungClient.tsx`:
   - **Ambil lokasi otomatis** via `navigator.geolocation.getCurrentPosition` untuk
     mengisi `latitude`/`longitude` (default ke `DEFAULT_BUYER_LAT/LNG` bila gagal).
   - Sediakan input manual lat/lng (override) agar bisa koreksi.
   - Field: nama warung, tarif antar (default 2000), toggle antar, toggle 3 metode
     bayar, nomor WhatsApp.
   - Submit → `createWarungForUser` → `upgradeToWarung` (refresh session role) →
     `redirect("/warung-admin")`.

4. Tambah tautan "Daftarkan Warung Anda" di halaman login / header (untuk user
   `PEMBELI`).

---

## 6. Kriteria Penerimaan

- Pembeli login bisa mendaftarkan satu warung; setelah submit, role menjadi `WARUNG`
  dan langsung diarahkan ke Terminal Warung miliknya.
- Koordinat terisi otomatis dari GPS; dapat dikoreksi manual.
- Warung baru langsung muncul di discovery pembeli yang berada dalam radius 200m
  (selama `isOpen = true`).
- User yang sudah `WARUNG` tidak bisa mendaftar lagi (redirect).

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
```
Uji manual: login sebagai PEMBELI baru, daftarkan warung di koordinat dekat
`DEFAULT_BUYER_LAT/LNG`, verifikasi muncul di `/`.

---

## 8. Edge Cases & Jebakan

- Satu user hanya boleh punya satu warung (`ownerId @unique` sudah menjamin).
  Tangani error uniqueness dengan pesan ramah.
- Akurasi GPS di dalam ruangan buruk; selalu sediakan input manual + tampilkan
  koordinat terpilih agar user yakin.
- Bungkus update role + insert warung dalam `prisma.$transaction` agar tidak
  meninggalkan state setengah jadi bila salah satu gagal.
- Refresh session setelah role berubah — `iron-session` perlu `saveSession` ulang
  dengan role baru agar middleware langsung mengizinkan `/warung-admin`.

---

## 9. Pesan Commit

```
feat(onboarding): merchant can register a new warung at /daftar-warung
```
