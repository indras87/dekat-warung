# MASTER DESIGN SYSTEM & UI SPECIFICATION: DEKAT WARUNG
*Wise-Inspired Aesthetic Edition (Sage Canvas, Lime Green Accent, Heavy Display Typography)*

---

## 1. Design Overview & Core Principles

**Dekat Warung** menggunakan bahasa desain modern berbasis **Wise Design System**. Menggabungkan kesan estetika *fintech magazine* yang bersih, segar, dan *friendly* dengan fungsi *hyper-local quick-commerce* (radius ≤ 200m)[cite: 1].

### Core Aesthetics & UX Principles
1. **Sage Canvas & White Surface Contrast:** Seluruh halaman menggunakan latar belakang *Sage Soft* (`#e8ebe6`)[cite: 1]. Kontras fisik dibentuk oleh *Card* berwarna putih murni (`#ffffff`) yang menumpang di atasnya tanpa membutuhkan bayangan (*elevation Level 0/2*)[cite: 1].
2. **Lime Green Universal Action:** Warna *Wise Lime Green* (`#9fe870`) dipakai secara konsisten sebagai tombol tindakan utama (CTA)[cite: 1].
3. **Heavy Display Typography:** Judul utama dan nilai transaksi menggunakan *Font Weight 900 / Extra Black* untuk menciptakan hierarki visual yang sangat tegas dan mudah dibaca cepat[cite: 1].
4. **Canonical 24px Pill Geometry:** Seluruh tombol utama dan *card* menggunakan sudut membulat 24px (`rounded-3xl` / `24px`)[cite: 1]. Tidak ada sudut tajam di elemen antarmuka[cite: 1].

---

## 2. Design Tokens (Tailwind CSS Mapping)

### 2.1. Color Palette

| Token Name | Hex Code | Tailwind Class / Value | Usage / Intent |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Lime)** | `#9fe870` | `bg-[#9fe870]` | Universal Primary CTA, Active badges, Brand accent[cite: 1] |
| **Primary Hover/Active** | `#cdffad` | `bg-[#cdffad]` | Hover/Pressed state for primary buttons[cite: 1] |
| **Primary Pale** | `#e2f6d5` | `bg-[#e2f6d5]` | Soft green badge & highlight background[cite: 1] |
| **Ink (Near-Black)** | `#0e0f0c` | `text-[#0e0f0c]`, `bg-[#0e0f0c]` | Main headlines, body text, dark cards[cite: 1] |
| **Ink Deep (Forest)** | `#163300` | `text-[#163300]` | Dark green text on positive surfaces[cite: 1] |
| **Canvas Soft (Sage)** | `#e8ebe6` | `bg-[#e8ebe6]` | Page-level canvas background[cite: 1] |
| **Canvas Pure (White)** | `#ffffff` | `bg-white` | Card container background[cite: 1] |
| **Body Text** | `#454745` | `text-[#454745]` | Secondary text & descriptions[cite: 1] |
| **Mute Text** | `#868685` | `text-[#868685]` | Captions, placeholders, timestamps[cite: 1] |
| **Positive State** | `#2ead4b` | `bg-[#2ead4b]` | Transaction completed status[cite: 1] |
| **Positive Deep** | `#054d28` | `text-[#054d28]` | Positive text color[cite: 1] |
| **Warning State** | `#ffd11a` | `bg-[#ffd11a]` | Pending order alert badge[cite: 1] |
| **Negative State** | `#d03238` | `bg-[#d03238]` | Reject button, out of stock indicator[cite: 1] |

### 2.2. Typography Scale

