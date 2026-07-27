# Plan 04 — Service Worker & PWA Installable

- **Prioritas:** P1
- **Estimasi usaha:** Sedang
- **Slug branch:** `feat/service-worker-pwa`

---

## 1. Konteks & Tujuan

`public/manifest.json` sudah ada dan ditautkan dari `app/layout.tsx`, tetapi
**tidak ada Service Worker** (verifikasi: tidak ada `public/sw.js`, tidak ada
registrasi `navigator.serviceWorker`). Tanpa SW, PWA tidak benar-benar installable
ke home screen dan tidak punya offline shell — ini menjadikan aplikasi "PWA setengah
jadi".

Tujuan: tambahkan SW manual (tanpa dependency) yang:
- Meng-cache shell statis (ikon, CSS) untuk pemuulan offline.
- Memakai strategi network-first untuk HTML/App Router (konten selalu segar saat
  online), cache-first untuk aset statis.
- Menyediakan halaman fallback offline.

---

## 2. Prasyarat

Tidak ada. Wajib selesai sebelum plan 08 (Push Notification butuh SW).

---

## 3. Perubahan Schema

Tidak ada.

---

## 4. File Terlibat

**Modifikasi:**
- `public/manifest.json` — lengkapi `start_url`, `scope`, `display: "standalone"`,
  `background_color`, `theme_color`, `icons` (192 & 512).
- `components/Providers.tsx` — registrasi SW saat `window load` (hanya produksi).
- `app/layout.tsx` / `public/` — tambah ikon 192/512 (PNG).

**Buat baru:**
- `public/sw.js` — service worker.
- `app/offline/page.tsx` — fallback offline sederhana.

---

## 5. Langkah Implementasi

1. Hasilkan dua ikon PNG dari `public/icon.svg`:
   - `public/icons/icon-192.png`
   - `public/icons/icon-512.png`
   (Boleh render manual atau ekspor; pastikan rasio kotak, format PNG.)

2. Lengkapi `public/manifest.json`:
   ```json
   {
     "name": "Dekat Warung",
     "short_name": "DekatWarung",
     "description": "Quick commerce warung tetangga (radius ≤ 200m)",
     "start_url": "/",
     "scope": "/",
     "display": "standalone",
     "background_color": "#e8ebe6",
     "theme_color": "#0e0f0c",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```

3. Buat `public/sw.js`:
   - `install`: pre-cache shell inti (`/`, `/offline`, ikon).
   - `activate`: bersihkan cache lama.
   - `fetch`: untuk navigasi (mode `navigate`) → network-first, fallback cache, lalu
     `/offline` bila keduanya gagal. Untuk aset statis (`.js`, `.css`, gambar) →
     cache-first dengan fallback network (stale-while-revalidate boleh).
   - Versi cache via konstanta `CACHE = "dw-v1"`; naikkan versi setiap perubahan.

4. Daftarkan SW di `components/Providers.tsx`:
   ```ts
   useEffect(() => {
     if (process.env.NODE_ENV !== "production") return;
     if (!("serviceWorker" in navigator)) return;
     const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
     window.addEventListener("load", onLoad);
     return () => window.removeEventListener("load", onLoad);
   }, []);
   ```

5. Buat `app/offline/page.tsx` — pesan "Anda sedang offline" bergaya Wise (kartu
   `rounded-pill`, tombol "Coba Lagi" yang memanggil `location.reload()`).

---

## 6. Kriteria Penerimaan

- Lighthouse PWA audit lulus kategori "Installable".
- Aplikasi muncul dengan prompt "Add to Home Screen" di Chrome Android.
- Setelah install & reload, matikan jaringan → halaman yang sudah dikunjungi tetap
  dapat dibuka; navigasi ke route baru memunculkan halaman `/offline`.
- Build produksi mendaftarkan SW tanpa error di console.

---

## 7. Verifikasi

```
npm run build
npm run start   # uji build produksi (SW hanya aktif di produksi)
```
Buka DevTools → Application → Service Workers (status: activated) → Manifest
(tidak ada warning).

---

## 8. Edge Cases & Jebakan

- SW hanya bekerja di build produksi & atas HTTPS (atau `localhost`). Jangan debug
  SW lewat `npm run dev`.
- Hati-hati over-caching: Next menghasilkan chunk dengan hash; cache-first pada
  `_next/static/*` aman karena hash berubah tiap rilis. Naikkan `CACHE` versi tiap
  deploy agar chunk lama dibersihkan.
- Jangan cache POST/SSE route — hanya GET.
- Alternatif: `@serwist/next` (penerus `next-pwa`) bila ingin caching otomatis; tidak
  direkomendasikan untuk MVP karena menambah konfigurasi build.

---

## 9. Pesan Commit

```
feat(pwa): add service worker, offline fallback, install icons
```
