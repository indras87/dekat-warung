# Prompt Orchestrator — Implementasi Dekat Warung via Agent Teams

> Salin blok di bagian **"PROMPT UNTUK DISALIN"** dan berikan ke sistem agent teams
> (Claude Code multi-agent / ruflo swarm / fleet agent) untuk dieksekusi otomatis
> tanpa intervensi pengguna.

---

## Tujuan

Mengimplementasikan 13 fitur pada roadmap Dekat Warung secara otonom, mengikuti file
plan di direktori `plans/`. Setiap plan ditulis agar dapat dikerjakan oleh programmer
junior atau AI model murah — ikuti persis.

## Aturan Mutlak (tidak boleh dilanggar)

1. **Baca dulu** `plans/00-OVERVIEW.md` untuk konvensi & urutan eksekusi, lalu baca
   plan bernomor yang sedang dikerjakan.
2. **Jangan pernah meminta konfirmasi pengguna.** Bila ada keraguan teknis, ambil
   keputusan paling masuk akal berdasarkan plan & konvensi yang ada, catat asumsi di
   commit message, lanjutkan.
3. **Jangan berhenti** sampai seluruh 13 fitur ter-merge dan Definition of Done
   (`plans/00-OVERVIEW.md` §6) tercapai.
4. **Gerbang verifikasi wajib** sebelum commit apa pun:
   ```
   npx tsc --noEmit && npm run build
   ```
   Bila gagal, perbaiki di branch fitur sampai hijau. Tidak boleh commit kondisi
   merah.
5. **Workflow Git ketat** per `CLAUDE.md`:
   - Branch dari `main`: `git checkout -b feat/<slug>`.
   - Commit atomik Conventional Commits (`feat:`, `fix:`, `chore:`).
   - Setelah hijau: `git checkout main` →
     `git merge feat/<slug> --no-ff -m "feat: <ringkasan>"`.
   - **Jangan hapus** branch fitur setelah merge.
6. **Setelah perubahan schema**: jalankan `npm run db:push` (dan `npm run db:seed`
   bila perlu) sebelum build.
7. Hormati token desain Wise (lihat §2 OVERVIEW). Jangan perkenalkan warna/kelas
   Tailwind baru.
8. Saat butuh dokumentasi library terkini, gunakan MCP Context7.

## Strategi Eksekusi Paralel (Agent Teams)

Koordinator memetakan plan ke fase. **Dalam satu fase**, plan boleh dijalankan
paralel oleh agent berbeda (tidak ada konflik file). **Fase berikutnya hanya mulai
setelah fase sebelumnya ter-merge ke `main` dan build hijau.**

- **Fase A (sekuensial):** `01-autentikasi-guard-merchant` (fondasi — satu agent)
- **Fase B (paralel setelah A):** `02`, `03`, `04`, `05`, `06`, `07`, `11`, `12`, `13`
  (9 agent paralel)
- **Fase C (paralel setelah B):** `08` (butuh 04), `09` (butuh 01), `10` (mandiri,
  boleh juga naik ke B bila slot tersedia)

Setiap agent pekerja:
1. `git checkout main && git pull` (bila ada remote).
2. Buat branch `feat/<slug>` dari plan yang ditugaskan.
3. Baca `plans/00-OVERVIEW.md` + plan spesifik.
4. Implementasi mengikti langkah di plan, urut & atomik.
5. Jalankan `npm run db:push` bila menyentuh schema.
6. Jalankan gerbang verifikasi; perbaiki sampai hijau.
7. Commit atomik + merge `--no-ff` ke `main`; pertahankan branch fitur.
8. Laporkan: slug, file yang diubah, hasil verifikasi, asumsi/penyimpangan.

Koordinator: setelah seluruh agent fase selesai, jalankan sekali lagi
`npx tsc --noEmit && npm run build` di `main` sebagai gerbang antar-fase sebelum
memulai fase berikutnya.

## Batas & Eskalasi