* **Font Family Primary:** `Inter`, `Wise Sans`, `system-ui`, `sans-serif`[cite: 1]
* **Display Mega / Price:** `text-4xl` s/d `text-5xl` (36px - 48px) | `font-black` (`font-weight: 900`)[cite: 1]
* **Display Hero / Title:** `text-2xl` s/d `text-3xl` (24px - 30px) | `font-black` (`font-weight: 900`)[cite: 1]
* **Section Title:** `text-xl` (20px) | `font-bold` (`font-weight: 700 / 800`)[cite: 1]
* **Body Bold / Label:** `text-base` (16px) | `font-semibold` (`font-weight: 600`)[cite: 1]
* **Body Normal:** `text-base` (16px) | `font-normal` (`font-weight: 400`)[cite: 1]
* **Caption / Badge:** `text-xs` s/d `text-sm` (12px - 14px) | `font-bold` (`font-weight: 600 / 700`)[cite: 1]

### 2.3. Geometry & Spacing

* **Canonical Radius (Cards & CTAs):** `rounded-[24px]` (`rounded-3xl`)[cite: 1]
* **Input Radius:** `rounded-[12px]` (`rounded-xl`)[cite: 1]
* **Badge Radius:** `rounded-full` (`rounded-pill`)[cite: 1]
* **Page Padding:** `p-4` s/d `p-6` (`16px` - `24px`)[cite: 1]
* **Primary Touch Target:** `h-14` (56px)[cite: 1]

---

## 3. UI Specifications: PWA Pembeli (Customer App)

---

### Halaman 1.1: Discovery & Warung Terdekat (`/`)
Halaman utama pembeli berbasis canvas sage (`#e8ebe6`) dengan card putih membulat (`rounded-[24px]`)[cite: 1].

* **Canvas Container:** `bg-[#e8ebe6] min-h-screen p-4 space-y-4`[cite: 1]
* **Header Bar (Sticky Top):**
  * `flex justify-between items-center bg-[#ffffff] p-4 rounded-[24px] shadow-sm`[cite: 1]
  * **Brand Title:** "Dekat Warung" (`text-2xl font-black text-[#0e0f0c]`)[cite: 1]
  * **GPS Radius Pill:** `bg-[#e2f6d5] text-[#163300] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1` ("📍 Radius ≤ 200m")[cite: 1]
* **Hero Search & Location Banner:**
  * `bg-[#0e0f0c] text-[#9fe870] p-6 rounded-[24px] space-y-2`[cite: 1]
  * Title: "Belanja Warung Tetangga, Sampai Hitungan Menit." (`text-2xl font-black leading-tight`)[cite: 1]
  * Subtitle: "Posisi kamu: Bojongsoang (~120m dari warung terdekat)" (`text-sm font-medium text-[#e8ebe6]`)[cite: 1]
* **List Warung Card (Looping):**
  * Container: `bg-[#ffffff] rounded-[24px] p-5 space-y-3 cursor-pointer hover:scale-[1.01] transition-transform`[cite: 1]
  * Header Row:
    * Nama Warung (`text-xl font-black text-[#0e0f0c]`)[cite: 1]
    * Badge Jarak: `bg-[#9fe870] text-[#0e0f0c] text-xs font-black px-3 py-1 rounded-full` ("⚡ 80 Meter")[cite: 1]
  * Details: Jenis Produk & Jam Buka (`text-sm text-[#454745] font-medium`)[cite: 1]
  * Status Badge:
    * *Buka:* `bg-[#e2f6d5] text-[#054d28] text-xs font-bold px-3 py-1 rounded-full inline-block` ("🟢 BUKA")[cite: 1]
    * *Tutup:* `bg-[#320707] text-[#ffffff] text-xs font-bold px-3 py-1 rounded-full inline-block` ("🔴 TUTUP")[cite: 1]

---

### Halaman 1.2: Etalase Warung & Pilih Produk (`/warung/[id]`)

