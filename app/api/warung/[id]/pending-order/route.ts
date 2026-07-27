import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

// Merchant alert polling: newest PENDING order for a warung.
// Force-dynamic so polling always hits the DB.
export const dynamic = "force-dynamic";

/**
 * Endpoint polling notifikasi merchant: mengembalikan order PENDING terbaru pada sebuah warung untuk memicu alert.
 * Diproteksi rate limit POLLING; force-dynamic agar selalu membaca DB.
 */
export const GET = withRateLimit(
  RATE_LIMIT.POLLING,
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { warungId: id, status: "PENDING" },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ order });
  },
);
