import { searchProducts, type ProductWithWarungDTO } from "@/lib/actions/product";
import { DEFAULT_BUYER_LAT, DEFAULT_BUYER_LNG, DISCOVERY_RADIUS_M } from "@/lib/constants";
import SearchClient from "@/components/SearchClient";

interface PageProps {
  searchParams: Promise<{ q?: string; lat?: string; lng?: string }>;
}

/**
 * Halaman pencarian produk untuk Pembeli: server component yang membaca query
 * (q, lat, lng) dari searchParams, menjalankan searchProducts dalam radius
 * discovery, lalu meneruskan hasil awal ke SearchClient.
 */
export default async function CariPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const lat = params.lat ? parseFloat(params.lat) : DEFAULT_BUYER_LAT;
  const lng = params.lng ? parseFloat(params.lng) : DEFAULT_BUYER_LNG;

  // Jika query kosong, jangan panggil search
  let initialResults: ProductWithWarungDTO[] = [];
  if (query.trim()) {
    initialResults = await searchProducts(query, lat, lng, DISCOVERY_RADIUS_M);
  }

  return (
    <SearchClient
      initialQ={query}
      initialLat={lat}
      initialLng={lng}
      initialResults={initialResults}
    />
  );
}
