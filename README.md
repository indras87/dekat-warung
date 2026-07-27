# Dekat Warung

> Platform **hyper-local quick-commerce** untuk warung kelontong tradisional — radius mikro **≤ 200 meter**.
> Dua Progressive Web App (PWA) dalam satu codebase: **PWA Pembeli** (cari warung, pesan, lacak) & **PWA Warung / Terminal** (terima pesanan + alarm suara, kelola stok, laporan).

**Stack:** Next.js 15.5 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma 6 · PostgreSQL · iron-session · SWR · web-push · **Wise Design System**.

---

## Daftar Isi

- [Tentang Aplikasi](#tentang-aplikasi)
- [Stack Teknologi & Library](#stack-teknologi--library)
- [Arsitektur & Struktur Folder](#arsitektur--struktur-folder)
- [Fitur](#fitur)
- [Rute Halaman](#rute-halaman)
- [API & Server Actions](#api--server-actions)
- [Schema Database](#schema-database)
- [Setup & Cara Run](#setup--cara-run)
- [Cara Test / Verifikasi](#cara-test--verifikasi)
- [Design System](#design-system)
- [Referensi](#referensi)

---

## Tentang Aplikasi

**Masalah:** Ekosistem warung kelontong masih serba manual — stok tidak terlihat dari luar, tidak ada jalur pemesanan digital instan, transaksi dicatat manual.

**Solusi:** Mendigitalkan warung kelontong lewat platform web progresif berbasis **radius mikro (≤ 200 m)** berbasis koordinat GPS pengguna (perhitungan *Haversine*, lihat `lib/geo.ts`).

**Dua arah aplikasi:**

1. **PWA Pembeli** — deteksi lokasi otomatis, daftar warung terdekat dalam radius, etalase produk + *Custom Request Box* (barang di luar katalog), checkout (pilih pengiriman & pembayaran), dan **pelacakan pesanan realtime** (`PENDING → DIPROSES → SIAP → SELESAI / BATAL`) + tombol WhatsApp warung.
2. **PWA Warung (Merchant Terminal)** — terminal kasir dengan **modal alert full-screen + alarm suara** saat pesanan baru masuk, eksekusi satu-klik Terima/Tolak, *Quick Stock Switcher* (Ada/Habis), CRUD produk & kategori, pengaturan warung (nama, tarif antar, QRIS, WhatsApp), serta laporan/analitik pendapatan.

**Alur transaksi inti:**

```
Pembeli checkout → Order (PENDING) disimpan → Server SSE push "newPending"
→ Merchant Terminal modal alert + bell → Admin "Terima" (DIPROSES) → SSE push status
→ Pembeli tracking update realtime → SIAP → SELESAI
```

---

## Stack Teknologi & Library

### Teknologi inti

| Lapisan | Teknologi | Versi |
|---------|-----------|-------|
| Framework | Next.js (App Router) | 15.5 |
| UI Library | React | 19 |
| Bahasa | TypeScript (strict) | 5.7 |
| Styling | Tailwind CSS | 3.4 |
| ORM | Prisma | 6.2 |
| Database | PostgreSQL | 16 (Alpine) |
| Container | Docker + Compose | — |

### Library utama (lihat `package.json`)

| Library | Fungsi |
|---------|--------|
| `@prisma/client` | ORM, akses PostgreSQL |
| `iron-session` | Sesi terenkripsi (cookie), autentikasi + middleware guard |
| `swr` | Data fetching & revalidation di client components |
| `web-push` | Push notification (VAPID) ke service worker |
| `tailwindcss` / `postcss` / `autoprefixer` | Styling pipeline token Wise Design System |
| `sharp` | Optimasi gambar (upload produk/QRIS) |
| `prisma` (dev) | CLI migrasi `db push`, generate client |

> Tanpa dependency runtime berat (tanpa Redux, tanpa UI kit pihak ketiga) — komponen UI custom mengikuti token Wise Design System.

---

## Arsitektur & Struktur Folder

Pola **App Router Next.js 15** + **React Server Components** + **Server Actions**. Penamaan file *kebab-case* untuk route, *PascalCase* untuk komponen.

```
dekat-warung/
├── app/                       # App Router — route, page, layout, API
│   ├── (auth)/                # Route group (tidak mempengaruhi URL) untuk halaman auth
│   │   ├── login/page.tsx
│   │   └── daftar-warung/page.tsx
│   ├── warung/[id]/page.tsx   # Etalase produk (dynamic route)
│   ├── order/[id]/page.tsx    # Tracking pesanan pembeli (dynamic route)
│   ├── warung-admin/          # Area merchant (diproteksi middleware)
│   │   ├── page.tsx           # Terminal kasir + alert
│   │   ├── stok/ produk/ pengaturan/ laporan/
│   ├── api/                   # Route Handlers (REST/SSE/cron)
│   │   ├── events/order/[id]/route.ts   # SSE: status 1 order
│   │   ├── events/warung/[id]/route.ts  # SSE: feed pesanan merchant
│   │   ├── orders/[id]/route.ts         # Polling fallback
│   │   ├── warung/[id]/pending-order/   # Polling fallback
│   │   ├── upload/route.ts              # Upload gambar
│   │   ├── push/{subscribe,unsubscribe}/# Web Push subscription
│   │   └── cron/cleanup-stale/route.ts  # Auto-cancel order stale
│   ├── layout.tsx             # Root layout + <Providers>
│   ├── page.tsx               # Discovery pembeli (/)
│   └── globals.css            # Token + base Tailwind
│
├── components/                # React components (PascalCase)
│   ├── *Client.tsx            # Suffix "Client" = komponen "use client" (interaktif)
│   ├── MerchantAlertModal.tsx # Modal alert full-screen + Web Audio bell
│   ├── MerchantTerminalClient.tsx
│   ├── EtalaseClient.tsx / Checkout (di app) / StockClient.tsx ...
│   ├── Providers.tsx          # SWR + Cart context provider
│   └── BarChart.tsx           # Chart laporan (no chart lib — SVG manual)
│
├── lib/                       # Logika shareable (bukan UI)
│   ├── actions/               # Server Actions ("use server"), return DTO polos
│   │   ├── auth.ts  order.ts  product.ts  warung.ts  laporan.ts
│   ├── prisma.ts              # Singleton PrismaClient
│   ├── session.ts             # Wrapper iron-session
│   ├── sse.ts                 # Helper SSE (ReadableStream + heartbeat)
│   ├── geo.ts                 # haversineMeters() — radius 200m
│   ├── push.ts                # Helper web-push (kirim notif)
│   ├── upload.ts              # saveImageFile() — validasi & simpan
│   ├── ratelimit.ts           # Token-bucket rate limiter (per IP:path)
│   ├── security.ts            # Util keamanan (validasi input)
│   ├── cleanup-worker.ts      # Background auto-cancel (setInterval, guarded)
│   ├── cart.tsx               # Cart context + localStorage
│   ├── constants.ts           # Domain constants (radius, label, TTL, rate-limit)
│   └── format.ts              # formatRupiah, formatDistance, timeAgo
│
├── prisma/
│   ├── schema.prisma          # Definisi model + enum
│   ├── seed.mjs               # Seed data demo (2 warung, 9 produk, 1 order PENDING)
│   └── dev.db                 # DB SQLite dev (opsional, lihat Ganti Provider DB)
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   ├── icon.svg, icons/       # Ikon PWA
│   └── uploads/               # Gambar upload runtime
│
├── middleware.ts              # Guard route /warung-admin/* (role WARUNG)
├── instrumentation.ts         # register() — start background worker saat boot
├── Dockerfile                 # Multi-stage build (Alpine)
├── docker-compose.yml         # Postgres 16 + app container
├── docker-entrypoint.sh       # prisma db push → seed → next start
├── tailwind.config.ts         # Token warna Wise Design System
├── next.config.mjs
├── tsconfig.json
├── .env.example               # Template environment
├── prd.md                     # Logika bisnis (PRD)
├── design.md                  # Spesifikasi UI/token Wise Design System
└── CLAUDE.md                  # Aturan proyek & workflow otonom
```

### Konvensi penamaan & pola

- **Server Actions** (`lib/actions/*.ts`): diawali `"use server"`, **selalu kembalikan DTO polos (serializable)**. `Date` dikonversi ke ISO string lewat helper `toDTO`. Dipanggil client components via `import` langsung.
- **Client components**: file `*.tsx` diawali `"use client"`. Nama file bersuffix `Client` (mis. `MerchantTerminalClient.tsx`) menandakan komponen interaktif yang dibungkus dari Server Component page.
- **API routes** (`app/api/.../route.ts`): ekspor `GET`/`POST`/`PATCH`/`DELETE`. Endpoint SSE pakai runtime Node.js (`export const runtime = "nodejs"`).
- **Konstanta domain** di `lib/constants.ts` — tidak ada angka "ajaib" di komponen.
- **Model DB**: `@@map("namatable")` + `id @default(cuid())`.

---

## Fitur

### PWA Pembeli

- **Discovery geo** — daftar warung aktif dalam radius ≤ 200 m (Haversine, `lib/geo.ts`).
- **Etalase per warung** — produk + indikator Buka/Tutup + status stok.
- **Custom Request Box** — pesan barang di luar katalog.
- **Cart** — context + persistensi `localStorage`.
- **Checkout** — pilih pengiriman (*Pickup* / *Anterin +Rp 2.000*) & pembayaran (*Cash* / *QRIS* / *Transfer*).
- **Tracking realtime** — SSE status pesanan + tombol WhatsApp warung.
- **Riwayat pesanan** — halaman `/pesanan-saya`.
- **Pencarian & filter produk** — halaman `/cari`.
- **Login/PIN** — autentikasi pembeli (opsional).

### PWA Warung (Merchant Terminal)

- **Terminal kasir + modal alert** — notifikasi full-screen + **alarm suara (Web Audio API)** saat order `PENDING` baru.
- **Eksekusi pesanan** — Terima/Tolak satu-klik, alur status `PENDING → DIPROSES → SIAP → SELESAI / BATAL`.
- **Quick Stock Switcher** — toggle stok Ada/Habis instan (`/warung-admin/stok`).
- **CRUD produk & kategori** — lengkap dengan upload gambar (`/warung-admin/produk`).
- **Verifikasi pembayaran** — konfirmasi/tolak pembayaran QRIS/Transfer (manual).
- **Pengaturan warung** — nama, tarif antar, status buka/tutup, foto QRIS, nomor WhatsApp.
- **Laporan & analitik** — pendapatan harian, jumlah order per status, top produk, KPI (`/warung-admin/laporan`).

### Cross-cutting / sistem

- **Realtime** — Server-Sent Events (SSE) lewat `lib/sse.ts` (tick 4 dtk server-side + heartbeat), endpoint `/api/events/*`.
- **Autentikasi** — `iron-session`, guard middleware `/warung-admin/*` untuk role `WARUNG` saja.
- **Push notification** — `web-push` (VAPID) untuk alert pesanan baru ke merchant.
- **PWA** — manifest + service worker + halaman offline.
- **Auto-cancel order stale** — dua mekanisme: background worker (`instrumentation.ts` → `cleanup-worker.ts`, interval 60 dtk) **dan** cron endpoint (`/api/cron/cleanup-stale`). TTL `PENDING` = 5 menit.
- **Rate limiting** — token bucket per `ip:path` (`lib/ratelimit.ts`), kuota per endpoint di `lib/constants.ts`.
- **Upload gambar** — endpoint `/api/upload` + validasi (`lib/upload.ts`), disimpan di `public/uploads/`.

---

## Rute Halaman

| Rute | Peran | Fungsi |
|------|-------|--------|
| `/` | Pembeli | Discovery warung terdekat (radius ≤ 200 m) |
| `/cari` | Pembeli | Pencarian & filter produk lintas warung |
| `/warung/[id]` | Pembeli | Etalase produk + custom request + cart |
| `/checkout` | Pembeli | Pilih pengiriman & pembayaran, kirim pesanan |
| `/order/[id]` | Pembeli | Lacak status realtime (SSE) + WhatsApp |
| `/pesanan-saya` | Pembeli | Riwayat pesanan |
| `/login` | Umum | Login (email/PIN) |
| `/daftar-warung` | Umum | Onboarding / daftar warung baru |
| `/offline` | Pembeli | Halaman offline (PWA) |
| `/warung-admin` | Warung | Terminal kasir + **modal alert + alarm suara** |
| `/warung-admin/stok` | Warung | Quick-toggle stok (Ada/Habis) |
| `/warung-admin/produk` | Warung | CRUD produk & kategori + upload gambar |
| `/warung-admin/pengaturan` | Warung | Nama warung, tarif antar, QRIS, WhatsApp |
| `/warung-admin/laporan` | Warung | Analitik pendapatan, status order, top produk |

---

## API & Server Actions

Aplikasi memakai dua pola: **Server Actions** (dipanggil langsung dari client component) untuk mutasi/query bisnis, dan **Route Handlers** (`app/api`) untuk SSE, upload, push, dan cron.

### Server Actions — `lib/actions/*.ts`

| Modul | Action utama |
|-------|--------------|
| `auth.ts` | `signIn`, `signOut`, `getCurrentUser`, `getCurrentBuyerId`, `registerWarungAndUpgradeSession` |
| `warung.ts` | `getNearbyWarungs` (Haversine ≤ 200 m), `getWarungById`, `getCurrentMerchantWarung`, `setWarungOpen`, `updateWarungSettings`, `createWarungForUser` |
| `product.ts` | `getProductsByWarung`, `toggleProductStock`, `createProduct`, `updateProduct`, `deleteProduct`, `getCategoriesByWarung`, `createCategory`, `deleteCategory`, `searchProducts` |
| `order.ts` | `createOrder`, `getOrderById`, `getOrdersForWarung`, `getNewestPendingOrder`, `updateOrderStatus`, `getOrdersByBuyer`, `cancelStaleOrders`, `markPaidByBuyer`, `confirmPayment`, `rejectPayment` |
| `laporan.ts` | `getDailyRevenue`, `getOrderCountsByStatus`, `getTopProducts`, `getKPI` |

### Route Handlers — `app/api/*/route.ts`

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `/api/events/order/[id]` | **SSE** feed status 1 order (tracking pembeli), tick 4 dtk |
| `GET` | `/api/events/warung/[id]` | **SSE** feed pesanan merchant + flag `newPending`, tick 4 dtk |
| `GET` | `/api/orders/[id]` | Polling fallback — status 1 order |
| `GET` | `/api/warung/[id]/pending-order` | Polling fallback — order `PENDING` terbaru |
| `POST` | `/api/upload` | Upload gambar produk/QRIS → `saveImageFile()` |
| `POST` | `/api/push/subscribe` | Daftarkan PushSubscription (web-push VAPID) |
| `POST` | `/api/push/unsubscribe` | Hapus PushSubscription |
| `POST` | `/api/cron/cleanup-stale` | Auto-cancel order stale (autentikasi `Bearer $CRON_SECRET`) |

> **Realtime:** SSE adalah mekanisme utama (endpoint `/api/events/*`). Endpoint polling (`/api/orders`, `/api/warung/*/pending-order`) tersedia sebagai fallback. Semua endpoint publik dibungkus `withRateLimit()`.

---

## Schema Database

ORM **Prisma**, provider **PostgreSQL** (lihat `prisma/schema.prisma`). Model provider-agnostic — bisa jalan di SQLite lokal (lihat [Ganti Provider DB](#ganti-provider-db)).

### Enum

```
Role          : ADMIN | PEMBELI | WARUNG
OrderStatus   : PENDING | DIPROSES | SIAP | SELESAI | BATAL
ServiceType   : PICKUP | ANTERIN
PaymentMethod : CASH | QRIS | TRANSFER
PaymentStatus : BELUM_BAYAR | MENUNGGU | TERKONFIRMASI | DITOLAK | LUNAS_TUNAI
```

### Model

| Model | Tabel | Inti |
|-------|-------|------|
| **User** | `users` | `nama`, `email`, `noHp`, `role`, `pin` (6-digit opsional), relasi 1-1 `Warung`, 1-N `Order` |
| **Warung** | `warungs` | `ownerId` (FK→User), `namaWarung`, `latitude`/`longitude`, `isOpen`, `isDeliveryAvailable`, `deliveryFee` (default 2000), flag pembayaran (`acceptCash/Qris/Transfer`), `qrisImageUrl`, `whatsappNumber` |
| **Category** | `categories` | `warungId` (FK, cascade), `nama`, 1-N `Product` |
| **Product** | `products` | `warungId` (FK, cascade), `categoryId` (opsional), `nama`, `harga` (Int), `isAvailable`, `imageUrl`. Index `[warungId]` |
| **Order** | `orders` | `orderNumber` (unique), `warungId`, `buyerId` (opsional), `buyerName`, `status`, `serviceType`, `paymentMethod`, `paymentStatus`, `paidAt`, `customNote`, `subtotal`/`deliveryFee`/`totalAmount` (Int), `expiresAt` (deadline auto-cancel), 1-N `OrderItem`. Index `[warungId]`, `[status]` |
| **OrderItem** | `order_items` | `orderId` (FK, cascade), `productId` (opsional), `productName`, `price`, `quantity` |
| **PushSubscription** | `push_subscriptions` | `userId`, `endpoint` (unique), `p256dh`, `auth`. Index `[userId]` |

### Relasi inti

```
User 1—1 Warung 1—N Category 1—N Product
                    Warung 1—N Order 1—N OrderItem
User 1—N Order (sebagai buyer)
User 1—N PushSubscription
```

---

## Setup & Cara Run

### Opsi A — Docker (cara utama, paling cepat)

Prasyarat: [Docker](https://docs.docker.com/get-docker/) + Compose v2.

```bash
docker compose up --build
```

Compose otomatis:

1. Menjalankan **PostgreSQL 16** (volume `pgdata`).
2. Membangun image multi-stage (Node 20 Alpine).
3. Saat container app start (via `docker-entrypoint.sh`): `prisma db push` → `seed` → `next start`.

Buka:
- **Pembeli** → http://localhost:3001
- **Terminal Warung** → http://localhost:3001/warung-admin

> ⚠️ **Port host default = 3001** (container tetap dengar 3000 secara internal). Compose memakai `${DEKAT_HOST_PORT:-3001}:3000` agar tidak berbenturan dengan Postgres/Next.js lain di host. Override dengan `DEKAT_HOST_PORT=3000 docker compose up` bila ingin port 3000.

Stop: `docker compose down` (data tersimpan di volume).
Reset data: `docker compose down -v`.

**Seed demo** membuat 2 warung, 9 produk, dan **1 order `PENDING` (ORD-104)** sehingga modal alert full-screen langsung bisa diuji di `/warung-admin`. Login merchant demo: lihat akun di `prisma/seed.mjs` (mis. `ani@warung.test`).

### Opsi B — Lokal tanpa Docker

```bash
npm install
docker compose up -d db          # hanya Postgres, atau pakai Postgres Anda sendiri
cp .env.example .env             # sesuaikan DATABASE_URL bila perlu
npm run db:setup                 # prisma db push + seed
npm run dev                      # http://localhost:3000
```

### Opsi C — Build produksi lokal

```bash
npm run build        # prisma generate + next build
npm start            # http://localhost:3000
```

### Script npm

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | `prisma generate` + `next build` |
| `npm start` | Next.js production server |
| `npm run db:push` | Sinkron schema Prisma → DB |
| `npm run db:seed` | Seed data demo (`prisma/seed.mjs`) |
| `npm run db:setup` | `db:push` + `db:seed` sekaligus |

### Environment (`.env`)

Salin `.env.example`. Variabel wajib/penting:

| Variabel | Keterangan |
|----------|------------|
| `DATABASE_URL` | URL PostgreSQL (Docker menyediakan sendiri untuk app container) |
| `SESSION_SECRET` | Kunci sesi iron-session (min. 32 karakter) |
| `SESSION_COOKIE_NAME` | Nama cookie sesi (default `dw-session`) |
| `CRON_SECRET` | Bearer token untuk endpoint cron auto-cancel |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push VAPID (generate: `npx web-push generate-vapid-keys`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key untuk client |
| `DEKAT_HOST_PORT` | (opsional) Override port host Docker, default 3001 |

### Ganti Provider DB

Container produksi = PostgreSQL. Untuk eksperimen lokal **SQLite**: ubah `provider = "sqlite"` di `prisma/schema.prisma` dan pakai `DATABASE_URL="file:./dev.db"`, lalu `npm run db:setup`. Model identik (enum Prisma diemulasikan otomatis).

---

## Cara Test / Verifikasi

> **Status:** Saat ini belum ada *automated test suite* (tidak ada file `*.test.*`/`*.spec.*` maupun runner test terkonfigurasi). Verifikasi dilakukan via **type-check + build** dan **pengujian manual**. Lihat rencana penambahan testing di `plans/`.

### 1. Gerbang wajib sebelum commit (otomatis)

```bash
npx tsc --noEmit        # type-check TypeScript (strict)
npm run build           # prisma generate + next build — harus 100% sukses tanpa error
```

Kedua perintah harus **lolos tanpa error**. Jangan commit kondisi merah.

### 2. Pengujian manual alur inti

Setelah `docker compose up --build` (atau `npm run dev`):

- **Discovery:** buka `/` → izinkan lokasi → daftar warung muncul (radius ≤ 200 m dari koordinat default demo Bojongsoang).
- **Merchant alert:** buka `/warung-admin` (login akun warung demo) → order `PENDING` seed (ORD-104) memicu **modal alert full-screen + alarm suara**. (Klik halaman sekali bila browser blok autoplay.)
- **Checkout & tracking:** `/warung/[id]` → tambah produk → `/checkout` → kirim → `/order/[id]` lacak status berubah realtime (SSE) saat merchant Terima.
- **Stok toggle:** `/warung-admin/stok` → toggle produk → cek etalase pembeli ikut update.
- **Offline PWA:** putuskan jaringan → halaman `/offline` tampil.

### 3. Cek DB langsung

```bash
docker compose exec db psql -U dekat -d dekat_warung   # psql ke container Postgres
```

### 4. Test cron auto-cancel

```bash
curl -X POST http://localhost:3001/api/cron/cleanup-stale \
  -H "Authorization: Bearer $CRON_SECRET"
# → {"cancelled": <n>}
```

### Rencana testing otomatis

Library `@playwright/test` sudah tersedia transitif di lockfile. Untuk E2E (alur inti di atas), direkomendasikan menambahkan Playwright sebagai devDependency + script `test` di masa depan.

---

## Design System

**Wise Design System** — estetika *fintech magazine* bersih, segar, *friendly*. Detail lengkap di `design.md`.

- **Canvas:** Sage Soft `#e8ebe6` (latar) vs White `#ffffff` (card) — elevasi via kontras permukaan, bukan shadow.
- **Aksi utama:** Wise Lime `#9fe870` (CTA eksklusif).
- **Tipografi:** Weight 900 (Black) untuk heading & nilai transaksi.
- **Geometri:** `rounded-3xl` (24px) untuk card & CTA; tidak ada sudut tajam.
- Token Tailwind terdaftar di `tailwind.config.ts` (`ink`, `lime`, `canvas-soft`, `positive`, `negative`, dll.).

---

## Referensi

| File | Isi |
|------|-----|
| `prd.md` | Logika bisnis & requirements |
| `design.md` | Sistem desain Wise (token warna, tipografi, geometri, UI spec per halaman) |
| `prisma/schema.prisma` | Lapisan basis data (model + enum) |
| `CLAUDE.md` | Aturan proyek & workflow otonom |
| `plans/00-OVERVIEW.md` | Roadmap 13-fitur & konvensi tunggal |
| `plans/0X-*.md` | Rencana implementasi per fitur |

---

## Lisensi

Private — proyek internal Dekat Warung.
