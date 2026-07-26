"use server";

import { prisma } from "@/lib/prisma";
import type { Order, OrderItem, OrderStatus, PaymentMethod, ServiceType } from "@prisma/client";

export type OrderItemDTO = OrderItem;

export type OrderDTO = Omit<Order, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
};

function toOrderDTO(o: Order & { items: OrderItem[] }): OrderDTO {
  return {
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items,
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
};

/** Generate next human-readable order number: ORD-105, ORD-106, … */
async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const seq = 104 + count + 1; // seed starts at ORD-104
  return `ORD-${seq}`;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDTO> {
  const subtotal = input.items.reduce((s, it) => s + it.price * it.quantity, 0);
  const deliveryFee =
    input.serviceType === "ANTERIN" ? (input.deliveryFee ?? 2000) : 0;
  const totalAmount = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      warungId: input.warungId,
      buyerName: input.buyerName,
      buyerId: input.buyerId ?? null,
      serviceType: input.serviceType,
      paymentMethod: input.paymentMethod,
      customNote: input.customNote ?? null,
      subtotal,
      deliveryFee,
      totalAmount,
      items: { create: input.items },
    },
    include: { items: true },
  });
  return toOrderDTO(order);
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return o ? toOrderDTO(o) : null;
}

export async function getOrdersForWarung(
  warungId: string,
  onlyActive = false,
): Promise<OrderDTO[]> {
  const where = onlyActive
    ? { warungId, status: { in: ["PENDING", "DIPROSES", "SIAP"] as OrderStatus[] } }
    : { warungId };
  const list = await prisma.order.findMany({
    where,
    include: { items: true },
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
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return o ? toOrderDTO(o) : null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderDTO> {
  const o = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  return toOrderDTO(o);
}
