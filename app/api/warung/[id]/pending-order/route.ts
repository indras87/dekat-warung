import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Merchant alert polling: newest PENDING order for a warung.
// Force-dynamic so polling always hits the DB.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { warungId: id, status: "PENDING" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ order });
}
