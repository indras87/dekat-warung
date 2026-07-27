"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STATUS_LABEL, PAYMENT_LABEL, PAYMENT_EMOJI } from "@/lib/constants";
import { formatRupiah, timeAgo } from "@/lib/format";
import { PushOptIn } from "@/components/PushOptIn";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import {
  markPaidByBuyer,
  type OrderDTO,
} from "@/lib/actions/order";
import type { OrderStatus, PaymentMethod, PaymentStatus, ServiceType } from "@prisma/client";

type TrackedOrder = {
  id: string;
  orderNumber: string;
  buyerName: string;
  status: OrderStatus;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
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
    qrisImageUrl: string | null;
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

/**
 * Halaman tracking pesanan realtime untuk Pembeli: subscribe SSE status pesanan
 * via /api/events/order/{id}, menampilkan banner status, instruksi pembayaran
 * QRIS/Transfer, detail item, serta link WhatsApp warung.
 */
export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const evSourceRef = useRef<EventSource | null>(null);

  // Load awal (fallback bila SSE gagal)
  /**
   * Memuat data pesanan via fetch ke /api/orders/{id} sebagai data awal dan
   * cadangan bila SSE belum mengirim update; menandai notFound bila respons 404.
   */
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

  // SSE connection untuk update status realtime
  useEffect(() => {
    const url = `/api/events/order/${id}`;
    const ev = new EventSource(url);
    evSourceRef.current = ev;

    ev.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          order: TrackedOrder | null;
        };
        if (data.order) {
          setOrder(data.order);
        } else {
          // Order tidak ditemukan (mungkin dihapus)
          setNotFound(true);
        }
      } catch {
        /* parse error — abaikan */
      }
    };

    ev.onerror = () => {
      // EventSource auto-reconnect
      // Fallback ke polling bila SSE error berkepanjangan bisa ditambahkan di sini
    };

    // Load awal untuk segera menampilkan data
    load();

    return () => {
      ev.close();
      evSourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Menandai pesanan non-tunai (QRIS/Transfer) sebagai "sudah dibayar" pembeli
   * via markPaidByBuyer dan memperbarui state order dengan hasil yang dikembalikan.
   */
  async function handleMarkPaid(orderId: string) {
    setMarkingPaid(true);
    try {
      const updated = await markPaidByBuyer(orderId);
      setOrder(updated as unknown as TrackedOrder);
    } catch (err) {
      console.error("Gagal menandai pembayaran:", err);
    } finally {
      setMarkingPaid(false);
    }
  }

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

  const isNonCash = order.paymentMethod !== "CASH";
  const canMarkPaid =
    isNonCash &&
    order.paymentStatus === "BELUM_BAYAR" &&
    order.status !== "BATAL" &&
    order.status !== "SELESAI";

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

      {/* Payment Status Badge */}
      <section className="bg-canvas-pure rounded-pill p-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-mute">Pembayaran</p>
          <p className="text-sm font-black text-ink">
            {PAYMENT_EMOJI[order.paymentMethod]} {PAYMENT_LABEL[order.paymentMethod]}
          </p>
        </div>
        <PaymentStatusBadge status={order.paymentStatus} />
      </section>

      {/* Push Opt-in */}
      <section className="bg-canvas-pure rounded-pill p-4 flex justify-center">
        <PushOptIn />
      </section>

      {/* Instruksi Pembayaran untuk QRIS/TRANSFER */}
      {isNonCash && order.paymentStatus !== "LUNAS_TUNAI" && order.status !== "BATAL" && (
        <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
          <h2 className="text-xl font-black text-ink">Instruksi Pembayaran</h2>
          <p className="text-sm text-body">
            Silakan transfer sesuai nominal di bawah ini:
          </p>
          <p className="text-3xl font-black text-ink text-center py-3">
            {formatRupiah(order.totalAmount)}
          </p>
          <p className="text-sm text-body">
            Metode: <span className="font-black text-ink">{PAYMENT_LABEL[order.paymentMethod]}</span>
          </p>
          {order.warung?.qrisImageUrl && order.paymentMethod === "QRIS" && (
            <div className="text-center space-y-2">
              <img
                src={order.warung.qrisImageUrl}
                alt="QRIS"
                className="mx-auto max-w-[200px] rounded-[16px]"
              />
              <p className="text-xs text-mute">Scan QRIS di atas untuk membayar</p>
            </div>
          )}
          {canMarkPaid && (
            <button
              type="button"
              onClick={() => handleMarkPaid(order.id)}
              disabled={markingPaid}
              className="w-full h-14 bg-lime text-ink font-black text-lg rounded-[16px] hover:bg-lime-hover disabled:opacity-50"
            >
              {markingPaid ? "Memproses…" : "Saya Sudah Bayar"}
            </button>
          )}
          {order.paymentStatus === "MENUNGGU" && (
            <p className="text-xs text-center text-body font-medium">
              Menunggu konfirmasi dari warung…
            </p>
          )}
          {order.paymentStatus === "TERKONFIRMASI" && (
            <p className="text-xs text-center text-positive-deep font-bold">
              Pembayaran telah dikonfirmasi! ✅
            </p>
          )}
          {order.paymentStatus === "DITOLAK" && (
            <p className="text-xs text-center text-negative font-bold">
              Pembayaran ditolak. Silakan hubungi warung.
            </p>
          )}
        </section>
      )}

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
