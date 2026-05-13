"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { createProduct } from "@/lib/api";
import type { ProductCategory } from "@/types";

const categories: ProductCategory[] = [
  "Çorap",
  "Şal",
  "Takı",
  "Çanta",
  "Diğer",
];

const placeholder = "https://picsum.photos/seed/aura-upload/400/400";

interface FormState {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  active: boolean;
}

export function ProductForm() {
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    category: "Çorap",
    price: 0,
    stock: 0,
    description: "",
    imageUrl: placeholder,
    active: true,
  });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    // In a real app, you'd process the dropped files here
  }, []);

  const handleInputChange = (
    field: keyof FormState,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!form.name.trim()) {
        setError("Ürün adı gereklidir");
        return;
      }
      if (form.price <= 0) {
        setError("Fiyat 0'dan büyük olmalıdır");
        return;
      }
      if (form.stock < 0) {
        setError("Stok sayısı negatif olamaz");
        return;
      }

      await createProduct({
        name: form.name,
        category: form.category,
        price: form.price,
        stock: form.stock,
        description: form.description,
        //imageUrl: form.imageUrl,
        //active: form.active,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset form
      setForm({
        name: "",
        category: "Çorap",
        price: 0,
        stock: 0,
        description: "",
        imageUrl: placeholder,
        active: true,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ürün kaydedilirken hata oluştu",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      category: "Çorap",
      price: 0,
      stock: 0,
      description: "",
      imageUrl: placeholder,
      active: true,
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <form
      className="space-y-4 rounded-card border border-white bg-white p-6 shadow-aura"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-semibold text-aura-text-primary">
        Yeni / düzenle ürün
      </h2>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Ürün başarıyla kaydedildi!
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Ürün adı
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          placeholder="Örn. Akdeniz Termal Çorap"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Kategori
        </label>
        <select
          value={form.category}
          onChange={(e) =>
            handleInputChange("category", e.target.value as ProductCategory)
          }
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
        >
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
            value={form.price}
            onChange={(e) => handleInputChange("price", Number(e.target.value))}
            className="w-full rounded-xl border border-aura-pink-light/70 bg-aura-page py-2 pl-8 pr-3 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Stok adedi
        </label>
        <input
          type="number"
          value={form.stock}
          onChange={(e) => handleInputChange("stock", Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-aura-pink-light/70 bg-aura-page px-3 py-2 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          min="0"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-aura-text-secondary">
          Açıklama
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
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
            src={form.imageUrl}
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
          aria-checked={form.active}
          onClick={() => handleInputChange("active", !form.active)}
          className={`relative h-7 w-12 rounded-full transition ${
            form.active ? "bg-aura-pink" : "bg-aura-text-secondary/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              form.active ? "left-6" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-aura-pink px-5 py-2.5 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-purple disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-aura-pink-light px-5 py-2.5 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
