import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  // Middleware sudah proteksi route ini - hanya user WARUNG yang bisa akses
  const warung = await getCurrentMerchantWarung();
  if (!warung) return null;
  return <SettingsClient warung={warung} />;
}
