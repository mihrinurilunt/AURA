"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { mockDonutSegments, mockTotalOrdersCenter } from "@/lib/mock-data";

export function DonutChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="rounded-card border border-white bg-white p-5 shadow-aura">
        <div className="mb-2 h-6 w-40 animate-pulse rounded bg-aura-page" />
        <div className="h-64 animate-pulse rounded-xl bg-aura-page" />
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white bg-white p-5 shadow-aura">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-aura-text-primary">
          Sipariş dağılımı
        </h2>
      </div>
      <div className="relative h-64 min-h-[256px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockDonutSegments}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
            >
              {mockDonutSegments.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                typeof value === "number" ? `%${value}` : `${value}`,
                "Oran",
              ]}
              contentStyle={{
                borderRadius: 12,
                borderColor: "#F4C0D1",
                boxShadow: "0 2px 8px rgba(212,83,126,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-aura-text-secondary">
            Toplam sipariş
          </p>
          <p className="text-3xl font-semibold text-aura-text-primary">
            {mockTotalOrdersCenter}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        {mockDonutSegments.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-aura-text-secondary">{s.name}</span>
            <span className="font-semibold text-aura-text-primary">
              %{s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
