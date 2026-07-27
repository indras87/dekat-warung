import { getCurrentMerchantWarung } from "@/lib/actions/warung";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

/**
 * Halaman Pengaturan untuk role WARUNG: server component yang mengambil data
 * warung yang login lalu merender SettingsClient untuk mengelola profil,
 * jam buka, dan metode pembayaran.
 */
export default async function PengaturanPage() {
  // Middleware sudah proteksi route ini - hanya user WARUNG yang bisa akses
  const warung = await getCurrentMerchantWarung();
  if (!warung) return null;
  return <SettingsClient warung={warung} />;
}
