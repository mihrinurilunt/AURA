"use client";

import { useEffect, useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import { getCampaignSuggestion } from "@/lib/api";

interface CampaignData {
  body: string;
  tags: string[];
  secondary: Array<{ title: string; body: string }>;
}

export function AiCampaignCard({ productId }: { productId: string }) {
  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCampaignSuggestion(productId);
      if (res) {
        setData({
          body: res.suggestion || "",
          tags: [],
          secondary: [],
        });
      }
    } catch (err) {
      setError("Kampanya önerisi yüklenemedi. Lütfen tekrar deneyiniz.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [productId]);

  const handleApplyCampaign = async () => {
    if (!data) return;
    setApplying(true);
    try {
      // Copy suggestion to clipboard or show as toast
      const text = data.body.replace(/\s*\[Ürün ref:.*?\]\s*$/, "");
      alert(`Kampanya metni kopyalandı:\n\n${text}`);
    } catch (err) {
      alert("Kampanya uygulanırken hata oluştu");
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-card border border-aura-purple-light bg-white p-6 shadow-aura">
        <div className="mb-3 flex items-center gap-2 text-aura-purple">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">✦ AI Kampanya Önerisi</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-full rounded bg-aura-purple-light/30"></div>
          <div className="h-4 w-4/5 rounded bg-aura-purple-light/30"></div>
          <div className="h-4 w-3/4 rounded bg-aura-purple-light/30"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-red-200 bg-red-50 p-6 shadow-aura">
        <p className="text-sm font-semibold text-red-700">⚠️ Hata</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchCampaign}
          className="mt-4 flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RotateCcw className="h-4 w-4" />
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-card border border-aura-pink-light/40 bg-aura-page p-4 text-sm text-aura-text-secondary">
        Kampanya verisi yüklenemedi
      </div>
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
          onClick={handleApplyCampaign}
          disabled={applying}
          className="mt-5 w-full rounded-full bg-aura-purple px-4 py-2.5 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-pink disabled:opacity-50"
        >
          {applying ? "Uygulanıyor..." : "Kampanyayı Uygula"}
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