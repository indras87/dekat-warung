"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

/**
 * Form login (nama/no. HP + PIN 6 digit) yang memanggil Server Action `signIn`
 * dan mengalihkan pengguna ke URL sesuai peran saat berhasil.
 */
export function LoginClient() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Handler submit: panggil Server Action signIn, redirect bila sukses atau tampilkan error. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !pin.trim()) return;

    setLoading(true);
    setError(null);

    const result = await signIn({ nama: nama.trim(), pin: pin.trim() });

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      setError(result.error || "Gagal login");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-negative/10 text-negative text-sm font-bold p-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nama" className="text-sm font-bold text-ink block mb-2">
          Nama atau Nomor HP
        </label>
        <input
          id="nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama atau no. HP"
          className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
          required
        />
      </div>

      <div>
        <label htmlFor="pin" className="text-sm font-bold text-ink block mb-2">
          PIN (6 digit)
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="••••••"
          className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-mono tracking-widest"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !nama.trim() || !pin.trim()}
        className="w-full h-14 bg-lime text-ink font-black text-lg rounded-pill shadow-lg hover:bg-lime-hover active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
      >
        {loading ? "Memproses..." : "LOGIN"}
      </button>

      <p className="text-center text-sm text-body">
        Belum punya akun?{" "}
        <a href="/" className="font-bold text-ink underline">
          Kembali ke Beranda
        </a>
      </p>
    </form>
  );
}
