// Service Worker untuk Dekat Warung PWA
// Cache version - naikkan versi setiap deploy untuk invalidate cache lama
const CACHE = "dw-v1";

// Shell inti yang di-cache saat install: navigasi dan fallback
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icon.svg",
];

// Route yang tidak boleh di-cache (POST, SSE, API dinamis)
const NO_CACHE_PATTERNS = [
  /\/api\/.*/,           // API routes
  /\/events\/.*/,         // SSE endpoint
  /\.js\?$/,              // Dynamic JS with query (Next.js data)
];

// Install: pre-cache shell statis
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE_URLS);
      // Skip waiting agar SW baru segera aktif
      await self.skipWaiting();
    })()
  );
});

// Activate: bersihkan cache versi lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Hapus cache dengan nama berbeda
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE)
          .map((name) => caches.delete(name))
      );
      // Claim clients agar SW segera mengontrol semua tab
      await self.clients.claim();
    })()
  );
});

// Fetch: strategi berbeda per tipe request
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Abaikan request non-GET (POST, PUT, DELETE, dll)
  if (request.method !== "GET") return;

  // Cek apakah route ini boleh di-cache
  const isNoCacheRoute = NO_CACHE_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  );
  if (isNoCacheRoute) return; // fallback ke network default

  // Navigasi HTML: network-first untuk konten segar
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Aset statis dengan hash (_next/static/*): cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Gambar & font: cache-first dengan network fallback
  if (/\.(png|jpg|jpeg|svg|webp|woff|woff2|ttf|otf)$/.test(url.pathname)) {
    event.respondWith(handleImageOrFont(request));
    return;
  }

  // Default: network-first untuk halaman dinamis
  event.respondWith(handleDefault(request));
});

// Network-first untuk navigasi (HTML)
async function handleNavigation(request) {
  const cache = await caches.open(CACHE);

  try {
    // Coba network dulu untuk konten segar
    const response = await fetch(request);
    // Cache respons sukses untuk offline nanti
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network gagal: coba cache
    const cached = await cache.match(request);
    if (cached) return cached;
    // Cache juga kosong: fallback ke halaman offline
    return caches.match("/offline");
  }
}

// Cache-first untuk aset statis (aman karena ada hash di filename)
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset tidak tersedia offline", { status: 503 });
  }
}

// Cache-first dengan network fallback untuk gambar/font
async function handleImageOrFont(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Gambar tidak tersedia offline", { status: 503 });
  }
}

// Default: network-first
async function handleDefault(request) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline - konten tidak tersedia", { status: 503 });
  }
}

// --- Push Notification Handlers ---

/** Event push: terima payload dan tampilkan notifikasi */
self.addEventListener("push", (event) => {
  const data = event.data?.json();
  if (!data) return;

  const options = {
    body: data.body || "",
    icon: "/icon.svg",
    badge: "/icons/icon-192.png",
    vibrate: [200, 100, 200],
    data: data.url || "/pesanan-saya",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Dekat Warung", options)
  );
});

/** Event klik notifikasi: buka URL yang sesuai */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data || "/pesanan-saya";
  event.waitUntil(clients.openWindow(url));
});
