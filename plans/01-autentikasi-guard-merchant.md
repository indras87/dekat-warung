# Plan 01 — Autentikasi & Guard Merchant Terminal

- **Prioritas:** P0
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/autentikasi-guard-merchant`

---

## 1. Konteks & Tujuan

Saat ini `getDefaultMerchantWarung()` (`lib/actions/warung.ts:47`) mengembalikan
warung pertama tanpa pengecekan identitas. Halaman `/warung-admin/*` terbuka untuk
siapa pun. Skema `User` sudah mendefinisikan role `ADMIN`/`PEMBELI`/`WARUNG` dan
relasi `Warung.ownerId`, tetapi tidak ada login sama sekali.

Tujuan: tambahkan autentikasi berbasis cookie terenkripsi (`iron-session`) yang:
- Memungkinkan pemilik warung login (PIN) untuk mengakses Terminal Warung.
- Membuat `PEMBELI` opsional login (untuk menyimpan `buyerId` pada order, dipakai
  plan 05).
- Melindungi seluruh route `/warung-admin/*` via middleware.

---

## 2. Prasyarat

Tidak ada. Ini fondasi Fase A.

---

## 3. Perubahan Schema

`prisma/schema.prisma` — model `User`:
```prisma
model User {
  // ... field existing ...
  pin          String?   // PIN numerik 6 digit, opsional untuk login
  // tambahkan:
  // (tidak ada field baru selain `pin`)
}
```
Jalankan `npm run db:push`. Update `prisma/seed.mjs` agar user WARUNG & PEMBELI
contoh memiliki `pin` (mis. `"123456"`).

Tambahkan ke `.env` dan `.env.example`:
```
SESSION_SECRET=<string-acak-min-32-karakter>
SESSION_COOKIE_NAME=dw-session
```

---

## 4. File Terlibat

**Modifikasi:**
- `package.json` — tambah dependency `iron-session`.
- `lib/actions/warung.ts` — ganti `getDefaultMerchantWarung` dengan
  `getCurrentMerchantWarung` (berbasis session ownerId).
- `app/warung-admin/page.tsx`, `app/warung-admin/stok/page.tsx`,
  `app/warung-admin/pengaturan/page.tsx` — baca warung dari session, bukan default.
- `app/checkout/page.tsx` & `lib/actions/order.ts` — bila pembeli login, simpan
  `buyerId`; jika tidak, tetap pakai `buyerName` string (pertahankan kompatibilitas).
- `app/layout.tsx` / `app/page.tsx` — tampilkan tombol Login / Logout di header.

**Buat baru:**
- `lib/session.ts` — helper `iron-session`: `getSession`, `saveSession`,
  `destroySession`, `requireRole(role)`.
- `lib/actions/auth.ts` — server actions `signIn`, `signOut`.
- `app/(auth)/login/page.tsx` + `components/LoginClient.tsx`.
- `middleware.ts` (root proyek) — proteksi `/warung-admin/*`.

---

## 5. Langkah Implementasi

1. Pasang dependency:
   ```
   npm install iron-session
   ```
   Konsultasi Context7 (`/vvo/iron-session`) untuk API versi terbaru.

2. Buat `lib/session.ts`:
   - `SessionData = { userId: string; role: Role; warungId?: string }`.
   - `getSession()` membaca session via `cookies()` dari `next/headers`.
   - `saveSession(data)` menulis, `destroySession()` menghapus.

3. Buat `lib/actions/auth.ts`:
   - `signIn(input: { nama: string; pin: string })`: cari `User` by `nama` (atau
     `noHp`), cocokkan `pin`, simpan session. Redirect sesuai role.
   - `signOut()`: destroy session, redirect `/`.

4. Buat `middleware.ts`:
   ```ts
   import { NextResponse, type NextRequest } from "next/server";
   // baca cookie dw-session, decode iron-session, cek role === "WARUNG"
   // bila tidak sesuai → redirect /login?next=/warung-admin
   ```
   Gunakan `getToken`/decode manual karena middleware berjalan di Edge; lihat
   dokumentasi iron-session untuk middleware cookie read.

5. Ganti `getDefaultMerchantWarung` → `getCurrentMerchantWarung`:
   - Baca `userId` dari session, cari `Warung` where `ownerId = userId`.
   - Bila tidak ada → lempar error / redirect onboarding (plan 06).

6. Perbarui tiga halaman `/warung-admin/*` agar memanggil
   `getCurrentMerchantWarung` (server component) lalu meneruskan ke client.

7. Update seed: set `pin` pada minimal 1 user WARUNG & 1 PEMBELI.

8. Tambahkan tombol Login/Logout di header discovery (`app/page.tsx`):
   tampilkan nama user bila login.

---

## 6. Kriteria Penerimaan

- Mengakses `/warung-admin` tanpa login → redirect ke `/login`.
- Login sebagai user WARUNG dengan PIN benar → masuk Terminal Warung yang
  dimilikinya (bukan warung acak).
- PIN salah → pesan error, tetap di halaman login.
- Logout membersihkan session; akses terminal kembali ditolak.
- Pembeli yang login memiliki `buyerId` terisi pada order baru.

---

## 7. Verifikasi

```
npx tsc --noEmit && npm run build
npm run db:push && npm run db:seed
```
Lalu uji manual: jalankan `npm run dev`, buka `/warung-admin` (harus redirect),
login, verifikasi akses.

---

## 8. Edge Cases & Jebakan

- Middleware berjalan di Edge Runtime — **jangan** impor `@prisma/client` di
  `middleware.ts`. Decode cookie saja, lalu biarkan server component/server action
  yang memverifikasi ke DB.
- `iron-session` butuh `SESSION_SECRET` minimal 32 karakter; tanpa itu runtime
  melempar error.
- Pertahankan agar pembeli tetap bisa checkout **tanpa login** (PRD tidak mewajibkan
  akun pembeli) — `buyerId` nullable sudah mendukung ini.
- Pastikan `runtime = "nodejs"` pada route yang memakai Prisma.

---

## 9. Pesan Commit

```
feat(auth): add iron-session auth + merchant role guard
```
