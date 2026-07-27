"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  registerWarungAndUpgradeSession,
} from "@/lib/actions/auth";
import {
  DEFAULT_BUYER_LAT,
  DEFAULT_BUYER_LNG,
} from "@/lib/constants";

interface DaftarWarungClientProps {
  userId: string;
}

export function DaftarWarungClient({ userId }: DaftarWarungClientProps) {
  const router = useRouter();

  // State form
  const [namaWarung, setNamaWarung] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_BUYER_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_BUYER_LNG);
  const [deliveryFee, setDeliveryFee] = useState(2000);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptQris, setAcceptQris] = useState(true);
  const [acceptTransfer, setAcceptTransfer] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // State UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);

  // Ambil lokasi otomatis saat mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        // Gagal获取 lokasi, gunakan default
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi minimal
    if (!namaWarung.trim()) {
      setError("Nama warung wajib diisi");
      setLoading(false);
      return;
    }

    const result = await registerWarungAndUpgradeSession({
      userId,
      namaWarung: namaWarung.trim(),
      latitude,
      longitude,
      deliveryFee,
      isDeliveryAvailable,
      acceptCash,
      acceptQris,
      acceptTransfer,
      whatsappNumber: whatsappNumber.trim() || null,
    });

    if (!result.success || !result.warung) {
      setError(result.error || "Gagal mendaftarkan warung");
      setLoading(false);
      return;
    }

    // Redirect ke terminal warung (session sudah di-upgrade di server action)
    router.push("/warung-admin");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Warung */}
      <div className="space-y-1">
        <label htmlFor="namaWarung" className="block text-sm font-bold text-ink">
          Nama Warung *
        </label>
        <input
          id="namaWarung"
          type="text"
          value={namaWarung}
          onChange={(e) => setNamaWarung(e.target.value)}
          placeholder="Contoh: Warung Berkah Jaya"
          className="w-full px-4 py-2 rounded-[16px] border-2 border-canvas-soft bg-canvas-soft text-ink focus:outline-none focus:border-lime transition-colors"
          disabled={loading}
          required
        />
      </div>

      {/* Koordinat GPS */}
      <div className="space-y-1">
        <label className="block text-sm font-bold text-ink">
          Lokasi Koordinat (GPS)
        </label>
        {locating ? (
          <p className="text-xs text-body">Mendeteksi lokasi otomatis...</p>
        ) : (
          <p className="text-xs text-body">
            Lokasi terdeteksi: Lat {latitude.toFixed(6)}, Lng {longitude.toFixed(6)}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
            placeholder="Latitude"
            className="w-full px-3 py-2 rounded-[16px] border-2 border-canvas-soft bg-canvas-soft text-ink focus:outline-none focus:border-lime transition-colors text-sm"
            disabled={loading}
          />
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
            placeholder="Longitude"
            className="w-full px-3 py-2 rounded-[16px] border-2 border-canvas-soft bg-canvas-soft text-ink focus:outline-none focus:border-lime transition-colors text-sm"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-mute">
          Pastikan koordinat akurat agar pembeli di sekitar bisa menemukan warung
          Anda.
        </p>
      </div>

      {/* Tarif Antar */}
      <div className="space-y-1">
        <label htmlFor="deliveryFee" className="block text-sm font-bold text-ink">
          Tarif Antar (Rp)
        </label>
        <input
          id="deliveryFee"
          type="number"
          min={0}
          step={100}
          value={deliveryFee}
          onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-2 rounded-[16px] border-2 border-canvas-soft bg-canvas-soft text-ink focus:outline-none focus:border-lime transition-colors"
          disabled={loading}
        />
      </div>

      {/* Toggle Antar */}
      <div className="flex items-center gap-2">
        <input
          id="isDeliveryAvailable"
          type="checkbox"
          checked={isDeliveryAvailable}
          onChange={(e) => setIsDeliveryAvailable(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-canvas-soft focus:ring-lime"
          disabled={loading}
        />
        <label htmlFor="isDeliveryAvailable" className="text-sm font-bold text-ink">
          Tersedia layanan antar
        </label>
      </div>

      {/* Metode Pembayaran */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-ink">Metode Pembayaran yang Diterima:</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              id="acceptCash"
              type="checkbox"
              checked={acceptCash}
              onChange={(e) => setAcceptCash(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-canvas-soft focus:ring-lime"
              disabled={loading}
            />
            <label htmlFor="acceptCash" className="text-sm text-ink">
              💵 Cash
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="acceptQris"
              type="checkbox"
              checked={acceptQris}
              onChange={(e) => setAcceptQris(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-canvas-soft focus:ring-lime"
              disabled={loading}
            />
            <label htmlFor="acceptQris" className="text-sm text-ink">
              📱 QRIS
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="acceptTransfer"
              type="checkbox"
              checked={acceptTransfer}
              onChange={(e) => setAcceptTransfer(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-canvas-soft focus:ring-lime"
              disabled={loading}
            />
            <label htmlFor="acceptTransfer" className="text-sm text-ink">
              🏦 Transfer
            </label>
          </div>
        </div>
      </div>

      {/* Nomor WhatsApp */}
      <div className="space-y-1">
        <label htmlFor="whatsappNumber" className="block text-sm font-bold text-ink">
          Nomor WhatsApp (opsional)
        </label>
        <input
          id="whatsappNumber"
          type="tel"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="Contoh: 081234567890"
          className="w-full px-4 py-2 rounded-[16px] border-2 border-canvas-soft bg-canvas-soft text-ink focus:outline-none focus:border-lime transition-colors"
          disabled={loading}
        />
        <p className="text-xs text-mute">
          Untuk notifikasi pesanan via WhatsApp (opsional).
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-negative text-white text-sm font-bold px-4 py-2 rounded-[16px]">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime text-ink-deep font-black py-3 rounded-pill hover:bg-lime-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Daftarkan Warung"}
      </button>
    </form>
  );
}
