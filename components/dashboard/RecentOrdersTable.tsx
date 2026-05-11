"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Order, OrderStatus } from "@/types";

function statusLabel(s: OrderStatus) {
  if (s === "received") return "Sipariş alındı";
  if (s === "shipping") return "Kargoda";
  return "Teslim edildi";
}

function statusClass(s: OrderStatus) {
  if (s === "received")
    return "bg-aura-pink-bg text-aura-pink border border-aura-pink-light/60";
  if (s === "shipping")
    return "bg-aura-purple-light text-aura-purple border border-aura-purple/20";
  return "bg-emerald-50 text-emerald-700 border border-emerald-100";
}

export function RecentOrdersTable({ orders }: { orders: Order[] }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Order | null>(null);

  return (
    <div className="rounded-card border border-white bg-white p-5 shadow-aura">
      <h2 className="mb-4 text-lg font-semibold text-aura-text-primary">
        Son siparişler
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-aura-text-secondary">
              <th className="pb-3 pr-4 font-semibold">Müşteri</th>
              <th className="pb-3 pr-4 font-semibold">Sipariş No</th>
              <th className="pb-3 pr-4 font-semibold">Ürün</th>
              <th className="pb-3 pr-4 font-semibold">Kategori</th>
              <th className="pb-3 pr-4 font-semibold">Adet</th>
              <th className="pb-3 pr-4 font-semibold">Tarih</th>
              <th className="pb-3 pr-4 font-semibold">Durum</th>
              <th className="pb-3 font-semibold">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aura-pink-light/40">
            {orders.map((o) => {
              const first = o.items[0];
              return (
                <tr key={o.id} className="align-middle">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.customer.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-aura-pink-light/60"
                      />
                      <span className="font-medium text-aura-text-primary">
                        {o.customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-aura-text-secondary">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={first.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="max-w-[160px] truncate text-aura-text-primary">
                        {first.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-aura-text-secondary">
                    {o.category}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-aura-text-primary">
                    {o.totalQuantity}
                  </td>
                  <td className="py-3 pr-4 text-aura-text-secondary">{o.date}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                        o.status,
                      )}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Siparişi iptal et"
                      onClick={() => {
                        setTarget(o);
                        setOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-aura-text-primary">
                  Sipariş iptali
                </h3>
                <p className="mt-2 text-sm text-aura-text-secondary">
                  Siparişi iptal edip müşteriye mesaj gönderilsin mi?
                </p>
                {target && (
                  <p className="mt-2 text-xs font-mono text-aura-text-secondary">
                    {target.orderNumber} — {target.customer.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-aura-text-secondary hover:bg-aura-page"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-aura-pink-light px-4 py-2 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
                onClick={() => setOpen(false)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="rounded-full bg-aura-pink px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-purple"
                onClick={() => setOpen(false)}
              >
                Evet, iptal et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
