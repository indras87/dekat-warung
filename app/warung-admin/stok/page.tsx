import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import { getProductsByWarung } from "@/lib/actions/product";
import { StockClient } from "@/components/StockClient";

export const dynamic = "force-dynamic";

/**
 * Halaman manajemen Stok untuk role WARUNG: server component yang mengambil
 * daftar produk warung lalu merender StockClient untuk memperbarui stok dan
 * opsi jual.
 */
export default async function StokPage() {
  // Middleware sudah proteksi route ini - hanya user WARUNG yang bisa akses
  const warung = await getCurrentMerchantWarung();
  if (!warung) return null;
  const products = await getProductsByWarung(warung.id);
  return <StockClient warungId={warung.id} initialProducts={products} />;
}
