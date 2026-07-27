"use client";

import { useState } from "react";
import { updateWarungSettings, type WarungDTO } from "@/lib/actions/warung";
import { MerchantBottomBar } from "./MerchantBottomBar";
import { ImageUpload } from "./ImageUpload";

/** Halaman pengaturan warung merchant: nama, tarif antar, WhatsApp, foto QRIS, serta toggle layanan & metode pembayaran. */
export function SettingsClient({ warung }: { warung: WarungDTO }) {
  const [namaWarung, setNamaWarung] = useState(warung.namaWarung);
  const [deliveryFee, setDeliveryFee] = useState(warung.deliveryFee);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(
    warung.isDeliveryAvailable,
  );
  const [acceptCash, setAcceptCash] = useState(warung.acceptCash);
  const [acceptQris, setAcceptQris] = useState(warung.acceptQris);
  const [acceptTransfer, setAcceptTransfer] = useState(warung.acceptTransfer);
  const [qrisImageUrl, setQrisImageUrl] = useState(warung.qrisImageUrl ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    warung.whatsappNumber ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /** Handler simpan: memanggil Server Action updateWarungSettings dan menampilkan indikator "Tersimpan". */
  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await updateWarungSettings(warung.id, {
        namaWarung,
        deliveryFee: Number(deliveryFee) || 0,
        isDeliveryAvailable,
        acceptCash,
        acceptQris,
        acceptTransfer,
        qrisImageUrl: qrisImageUrl.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium";
  const label = "text-sm font-bold text-ink block mb-1";

  return (
    <main className="bg-canvas-soft min-h-screen p-4 pb-24 space-y-4">
      <header className="bg-ink text-lime px-5 py-4 rounded-pill">
        <h1 className="text-xl font-black">Pengaturan Warung</h1>
      </header>

      <section className="bg-canvas-pure rounded-pill p-5 space-y-4">
        <div>
          <label htmlFor="nama" className={label}>
            Nama Warung
          </label>
          <input
            id="nama"
            value={namaWarung}
            onChange={(e) => setNamaWarung(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="fee" className={label}>
            Tarif Antar (Rp)
          </label>
          <input
            id="fee"
            type="number"
            inputMode="numeric"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="wa" className={label}>
            Nomor WhatsApp (untuk tombol hubungi)
          </label>
          <input
            id="wa"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="62812xxxxxxx"
            className={field}
          />
        </div>

        <div>
          <ImageUpload
            value={qrisImageUrl || null}
            onChange={(url) => setQrisImageUrl(url ?? "")}
            label="Foto QRIS (opsional)"
            placeholder="https://…/qris.png"
            disabled={saving}
          />
        </div>
      </section>

      {/* Toggles */}
      <section className="bg-canvas-pure rounded-pill p-5 space-y-3">
        <h2 className="text-lg font-black text-ink">Layanan & Pembayaran</h2>
        <Toggle
          label="🛵 Aktifkan Anterin (delivery)"
          checked={isDeliveryAvailable}
          onChange={setIsDeliveryAvailable}
        />
        <Toggle label="💵 Terima Cash" checked={acceptCash} onChange={setAcceptCash} />
        <Toggle label="📱 Terima QRIS" checked={acceptQris} onChange={setAcceptQris} />
        <Toggle
          label="🏦 Terima Transfer"
          checked={acceptTransfer}
          onChange={setAcceptTransfer}
        />
      </section>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full h-14 bg-lime text-ink font-black text-lg rounded-pill hover:bg-lime-hover transition-colors disabled:opacity-50"
      >
        {saving ? "Menyimpan…" : "Simpan Perubahan"}
      </button>
      {saved && (
        <p className="text-center text-sm font-bold text-positive-deep">
          ✓ Tersimpan
        </p>
      )}

      <MerchantBottomBar warungId={warung.id} />
    </main>
  );
}

/** Saklar on/off berlabel yang dipakai pada bagian Layanan & Pembayaran halaman pengaturan. */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full bg-canvas-soft p-3 rounded-xl flex justify-between items-center font-bold text-ink"
    >
      <span>{label}</span>
      <span
        className={`w-12 h-7 rounded-full relative transition-colors ${
          checked ? "bg-lime" : "bg-mute"
        }`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
