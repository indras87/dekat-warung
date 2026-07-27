"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getNearbyWarungs, type WarungDTO } from "@/lib/actions/warung";
import { getCurrentUser, signOut } from "@/lib/actions/auth";
import {
  DEFAULT_BUYER_LAT,
  DEFAULT_BUYER_LNG,
  DISCOVERY_RADIUS_M,
} from "@/lib/constants";
import { formatDistance } from "@/lib/format";

export default function DiscoveryPage() {
  const router = useRouter();
  const [warungs, setWarungs] = useState<WarungDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [locLabel, setLocLabel] = useState("Mendeteksi lokasi…");
  const [user, setUser] = useState<{ id: string; nama: string; role: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Load user data
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        if (!cancelled && userData) {
          setUser({ id: userData.id, nama: userData.nama, role: userData.role });
        }
      } catch (e) {
        // Silent fail - user not logged in
      }
    }

    // Load warungs
    async function load(lat: number, lng: number, label: string) {
      setLocLabel(label);
      try {
        const list = await getNearbyWarungs(lat, lng);
        if (!cancelled) setWarungs(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    if (!("geolocation" in navigator)) {
      load(DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG, "Bojongsoang (default)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        load(
          pos.coords.latitude,
          pos.coords.longitude,
          `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
        ),
      () => load(DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG, "Bojongsoang (default)"),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await signOut();
    setUser(null);
    router.refresh();
  }

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      {/* Header */}
      <header className="bg-canvas-pure p-4 rounded-pill shadow-sm space-y-3">
        {/* Top row: brand + user actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-ink">Dekat Warung</h1>
          <div className="flex items-center gap-2">
            <span className="bg-lime-pale text-ink-deep text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              📍 Radius ≤ {DISCOVERY_RADIUS_M}m
            </span>
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "PEMBELI" && (
                  <>
                    <Link
                      href="/pesanan-saya"
                      className="text-xs font-bold text-ink bg-lime-pale px-3 py-1.5 rounded-full hover:bg-lime transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                    <Link
                      href="/daftar-warung"
                      className="text-xs font-bold text-canvas-pure bg-ink px-3 py-1.5 rounded-full hover:bg-ink-deep transition-colors"
                    >
                      Daftarkan Warung
                    </Link>
                  </>
                )}
                <Link
                  href={user.role === "WARUNG" ? "/warung-admin" : "/"}
                  className="text-sm font-bold text-ink hover:underline"
                >
                  {user.nama}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-body bg-canvas-soft px-3 py-1.5 rounded-full hover:bg-ink hover:text-lime transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-ink bg-lime px-4 py-2 rounded-full hover:bg-lime-hover transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Search bar - wrapped in Suspense */}
        <Suspense fallback={<SearchBarFallback />}>
          <SearchBar />
        </Suspense>
      </header>

      {/* Hero */}
      <section className="bg-ink text-lime p-6 rounded-pill space-y-2">
        <h2 className="text-2xl font-black leading-tight">
          Belanja Warung Tetangga, Sampai Hitungan Menit.
        </h2>
        <p className="text-sm font-medium text-canvas-soft">
          Posisi kamu: {locLabel}
        </p>
      </section>

      {/* Loading / empty / list */}
      {loading ? (
        <p className="text-center text-body font-medium py-10">
          Mencari warung terdekat…
        </p>
      ) : warungs.length === 0 ? (
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-2">
          <p className="text-lg font-black text-ink">Tidak ada warung aktif</p>
          <p className="text-sm text-body">
            Belum ada warung dalam radius {DISCOVERY_RADIUS_M}m yang sedang
            menerima pesanan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {warungs.map((w) => (
            <Link
              key={w.id}
              href={`/warung/${w.id}`}
              className="block bg-canvas-pure rounded-pill p-5 space-y-3 cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-black text-ink">{w.namaWarung}</h3>
                <span className="shrink-0 bg-lime text-ink text-xs font-black px-3 py-1 rounded-full">
                  ⚡ {formatDistance(w.distanceM ?? 0)}
                </span>
              </div>
              <p className="text-sm text-body font-medium">
                {w.acceptCash || w.acceptQris || w.acceptTransfer
                  ? "Makanan · Minuman · Kebutuhan Harian"
                  : "Warung kelontong"}
              </p>
              <div>
                {w.isOpen ? (
                  <span className="bg-lime-pale text-positive-deep text-xs font-bold px-3 py-1 rounded-full inline-block">
                    🟢 BUKA
                  </span>
                ) : (
                  <span className="bg-[#320707] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
                    🔴 TUTUP
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

/** Search bar with useSearchParams - wrapped in Suspense boundary */
function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cari?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSearchSubmit} className="flex gap-2">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Cari Indomie, telur, minuman..."
        className="flex-1 px-4 py-3 rounded-[16px] border-2 border-ink focus:border-lime focus:outline-none text-ink font-medium"
        maxLength={60}
      />
      <button
        type="submit"
        className="px-6 py-3 bg-ink text-lime font-bold rounded-[16px] hover:bg-ink-deep transition-colors"
      >
        🔍
      </button>
    </form>
  );
}

/** Fallback for Suspense boundary */
function SearchBarFallback() {
  return (
    <div className="flex gap-2">
      <div className="flex-1 h-12 bg-canvas-soft rounded-[16px] animate-pulse" />
      <div className="w-16 h-12 bg-canvas-soft rounded-[16px] animate-pulse" />
    </div>
  );
}
