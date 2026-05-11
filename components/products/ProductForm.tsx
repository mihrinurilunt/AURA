"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import type { ProductCategory } from "@/types";

const categories: ProductCategory[] = [
  "Çorap",
  "Şal",
  "Takı",
  "Çanta",
  "Diğer",
];

const placeholder = "https://picsum.photos/seed/aura-upload/400/400";

export function ProductForm() {
  const [drag, setDrag] = useState(false);
  const [active, setActive] = useState(true);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  return (
    <form
      className="space-y-4 rounded-card border border-white bg-white p-6 shadow-aura"
      onSubmit={(e) => e.preventDefault()}
    >
      <h2 className="text-lg font-semibold text-aura-text-primary">
        Yeni / düzenle ürün
      </h2>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Ürün adı
        </label>
        <input
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          placeholder="Örn. Akdeniz Termal Çorap"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Kategori
        </label>
        <select className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light">
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Fiyat
        </label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-aura-text-secondary">
            ₺
          </span>
          <input
            type="number"
            className="w-full rounded-xl border border-aura-pink-light/70 bg-aura-page py-2 pl-8 pr-3 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Stok adedi
        </label>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Açıklama
        </label>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          placeholder="Kumaş, ölçü, bakım talimatları..."
        />
      </div>
      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Ürün görseli
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-4 py-8 text-center transition ${
            drag
              ? "border-aura-purple bg-aura-purple-bg"
              : "border-aura-pink-light bg-aura-page hover:border-aura-pink"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={placeholder}
            alt=""
            className="h-28 w-28 rounded-xl object-cover shadow-aura"
          />
          <div className="flex items-center gap-2 text-sm text-aura-text-secondary">
            <Upload className="h-4 w-4 text-aura-purple" />
            Sürükleyip bırakın veya tıklayın (şimdilik önizleme)
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-aura-purple-bg px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-aura-text-primary">
            Aktif ürün
          </p>
          <p className="text-xs text-aura-text-secondary">
            Pasif ürünler vitrinde görünmez.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setActive((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition ${
            active ? "bg-aura-pink" : "bg-aura-text-secondary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              active ? "left-6" : "left-0.5"
            }`}
          />
        </button>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-full bg-aura-pink px-5 py-2.5 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-purple"
        >
          Kaydet
        </button>
        <button
          type="button"
          className="rounded-full border border-aura-pink-light px-5 py-2.5 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