* **Canvas Container:** `bg-[#e8ebe6] min-h-screen p-4 pb-28 space-y-4`[cite: 1]
* **Warung Info Card:**
  * `bg-[#ffffff] rounded-[24px] p-5 space-y-2`[cite: 1]
  * Title: Nama Warung (`text-2xl font-black text-[#0e0f0c]`)[cite: 1]
  * Accepted Payment Tags: `flex gap-2 pt-1`
    * `bg-[#e8ebe6] text-[#0e0f0c] text-xs font-bold px-2.5 py-1 rounded-lg` ("💵 CASH")[cite: 1]
    * `bg-[#e8ebe6] text-[#0e0f0c] text-xs font-bold px-2.5 py-1 rounded-lg` ("📱 QRIS")[cite: 1]
* **Custom Request Box:**
  * `bg-[#e2f6d5] border-2 border-dashed border-[#9fe870] rounded-[24px] p-4 space-y-2`[cite: 1]
  * Label: "Minta Barang Khusus / Custom?" (`text-sm font-bold text-[#163300]`)[cite: 1]
  * Input: `w-full bg-[#ffffff] border border-[#0e0f0c] rounded-[12px] p-3 text-sm text-[#0e0f0c]`[cite: 1]
* **Catalog Product List:**
  * Item Card Row: `flex justify-between items-center bg-[#ffffff] p-4 rounded-[24px] shadow-sm mb-3`[cite: 1]
  * Left: Nama Barang (`text-base font-bold text-[#0e0f0c]`), Harga (`text-lg font-black text-[#0e0f0c]`)[cite: 1]
  * Right (Counter Stepper): `flex items-center gap-3 bg-[#e8ebe6] p-1.5 rounded-[16px]`[cite: 1]
    * Minus/Plus Buttons: `w-8 h-8 bg-[#ffffff] text-[#0e0f0c] font-black rounded-full flex items-center justify-center`[cite: 1]
    * Quantity: `text-sm font-black text-[#0e0f0c]`
* **Floating Bottom Cart Bar (Sticky):**
  * `fixed bottom-4 left-4 right-4 bg-[#0e0f0c] text-[#ffffff] rounded-[24px] p-4 shadow-2xl flex justify-between items-center z-30`[cite: 1]
  * Left: `2 Barang` • `Rp 22.000` (`text-xl font-black text-[#9fe870]`)[cite: 1]
  * CTA Button: `bg-[#9fe870] text-[#0e0f0c] font-black h-12 px-6 rounded-full hover:bg-[#cdffad] transition-colors` ("Checkout →")[cite: 1]

---

### Halaman 1.3: Checkout & Konfirmasi (`/checkout`)

* **Canvas Container:** `bg-[#e8ebe6] min-h-screen p-4 space-y-4`[cite: 1]
* **Order Summary Card:**
  * `bg-[#ffffff] rounded-[24px] p-5 space-y-3`[cite: 1]
  * Title: "Ringkasan Pesanan" (`text-xl font-black text-[#0e0f0c]`)[cite: 1]
  * Rincian Item: Teks bersih dengan pembatas `border-b border-[#e8ebe6] pb-2`[cite: 1]
* **Delivery Option Switcher:**
  * 2 Grid Switcher: `grid grid-cols-2 gap-3`
  * Active Option: `bg-[#0e0f0c] text-[#9fe870] p-4 rounded-[24px] font-bold text-center cursor-pointer` ("🚶 Ambil Sendiri")[cite: 1]
  * Inactive Option: `bg-[#ffffff] text-[#0e0f0c] p-4 rounded-[24px] font-bold text-center border border-[#0e0f0c] cursor-pointer` ("🛵 Anterin (+2k)")[cite: 1]
* **Payment Selector:**
  * Container: `bg-[#ffffff] rounded-[24px] p-5 space-y-3`[cite: 1]
  * Option Pills: `bg-[#e8ebe6] p-3 rounded-[12px] flex justify-between items-center font-bold text-[#0e0f0c]`[cite: 1]
* **Submit CTA Button:**
  * `w-full h-16 bg-[#9fe870] text-[#0e0f0c] font-black text-xl rounded-[24px] shadow-lg hover:bg-[#cdffad] active:scale-95 transition-all` ("KIRIM PESANAN SEKARANG")[cite: 1]

