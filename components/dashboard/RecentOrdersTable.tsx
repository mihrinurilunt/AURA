"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { CancelOrderModal } from "@/components/dashboard/CancelOrderModal";
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

export function RecentOrdersTable({
  orders,
  onOrdersChange,
}: {
  orders: Order[];
  onOrdersChange: (next: Order[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

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
              const first = o.items?.[0];
              const customer = o.customer;
              return (
                <tr key={o.id} className="align-middle">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={first?.imageUrl ?? "/placeholder-product.png"}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-aura-pink-light/60"
                      />
                      <span className="font-medium text-aura-text-primary">
                        {first?.name ?? "Ürün bilgisi yok"}
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
                        src={customer?.avatarUrl ?? "/avatar-placeholder.png"}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="max-w-[160px] truncate text-aura-text-primary">
                        {customer?.name ?? "Bilinmeyen müşteri"}
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

      <CancelOrderModal
        open={open}
        order={target}
        onClose={() => {
          setOpen(false);
          setTarget(null);
        }}
        onSuccess={(orderId) => {
          onOrdersChange(orders.filter((x) => x.id !== orderId));
          setToast("Sipariş iptal edildi, müşteriye mesaj gönderildi ✓");
        }}
      />

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[60] max-w-md -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-center text-sm font-medium text-emerald-900 shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
