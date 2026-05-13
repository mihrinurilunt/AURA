"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cancelOrderWithAiMessage, cancelOrder } from "@/lib/api";
import type { Order } from "@/types";

const CANCEL_REASONS = [
  "Stok tükendi",
  "Ürün hasarlı / kalite sorunu",
  "Kargo sorunu",
  "Satıcı kaynaklı hata",
  "Diğer",
] as const;

type CancelReason = (typeof CANCEL_REASONS)[number];

export function CancelOrderModal({
  open,
  order,
  onClose,
  onSuccess,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<CancelReason | "">("");
  const [customReason, setCustomReason] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const reset = useCallback(() => {
    setStep(1);
    setReason("");
    setCustomReason("");
    setAiMessage("");
    setStepError(null);
    setLoadingPreview(false);
  }, []);

  useEffect(() => {
    if (open && order) {
      reset();
    }
  }, [open, order?.id, reset, order]);

  if (!open || !order) return null;

  const productName = order.items?.[0]?.name ?? "Ürün";
  const customerName = order.customer?.name ?? "Müşteri";

  const handleContinue = async () => {
    setStepError(null);
    if (!reason) {
      setStepError("Lütfen bir iptal sebebi seçin.");
      return;
    }
    if (reason === "Diğer" && !customReason.trim()) {
      setStepError("Lütfen kısa bir açıklama yazın.");
      return;
    }
    setLoadingPreview(true);
    try {
      const { aiMessage: msg } = await cancelOrderWithAiMessage(
        order.orderNumber,
        customerName,
        productName,
        reason,
        reason === "Diğer" ? customReason.trim() : undefined,
      );
      setAiMessage(msg);
      setStep(2);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    
    try {
      const actualReason = reason === "Diğer" ? customReason : reason;
      await cancelOrder(order.id, actualReason);
      onSuccess(order.id);
      onClose();
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : "Sipariş iptal edilirken hata oluştu"
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-card bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full p-1 text-aura-text-secondary transition hover:bg-aura-page"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative min-h-[320px] pr-8">
          <div
            className={`transition-all duration-300 ease-out ${
              step === 1
                ? "translate-y-0 opacity-100"
                : "pointer-events-none absolute inset-0 -translate-y-2 opacity-0"
            }`}
          >
            <h2
              id="cancel-modal-title"
              className="text-lg font-semibold text-aura-text-primary"
            >
              Siparişi İptal Et
            </h2>
            <p className="mt-1 text-sm text-aura-text-secondary">
              {order.orderNumber} — {customerName}
            </p>

            <p className="mt-6 text-sm font-medium text-aura-text-primary">
              İptal sebebi
            </p>
            <ul className="mt-3 space-y-3">
              {CANCEL_REASONS.map((r) => (
                <li key={r}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-aura-text-primary">
                    <input
                      type="radio"
                      name="cancel-reason"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-aura-purple"
                      checked={reason === r}
                      onChange={() => {
                        setReason(r);
                        setStepError(null);
                      }}
                    />
                    <span>{r}</span>
                  </label>
                  {r === "Diğer" && reason === "Diğer" && (
                    <textarea
                      rows={3}
                      placeholder="Kısaca açıklayın…"
                      className="ml-7 mt-2 w-[calc(100%-1.75rem)] rounded-xl border border-aura-pink-light px-3 py-2 text-sm outline-none ring-aura-purple/30 transition focus:border-aura-purple focus:ring-2"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                </li>
              ))}
            </ul>
            {stepError && (
              <p className="mt-3 text-sm text-red-600">{stepError}</p>
            )}
            <div className="mt-8 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-aura-pink-light px-4 py-2 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
                onClick={onClose}
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={loadingPreview}
                className="rounded-full bg-aura-purple px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-pink disabled:opacity-60"
                onClick={() => void handleContinue()}
              >
                {loadingPreview ? "Yükleniyor…" : "Devam Et"}
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-out ${
              step === 2
                ? "translate-y-0 opacity-100"
                : "pointer-events-none absolute inset-0 translate-y-2 opacity-0"
            }`}
          >
            <h2 className="text-lg font-semibold text-aura-text-primary">
              Müşteriye Gönderilecek Mesaj
            </h2>
            <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              ✦ Bu mesaj yapay zeka tarafından oluşturuldu. Göndermeden önce
              düzenleyebilirsiniz.
            </div>
            <textarea
              className="mt-4 min-h-[200px] w-full resize-y rounded-xl border border-aura-pink-light px-3 py-3 text-sm leading-relaxed text-aura-text-primary outline-none ring-aura-purple/20 transition focus:border-aura-purple focus:ring-2"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
            />
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-aura-pink-light px-4 py-2 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
                onClick={() => {
                  setStep(1);
                  setStepError(null);
                }}
              >
                Geri Dön
              </button>
              <button
                type="button"
                className="rounded-full bg-aura-purple px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-pink"
                onClick={handleConfirmCancel}
              >
                Gönder ve İptal Et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
