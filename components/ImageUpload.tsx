"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  /** URL gambar saat ini (bisa null/undefined) */
  value?: string | null;
  /** Callback saat URL berubah (setelah upload sukses atau URL manual) */
  onChange: (url: string | null) => void;
  /** Label untuk input file */
  label?: string;
  /** Placeholder untuk input URL manual */
  placeholder?: string;
  /** Apakah sedang loading dari parent */
  disabled?: boolean;
}

/**
 * Input gambar untuk form merchant: tombol upload file (POST /api/upload) plus
 * fallback input URL manual, lengkap dengan pratinjau gambar dan state loading/error.
 */
export function ImageUpload({
  value,
  onChange,
  label = "URL Gambar (opsional)",
  placeholder = "https://example.com/gambar.jpg",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState(value ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Handler pemilihan file: upload ke /api/upload lalu teruskan URL hasil ke onChange. */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengupload gambar");
      }

      const data = await res.json();
      onChange(data.url);
      setManualUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload gambar");
    } finally {
      setUploading(false);
      // Reset input file agar bisa pilih file sama lagi
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /** Handler input URL manual: sinkronkan nilai teks ke onChange (null bila kosong). */
  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualUrl(url);
    onChange(url.trim() || null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={label} className="text-sm font-bold text-ink block">
        {label}
      </label>

      {/* Input file (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Button pilih file */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="w-full h-12 bg-canvas-soft border-2 border-ink rounded-xl p-3 text-base text-ink font-medium hover:bg-lime-pale transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Spinner />
            <span>Mengupload...</span>
          </>
        ) : (
          "📷 Pilih File Gambar"
        )}
      </button>

      {/* Input URL manual (fallback) */}
      <input
        type="url"
        value={manualUrl}
        onChange={handleManualUrlChange}
        placeholder={placeholder}
        className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-sm text-ink font-medium disabled:opacity-50"
        disabled={disabled || uploading}
      />

      {/* Error message */}
      {error && <p className="text-sm font-bold text-negative">{error}</p>}

      {/* Preview gambar */}
      {value && (
        <div className="relative w-full h-40 bg-canvas-soft rounded-xl overflow-hidden border border-ink">
          <img
            src={value}
            alt="Pratinjau"
            className="w-full h-full object-contain"
            onError={() => setError("Gagal memuat gambar")}
          />
        </div>
      )}
    </div>
  );
}

/** Spinner sederhana untuk indikator loading */
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-ink"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
