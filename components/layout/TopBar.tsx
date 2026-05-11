"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Genel Bakış",
  "/products": "Ürün Yönetimi",
  "/chat": "Müşteri & AI Sohbet",
  "/shipping": "Kargo Takip",
};

export function TopBar() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] ??
    "AURA";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-aura-pink-light/40 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-aura-purple">
          Hoş geldin
        </p>
        <h1 className="text-xl font-semibold text-aura-text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aura-text-secondary" />
          <input
            type="search"
            placeholder="Hızlı ara..."
            className="w-56 rounded-full border border-aura-pink-light/60 bg-aura-page py-2 pl-9 pr-3 text-sm text-aura-text-primary outline-none transition hover:border-aura-pink/50 focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          />
        </div>
        <button
          type="button"
          className="relative rounded-full border border-transparent p-2 text-aura-text-secondary transition hover:border-aura-pink-light hover:text-aura-pink"
          aria-label="Bildirimler"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-aura-pink" />
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-aura-pink-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/aura-founder/72/72"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
