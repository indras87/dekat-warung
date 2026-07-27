"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/warung-admin", label: "Kasir", icon: "🧾", exact: true },
  { href: "/warung-admin/stok", label: "Stok", icon: "📦", exact: false },
  { href: "/warung-admin/produk", label: "Produk", icon: "🛍️", exact: false },
  { href: "/warung-admin/pengaturan", label: "Atur", icon: "⚙️", exact: false },
];

export function MerchantBottomBar({ warungId }: { warungId: string }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ink text-white h-16 grid grid-cols-4 z-30 rounded-t-pill">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={`${t.href}?w=${warungId}`}
            className={`flex flex-col items-center justify-center text-xs ${
              active ? "text-lime font-black" : "text-mute font-semibold"
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="mt-0.5">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
