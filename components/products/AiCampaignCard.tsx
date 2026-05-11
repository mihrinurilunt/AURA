"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getCampaignSuggestion } from "@/lib/api";
import type { CampaignSuggestion } from "@/types";

export function AiCampaignCard({ productId }: { productId: string }) {
  const [data, setData] = useState<CampaignSuggestion | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getCampaignSuggestion(productId);
      if (!cancelled) setData(res);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!data) {
    return (
      <div className="h-64 animate-pulse rounded-card bg-aura-purple-bg" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-aura-purple-light bg-white p-6 shadow-aura">
        <div className="mb-3 flex items-center gap-2 text-aura-purple">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">✦ AI Kampanya Önerisi</h2>
        </div>
        <p className="text-sm leading-relaxed text-aura-text-primary">
          {data.body.replace(/\s*\[Ürün ref:.*?\]\s*$/, "")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-aura-purple-bg px-3 py-1 text-xs font-semibold text-aura-purple"
            >
              {t}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-full bg-aura-purple px-4 py-2.5 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-pink"
        >
          Kampanyayı Uygula
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.secondary.map((s) => (
          <div
            key={s.title}
            className="rounded-card border border-aura-pink-light/40 bg-aura-page/80 p-4 text-sm text-aura-text-secondary opacity-90"
          >
            <p className="font-semibold text-aura-text-primary">{s.title}</p>
            <p className="mt-1 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
