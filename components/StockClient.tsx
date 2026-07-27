"use client";

import { useState } from "react";
import { toggleProductStock } from "@/lib/actions/product";
import type { ProductDTO } from "@/lib/actions/product";
import { formatRupiah } from "@/lib/format";
import { MerchantBottomBar } from "./MerchantBottomBar";

/** Halaman kelola stok merchant: toggle cepat status Ada/Habis per produk via Server Action toggleProductStock. */
export function StockClient({
  warungId,
  initialProducts,
}: {
  warungId: string;
  initialProducts: ProductDTO[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState<string | null>(null);

  /** Toggle ketersediaan produk (optimistic UI + Server Action toggleProductStock). */
  async function toggle(id: string, current: boolean) {
    setBusyId(id);
    const updated = await toggleProductStock(id, !current);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: updated.isAvailable } : p)),
    );
    setBusyId(null);
  }

  return (
    <main className="bg-canvas-soft min-h-screen p-4 pb-24 space-y-3">
      <header className="bg-ink text-lime px-5 py-4 rounded-pill">
        <h1 className="text-xl font-black">Kelola Stok</h1>
        <p className="text-xs text-canvas-soft font-medium">
          Toggle cepat: Ada / Habis
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-center text-body py-10">Belum ada produk.</p>
      ) : (
        products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-canvas-pure p-4 rounded-pill"
          >
            <div className="pr-3">
              <p className="text-base font-bold text-ink">{p.nama}</p>
              <p className="text-sm text-body">{formatRupiah(p.harga)}</p>
            </div>
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => toggle(p.id, p.isAvailable)}
              className={
                p.isAvailable
                  ? "bg-lime-pale text-positive-deep border-2 border-positive px-4 py-2 rounded-full font-black text-xs"
                  : "bg-[#320707] text-white px-4 py-2 rounded-full font-black text-xs"
              }
            >
              {p.isAvailable ? "🟢 ADA" : "🔴 HABIS"}
            </button>
          </div>
        ))
      )}

      <MerchantBottomBar warungId={warungId} />
    </main>
  );
}
