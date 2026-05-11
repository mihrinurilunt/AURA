"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Truck,
  Sparkles,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/products", label: "Ürünler", icon: Package },
  { href: "/chat", label: "AI Sohbet", icon: MessageCircle },
  { href: "/shipping", label: "Kargo", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-aura-pink-light/40 bg-white shadow-aura">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-card bg-gradient-to-br from-aura-pink to-aura-purple text-white shadow-aura">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-aura-purple">
            AURA
          </p>
          <p className="text-sm font-semibold text-aura-text-primary">
            Mağaza Paneli
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-aura-pink-bg text-aura-pink shadow-aura"
                  : "text-aura-text-secondary hover:bg-aura-purple-bg hover:text-aura-purple"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                  active ? "text-aura-pink" : ""
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-aura-pink-light/50 p-4 text-xs text-aura-text-secondary">
        Kadın girişimciler için AI destekli yönetim.
      </div>
    </aside>
  );
}
