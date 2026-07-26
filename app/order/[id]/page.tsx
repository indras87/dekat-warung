"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { POLL_INTERVAL_MS, STATUS_LABEL } from "@/lib/constants";
import { formatRupiah, timeAgo } from "@/lib/format";
import type { OrderStatus, ServiceType, PaymentMethod } from "@prisma/client";

type TrackedOrder = {
  id: string;
  orderNumber: string;
  buyerName: string;
  status: OrderStatus;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  customNote: string | null;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  items: { id: string; productName: string; price: number; quantity: number }[];
  warung: {
    id: string;
    namaWarung: string;
    whatsappNumber: string | null;
  } | null;
};

const BANNER: Record<OrderStatus, { box: string; title: string; pulse?: boolean }> = {
  PENDING: {
    box: "bg-warning text-ink",
    title: "Menunggu Konfirmasi Warung…",
    pulse: true,
  },
  DIPROSES: { box: "bg-ink text-lime", title: "Pesanan Sedang Disiapkan! 📦" },
  SIAP: { box: "bg-lime text-ink", title: "Pesanan Siap Diambil! ✅" },
  SELESAI: { box: "bg-lime-pale text-positive-deep", title: "Pesanan Selesai! 🎉" },
  BATAL: { box: "bg-[#320707] text-white", title: "Pesanan Dibatalkan ❌" },
};

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = (await res.json()) as { order: TrackedOrder | null };
      if (data.order) setOrder(data.order);
    } catch {
      /* transient */
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [load]);

  if (notFound) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-2">
          <p className="text-lg font-black text-ink">Pesanan tidak ditemukan</p>
          <Link
            href="/"
            className="inline-block bg-lime text-ink font-black h-12 px-6 rounded-full leading-[3rem]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4">
        <p className="text-center text-body font-medium py-10">
          Memuat pesanan…
        </p>
      </main>
    );
  }

  const banner = BANNER[order.status];
  const waNumber = order.warung?.whatsappNumber;
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Halo ${order.warung?.namaWarung ?? ""}, saya mau tanya pesanan ${order.orderNumber}`,
      )}`
    : null;

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      {/* Status banner */}
      <section
        className={`${banner.box} p-6 rounded-pill text-center space-y-2 ${
          banner.pulse ? "animate-pulse" : ""
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">
          {order.orderNumber}
        </p>
        <h1 className="text-2xl font-black">{banner.title}</h1>
        <p className="text-xs font-bold opacity-80">
          Status: {STATUS_LABEL[order.status]} · {timeAgo(order.createdAt)}
        </p>
      </section>

      {/* Details */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
        <h2 className="text-xl font-black text-ink">Detail Pesanan</h2>
        <p className="text-sm text-body font-medium">
          Warung: <span className="font-black text-ink">{order.warung?.namaWarung}</span>
        </p>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div
              key={it.id}
              className="flex justify-between border-b border-canvas-soft pb-2 last:border-0"
            >
              <span className="font-semibold text-ink">
                {it.quantity}× {it.productName}
              </span>
              <span className="font-black text-ink">
                {formatRupiah(it.price * it.quantity)}
              </span>
            </div>
          ))}
          {order.customNote && (
            <p className="text-sm text-body pt-1">📝 {order.customNote}</p>
          )}
        </div>
        <div className="flex justify-between pt-2 border-t border-canvas-soft">
          <span className="text-body font-medium">Total</span>
          <span className="text-2xl font-black text-ink">
            {formatRupiah(order.totalAmount)}
          </span>
        </div>
      </section>

      {/* WhatsApp */}
      {waLink && order.status !== "BATAL" && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 bg-ink text-white font-bold rounded-[16px] flex items-center justify-center gap-2"
        >
          💬 Hubungi Warung
        </a>
      )}

      <Link
        href="/"
        className="block text-center text-sm font-bold text-ink underline pt-2"
      >
        Belanja lagi
      </Link>
    </main>
  );
}
