"use client";

import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

const items = [
  {
    label: "Toplam satış",
    value: "1,284 ürün",
    change: 12,
    icon: ShoppingBag,
  },
  {
    label: "Toplam müşteri",
    value: "342 kişi",
    change: 5,
    icon: Users,
  },
  {
    label: "Aktif ürün çeşidi",
    value: "47 ürün",
    change: -2,
    icon: Package,
  },
  {
    label: "Bu ay gelir",
    value: "₺28,450",
    change: 18,
    icon: TrendingUp,
  },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, change, icon: Icon }) => {
        const positive = change >= 0;
        const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
        return (
          <div
            key={label}
            className="group rounded-card border border-white bg-white p-5 shadow-aura transition duration-200 hover:-translate-y-0.5 hover:border-aura-pink-light hover:shadow-lg hover:shadow-aura-pink/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-aura-text-secondary">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-aura-text-primary">
                  {value}
                </p>
              </div>
              <span className="rounded-2xl bg-aura-purple-bg p-3 text-aura-purple transition group-hover:bg-aura-pink-bg group-hover:text-aura-pink">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <div
              className={`mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {positive ? "+" : ""}
              {change}% geçen aya göre
            </div>
          </div>
        );
      })}
    </div>
  );
}
