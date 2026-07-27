import { getSession } from "@/lib/session";
import { getOrdersByBuyer } from "@/lib/actions/order";
import { RiwayatClient } from "@/components/RiwayatClient";
import Link from "next/link";

export default async function PesananSayaPage() {
  const session = await getSession();

  // Jika belum login, tampilkan prompt login
  if (!session.userId) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
        <header className="bg-canvas-pure p-4 rounded-pill shadow-sm">
          <h1 className="text-2xl font-black text-ink">Dekat Warung</h1>
        </header>

        <div className="bg-canvas-pure rounded-pill p-8 text-center space-y-4">
          <div className="text-6xl">📋</div>
          <h2 className="text-xl font-black text-ink">Login untuk melihat pesanan Anda</h2>
          <p className="text-body">
            Silakan login untuk melihat riwayat pesanan dan melacak status pesanan aktif.
          </p>
          <Link
            href="/login"
            className="inline-block bg-lime text-ink font-black px-6 py-3 rounded-full hover:bg-lime-hover transition-colors"
          >
            Login Sekarang
          </Link>
        </div>
      </main>
    );
  }

  // Pembeli login, ambil pesanan mereka
  const orders = await getOrdersByBuyer(session.userId);

  return <RiwayatClient initialOrders={orders} />;
}
