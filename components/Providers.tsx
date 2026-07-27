"use client";

import { useEffect } from "react";
import { CartProvider } from "@/lib/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  // Registrasi Service Worker hanya di produksi
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

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
