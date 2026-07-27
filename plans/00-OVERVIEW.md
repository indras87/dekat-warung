# Dekat Warung — Roadmap & Master Implementation Plan

Dokumen ini adalah indeks dan konvensi tunggal untuk seluruh rencana fitur. Setiap
implementor (programmer junior atau AI model murah) **wajib** membaca dokumen ini
sebelum mulai, lalu membuka file plan spesifik bernomor.

---

## 1. Stack & Sumber Kebenapan

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Next.js 15.5 (App Router), React 19 |
| Bahasa | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 (token Wise Design System) |
| ORM | Prisma 6, provider **PostgreSQL** |
| Runtime DB lokal | via `docker-compose.yml` (service Postgres) |
| PWA | `public/manifest.json` (+ Service Worker pada plan 04) |

File acuan: `prd.md` (logika bisnis), `design.md` (token UI), `prisma/schema.prisma`
(lapisan data), `CLAUDE.md` (aturan proyek).

---

## 2. Konvensi Wajib

### Struktur kode
- **Server Actions:** `lib/actions/*..ts`, diawali `"use server"`. Selalu kembalikan
  DTO polos (serializable). Konversi `Date` → `ISO string` lewat helper `toDTO`.
  Lihat pola di `lib/actions/warung.ts`.
- **Client components:** `*.tsx` diawali `"use client"`, impor action dari `@/lib/actions`.
- **API routes:** `app/api/.../route.ts`, ekspor `GET`/`POST`/`PATCH`/`DELETE`.
- **Token Tailwind yang ada** (PAKAI, jangan buat warna baru):
  `ink` `ink-deep` `lime` `lime-hover` `lime-pale` `canvas-soft` `canvas-pure`
  `body` `mute` `positive` `positive-deep` `warning` `negative`.
- **Geometri:** `rounded-pill` (24px) untuk kartu & CTA utama, `rounded-[16px]` untuk
  tombol sekunder, `font-black` (weight 900) untuk heading.
- **Konstanta domain:** taruh di `lib/constants.ts`. **Util format:** `lib/format.ts`
  (`formatRupiah`, `formatDistance`, `timeAgo`).
- **Tidak boleh ada angka "ajaib"** di komponen — lewatkan dari `constants.ts`.

### Database
- Setiap perubahan schema: edit `prisma/schema.prisma`, lalu jalankan
  `npm run db:push` (migrasi cepat dev) dan `npm run db:seed` bila perlu data contoh.
- Model baru wajib `@@map("namatable")` dan `@default(cuid())` untuk `id`.

### Verifikasi (gerbang wajib sebelum commit)
```
npx tsc --noEmit && npm run build
```
Kedua perintah harus **lolos tanpa error**. Bila gagal, perbaiki di branch fitur
sampai hijau. Jangan pernah commit kondisi merah.

### Git & merging (ikuti `CLAUDE.md` ketat)
1. Branch dari `main`: `git checkout -b feat/<slug-fitur>`.
2. Commit atomik per sub-langkah, format Conventional Commits
   (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
3. Setelah build hijau: `git checkout main` lalu
   `git merge feat/<slug-fitur> --no-ff -m "feat: <ringkasan>"`.
4. **JANGAN hapus** branch fitur setelah merge.

---

## 3. Daftar Plan Bernomor

| # | Slug Fitur | Prioritas | Prasyarat |
|---|-----------|:---:|---|
| 01 | `autentikasi-guard-merchant` | P0 | — |
| 02 | `product-crud-ui` | P0 | — |
| 03 | `realtime-sse` | P1 | — |
| 04 | `service-worker-pwa` | P1 | — |
| 05 | `riwayat-pembeli` | P2 | 01 |
| 06 | `onboarding-warung` | P2 | 01 |
| 07 | `upload-gambar` | P3 | — |
| 08 | `push-notification` | P3 | 04 |
| 09 | `analitik-merchant` | P3 | 01 |
| 10 | `verifikasi-pembayaran` | P3 | — |
| 11 | `pencarian-filter-produk` | P3 | — |
| 12 | `auto-cancel-stale-orders` | P3 | — |
| 13 | `rate-limiting-keamanan-api` | P3 | — |

---

## 4. Urutan Eksekusi (untuk Agent Teams)

Eksekusi per fase. Dalam satu fase, plan boleh dijalankan paralel oleh agent berbeda
karena tidak saling mengubah file konflik. **Fase berikutnya hanya mulai setelah fase
sebelumnya merge ke `main` dan build hijau.**

- **Fase A (sekuensial, fondasi):** `01`
- **Fase B (paralel setelah A):** `02`, `03`, `04`, `05`, `06`, `07`, `11`, `12`, `13`
- **Fase C (paralel setelah B):** `08` (butuh 04), `09` (butuh 01 — boleh naik ke B), `10`

> Catatan: `09` sebenarnya hanya butuh `01`, jadi boleh dipindah ke Fase B untuk
> mempercepat. `08` wajib menunggu `04` (Service Worker).

---

## 5. Template Satu File Plan

Setiap file plan memakai kerangka berikut agar konsisten:
1. Prioritas & estimasi usaha
2. Konteks & tujuan
3. Prasyarat / dependensi
4. Perubahan schema (bila ada)
5. File terlibat (modifikasi + buat baru)
6. Langkah implementasi terurut & atomik
7. Kriteria penerimaan
8. Perintah verifikasi
9. Edge case & jebakan
10. Pesan commit disarankan

---

## 6. Definition of Done (proyek)

Seluruh plan dinilai selesai ketika:
- Semua 13 fitur terimplementasi & ter-merge ke `main`.
- `npx tsc --noEmit && npm run build` hijau di `main`.
- `npm run db:push && npm run db:seed` berjalan tanpa error.
- `docker compose up --build` menghasilkan container yang bisa diakses.
- Tidak ada regressi pada alur inti: discovery → checkout → tracking → merchant alert.

---

## 7. Catatan untuk Implementor AI

- Saat butuh dokumentasi library terkini (Next.js, Prisma, iron-session, web-push,
  Serwist, dll.), **gunakan MCP Context7** (`resolve-library-id` → `query-docs`).
  Jangan andalkan ingatan.
- Pertahankan komentar kode berbahasa Indonesia ringkas sesuai gaya yang sudah ada.
- Hormati token desain — jangan memperkenalkan kelas Tailwind atau warna baru di luar
  yang tercantum di §2.
