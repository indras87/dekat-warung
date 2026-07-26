import { getDefaultMerchantWarung } from "@/lib/actions/warung";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const warung = await getDefaultMerchantWarung();
  if (!warung) return null;
  return <SettingsClient warung={warung} />;
}
