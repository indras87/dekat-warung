import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import {
  getDailyRevenue,
  getOrderCountsByStatus,
  getTopProducts,
} from "@/lib/actions/laporan";
import { redirect } from "next/navigation";
import { LaporanClient } from "@/components/LaporanClient";

export const dynamic = "force-dynamic";

/**
 * Halaman Laporan untuk role WARUNG: server component yang mengambil agregasi
 * pendapatan harian, jumlah pesanan per status, dan produk terlaris, lalu
 * meneruskannya ke LaporanClient untuk divisualisasikan.
 */
export default async function LaporanPage() {
  const warung = await getCurrentMerchantWarung();

  if (!warung) {
    redirect("/login");
  }

  // Ambil data agregasi
  const [dailyRevenue, orderCounts, topProducts] = await Promise.all([
    getDailyRevenue(warung.id, 7),
    getOrderCountsByStatus(warung.id),
    getTopProducts(warung.id, 5),
  ]);

  return (
    <LaporanClient
      warungId={warung.id}
      dailyRevenue={dailyRevenue}
      orderCounts={orderCounts}
      topProducts={topProducts}
    />
  );
}
