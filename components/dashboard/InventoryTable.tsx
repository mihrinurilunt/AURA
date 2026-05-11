"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import type { Product } from "@/types";

export function InventoryTable({ products }: { products: Product[] }) {
  return (
    <div className="rounded-card border border-white bg-white p-5 shadow-aura">
      <h2 className="mb-4 text-lg font-semibold text-aura-text-primary">
        Ürün envanteri özeti
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-aura-text-secondary">
              <th className="pb-3 pr-4 font-semibold">Ürün</th>
              <th className="pb-3 pr-4 font-semibold">Ürün adı</th>
              <th className="pb-3 pr-4 font-semibold">Ürün ID</th>
              <th className="pb-3 pr-4 font-semibold">Kalan stok</th>
              <th className="pb-3 font-semibold">Düzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aura-pink-light/40">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-aura-pink-light/50"
                  />
                </td>
                <td className="py-3 pr-4 font-medium text-aura-text-primary">
                  {p.name}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-aura-text-secondary">
                  {p.id}
                </td>
                <td
                  className={`py-3 pr-4 font-semibold ${
                    p.stock < 10 ? "text-rose-600" : "text-aura-text-primary"
                  }`}
                >
                  {p.stock}
                </td>
                <td className="py-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1 rounded-full border border-aura-pink-light px-3 py-1.5 text-xs font-semibold text-aura-pink transition hover:border-aura-purple hover:text-aura-purple"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
