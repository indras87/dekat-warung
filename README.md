# Dekat Warung

Hyper-local quick-commerce PWA untuk warung kelontong (radius ≤ 200m).
Dua arah: **PWA Pembeli** (cari warung, pesan, lacak) & **PWA Warung / Terminal** (terima pesanan + alarm suara, kelola stok, pengaturan).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · Wise Design System.

---

## 🚀 Jalankan dengan Docker (cara utama)

Prasyarat: [Docker](https://docs.docker.com/get-docker/) (+ Compose v2).

```bash
docker compose up --build
```

Itu saja. Compose akan:

1. Menjalankan **PostgreSQL 16** (volume `pgdata`).
2. Membangun image aplikasi (multi-stage).
3. Saat container app start: `prisma db push` (buat/sync schema) → seed data demo → `next start`.

Buka:
- Pembeli → http://localhost:3000
- Terminal Warung → http://localhost:3000/warung-admin

Stop: `docker compose down` (data tersimpan di volume).
Reset data: `docker compose down -v`.

Seed demo membuat 2 warung, 9 produk, dan **1 order PENDING (ORD-104)** sehingga modal alert full-screen langsung bisa diuji di `/warung-admin`.

---

## 🧑‍💻 Jalankan lokal tanpa Docker

```bash
npm install
docker compose up -d db          # hanya Postgres, atau pakai Postgres Anda sendiri
cp .env.example .env             # sesuaikan DATABASE_URL bila perlu
npm run db:setup                 # prisma db push + seed
npm run dev                      # http://localhost:3000
```

Build produksi:

```bash
npm run build        # prisma generate + next build
npm start
```

---

## 🗺️ Rute

| Rute | Peran | Fungsi |
| --- | --- | --- |
| `/` | Pembeli | Discovery warung terdekat (Haversine ≤ 200m) |
| `/warung/[id]` | Pembeli | etalase produk + custom request + keranjang |
| `/checkout` | Pembeli | pilih pengiriman & pembayaran, kirim pesanan |
| `/order/[id]` | Pembeli | lacak status realtime (polling) + WhatsApp |
| `/warung-admin` | Warung | terminal kasir + **modal alert + alarm suara** |
| `/warung-admin/stok` | Warung | quick-toggle stok (Ada/Habis) |
| `/warung-admin/pengaturan` | Warung | nama warung, tarif antar, QRIS, WhatsApp |

---

## 🧱 Arsitektur singkat

- **Data:** Prisma → PostgreSQL. Skema: `User`, `Warung`, `Category`, `Product`, `Order`, `OrderItem` + enum `OrderStatus` (`PENDING → DIPROSES → SIAP → SELESAI / BATAL`).
- **Server Actions** (`lib/actions/`): nearby warung (Haversine), CRUD produk + toggle stok, buat order + update status, pengaturan warung.
- **Realtime:** polling (4s) lewat API routes `/api/warung/[id]/pending-order` (alert merchant) dan `/api/orders/[id]` (tracking pembeli). Untuk MVP dipilih polling; WebSocket dapat ditambah kemudian.
- **Alarm suara:** Web Audio API (bell loop) pada modal alert; autostart dibuka saat interaksi pertama (kebijakan autoplay browser).
- **Cart:** context + localStorage.

---

## 🔄 Ganti provider DB

Container produksi = PostgreSQL. Untuk eksperimen lokal SQLite: ubah `provider = "sqlite"` di `prisma/schema.prisma` dan pakai `DATABASE_URL="file:./dev.db"`. Model identik.

---

## 📄 Referensi

- `prd.md` — logika bisnis
- `design.md` — sistem desain Wise (token warna, tipografi, geometri)
- `prisma/schema.prisma` — lapisan basis data
