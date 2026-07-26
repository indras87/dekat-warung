import Link from "next/link";
import { getDefaultMerchantWarung } from "@/lib/actions/warung";
import { getOrdersForWarung } from "@/lib/actions/order";
import { MerchantTerminalClient } from "@/components/MerchantTerminalClient";

export default async function TerminalPage() {
  const warung = await getDefaultMerchantWarung();
  if (!warung) {
    return (
      <main className="bg-canvas-soft min-h-screen p-4">
        <div className="bg-canvas-pure rounded-pill p-6 text-center space-y-3">
          <p className="text-lg font-black text-ink">Belum ada warung</p>
          <p className="text-sm text-body">
            Jalankan <code>npm run db:seed</code> untuk membuat data warung demo.
          </p>
          <Link
            href="/"
            className="inline-block bg-lime text-ink font-black h-12 px-6 rounded-full leading-[3rem]"
          >
            Ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const orders = await getOrdersForWarung(warung.id, true);
  return <MerchantTerminalClient warung={warung} initialOrders={orders} />;
}
