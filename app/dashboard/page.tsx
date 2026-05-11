"use client";

import { useEffect, useState } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { CelebrationBanner } from "@/components/dashboard/CelebrationBanner";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { SalesLineChart } from "@/components/dashboard/SalesLineChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { getOrders, getProducts } from "@/lib/api";
import type { Order, Product } from "@/types";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [o, p] = await Promise.all([getOrders(), getProducts()]);
      if (!cancelled) {
        setOrders(o);
        setProducts(p);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <KpiCards />
      <CelebrationBanner />
      <div className="grid gap-6 lg:grid-cols-2">
        <DonutChart />
        <SalesLineChart />
      </div>
      {orders.length > 0 && <RecentOrdersTable orders={orders} />}
      {products.length > 0 && <InventoryTable products={products} />}
    </div>
  );
}
