"use server";

import { prisma } from "@/lib/prisma";
import { ORDER_PENDING_TTL_MS } from "@/lib/constants";
import {
  assertMaxLength,
  assertRange,
  assertEnum,
} from "@/lib/security";
import { sendPush } from "@/lib/push";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, ServiceType, Warung } from "@prisma/client";

export type OrderItemDTO = OrderItem;

export type WarungDTO = Omit<Warung, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type OrderDTO = Omit<Order, "createdAt" | "updatedAt" | "paidAt"> & {
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  items: OrderItemDTO[];
  warung?: WarungDTO;
};

/**
 * Mengkonversi entity Order (beserta relasi) menjadi DTO serializable dengan Date → ISO string.
 */
function toOrderDTO(o: Order & { items: OrderItem[]; warung?: Warung }): OrderDTO {
  return {
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    items: o.items,
    warung: o.warung
      ? {
          ...o.warung,
          createdAt: o.warung.createdAt.toISOString(),
          updatedAt: o.warung.updatedAt.toISOString(),
        }
      : undefined,
  };
}

export type CreateOrderInput = {
  warungId: string;
  buyerName: string;
  buyerId?: string | null;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  customNote?: string | null;
  items: { productId?: string | null; productName: string; price: number; quantity: number }[];
  deliveryFee?: number;
  /** Opsional: buyerId dari session jika pembeli login. */
  sessionBuyerId?: string | null;
};

/** Generate next human-readable order number: ORD-105, ORD-106, … */
async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const seq = 104 + count + 1; // seed starts at ORD-104
  return `ORD-${seq}`;
}

/**
 * Membuat pesanan baru dari input checkout pembeli.
 * Memvalidasi item/enum/panjang string, menghitung subtotal-ongkir-total, menyimpan ke DB, lalu mengembalikan DTO order.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderDTO> {
  // --- Validasi input ketat (security) ---

  // Total item harus ≥ 1
  if (!input.items || input.items.length < 1) {
    throw new Error("Pesanan harus memiliki minimal 1 item");
  }

  // Validasi setiap item
  for (const item of input.items) {
    if (item.quantity <= 0 || item.quantity > 99) {
      throw new Error("Jumlah item harus antara 1 dan 99");
    }
    if (item.price < 0) {
      throw new Error("Harga item tidak boleh negatif");
    }
  }

  // Validasi panjang string
  assertMaxLength(input.buyerName, 80, "Nama pembeli");
  if (input.customNote) {
    assertMaxLength(input.customNote, 500, "Catatan");
  }

  // Validasi enum
  assertEnum(
    input.serviceType,
    ["PICKUP", "ANTERIN"] as const,
    "Tipe layanan",
  );
  assertEnum(
    input.paymentMethod,
    ["CASH", "QRIS", "TRANSFER"] as const,
    "Metode pembayaran",
  );

  // Hitung total
  const subtotal = input.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const deliveryFee =
    input.serviceType === "ANTERIN" ? (input.deliveryFee ?? 2000) : 0;
  const totalAmount = subtotal + deliveryFee;

  // Total harus > 0
  if (totalAmount <= 0) {
    throw new Error("Total pesanan harus lebih dari 0");
  }

  // Gunakan sessionBuyerId jika pembeli login, fallback ke buyerId dari input
  // (backward compatibility: pembeli tanpa login tetap bisa pakai buyerName saja)
  const finalBuyerId = input.sessionBuyerId || input.buyerId || null;

  const order = await prisma.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      warungId: input.warungId,
      buyerName: input.buyerName,
      buyerId: finalBuyerId,
      serviceType: input.serviceType,
      paymentMethod: input.paymentMethod,
      paymentStatus: "BELUM_BAYAR",
      customNote: input.customNote ?? null,
      subtotal,
      deliveryFee,
      totalAmount,
      expiresAt: new Date(Date.now() + ORDER_PENDING_TTL_MS),
      items: { create: input.items },
    },
    include: { items: true },
  });
  return toOrderDTO(order);
}

/**
 * Mengambil satu pesanan beserta item dan data warung-nya berdasarkan id; mengembalikan null jika tidak ditemukan.
 */
export async function getOrderById(id: string): Promise<OrderDTO | null> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true, warung: true },
  });
  return o ? toOrderDTO(o) : null;
}

/**
 * Mengambil daftar pesanan untuk sebuah warung, terurut terbaru.
 * Jika onlyActive true, hanya menyertakan pesanan berstatus PENDING/DIPROSES/SIAP.
 */
