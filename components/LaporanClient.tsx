"use client";

import { formatRupiah } from "@/lib/format";
import { STATUS_LABEL, STATUS_EMOJI } from "@/lib/constants";
import { BarChart } from "@/components/BarChart";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@prisma/client";

interface DailyRevenueDTO {
  date: string;
  total: number;
}

interface OrderCountByStatusDTO {
  status: OrderStatus;
  count: number;
}

interface TopProductDTO {
  productName: string;
  quantity: number;
  totalRevenue: number;
}

interface Props {
  warungId: string;
  dailyRevenue: DailyRevenueDTO[];
  orderCounts: OrderCountByStatusDTO[];
  topProducts: TopProductDTO[];
}

const ALL_STATUSES: OrderStatus[] = ["PENDING", "DIPROSES", "SIAP", "SELESAI", "BATAL"];

/**
 * Halaman laporan merchant: KPI omzet/pesanan/AOV, grafik omzet 7 hari terakhir,
 * produk terlaris, dan distribusi status pesanan. Menampilkan empty state bila
 * belum ada pesanan berstatus SELESAI.
 */
export function LaporanClient({
  warungId,
  dailyRevenue,
  orderCounts,
  topProducts,
}: Props) {
  // Hitung KPI
  const totalOmzet = dailyRevenue.reduce((sum, item) => sum + item.total, 0);
  const completedCount = orderCounts.find((c) => c.status === "SELESAI")?.count ?? 0;
  const aov = completedCount > 0 ? totalOmzet / completedCount : 0;

  // Siapkan data chart batang (isi tanggal kosong dengan 0)
  const last7Days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split("T")[0]);
  }

  const chartData = last7Days.map((date) => ({
    label: new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    value: dailyRevenue.find((dr) => dr.date === date)?.total ?? 0,
  }));

  // Empty state: belum ada order SELESAI
  const hasData = completedCount > 0;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-canvas-soft pb-20 px-4 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-black text-ink mb-6">📊 Laporan</h1>

          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-black text-ink mb-2">Belum Ada Data Penjualan</h2>
            <p className="text-body text-sm">
              Omzet dan analitik akan muncul di sini setelah ada pesanan selesai.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-soft pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-black text-ink mb-6">📊 Laporan</h1>

        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <KPICard label="Omzet 7 Hari" value={formatRupiah(totalOmzet)} />
          <KPICard label="Pesanan Selesai" value={completedCount.toString()} />
          <KPICard label="AOV" value={formatRupiah(aov)} />
        </div>

        {/* Chart Batang Omzet Harian */}
        <div className="bg-white rounded-3xl p-5 mb-6">
          <h2 className="text-lg font-black text-ink mb-4">Omzet Harian (7 Hari)</h2>
          <BarChart data={chartData} />
        </div>

        {/* Produk Terlaris */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-5 mb-6">
            <h2 className="text-lg font-black text-ink mb-4">Produk Terlaris</h2>
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={product.productName} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-pale flex items-center justify-center text-positive-deep font-black text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-ink text-sm">{product.productName}</div>
                    <div className="text-xs text-body">
                      {product.quantity} terjual • {formatRupiah(product.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Distribusi Status */}
        <div className="bg-white rounded-3xl p-5">
          <h2 className="text-lg font-black text-ink mb-4">Distribusi Status Pesanan</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((status) => {
              const count = orderCounts.find((c) => c.status === status)?.count ?? 0;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center gap-2">
                  <StatusBadge status={status} size="md" />
                  <span className="text-sm font-black text-ink">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Kartu KPI kecil yang menampilkan satu label dan satu nilai (omzet/jumlah/AOV). */
function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-3xl p-4 text-center">
      <div className="text-xs font-bold text-body mb-1">{label}</div>
      <div className="text-lg font-black text-lime truncate">{value}</div>
    </div>
  );
}
