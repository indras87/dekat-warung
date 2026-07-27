import Link from "next/link";
import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import { getOrdersForWarung } from "@/lib/actions/order";
import { MerchantTerminalClient } from "@/components/MerchantTerminalClient";

// Always render at request time — these pages query the DB and must not be
// prerendered at build time (Docker build has no live Postgres).
export const dynamic = "force-dynamic";

/**
 * Halaman Terminal Warung untuk role WARUNG: server component yang mengambil
 * data warung & pesanan aktif, menampilkan prompt bila warung belum terhubung,
 * lalu merender MerchantTerminalClient untuk mengelola pesanan secara realtime.
 */
export default async function TerminalPage() {
  // Middleware sudah proteksi route ini - hanya user WARUNG yang bisa akses
  const warung = await getCurrentMerchantWarung();
  if (!warung) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4">
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-3">
          <p className="text-lg font-black text-ink">Warung tidak ditemukan</p>
          <p className="text-sm text-body">
            Akun Anda belum terhubung dengan warung. Hubungi admin.
          </p>
          <Link
            href="/"
            className="inline-block bg-lime text-ink font-black h-12 px-6 rounded-full leading-[3rem]"
          >
            Ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const orders = await getOrdersForWarung(warung.id, true);
  return <MerchantTerminalClient warung={warung} initialOrders={orders} />;
}