export async function getOrdersForWarung(
  warungId: string,
  onlyActive = false,
): Promise<OrderDTO[]> {
  const where = onlyActive
    ? { warungId, status: { in: ["PENDING", "DIPROSES", "SIAP"] as OrderStatus[] } }
    : { warungId };
  const list = await prisma.order.findMany({
    where,
    include: { items: true, warung: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map(toOrderDTO);
}

/** Newest PENDING order — drives the full-screen merchant alert modal. */
export async function getNewestPendingOrder(
  warungId: string,
): Promise<OrderDTO | null> {
  const o = await prisma.order.findFirst({
    where: { warungId, status: "PENDING" },
    include: { items: true, warung: true },
    orderBy: { createdAt: "desc" },
  });
  return o ? toOrderDTO(o) : null;
}

/**
 * Memperbarui status pesanan beserta efek sampingnya (hapus expiresAt saat DIPROSES, set LUNAS_TUNAI saat SELESAI).
 * Mengirim push notification ke pembeli secara fire-and-forget bila buyerId tersedia.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderDTO> {
  const o = await prisma.order.update({
    where: { id },
    data: {
      status,
      // Hapus expiresAt saat merchant terima order (DIPROSES)
      expiresAt: status === "DIPROSES" ? null : undefined,
      // Set LUNAS_TUNAI untuk pembayaran CASH saat SELESAI
      paymentStatus:
        status === "SELESAI" ? { set: "LUNAS_TUNAI" } : undefined,
    },
    include: { items: true, warung: true },
  });

  // Kirim push notification ke pembeli secara fire-and-forget
  if (o.buyerId) {
    // Tentukan pesan berdasarkan status
    let title = "Status Pesanan Diperbarui";
    let body = "";
    let url = `/pesanan-saya`;

    switch (status) {
      case "DIPROSES":
        title = "📦 Pesanan Diproses";
        body = `Pesanan ${o.orderNumber} sedang disiapkan oleh ${o.warung?.namaWarung || "warung"}.`;
        break;
      case "SIAP":
        title = "✅ Pesanan Siap";
        body = `Pesanan ${o.orderNumber} sudah siap diambil!`;
        url = `/pesanan-saya`;
        break;
      case "SELESAI":
        title = "🎉 Pesanan Selesai";
        body = `Pesanan ${o.orderNumber} telah selesai. Terima kasih!`;
        url = `/pesanan-saya`;
        break;
      case "BATAL":
        title = "❌ Pesanan Dibatalkan";
        body = `Pesanan ${o.orderNumber} telah dibatalkan.`;
        url = `/pesanan-saya`;
        break;
      default:
        body = `Status pesanan ${o.orderNumber} kini: ${status}.`;
    }

    // Kirim push asynchronously, jangan blok response
    sendPush(o.buyerId, { title, body, url }).catch((err) =>
      console.error("[updateOrderStatus] Gagal kirim push:", err)
    );
  }

  return toOrderDTO(o);
}

/** Mengambil daftar pesanan pembeli berdasarkan userId, terurut terbaru. */
export async function getOrdersByBuyer(
  userId: string,
  limit = 50,
): Promise<OrderDTO[]> {
  const list = await prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { warung: true, items: true },
  });
  return list.map(toOrderDTO);
}

/**
 * Batalkan otomatis order PENDING yang sudah melewati expiresAt.
 * Dipanggil oleh cleanup worker dan cron endpoint.
 * @returns jumlah order yang dibatalkan
 */
export async function cancelStaleOrders(): Promise<number> {
  const result = await prisma.order.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "BATAL" },
  });
  return result.count;
}

/**
 * Pembeli menandai bahwa mereka sudah membayar (QRIS/TRANSFER).
 * Idempoten: jika sudah MENUNGGU, tidak berubah.
 * Hanya untuk non-CASH.
 */
export async function markPaidByBuyer(orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan");
  }

  if (order.paymentMethod === "CASH") {
    throw new Error("Pembayaran tunai diverifikasi saat pesanan selesai");
  }

  // Idempoten: jika sudah MENUNGGU atau TERKONFIRMASI, tidak perlu update
  if (order.paymentStatus === "MENUNGGU" || order.paymentStatus === "TERKONFIRMASI") {
    return getOrderById(orderId) as Promise<OrderDTO>;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "MENUNGGU" },
    include: { items: true, warung: true },
  });

  return toOrderDTO(updated);
}

/**
 * Merchant mengkonfirmasi pembayaran (setelah pembeli klik "Saya Sudah Bayar").
 * Set TERKONFIRMASI dan paidAt = now.
 */
export async function confirmPayment(orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "TERKONFIRMASI",
      paidAt: new Date(),
    },
    include: { items: true, warung: true },
  });

  return toOrderDTO(updated);
}

/**
 * Merchant menolak pembayaran (bukti tidak valid).
 */
export async function rejectPayment(orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Pesanan tidak ditemukan");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "DITOLAK" },
    include: { items: true, warung: true },
  });

  return toOrderDTO(updated);
}
