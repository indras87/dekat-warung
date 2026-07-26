/** Format integer rupiah amount → "Rp 22.000". */
export function formatRupiah(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

/** Format distance in meters → "80 Meter" / "1.2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} Meter`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Relative time → "1m lalu" / "2j lalu". */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}d lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}
