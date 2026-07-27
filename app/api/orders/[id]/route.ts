import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

// Buyer tracking polling: current order state.
export const dynamic = "force-dynamic";

export const GET = withRateLimit(
  RATE_LIMIT.POLLING,
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, warung: true },
    });
    if (!order) return NextResponse.json({ order: null }, { status: 404 });
    return NextResponse.json({ order });
  },
);
