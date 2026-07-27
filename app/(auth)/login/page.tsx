import { LoginClient } from "@/components/LoginClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="bg-canvas-soft min-h-screen p-4 flex items-center justify-center">
      <div className="bg-canvas-pure rounded-pill p-6 w-full max-w-md space-y-6 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-ink">Login Dekat Warung</h1>
          <p className="text-sm text-body">
            Masuk untuk mengakses Terminal Warung atau riwayat pesanan.
          </p>
        </div>

        {/* Login Form */}
        <LoginClient />

        {/* Daftar Warung link */}
        <Link
          href="/daftar-warung"
          className="block text-center text-sm font-bold text-lime hover:underline"
        >
          Belum punya akun? Daftarkan Warung Anda
        </Link>

        {/* Back link */}
        <Link
          href="/"
          className="block text-center text-sm font-bold text-ink hover:underline"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
