"use client";

export function AiDraftBanner({
  text,
  onSend,
  onEdit,
}: {
  text: string;
  onSend: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="ml-0 max-w-[85%] rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100/80 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <p className="text-xs font-semibold text-amber-800">✦ AI Taslak Yanıt</p>
      <p className="mt-2 leading-relaxed">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSend}
          className="rounded-full bg-aura-pink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-aura-purple"
        >
          Gönder
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-amber-300/80 bg-white/70 px-4 py-1.5 text-xs font-semibold text-amber-900 transition hover:border-aura-purple hover:text-aura-purple"
        >
          Düzenle
        </button>
      </div>
    </div>
  );
}
