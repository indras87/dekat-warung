import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DaftarWarungClient } from "@/components/DaftarWarungClient";

export const dynamic = "force-dynamic";

/**
 * Halaman pendaftaran warung untuk user PEMBELI.
 * User yang sudah WARUNG di-redirect ke /warung-admin.
 * User yang belum login di-redirect ke /login.
 */
export default async function DaftarWarungPage() {
  const session = await getSession();

  // Jika belum login, redirect ke login dengan next parameter
  if (!session.userId) {
    redirect("/login?next=/daftar-warung");
  }

  // Jika sudah WARUNG, redirect ke terminal warung
  if (session.role === "WARUNG") {
    redirect("/warung-admin");
  }

  // Render form pendaftaran untuk user PEMBELI
  return (
    <main className="bg-canvas-soft min-h-screen p-4 flex items-center justify-center">
      <div className="bg-canvas-pure rounded-pill p-6 w-full max-w-md space-y-6 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-ink">Daftarkan Warung Anda</h1>
          <p className="text-sm text-body">
            Mulai jualan online dan terima pesanan dari tetangga sekitar.
          </p>
        </div>

        {/* Form */}
        <DaftarWarungClient userId={session.userId} />

        {/* Back link */}
        <a
          href="/"
          className="block text-center text-sm font-bold text-ink hover:underline"
        >
          ← Kembali ke Beranda
        </a>
      </div>
    </main>
  );
}
