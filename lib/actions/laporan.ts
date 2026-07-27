"use server";

import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

/** DTO omzet harian */
export interface DailyRevenueDTO {
  date: string; // "YYYY-MM-DD"
  total: number;
}

/** DTO count per status */
export interface OrderCountByStatusDTO {
  status: OrderStatus;
  count: number;
}

/** DTO produk terlaris */
export interface TopProductDTO {
  productName: string;
  quantity: number;
  totalRevenue: number;
}

/**
 * Omzet harian dalam N hari terakhir (hanya order SELESAI).
 * Kelompokkan per tanggal, jumlahkan totalAmount.
 */
export async function getDailyRevenue(
  warungId: string,
  days: number = 7,
): Promise<DailyRevenueDTO[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      warungId,
      status: "SELESAI",
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by date di JS (YYYY-MM-DD format)
  const byDate = new Map<string, number>();
  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const current = byDate.get(dateKey) ?? 0;
    byDate.set(dateKey, current + order.totalAmount);
  }

  // Convert ke array DTO
  return Array.from(byDate.entries()).map(([date, total]) => ({
    date,
    total,
  }));
}

/**
 * Jumlah order per status untuk warung tertentu.
 * Menggunakan Prisma groupBy.
 */
export async function getOrderCountsByStatus(
  warungId: string,
): Promise<OrderCountByStatusDTO[]> {
  const result = await prisma.order.groupBy({
    by: ["status"],
    where: { warungId },
    _count: true,
  });

  return result.map((item) => ({
    status: item.status,
    count: item._count,
  }));
}

/**
 * Produk terlaris (top N) berdasarkan total quantity dari order SELESAI.
 * Agregasi di JS dengan grouping per productName (snapshot, bukan productId).
 */
export async function getTopProducts(
  warungId: string,
  limit: number = 5,
): Promise<TopProductDTO[]> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        warungId,
        status: "SELESAI",
      },
    },
    select: {
      productName: true,
      quantity: true,
      price: true,
    },
  });

  // Group by productName di JS
  const byName = new Map<string, { quantity: number; totalRevenue: number }>();
  for (const item of orderItems) {
    const current = byName.get(item.productName) ?? { quantity: 0, totalRevenue: 0 };
    byName.set(item.productName, {
      quantity: current.quantity + item.quantity,
      totalRevenue: current.totalRevenue + item.quantity * item.price,
    });
  }

  // Convert ke array, sort descending by quantity, ambil limit
  return Array.from(byName.entries())
    .map(([productName, { quantity, totalRevenue }]) => ({
      productName,
      quantity,
      totalRevenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/**
 * Summary KPI: total omzet N hari terakhir, jumlah order selesai, dan AOV.
 */
export async function getKPI(warungId: string, days: number = 7) {
  const dailyRevenue = await getDailyRevenue(warungId, days);
  const totalRevenue = dailyRevenue.reduce((sum, item) => sum + item.total, 0);

  const statusCounts = await getOrderCountsByStatus(warungId);
  const completedCount = statusCounts.find((c) => c.status === "SELESAI")?.count ?? 0;

  const aov = completedCount > 0 ? totalRevenue / completedCount : 0;

  return {
    totalRevenue,
    completedCount,
    aov,
  };
}
