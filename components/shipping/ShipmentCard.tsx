"use client";

import { useState } from "react";
import type { Shipment } from "@/types";
import { TrackingTimeline } from "@/components/shipping/TrackingTimeline";
import { triggerDelayAlert, approveAndSendMessage } from "@/lib/api";
import { AlertTriangle, X } from "lucide-react";

interface DelayAlertModalState {
  open: boolean;
  loading: boolean;
  draftMessage: string;
  error: string | null;
  sent: boolean;
}

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const [modal, setModal] = useState<DelayAlertModalState>({
    open: false,
    loading: false,
    draftMessage: "",
    error: null,
    sent: false,
  });
  const [buttonSent, setButtonSent] = useState(false);

  const handleNotifyCustomer = async () => {
    setModal({
      open: true,
      loading: true,
      draftMessage: "",
      error: null,
      sent: false,
    });

    try {
      const result = await triggerDelayAlert(shipment.id);
      setModal((prev) => ({
        ...prev,
        loading: false,
        draftMessage: result.draft_message,
      }));
    } catch (err) {
      setModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Mesaj hazırlanırken hata oluştu",
      }));
    }
  };

  const handleApproveAndSend = async () => {
    if (!modal.draftMessage.trim()) return;

    setModal((prev) => ({ ...prev, loading: true }));

    try {
      await approveAndSendMessage({
        customer_id: shipment.customer_id || "cust-1",
        message: modal.draftMessage,
        order_id: shipment.order_id,
      });

      setModal((prev) => ({
        ...prev,
        loading: false,
        sent: true,
      }));
      setButtonSent(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        setModal((prev) => ({ ...prev, open: false }));
      }, 2000);
    } catch (err) {
      setModal((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Mesaj gönderilirken hata oluştu",
      }));
    }
  };

  const handleCloseModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <div className="rounded-card border border-white bg-white p-5 shadow-aura transition hover:border-aura-pink-light">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-aura-text-primary">
              {shipment.customerName}
            </p>
            <p className="text-xs font-mono text-aura-text-secondary">
              {shipment.orderNumber}
            </p>
            <p className="text-sm text-aura-text-secondary">{shipment.productName}</p>
          </div>
          <div className="flex-1 border-t border-aura-pink-light/40 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-aura-purple">
              {shipment.carrier}
            </p>
            <p className="mt-1 font-mono text-sm text-aura-text-primary">
              {shipment.trackingNumber}
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-3 lg:items-end">
            <TrackingTimeline current={shipment.currentStep} />
            <div className="flex flex-wrap items-center gap-2">
              {shipment.delayed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Gecikme bekleniyor
                </span>
              )}
              {shipment.delayed && (
                <button
                  type="button"
                  onClick={handleNotifyCustomer}
                  disabled={buttonSent}
                  className="rounded-full border border-aura-pink-light px-3 py-1 text-xs font-semibold text-aura-pink transition hover:border-aura-purple hover:text-aura-purple disabled:opacity-50"
                >
                  {buttonSent ? "Gönderildi ✓" : "Müşteriye Bildir"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-card bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-1 text-aura-text-secondary transition hover:bg-aura-page"
              onClick={handleCloseModal}
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-aura-text-primary">
              Müşteriye Gecikme Bildirimi
            </h2>
            <p className="mt-1 text-sm text-aura-text-secondary">
              {shipment.customerName} — {shipment.trackingNumber}
            </p>

            {modal.loading ? (
              <div className="mt-6 space-y-3">
                <div className="h-32 animate-pulse rounded-xl bg-aura-purple-light/30"></div>
              </div>
            ) : modal.sent ? (
              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3">
                <p className="text-sm font-semibold text-green-700">
                  ✓ Mesaj başarıyla gönderildi!
                </p>
              </div>
            ) : (
              <>
                {modal.error && (
                  <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {modal.error}
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  ✦ Bu mesaj yapay zeka tarafından oluşturuldu. Göndermeden
                  önce düzenleyebilirsiniz.
                </div>

                <textarea
                  className="mt-4 min-h-[180px] w-full resize-y rounded-xl border border-aura-pink-light px-3 py-3 text-sm leading-relaxed text-aura-text-primary outline-none ring-aura-purple/20 transition focus:border-aura-purple focus:ring-2"
                  value={modal.draftMessage}
                  onChange={(e) =>
                    setModal((prev) => ({
                      ...prev,
                      draftMessage: e.target.value,
                    }))
                  }
                />

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-full border border-aura-pink-light px-4 py-2 text-sm font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveAndSend}
                    disabled={modal.loading || !modal.draftMessage.trim()}
                    className="rounded-full bg-aura-purple px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-pink disabled:opacity-60"
                  >
                    {modal.loading ? "Gönderiliyor..." : "Onayla ve Gönder"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
