import { getDefaultMerchantWarung } from "@/lib/actions/warung";
import { getProductsByWarung } from "@/lib/actions/product";
import { StockClient } from "@/components/StockClient";

export default async function StokPage() {
  const warung = await getDefaultMerchantWarung();
  if (!warung) return null;
  const products = await getProductsByWarung(warung.id);
  return <StockClient warungId={warung.id} initialProducts={products} />;
}
