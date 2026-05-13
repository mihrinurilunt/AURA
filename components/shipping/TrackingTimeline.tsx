"use client";

import { Check } from "lucide-react";
import type { ShipmentStep } from "@/types";

const allSteps: { key: ShipmentStep; label: string }[] = [
  { key: "hazirlaniyor", label: "Hazırlanıyor" },
  { key: "kargoya_verildi", label: "Kargoya Verildi" },
  { key: "dagitimda", label: "Dağıtımda" },
  { key: "teslim_edildi", label: "Teslim Edildi" },
];

export function TrackingTimeline({ steps }: { steps: ShipmentStep[] }) {
  const activeKey = steps[steps.length - 1] ?? "";
  const allComplete = activeKey === "teslim_edildi";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-start justify-between gap-2">
        {allSteps.map((step, i) => {
          const done = steps.includes(step.key) && step.key !== activeKey;
          const active = !allComplete && step.key === activeKey;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center text-center">
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
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
