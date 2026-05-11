"use client";

import { ProductForm } from "@/components/products/ProductForm";
import { AiCampaignCard } from "@/components/products/AiCampaignCard";
import { mockProducts } from "@/lib/mock-data";

export default function ProductsPage() {
  const featuredId = mockProducts[0]?.id ?? "PRD-1001";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ProductForm />
      <AiCampaignCard productId={featuredId} />
    </div>
  );
}
