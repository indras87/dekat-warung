import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dekat Warung — Quick Commerce Tetangga",
  description:
    "Hyper-local quick commerce untuk warung kelontong sekitar (radius ≤ 200m). PWA Pembeli & Terminal Warung.",
  applicationName: "Dekat Warung",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dekat Warung",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0f0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * Root layout aplikasi: membungkus seluruh halaman dengan Providers dan
 * menetapkan metadata global serta viewport PWA (lang "id", tema Wise).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-canvas-soft text-ink min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