---

### Halaman 1.4: Realtime Order Tracking (`/order/[id]`)

* **State Banner (Hero Polarity):**
  * State `PENDING`: `bg-[#ffd11a] text-[#0e0f0c] p-6 rounded-[24px] text-center space-y-2 animate-pulse`[cite: 1]
    * Title: "Menunggu Konfirmasi Warung..." (`text-2xl font-black`)[cite: 1]
  * State `DIPROSES`: `bg-[#0e0f0c] text-[#9fe870] p-6 rounded-[24px] text-center space-y-2`[cite: 1]
    * Title: "Pesanan Sedang Disiapkan! 📦" (`text-2xl font-black`)[cite: 1]
  * State `SELESAI`: `bg-[#e2f6d5] text-[#054d28] p-6 rounded-[24px] text-center space-y-2`[cite: 1]
    * Title: "Pesanan Selesai! 🎉" (`text-2xl font-black`)[cite: 1]
* **Details Card:**
  * `bg-[#ffffff] rounded-[24px] p-5 space-y-3`[cite: 1]
  * WhatsApp Button: `w-full h-12 bg-[#0e0f0c] text-[#ffffff] font-bold rounded-[16px] flex items-center justify-center gap-2` ("💬 Hubungi Warung")[cite: 1]

---

## 4. UI Specifications: PWA Warung (Merchant Terminal)

---

### Halaman 2.1: Terminal Kasir Utama (`/warung-admin`)
Layar kasir dengan kontras maksimal dan tombol aksi masif[cite: 1].

* **Sticky Top Navigation:**
  * `bg-[#0e0f0c] text-[#ffffff] px-5 py-4 rounded-b-[24px] flex justify-between items-center`[cite: 1]
  * Title: "Warung Terminal" (`text-xl font-black text-[#9fe870]`)[cite: 1]
  * Store Toggle Button:
    * *State Buka:* `bg-[#9fe870] text-[#0e0f0c] text-xs font-black px-4 py-2 rounded-full` ("🟢 BUKA")[cite: 1]
    * *State Tutup:* `bg-[#d03238] text-[#ffffff] text-xs font-black px-4 py-2 rounded-full` ("🔴 TUTUP")[cite: 1]
* **Order Feed Cards (Looping List):**
  * Container Card: `bg-[#ffffff] border-2 border-[#0e0f0c] rounded-[24px] p-5 space-y-4 shadow-sm`[cite: 1]
  * Header Row:
    * `#ORD-104` • `1m lalu` (`text-lg font-black text-[#0e0f0c]`)[cite: 1]
    * Service Tag: `bg-[#e2f6d5] text-[#163300] text-xs font-black px-3 py-1 rounded-full` ("🚶 PICKUP")[cite: 1]
  * Items Block: `bg-[#e8ebe6] p-4 rounded-[16px] text-base font-semibold text-[#0e0f0c] space-y-1`[cite: 1]
  * Total Price & Payment: `flex justify-between items-center`
    * Total: `Rp 22.000` (`text-2xl font-black text-[#0e0f0c]`)[cite: 1]
    * Tag: `bg-[#ffd11a] text-[#0e0f0c] text-xs font-extrabold px-2.5 py-1 rounded-md` ("CASH")[cite: 1]
  * Actions Grid: `grid grid-cols-2 gap-3 pt-2`
    * Secondary Action: `h-14 bg-[#e8ebe6] text-[#d03238] font-bold rounded-[16px]` ("Tolak")[cite: 1]
    * Primary Action: `h-14 bg-[#9fe870] text-[#0e0f0c] font-black text-lg rounded-[16px] hover:bg-[#cdffad]` ("Terima Pesanan")[cite: 1]

---

### Halaman 2.2: Modal Alert Pesanan Masuk (Full-Screen Overlay)

