"use client";

import { Check } from "lucide-react";
import type { ShipmentStep } from "@/types";

const steps: { key: ShipmentStep; label: string }[] = [
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "shipped", label: "Kargoya Verildi" },
  { key: "out_for_delivery", label: "Dağıtımda" },
  { key: "delivered", label: "Teslim Edildi" },
];

export function TrackingTimeline({ current }: { current: ShipmentStep }) {
  const idx = steps.findIndex((s) => s.key === current);
  const allComplete = current === "delivered";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-start justify-between gap-2">
        {steps.map((s, i) => {
          const done = allComplete || i < idx;
          const active = !allComplete && i === idx;
          return (
            <div key={s.key} className="flex flex-1 flex-col items-center text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  done
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : active
                      ? "border-aura-pink bg-aura-pink text-white shadow-aura"
                      : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : active ? "●" : i + 1}
              </div>
              <p
                className={`mt-2 text-[11px] font-medium leading-tight ${
                  active
                    ? "text-aura-pink"
                    : done
                      ? "text-emerald-700"
                      : "text-aura-text-secondary"
                }`}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
