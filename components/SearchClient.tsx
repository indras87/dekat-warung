"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { searchProducts, type ProductWithWarungDTO } from "@/lib/actions/product";
import { DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG, DISCOVERY_RADIUS_M } from "@/lib/constants";
import { formatDistance, formatRupiah } from "@/lib/format";

interface SearchClientProps {
  initialQ: string;
  initialLat: number;
  initialLng: number;
  initialResults: ProductWithWarungDTO[];
}

interface GroupedResult {
  warungId: string;
  namaWarung: string;
  isOpen: boolean;
  distanceM: number;
  products: ProductWithWarungDTO[];
}

/**
 * Halaman pencarian produk hyper-local untuk pembeli: input query dengan debounce,
 * pengambilan koordinat GPS otomatis, pemanggilan Server Action searchProducts
 * dalam radius discovery, dan menampilkan hasil dikelompokkan per warung (terurut
 * berdasarkan jarak terdekat).
 */
export default function SearchClient({
  initialQ,
  initialLat,
  initialLng,
  initialResults,
}: SearchClientProps) {
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [results, setResults] = useState<ProductWithWarungDTO[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [userLat, setUserLat] = useState(initialLat);
  const [userLng, setUserLng] = useState(initialLng);
  const [locLabel, setLocLabel] = useState("Koordinat default");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Ambil koordinat via geolocation sekali saat mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocLabel("Bojongsoang (default)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setLocLabel(`Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);
      },
      () => {
        setLocLabel("Bojongsoang (default)");
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 },
    );
  }, []);

  // Debounce query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Panggil searchProducts ketika debouncedQuery berubah
  useEffect(() => {
    /** Eksekusi pencarian via Server Action searchProducts dan memperbarui state hasil/loading. */
    async function doSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchProducts(
          debouncedQuery,
          userLat,
          userLng,
          DISCOVERY_RADIUS_M,
        );
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    doSearch();
  }, [debouncedQuery, userLat, userLng]);

  // Kelompokkan hasil per warung
  /** Mengelompokkan hasil pencarian per warung dan mengurutkannya berdasarkan jarak terdekat. */
  const groupedResults = useCallback((): GroupedResult[] => {
    const groups = new Map<string, GroupedResult>();

    results.forEach((product) => {
      const warungId = product.warung.id;
      if (!groups.has(warungId)) {
        groups.set(warungId, {
          warungId,
          namaWarung: product.warung.namaWarung,
          isOpen: product.warung.isOpen,
          distanceM: product.distanceM,
          products: [],
        });
      }
      groups.get(warungId)!.products.push(product);
    });

    // Sort groups by distance
    return Array.from(groups.values()).sort((a, b) => a.distanceM - b.distanceM);
  }, [results]);

  /** Handler perubahan input pencarian; akan memicu debounce 300ms sebelum query dikirim. */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  /** Handler submit form: menjalankan pencarian langsung tanpa menunggu debounce. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      {/* Header dengan input pencarian */}
      <header className="bg-canvas-pure p-4 rounded-pill shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-black text-ink hover:underline">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-black text-ink">Cari Produk</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
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

        <p className="text-xs text-body">
          📍 {locLabel} · Radius ≤ {DISCOVERY_RADIUS_M}m
        </p>
      </header>

      {/* Hasil pencarian */}
      {loading ? (
        <div className="bg-canvas-pure rounded-pill p-6 text-center">
          <p className="text-body font-medium">Mencari produk...</p>
        </div>
      ) : !query.trim() ? (
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-2">
          <p className="text-lg font-black text-ink">Mulai mencari</p>
          <p className="text-sm text-body">
            Ketik nama produk untuk mencari di warung sekitar
          </p>
        </div>
      ) : groupedResults().length === 0 ? (
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-2">
          <p className="text-lg font-black text-ink">Produk tidak ditemukan</p>
          <p className="text-sm text-body">
            Tidak ada produk "{query}" dalam radius {DISCOVERY_RADIUS_M}m
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-bold text-body">
            Ditemukan {results.length} produk di {groupedResults().length} warung
          </p>
          {groupedResults().map((group) => (
            <div
              key={group.warungId}
              className="bg-canvas-pure rounded-pill p-5 space-y-4"
            >
              {/* Header warung */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-xl font-black text-ink">{group.namaWarung}</h3>
                  <p className="text-sm text-body font-medium">
                    📍 {formatDistance(group.distanceM)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {group.isOpen ? (
                    <span className="bg-lime-pale text-positive-deep text-xs font-bold px-3 py-1 rounded-full">
                      🟢 BUKA
                    </span>
                  ) : (
                    <span className="bg-[#320707] text-white text-xs font-bold px-3 py-1 rounded-full">
                      🔴 TUTUP
                    </span>
                  )}
                </div>
              </div>

              {/* Daftar produk */}
              <div className="space-y-2">
                {group.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center bg-canvas-soft p-3 rounded-[16px]"
                  >
                    <div>
                      <p className="font-bold text-ink">{product.nama}</p>
                      {!product.isAvailable && (
                        <span className="text-xs text-warning font-bold">
                          ⚠️ Habis
                        </span>
                      )}
                    </div>
                    <p className="font-black text-ink">{formatRupiah(product.harga)}</p>
                  </div>
                ))}
              </div>

              {/* Tombol lihat warung */}
              <Link
                href={`/warung/${group.warungId}`}
                className="block text-center py-3 bg-ink text-lime font-bold rounded-[16px] hover:bg-ink-deep transition-colors"
              >
                Lihat Warung
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
