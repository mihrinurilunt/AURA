"use client";

import type { Shipment } from "@/types";
import { TrackingTimeline } from "@/components/shipping/TrackingTimeline";
import { AlertTriangle } from "lucide-react";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <div className="rounded-card border border-white bg-white p-5 shadow-aura transition hover:border-aura-pink-light">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-aura-text-primary">
            {shipment.customerName}
          </p>
          <p className="text-xs font-mono text-aura-text-secondary">
            {shipment.orderNumber}
          </p>
          <p className="text-sm text-aura-text-secondary">{shipment.productName}</p>
        </div>
        <div className="flex-1 border-t border-aura-pink-light/40 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-aura-purple">
            {shipment.carrier}
          </p>
          <p className="mt-1 font-mono text-sm text-aura-text-primary">
            {shipment.trackingNumber}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-3 lg:items-end">
          <TrackingTimeline current={shipment.currentStep} />
          <div className="flex flex-wrap items-center gap-2">
            {shipment.delayed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Gecikme bekleniyor
              </span>
            )}
            {shipment.delayed && (
              <button
                type="button"
                className="rounded-full border border-aura-pink-light px-3 py-1 text-xs font-semibold text-aura-pink transition hover:border-aura-purple hover:text-aura-purple"
              >
                Müşteriye Bildir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
