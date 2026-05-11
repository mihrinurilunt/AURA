"use client";

import { useEffect, useMemo, useState } from "react";
import { ShipmentCard } from "@/components/shipping/ShipmentCard";
import { getShipments } from "@/lib/api";
import type { Shipment } from "@/types";

export default function ShippingPage() {
  const [items, setItems] = useState<Shipment[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getShipments();
      if (!cancelled) setItems(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const pending = items.filter((s) => s.currentStep === "preparing").length;
    const inTransit = items.filter(
      (s) => s.currentStep === "shipped" || s.currentStep === "out_for_delivery",
    ).length;
    const delivered = items.filter((s) => s.currentStep === "delivered").length;
    return { pending, inTransit, delivered };
  }, [items]);

  const cards = [
    { label: "Bekleyen", value: summary.pending },
    { label: "Yolda", value: summary.inTransit },
    { label: "Teslim", value: summary.delivered },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-card border border-white bg-white p-5 shadow-aura transition hover:border-aura-pink-light"
          >
            <p className="text-sm text-aura-text-secondary">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-aura-text-primary">
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {items.map((s) => (
          <ShipmentCard key={s.id} shipment={s} />
        ))}
      </div>
    </div>
  );
}
