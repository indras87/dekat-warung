"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Counter } from "./Counter";
import { formatRupiah } from "@/lib/format";
import type { WarungDTO } from "@/lib/actions/warung";
import type { ProductDTO } from "@/lib/actions/product";

export function EtalaseClient({
  warung,
  products,
}: {
  warung: WarungDTO;
  products: ProductDTO[];
}) {
  const {
    setWarung,
    setQty,
    customNote,
    setCustomNote,
    items,
    itemCount,
    subtotal,
  } = useCart();

  // Bind this warung to the cart on mount.
  useEffect(() => {
    setWarung(warung.id, warung.namaWarung);
  }, [warung.id, warung.namaWarung, setWarung]);

  const qtyOf = (pid: string) =>
    items.find((i) => i.productId === pid)?.qty ?? 0;

  const hasCustom = customNote.trim().length > 0;
  const canCheckout = itemCount > 0 || hasCustom;

  return (
    <main className="bg-canvas-soft min-h-screen p-4 pb-28 space-y-4">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-bold text-ink"
      >
        ← Kembali
      </Link>

      {/* Warung info */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-2">
        <h1 className="text-2xl font-black text-ink">{warung.namaWarung}</h1>
        {warung.isOpen ? (
          <span className="bg-lime-pale text-positive-deep text-xs font-bold px-3 py-1 rounded-full inline-block">
            🟢 BUKA
          </span>
        ) : (
          <span className="bg-[#320707] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
            🔴 TUTUP
          </span>
        )}
        <div className="flex gap-2 pt-1 flex-wrap">
          {warung.acceptCash && (
            <span className="bg-canvas-soft text-ink text-xs font-bold px-2.5 py-1 rounded-lg">
              💵 CASH
            </span>
          )}
          {warung.acceptQris && (
            <span className="bg-canvas-soft text-ink text-xs font-bold px-2.5 py-1 rounded-lg">
              📱 QRIS
            </span>
          )}
          {warung.acceptTransfer && (
            <span className="bg-canvas-soft text-ink text-xs font-bold px-2.5 py-1 rounded-lg">
              🏦 TRANSFER
            </span>
          )}
        </div>
      </section>

      {/* Custom request */}
      <section className="bg-lime-pale border-2 border-dashed border-lime rounded-pill p-4 space-y-2">
        <label
          htmlFor="customNote"
          className="text-sm font-bold text-ink-deep block"
        >
          Minta Barang Khusus / Custom?
        </label>
        <input
          id="customNote"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="Cth: 2 bungkus mie ayam, dikasih cabe extra…"
          className="w-full bg-canvas-pure border border-ink rounded-xl p-3 text-sm text-ink"
        />
      </section>

      {/* Catalog */}
      <section className="space-y-3">
        <h2 className="text-xl font-black text-ink px-1">Etalase</h2>
        {products.length === 0 ? (
          <p className="text-body text-sm">Belum ada produk terdaftar.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className={`flex justify-between items-center bg-canvas-pure p-4 rounded-pill shadow-sm ${
                !p.isAvailable ? "opacity-50" : ""
              }`}
            >
              <div className="pr-3">
                <p className="text-base font-bold text-ink">{p.nama}</p>
                <p className="text-lg font-black text-ink">
                  {formatRupiah(p.harga)}
                </p>
                {!p.isAvailable && (
                  <span className="text-xs font-bold text-negative">
                    🔴 HABIS
                  </span>
                )}
              </div>
              {p.isAvailable && (
                <Counter
                  value={qtyOf(p.id)}
                  onChange={(q) => setQty(p.id, p.nama, p.harga, q)}
                />
              )}
            </div>
          ))
        )}
      </section>

      {/* Floating cart bar */}
      {canCheckout && (
        <div className="fixed bottom-4 left-4 right-4 bg-ink text-white rounded-pill p-4 shadow-2xl flex justify-between items-center z-30">
          <div>
            <p className="text-xs text-mute font-medium">
              {itemCount} Barang{hasCustom ? " + Custom" : ""}
            </p>
            <p className="text-xl font-black text-lime">
              {formatRupiah(subtotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="bg-lime text-ink font-black h-12 px-6 rounded-full hover:bg-lime-hover transition-colors flex items-center"
          >
            Checkout →
          </Link>
        </div>
      )}
    </main>
  );
}
