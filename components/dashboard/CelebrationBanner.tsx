"use client";

export function CelebrationBanner() {
  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-r from-aura-pink via-aura-pink to-aura-purple p-6 text-white shadow-aura">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="text-3xl font-semibold leading-tight">
            🎉 Bu ay rekor kırdın!
          </p>
          <p className="text-sm text-white/90">
            Akdeniz Termal Çorap 284 adet satıldı — en iyi ayın!
          </p>
          <button
            type="button"
            className="mt-2 inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
          >
            Detayları gör
          </button>
        </div>
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/25 md:relative md:right-0 md:top-0 md:h-32 md:w-48"
          aria-hidden
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle cx="40" cy="30" r="6" fill="currentColor" />
            <circle cx="120" cy="20" r="4" fill="currentColor" />
            <circle cx="170" cy="60" r="5" fill="currentColor" />
            <path
              d="M20 120 L35 95 L50 120 Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M140 140 L155 110 L170 140 Z"
              fill="currentColor"
              opacity="0.6"
            />
            <rect
              x="90"
              y="70"
              width="10"
              height="10"
              rx="2"
              fill="currentColor"
              transform="rotate(20 95 75)"
            />
            <rect
              x="150"
              y="100"
              width="8"
              height="8"
              rx="2"
              fill="currentColor"
              transform="rotate(-15 154 104)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
