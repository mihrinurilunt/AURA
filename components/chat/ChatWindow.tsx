"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Conversation } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { AiDraftBanner } from "@/components/chat/AiDraftBanner";

export function ChatWindow({ conversation }: { conversation: Conversation }) {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-card border border-white bg-white shadow-aura">
      <div className="flex items-center justify-between border-b border-aura-pink-light/50 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={conversation.avatarUrl}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-2 ring-aura-pink-light"
          />
          <div>
            <p className="font-semibold text-aura-text-primary">
              {conversation.customerName}
            </p>
            <p className="text-xs text-aura-text-secondary">
              {conversation.orderCount} sipariş · Son sipariş:{" "}
              {conversation.lastOrderDate}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-aura-page/60 px-4 py-4">
        {conversation.messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <MessageBubble role={m.role} text={m.text} time={m.time} />
            {m.role === "customer" && m.aiDraft ? (
              <AiDraftBanner
                text={m.aiDraft}
                onSend={() => {}}
                onEdit={() => {}}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="border-t border-aura-pink-light/50 bg-white p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Yanıt yaz..."
            className="flex-1 rounded-full border border-aura-pink-light/70 bg-aura-page px-4 py-2.5 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-aura-pink px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-purple"
          >
            Gönder
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
