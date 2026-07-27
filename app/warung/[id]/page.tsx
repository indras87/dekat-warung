import { notFound } from "next/navigation";
import { getWarungById } from "@/lib/actions/warung";
import { getProductsByWarung } from "@/lib/actions/product";
import { EtalaseClient } from "@/components/EtalaseClient";

/**
 * Halaman etalase warung untuk Pembeli: server component yang mengambil data
 * warung beserta daftar produk berdasarkan id, mengembalikan 404 bila warung
 * tidak ditemukan, lalu merender EtalaseClient untuk berbelanja.
 */
export default async function WarungEtalasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const warung = await getWarungById(id);
  if (!warung) notFound();
  const products = await getProductsByWarung(id);

  return <EtalaseClient warung={warung} products={products} />;
}
