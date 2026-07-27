"use client";

import { useEffect, useState, useRef } from "react";
import { MerchantAlertModal } from "./MerchantAlertModal";
import { MerchantBottomBar } from "./MerchantBottomBar";
import { StatusBadge } from "./StatusBadge";
import { setWarungOpen, type WarungDTO } from "@/lib/actions/warung";
import {
  getOrdersForWarung,
  updateOrderStatus,
  type OrderDTO,
} from "@/lib/actions/order";
import { formatRupiah, timeAgo } from "@/lib/format";
import {
  SERVICE_EMOJI,
  SERVICE_LABEL,
  PAYMENT_EMOJI,
  PAYMENT_LABEL,
} from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

export function MerchantTerminalClient({
  warung,
  initialOrders,
}: {
  warung: WarungDTO;
  initialOrders: OrderDTO[];
}) {
  const [open, setOpen] = useState(warung.isOpen);
  const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const evSourceRef = useRef<EventSource | null>(null);

  // SSE connection untuk update pesanan realtime
  useEffect(() => {
    const url = `/api/events/warung/${warung.id}`;
    const ev = new EventSource(url);
    evSourceRef.current = ev;

    ev.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          orders: OrderDTO[];
          newPending: string | null;
        };

        // Filter sesuai pilihan user (active/all)
        const filtered =
          filter === "active"
            ? data.orders.filter((o) =>
                ["PENDING", "DIPROSES", "SIAP"].includes(o.status),
              )
            : data.orders;

        setOrders(filtered);
      } catch {
        /* parse error — abaikan */
      }
    };

    ev.onerror = () => {
      // EventSource auto-reconnect
    };

    return () => {
      ev.close();
      evSourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warung.id, filter]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next); // optimistic
    const w = await setWarungOpen(warung.id, next);
    setOpen(w.isOpen);
  }

  async function setStatus(orderId: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
    await updateOrderStatus(orderId, status);
  }

  return (
    <main className="bg-canvas-soft min-h-screen pb-20">
      {/* Sticky top nav */}
      <header className="bg-ink text-white px-5 py-4 rounded-b-pill flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-black text-lime">Warung Terminal</h1>
        <button
          type="button"
          onClick={toggleOpen}
          className={`text-xs font-black px-4 py-2 rounded-full ${
            open ? "bg-lime text-ink" : "bg-negative text-white"
          }`}
        >
          {open ? "🟢 BUKA" : "🔴 TUTUP"}
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Warung title */}
        <div className="bg-canvas-pure rounded-pill p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-mute">Mengelola</p>
            <p className="text-lg font-black text-ink">{warung.namaWarung}</p>
          </div>
          <span
            className={`text-xs font-black px-3 py-1 rounded-full ${
              open
                ? "bg-lime-pale text-positive-deep"
                : "bg-[#320707] text-white"
            }`}
          >
            {open ? "🟢 MENERIMA" : "🔴 TUTUP"}
          </span>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(["active", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-black ${
                filter === f
                  ? "bg-ink text-lime"
                  : "bg-canvas-pure text-ink border border-ink"
              }`}
            >
              {f === "active" ? "Aktif" : "Semua"}
            </button>
          ))}
        </div>

        {/* Order feed */}
        {orders.length === 0 ? (
          <div className="bg-canvas-pure rounded-pill p-8 text-center space-y-2">
            <p className="text-4xl">🛎️</p>
            <p className="text-lg font-black text-ink">Belum ada pesanan</p>
            <p className="text-sm text-body">
              Pastikan status warung BUKA untuk menerima pesanan baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} onStatus={setStatus} />
            ))}
          </div>
        )}
      </div>

      <MerchantAlertModal warungId={warung.id} />
      <MerchantBottomBar warungId={warung.id} />
    </main>
  );
}

function OrderCard({
  order,
  onStatus,
}: {
  order: OrderDTO;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  return (
    <article className="bg-canvas-pure border-2 border-ink rounded-pill p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-black text-ink">#{order.orderNumber}</p>
          <p className="text-xs text-mute font-medium">
            {timeAgo(order.createdAt)} · {order.buyerName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          <span className="bg-lime-pale text-ink-deep text-xs font-black px-3 py-1 rounded-full">
            {SERVICE_EMOJI[order.serviceType]}{" "}
            {SERVICE_LABEL[order.serviceType].toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-canvas-soft p-4 rounded-[16px] text-base font-semibold text-ink space-y-1">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.quantity}× {it.productName}
            </span>
            <span>{formatRupiah(it.price * it.quantity)}</span>
          </div>
        ))}
        {order.customNote && (
          <p className="pt-2 border-t border-mute/30 text-sm text-body">
            📝 {order.customNote}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-2xl font-black text-ink">
          {formatRupiah(order.totalAmount)}
        </span>
        <span className="bg-warning text-ink text-xs font-extrabold px-2.5 py-1 rounded-md">
          {PAYMENT_EMOJI[order.paymentMethod]}{" "}
          {PAYMENT_LABEL[order.paymentMethod].toUpperCase()}
        </span>
      </div>

      {/* Status-driven actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {order.status === "PENDING" && (
          <>
            <button
              type="button"
              onClick={() => onStatus(order.id, "BATAL")}
              className="h-14 bg-canvas-soft text-negative font-bold rounded-[16px]"
            >
              Tolak
            </button>
            <button
              type="button"
              onClick={() => onStatus(order.id, "DIPROSES")}
              className="h-14 bg-lime text-ink font-black text-lg rounded-[16px] hover:bg-lime-hover"
            >
              Terima
            </button>
          </>
        )}
        {order.status === "DIPROSES" && (
          <>
            <button
              type="button"
              onClick={() => onStatus(order.id, "SIAP")}
              className="h-14 bg-canvas-soft text-ink font-bold rounded-[16px]"
            >
              Siap ✅
            </button>
            <button
              type="button"
              onClick={() => onStatus(order.id, "SELESAI")}
              className="h-14 bg-lime text-ink font-black text-lg rounded-[16px] hover:bg-lime-hover"
            >
              Selesai
            </button>
          </>
        )}
        {order.status === "SIAP" && (
          <button
            type="button"
            onClick={() => onStatus(order.id, "SELESAI")}
            className="col-span-2 h-14 bg-lime text-ink font-black text-lg rounded-[16px] hover:bg-lime-hover"
          >
            Tandai Selesai 🎉
          </button>
        )}
        {(order.status === "SELESAI" || order.status === "BATAL") && (
          <p className="col-span-2 text-center text-sm font-bold text-mute py-2">
            Pesanan {order.status === "SELESAI" ? "selesai" : "dibatalkan"}.
          </p>
        )}
      </div>
    </article>
  );
}
