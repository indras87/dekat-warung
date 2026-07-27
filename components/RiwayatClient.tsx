"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PushOptIn } from "@/components/PushOptIn";
import { formatRupiah, timeAgo } from "@/lib/format";
import type { OrderDTO } from "@/lib/actions/order";

interface RiwayatClientProps {
  initialOrders: OrderDTO[];
}

export function RiwayatClient({ initialOrders }: RiwayatClientProps) {
  // TODO: Bila plan 03 sudah merge, tambahkan SSE subscription untuk update real-time
  // const [orders, setOrders] = useState<OrderDTO[]>(initialOrders);

  const orders = initialOrders;

  if (orders.length === 0) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
        <header className="bg-canvas-pure p-4 rounded-pill shadow-sm">
          <h1 className="text-2xl font-black text-ink">Pesanan Saya</h1>
        </header>

        <div className="bg-canvas-pure rounded-pill p-8 text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h2 className="text-xl font-black text-ink">Belum ada pesanan</h2>
          <p className="text-body">
            Kamu belum membuat pesanan sama sekali. Mulai belanja dari warung terdekat!
          </p>
          <Link
            href="/"
            className="inline-block bg-lime text-ink font-black px-6 py-3 rounded-full hover:bg-lime-hover transition-colors"
          >
            Cari Warung
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-canvas-soft min-h-screen p-4 space-y-4">
      <header className="bg-canvas-pure p-4 rounded-pill shadow-sm flex justify-between items-center gap-2">
        <h1 className="text-xl font-black text-ink">Pesanan Saya</h1>
        <div className="flex items-center gap-2">
          <PushOptIn />
          <Link
            href="/"
            className="text-xs font-bold text-ink bg-lime px-3 py-2 rounded-full hover:bg-lime-hover transition-colors"
          >
            ← Kembali
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/order/${order.id}`}
            className="block bg-canvas-pure rounded-pill p-5 space-y-3 cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-body">#{order.orderNumber}</p>
                <h3 className="text-lg font-black text-ink">{order.warung?.namaWarung || "Warung"}</h3>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex justify-between items-center gap-3">
              <div className="space-y-0.5">
                <p className="text-xs text-body">{timeAgo(order.createdAt)}</p>
                <p className="text-sm font-medium text-body">
                  {order.items.length} item · {order.serviceType === "ANTERIN" ? "Anterin" : "Ambil Sendiri"}
                </p>
              </div>
              <p className="text-lg font-black text-ink">{formatRupiah(order.totalAmount)}</p>
            </div>

            <div className="flex justify-between items-center gap-2 pt-1">
              <span className="text-xs text-mute">
                {order.paymentMethod === "CASH"
                  ? "💵 Tunai"
                  : order.paymentMethod === "QRIS"
                    ? "📱 QRIS"
                    : "🏦 Transfer"}
              </span>
              <span className="text-xs font-bold text-ink hover:underline">Lacak →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
