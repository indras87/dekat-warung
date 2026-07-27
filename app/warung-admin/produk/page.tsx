import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import { getProductsByWarung, getCategoriesByWarung } from "@/lib/actions/product";
import { ProdukClient } from "@/components/ProdukClient";

export const dynamic = "force-dynamic";

export default async function ProdukPage() {
  // Middleware sudah proteksi route ini - hanya user WARUNG yang bisa akses
  const warung = await getCurrentMerchantWarung();
  if (!warung) return null;

  const [products, categories] = await Promise.all([
    getProductsByWarung(warung.id),
    getCategoriesByWarung(warung.id),
  ]);

  return (
    <ProdukClient
      warungId={warung.id}
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