* **Overlay Backdrop:** `fixed inset-0 bg-[#0e0f0c]/90 backdrop-blur-md z-50 flex items-center justify-center p-4`[cite: 1]
* **Modal Card Container:** `bg-[#ffffff] rounded-[24px] w-full max-w-md p-6 space-y-6 shadow-2xl border-4 border-[#9fe870]`[cite: 1]
* **Title Header:**
  * 🔔 **ADA PESANAN BARU!** (`text-3xl font-black text-center text-[#0e0f0c]`)[cite: 1]
  * Sound status: `text-xs font-bold text-[#868685] text-center` ("Alarm bel berbunyi...")[cite: 1]
* **Primary Big Action Button:**
  * `w-full h-16 bg-[#9fe870] text-[#0e0f0c] text-2xl font-black rounded-[24px] shadow-xl hover:bg-[#cdffad] active:scale-95 transition-all` ("TERIMA PESANAN")[cite: 1]

---

### Halaman 2.3: Kelola Stok Quick-Toggle (`/warung-admin/stok`)

* **Canvas Container:** `bg-[#e8ebe6] min-h-screen p-4 space-y-3`[cite: 1]
* **Stock Row Card:**
  * `flex justify-between items-center bg-[#ffffff] p-4 rounded-[24px]`[cite: 1]
  * Left: Nama Barang (`text-base font-bold text-[#0e0f0c]`), Harga (`text-sm text-[#454745]`)[cite: 1]
  * Right (Stock Toggle Pill):
    * *State Ada:* `bg-[#e2f6d5] text-[#054d28] border-2 border-[#2ead4b] px-4 py-2 rounded-full font-black text-xs` ("🟢 ADA")[cite: 1]
    * *State Habis:* `bg-[#320707] text-[#ffffff] px-4 py-2 rounded-full font-black text-xs` ("🔴 HABIS")[cite: 1]

---

### Halaman 2.4: Pengaturan Warung (`/warung-admin/pengaturan`)

* **Form Container:** `bg-[#ffffff] rounded-[24px] p-5 space-y-4`[cite: 1]
* **Input Fields:** `w-full bg-[#e8ebe6] border border-[#0e0f0c] rounded-[12px] p-3 text-base text-[#0e0f0c] font-medium`[cite: 1]
* **Save CTA Button:** `w-full h-14 bg-[#9fe870] text-[#0e0f0c] font-black text-lg rounded-[24px]` ("Simpan Perubahan")[cite: 1]

---

## 5. Shared Navigation & Components

### Component 5.1: Merchant Bottom Bar
* `fixed bottom-0 left-0 right-0 bg-[#0e0f0c] text-[#ffffff] h-16 grid grid-cols-3 z-30 rounded-t-[24px]`[cite: 1]
* Active Link: `text-[#9fe870] font-black flex flex-col items-center justify-center text-xs`[cite: 1]
* Inactive Link: `text-[#868685] font-semibold flex flex-col items-center justify-center text-xs`[cite: 1]

---

## 6. Do's and Don'ts (Wise Guidelines)

### Do
* Gunakan warna **Wise Lime Green (`#9fe870`)** eksklusif untuk tombol/elemen aksi utama (CTA)[cite: 1].
* Gunakan sudut **24px (`rounded-[24px]`)** untuk seluruh *Card* dan *Primary Button*[cite: 1].
* Terapkan **Weight 900 (Black)** pada angka harga, ID order, dan judul besar[cite: 1].
* Manfaatkan kontras warna permukaan: *Sage Canvas* (`#e8ebe6`) sebagai latar halaman, dan *White Card* (`#ffffff`) sebagai wadah konten[cite: 1].

### Don't
* Dilarang menggunakan sudut siku-siku (0px) pada tombol atau card[cite: 1].
* Dilarang menambahkan warna aksen kedua selain Lime Green agar identitas brand tetap fokus[cite: 1].
* Dilarang menggunakan *box-shadow* berat/gelap; gunakan kontras warna permukaan (*Sage vs White*) untuk menciptakan efek elevasi[cite: 1].