import { formatRupiah } from "@/lib/format";

interface BarChartProps {
  data: { label: string; value: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1); // Avoid division by zero

  return (
    <div className="h-40 flex items-end gap-2">
      {data.map((item) => {
        const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isToday = item.value > 0;

        return (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            {/* Nilai di atas batang */}
            {isToday && (
              <div className="text-xs font-bold text-ink mb-1">
                {formatRupiah(item.value)}
              </div>
            )}

            {/* Batang */}
            <div
              className={`w-full rounded-t-lg ${
                isToday ? "bg-lime" : "bg-lime-pale"
              }`}
              style={{ height: `${Math.max(heightPercent, isToday ? 4 : 0)}%` }}
            />

            {/* Label tanggal di bawah */}
            <div className="text-xs font-semibold text-body mt-2">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}
