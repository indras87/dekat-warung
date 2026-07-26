"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNearbyWarungs, type WarungDTO } from "@/lib/actions/warung";
import {
  DEFAULT_BUYER_LAT,
  DEFAULT_BUYER_LNG,
  DISCOVERY_RADIUS_M,
} from "@/lib/constants";
import { formatDistance } from "@/lib/format";

export default function DiscoveryPage() {
  const [warungs, setWarungs] = useState<WarungDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [locLabel, setLocLabel] = useState("Mendeteksi lokasi…");

  useEffect(() => {
    let cancelled = false;
    async function load(lat: number, lng: number, label: string) {
      setLocLabel(label);
      try {
        const list = await getNearbyWarungs(lat, lng);
        if (!cancelled) setWarungs(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

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

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-canvas-pure p-4 rounded-pill shadow-sm">
        <h1 className="text-2xl font-black text-ink">Dekat Warung</h1>
        <span className="bg-lime-pale text-ink-deep text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          📍 Radius ≤ {DISCOVERY_RADIUS_M}m
        </span>
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
