import { STATUS_LABEL, STATUS_EMOJI } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

const STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-warning text-ink",
  DIPROSES: "bg-ink text-lime",
  SIAP: "bg-lime text-ink",
  SELESAI: "bg-lime-pale text-positive-deep",
  BATAL: "bg-negative text-white",
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatus;
  size?: "sm" | "md";
}) {
  const pad = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-block ${pad} font-black rounded-full ${STYLE[status]}`}
    >
      {STATUS_EMOJI[status]} {STATUS_LABEL[status]}
    </span>
  );
}
