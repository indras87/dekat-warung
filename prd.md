# PRD — Project Requirements Document

## 1. Overview
Aplikasi **Dekat Warung** bertujuan mendigitalkan ekosistem warung kelontong tradisional melalui platform *hyper-local quick-commerce* berbasis radius mikro (≤ 200 meter). Masalah utama yang ingin diselesaikan adalah ketersediaan informasi stok warung sekitar secara *real-time*, ketiadaan jalur pemesanan digital yang instan tanpa biaya aplikasi tinggi, serta pengelolaan transaksi warung yang masih serba manual.

Tujuan utama aplikasi ini adalah menyediakan aplikasi web progresif (PWA) dua arah: **PWA Pembeli** untuk mencari warung terdekat, memesan barang (termasuk permintaan kustom), dan melacak status pesanan; serta **PWA Warung (Merchant Terminal)** bagi pemilik warung untuk menerima pesanan secara *real-time* dengan alert suara, mengelola ketersediaan stok secara instan, dan mengatur profil operasional warung.

## 2. Requirements
Berikut adalah persyaratan tingkat tinggi untuk pengembangan sistem:
- **Aksesibilitas:** Sistem berupa Progressive Web App (PWA) berpendekatan *Mobile-First*, di mana Pembeli dan Warung Admin menggunakan antarmuka web berbasis HP/Tablet.
- **Pengguna & Peran:**
  - **Pembeli:** Dapat menjelajahi warung di sekitar tanpa hambatan, membuat pesanan kustom, memilih metode pengiriman/pembayaran, dan melacak pesanan.
  - **Warung Admin:** Memiliki hak penuh mengelola toko, menerima/menolak pesanan, mengaktifkan status buka/tutup, serta mengubah status stok produk secara instan.
- **Geolokasi & Jarak:** Filter otomatis menampilkan warung aktif dalam radius ≤ 200m berbasis koordinat GPS pengguna (menggunakan perhitungan Haversine/PostGIS).
- **Notifikasi & Alert Realtime:** Terminal Warung wajib memiliki modal visual *full-screen* dengan alarm suara saat pesanan baru masuk. Pembeli mendapat pembaruan status pesanan secara *real-time*.
- **Fleksibilitas Pesanan:** Memasilitasi opsi pengiriman (*Ambil Sendiri* atau *Anterin ke Rumah*) serta kotak *Custom Request* untuk barang yang tidak ada di etalase digital.

## 3. Core Features
Fitur-fitur kunci yang wajib ada dalam versi pertama (MVP):

1. **PWA Pembeli — Discovery & Etalase Warung**
   - Deteksi lokasi otomatis dan daftar warung terdekat (Radius ≤ 200m).
   - Etalase produk per warung dilengkapi indikator status operasional (Buka/Tutup).
   - **Custom Request Box:** Form input catatan pesanan khusus untuk barang luar katalog.
2. **PWA Pembeli — Checkout & Realtime Tracking**
   - Opsi Pengiriman: *Ambil Sendiri (Pickup)* atau *Anterin (+Rp 2.000)*.
   - Opsi Pembayaran: *Cash*, *QRIS*, atau *Transfer*.
   - **Layar Pelacakan Pesanan:** Status visual *real-time* (`PENDING`, `DIPROSES`, `SIAP`, `SELESAI`, `BATAL`) dilengkapi tombol integrasi ke WhatsApp warung.
3. **PWA Warung — Terminal Kasir & Alert Modal**
   - **Modal Pop-Up Full-Screen + Sound Alert:** Notifikasi otomatis ketika pesanan baru masuk (`PENDING`).
   - Tombol eksekusi satu-klik: *Terima Pesanan* atau *Tolak*[cite: 1].
   - Sakelar cepat status toko (*Buka / Tutup*)[cite: 1].
4. **PWA Warung — Quick-Toggle Stok & Pengaturan**
   - **Quick Stock Switcher:** Ubah status stok barang secara instan (*Ada / Habis*)[cite: 1].
   - Pengaturan warung: Nama warung, tarif antar, serta tautan foto QRIS stasioner[cite: 1].

## 4. User Flow
Alur kerja sistem bagi Pembeli dan Warung Admin:

### Alur Pembeli
1. **Discovery:** Pembeli membuka PWA, sistem meminta izin lokasi dan menampilkan warung aktif di radius ≤ 200m[cite: 1].
2. **Pilih Barang:** Pembeli memilih warung, menentukan jumlah produk, atau mengisi form *Custom Request*[cite: 1].
3. **Checkout:** Pembeli memilih metode pengiriman (Pickup/Delivery) dan cara bayar, lalu mengirim pesanan[cite: 1].
4. **Tracking:** Pembeli memantau perubahan status pesanan di layar pelacakan secara *real-time*[cite: 1].

### Alur Warung Admin
1. **Standby Terminal:** Admin membuka Terminal Warung dan memastikan status toko "BUKA"[cite: 1].
2. **Notifikasi Pesanan:** Saat pesanan baru masuk, layar berpindah ke modal alert penuh disertai bunyi bel/alarm[cite: 1].
3. **Eksekusi:** Admin menekan "Terima Pesanan", menyiapkan produk, lalu memperbarui status pesanan menjadi "SIAP" atau "SELESAI"[cite: 1].
4. **Kelola Stok:** Jika ada barang habis, Admin membuka tab stok dan menekan tombol *toggle* menjadi "HABIS"[cite: 1].

## 5. Architecture
Berikut adalah gambaran arsitektur aliran data transaksi *real-time* antara Pembeli, Server, Database, dan Terminal Warung:

```mermaid
sequenceDiagram
    participant B as Pembeli (PWA)
    participant S as Backend Server & Realtime Engine
    participant DB as Database (PostgreSQL)
    participant M as Warung Admin (Terminal PWA)

    Note over B, M: Alur Transaksi & Realtime Alert

    B->>S: Kirim Pesanan Baru (Checkout)
    S->>DB: Simpan Order (Status: PENDING)
    DB-->>S: Order Saved & ID Generated
    S-->>B: Redirect ke Layar Tracking (/order/[id])
    S->>M: Push Event "NEW_ORDER" (WebSocket / Realtime)
    
    Note over M: Modal Alert Full-Screen + Sound Alarm Aktif
    
    M->>S: Aksi "Terima Pesanan"
    S->>DB: Update Status Order -> DIPROSES
    DB-->>S: Status Updated
    S-->>B: Push Event Status Update -> DIPROSES (UI Refresh)
    S-->>M: Konfirmasi Pesanan Diproses