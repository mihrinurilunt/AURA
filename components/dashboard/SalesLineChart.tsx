"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySalesPoint } from "@/types";
import { mockMonthlySales } from "@/lib/mock-data";

type Cat = "Tümü" | "Çorap" | "Şal" | "Takı" | "Diğer";

function buildChartData(
  rows: MonthlySalesPoint[],
  category: Cat,
): { month: string; sales: number }[] {
  return rows.map((r) => {
    let sales = 0;
    if (category === "Tümü") {
      sales = r["Çorap"] + r["Şal"] + r["Takı"] + r["Diğer"];
    } else {
      sales = r[category as keyof Omit<MonthlySalesPoint, "month">];
    }
    return { month: r.month, sales };
  });
}

const filters: Cat[] = ["Tümü", "Çorap", "Şal", "Takı", "Diğer"];

export function SalesLineChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [cat, setCat] = useState<Cat>("Tümü");
  const data = useMemo(
    () => buildChartData(mockMonthlySales, cat),
    [cat],
  );

  if (!mounted) {
    return (
      <div className="rounded-card border border-white bg-white p-5 shadow-aura">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-aura-page" />
        <div className="h-64 animate-pulse rounded-xl bg-aura-page" />
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white bg-white p-5 shadow-aura">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-aura-text-primary">
          Aylık satış (adet)
        </h2>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setCat(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                f === cat
                  ? "bg-aura-pink text-white shadow-aura"
                  : "bg-aura-page text-aura-text-secondary hover:bg-aura-pink-bg hover:text-aura-pink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 min-h-[256px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" />
            <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} width={36} />
            <Tooltip
              cursor={{ stroke: "#F4C0D1" }}
              contentStyle={{
                borderRadius: 12,
                borderColor: "#F4C0D1",
                boxShadow: "0 2px 8px rgba(212,83,126,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#D4537E"
              strokeWidth={3}
              dot={{ r: 4, fill: "#D4537E", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#7C3AED" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
