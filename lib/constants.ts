// Dekat Warung — domain constants & display labels
import type { OrderStatus, ServiceType, PaymentMethod } from "@prisma/client";

/** Hyper-local discovery radius (PRD: ≤ 200m). */
export const DISCOVERY_RADIUS_M = 200;

/** Default buyer coordinates (Bojongsoang demo seed). */
export const DEFAULT_BUYER_LAT = -6.9659;
export const DEFAULT_BUYER_LNG = 107.6255;

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Menunggu Konfirmasi",
  DIPROSES: "Sedang Disiapkan",
  SIAP: "Pesanan Siap",
  SELESAI: "Selesai",
  BATAL: "Dibatalkan",
};

export const STATUS_EMOJI: Record<OrderStatus, string> = {
  PENDING: "⏳",
  DIPROSES: "📦",
  SIAP: "✅",
  SELESAI: "🎉",
  BATAL: "❌",
};

export const SERVICE_LABEL: Record<ServiceType, string> = {
  PICKUP: "Ambil Sendiri",
  ANTERIN: "Anterin",
};

export const SERVICE_EMOJI: Record<ServiceType, string> = {
  PICKUP: "🚶",
  ANTERIN: "🛵",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

export const PAYMENT_EMOJI: Record<PaymentMethod, string> = {
  CASH: "💵",
  QRIS: "📱",
  TRANSFER: "🏦",
};

/**
 * Interval SSE internal server (ms).
 * Dipakai di lib/sse.ts sebagai tick fetcher — bukan polling klien.
 * Klien menerima event realtime via EventSource (Server-Sent Events).
 */
export const POLL_INTERVAL_MS = 4000;
