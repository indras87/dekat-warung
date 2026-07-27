"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { getWarungById, type WarungDTO } from "@/lib/actions/warung";
import { createOrder } from "@/lib/actions/order";
import { getCurrentBuyerId } from "@/lib/actions/auth";
import { formatRupiah } from "@/lib/format";
import {
  SERVICE_EMOJI,
  SERVICE_LABEL,
  PAYMENT_EMOJI,
  PAYMENT_LABEL,
} from "@/lib/constants";
import type { ServiceType, PaymentMethod } from "@prisma/client";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    warungId,
    warungName,
    items,
    customNote,
    subtotal,
    itemCount,
    clear,
  } = useCart();

  const [warung, setWarung] = useState<WarungDTO | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [service, setService] = useState<ServiceType>("PICKUP");
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warungId) return;
    getWarungById(warungId).then(setWarung);
  }, [warungId]);

  const hasCustom = customNote.trim().length > 0;
  const canOrder = (itemCount > 0 || hasCustom) && buyerName.trim().length > 0;
  const deliveryFee = service === "ANTERIN" ? warung?.deliveryFee ?? 2000 : 0;
  const total = subtotal + deliveryFee;

  const paymentOptions: { key: PaymentMethod; allowed: boolean }[] = [
    { key: "CASH", allowed: warung?.acceptCash ?? true },
    { key: "QRIS", allowed: warung?.acceptQris ?? false },
    { key: "TRANSFER", allowed: warung?.acceptTransfer ?? false },
  ];

  async function handleSubmit() {
    if (!warungId || !canOrder) return;
    setSubmitting(true);
    setError(null);
    try {
      // Ambil buyerId dari session jika pembeli login
      const buyerId = await getCurrentBuyerId();

      const order = await createOrder({
        warungId,
        buyerName: buyerName.trim(),
        sessionBuyerId: buyerId, // buyerId dari session
        serviceType: service,
        paymentMethod: payment,
        customNote: hasCustom ? customNote.trim() : null,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          price: i.price,
          quantity: i.qty,
        })),
        deliveryFee,
      });
      clear();
      router.push(`/order/${order.id}`);
    } catch (e) {
      setError("Gagal mengirim pesanan. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (!warungId) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-3">
          <p className="text-lg font-black text-ink">Keranjang kosong</p>
          <p className="text-sm text-body">
            Pilih warung dulu untuk mulai berbelanja.
          </p>
          <Link
            href="/"
            className="inline-block bg-lime text-ink font-black h-12 px-6 rounded-full leading-[3rem]"
          >
            Cari Warung
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      <Link
        href={warungId ? `/warung/${warungId}` : "/"}
        className="inline-flex items-center gap-1 text-sm font-bold text-ink"
      >
        ← Kembali
      </Link>

      <h1 className="text-2xl font-black text-ink px-1">Checkout</h1>

      {/* Order summary */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-ink">Ringkasan Pesanan</h2>
          <span className="text-sm font-bold text-body">{warungName}</span>
        </div>
        {items.length === 0 && !hasCustom && (
          <p className="text-sm text-body">Belum ada item dipilih.</p>
        )}
        {items.map((i) => (
          <div
            key={i.productId}
            className="flex justify-between border-b border-canvas-soft pb-2 last:border-0"
          >
            <span className="text-base font-semibold text-ink">
              {i.qty}× {i.productName}
            </span>
            <span className="text-base font-black text-ink">
              {formatRupiah(i.price * i.qty)}
            </span>
          </div>
        ))}
        {hasCustom && (
          <div className="flex justify-between border-b border-canvas-soft pb-2 last:border-0">
            <span className="text-base font-semibold text-ink">📝 Custom</span>
            <span className="text-sm text-body italic max-w-[60%] text-right">
              {customNote}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-1">
          <span className="text-body font-medium">Subtotal</span>
          <span className="font-black text-ink">{formatRupiah(subtotal)}</span>
        </div>
      </section>

      {/* Buyer name */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-2">
        <label htmlFor="buyerName" className="text-sm font-bold text-ink block">
          Nama Pemesan
        </label>
        <input
          id="buyerName"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Nama kamu"
          className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
        />
      </section>

      {/* Delivery */}
      <section className="space-y-2">
        <h2 className="text-xl font-black text-ink px-1">Pengiriman</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["PICKUP", "ANTERIN"] as ServiceType[]).map((s) => {
            const active = service === s;
            const disabled =
              s === "ANTERIN" && !!warung && !warung.isDeliveryAvailable;
            return (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => setService(s)}
                className={`p-4 rounded-pill font-bold text-center transition-colors ${
                  active
                    ? "bg-ink text-lime"
                    : "bg-canvas-pure text-ink border border-ink"
                } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {SERVICE_EMOJI[s]} {SERVICE_LABEL[s]}
                {s === "ANTERIN" && (
                  <span className="block text-xs font-medium">
                    +{formatRupiah(warung?.deliveryFee ?? 2000)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Payment */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
        <h2 className="text-xl font-black text-ink">Pembayaran</h2>
        <div className="space-y-2">
          {paymentOptions.map((opt) => {
            const active = payment === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                disabled={!opt.allowed}
                onClick={() => setPayment(opt.key)}
                className={`w-full p-3 rounded-xl flex justify-between items-center font-bold text-ink transition-colors ${
                  active ? "bg-lime-pale" : "bg-canvas-soft"
                } ${!opt.allowed ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span>
                  {PAYMENT_EMOJI[opt.key]} {PAYMENT_LABEL[opt.key]}
                </span>
                {active && <span className="text-positive-deep">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Total + submit */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-body font-medium">Total Pembayaran</span>
          <span className="text-2xl font-black text-ink">
            {formatRupiah(total)}
          </span>
        </div>
        {error && <p className="text-sm font-bold text-negative">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canOrder || submitting}
          className="w-full h-16 bg-lime text-ink font-black text-xl rounded-pill shadow-lg hover:bg-lime-hover active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          {submitting ? "Mengirim…" : "KIRIM PESANAN SEKARANG"}
        </button>
      </section>
    </main>
  );
}
