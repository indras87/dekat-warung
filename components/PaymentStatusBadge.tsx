import type { PaymentStatus } from "@prisma/client";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_EMOJI } from "@/lib/constants";

type Props = {
  status: PaymentStatus;
};

const BADGE_STYLE: Record<PaymentStatus, string> = {
  BELUM_BAYAR: "bg-canvas-soft text-mute",
  MENUNGGU: "bg-warning text-ink",
  TERKONFIRMASI: "bg-lime-pale text-positive-deep",
  DITOLAK: "bg-[#320707] text-white",
  LUNAS_TUNAI: "bg-lime-pale text-positive-deep",
};

/** Badge berwarna + emoji yang merepresentasikan status pembayaran sebuah pesanan. */
export function PaymentStatusBadge({ status }: Props) {
  return (
    <span
      className={`text-xs font-black px-3 py-1 rounded-full ${BADGE_STYLE[status]}`}
    >
      {PAYMENT_STATUS_EMOJI[status]} {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}