- Bila sebuah plan **tidak bisa** diselesaikan karena masalah teknis nyata (mis.
lib tidak kompatibel Next 15), lewati sementara, catat di `plans/BLOCKERS.md`, dan
lanjutkan plan lain. Kembali di akhir setelah seluruh plan lain selesai.
- Bila terjadi konflik merge (jarang, karena pemisahan fase), selesaikan dengan
  mengutamakan implementasi paling lengkap, lalu verifikasi build ulang.

## Definition of Done

Lihat `plans/00-OVERVIEW.md` §6.

---

## PROMPT UNTUK DISALIN

```
Anda adalah koordinator agent teams yang mengimplementasikan roadmap fitur proyek
"Dekat Warung" secara otonom. Direktori kerja: /mnt/c/ai_workspace/dekat-warung.

CARA KERJA:
1. Baca plans/00-OVERVIEW.md untuk memahami konvensi, urutan fase, dan Definition of
   Done. Ini sumber kebenaran tunggal.
2. Eksekusi dalam 3 fase (A → B → C). Dalam satu fase, dispatch agent pekerja paralel
   (satu agent per plan) via Agent tool. Fase berikutnya hanya mulai setelah fase
   sebelumnya ter-merge ke main dan "npx tsc --noEmit && npm run build" hijau.
   - Fase A (sekuensial): plan 01-autentikasi-guard-merchant
   - Fase B (paralel): plan 02, 03, 04, 05, 06, 07, 11, 12, 13
   - Fase C (paralel): plan 08, 09, 10
3. Tiap agent pekerja menerima prompt:
   "Baca plans/00-OVERVIEW.md dan plans/<NN-slug>.md. Buat branch feat/<slug> dari
   main. Implementasikan persis sesuai plan, urut dan atomik. Jalankan
   'npm run db:push' bila menyentuh prisma/schema.prisma. Verifikasi dengan
   'npx tsc --noEmit && npm run build' — perbaiki sampai hijau, dilarang commit
   kondisi merah. Commit atomik Conventional Commits. Setelah hijau, checkout main,
   merge branch '--no-ff' dengan pesan 'feat: <ringkasan>', lalu PERTAHANKAN branch
   fitur (jangan hapus). Gunakan MCP Context7 bila butuh dokumentasi library. Jangan
   meminta konfirmasi pengguna — ambil keputusan terbaik, catat asumsi di commit.
   Laporkan: slug, daftar file yang diubah/created, hasil verifikasi, asumsi."

ATURAN MUTLAK:
- Jangan pernah meminta intervensi pengguna. Lanjutkan sampai selesai.
- Gerbang verifikasi "npx tsc --noEmit && npm run build" wajib hijau sebelum setiap
  commit dan sebelum setiap merge ke main.
- Patuhi workflow Git di CLAUDE.md (branch feat, merge --no-ff, retain branch).
- Hormati token desain Wise (jangan warna/kelas Tailwind baru) — lihat OVERVIEW §2.
- Gunakan MCP Context7 untuk dokumentasi library terkini; jangan andalkan ingatan.
- Bila satu plan terblokir masalah teknis nyata, catat di plans/BLOCKERS.md, lewati,
  lanjutkan plan lain. Jangan menghentikan seluruh eksekusi.

PENTING UNTUK KOORDINATOR:
- Sebelum mulai Fase A, pastikan kondisi awal bersih: git status bersih di main,
  dependencies terpasang (npm install).
- Setelah setiap fase selesai, jalankan ulang gerbang verifikasi di main sebelum
   fase berikutnya.
- Akhiri dengan ringkasan: status tiap plan (selesai/dilewati/blokir), total commit,
  hasil akhir "npx tsc --noEmit && npm run build" di main, dan langkah manual
  tersisa (mis. generate VAPID keys, set env production).

Mulai sekarang. Kerjakan tanpa berhenti sampai Definition of Done (OVERVIEW §6)
tercapai atau seluruh plan yang bisa dikerjakan telah selesai/ditandai blokir.
```
