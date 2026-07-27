"use client";

import { useEffect } from "react";
import { CartProvider } from "@/lib/cart";

/**
 * Pembungkus provider root aplikasi: menyediakan CartProvider dan mendaftarkan
 * Service Worker (/sw.js) saat window load, hanya di lingkungan produksi.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Registrasi Service Worker hanya di produksi
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    /** Mendaftarkan /sw.js sebagai Service Worker dan mencatat hasil/skenario gagal di konsol. */
    const registerSW = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW terdaftar:", registration.scope);
        })
        .catch((err) => {
          console.error("SW gagal diregistrasi:", err);
        });
    };

    // Tunggu window load untuk memastikan SW terdaftar setelah semua resource selesai
    window.addEventListener("load", registerSW);
    return () => window.removeEventListener("load", registerSW);
  }, []);

  return <CartProvider>{children}</CartProvider>;
}
