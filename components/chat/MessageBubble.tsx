"use client";

import type { MessageRole } from "@/types";

export function MessageBubble({
  role,
  text,
  time,
}: {
  role: MessageRole;
  text: string;
  time: string;
}) {
  const isCustomer = role === "customer";
  return (
    <div className={`flex w-full ${isCustomer ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isCustomer
            ? "bg-slate-100 text-aura-text-primary"
            : "bg-gradient-to-r from-aura-pink to-aura-purple text-white"
        }`}
      >
        <p>{text}</p>
        <p
          className={`mt-2 text-[11px] ${
            isCustomer ? "text-aura-text-secondary" : "text-white/80"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
