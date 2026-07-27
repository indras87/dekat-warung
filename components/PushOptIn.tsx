"use client";

/**
 * Komponen PushOptIn - Tombol aktifkan notifikasi push
 * Menampilkan status izin notifikasi dan handle subscribe/unsubscribe.
 */
import { useEffect, useState } from "react";

type PermissionState = "granted" | "denied" | "default" | "not-supported";

export function PushOptIn() {
  const [permission, setPermission] =
    useState<PermissionState>("default");
  const [loading, setLoading] = useState(false);

  // Cek dukungan dan izin saat mount
  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("not-supported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // Dengar perubahan izin (bila user ubah dari pengaturan browser)
    const handler = () => setPermission(Notification.permission as PermissionState);
    // @ts-ignore - Notification.onpermissionchange belum standar
    Notification.onpermissionchange = handler;
    return () => {
      // @ts-ignore
      Notification.onpermissionchange = null;
    };
  }, []);

  /** Minta izin dan subscribe ke push */
  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Browser Anda tidak mendukung notifikasi push.");
      return;
    }

    setLoading(true);
    try {
      // Minta izin notifikasi
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        return; // User tolak
      }

      // Dapatkan service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe ke push dengan VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("[PushOptIn] NEXT_PUBLIC_VAPID_PUBLIC_KEY tidak diset");
        return;
      }

      // Convert base64 ke Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey) as BufferSource;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Kirim subscription ke server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      console.log("[PushOptIn] Berhasil subscribe");
    } catch (error) {
      console.error("[PushOptIn] Gagal subscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan pesan bila tidak didukung
  if (permission === "not-supported") {
    return (
      <div className="bg-canvas-soft rounded-pill px-4 py-2 text-sm text-mute">
        Notifikasi tidak didukung di browser ini.
      </div>
    );
  }

  // Tampilkan pesan bila sudah granted
  if (permission === "granted") {
    return (
      <div className="bg-lime-pale text-ink rounded-pill px-4 py-2 text-sm font-bold">
        🔔 Notifikasi aktif
      </div>
    );
  }

  // Tampilkan pesan bila denied
  if (permission === "denied") {
    return (
      <div className="bg-negative/10 text-negative rounded-pill px-4 py-2 text-sm">
        Notifikasi diblokir. Aktifkan di pengaturan browser.
      </div>
    );
  }

  // Default - tampilkan tombol
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-lime hover:bg-lime-hover text-ink-deep font-black rounded-pill px-4 py-2 text-sm transition-colors disabled:opacity-50"
    >
      {loading ? "Memproses..." : "🔔 Aktifkan Notifikasi"}
    </button>
  );
}

/** Helper untuk convert VAPID key (base64) ke Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
