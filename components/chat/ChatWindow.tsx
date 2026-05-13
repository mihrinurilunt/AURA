"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { streamChatDraft } from "@/lib/api";
import type { Conversation, ChatMessage } from "@/types";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { AiDraftBanner } from "@/components/chat/AiDraftBanner";

export function ChatWindow({ conversation }: { conversation: Conversation }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [aiDraft, setAiDraft] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDraft, setEditingDraft] = useState("");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add customer message to history
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "customer",
      text: input,
      time: new Date().toLocaleTimeString("tr-TR"),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setAiDraft("");
    setIsEditing(false);
    setEditingDraft("");

    // Build conversation history for API
    const history = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));
    history.push({ role: "customer", content: newMessage.text });

    // Stream AI draft
    setIsStreaming(true);
    let fullDraft = "";

    await streamChatDraft(
      conversation.id || "customer-1",
      newMessage.text,
      history,
      (chunk) => {
        fullDraft += chunk;
        setAiDraft(fullDraft);
      },
      () => {
        setIsStreaming(false);
        setEditingDraft(fullDraft);
      },
    );
  };

  const handleSendDraft = async () => {
    if (!aiDraft.trim()) return;

    // Add AI message to conversation
    const aiMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "owner",
      text: aiDraft,
      time: new Date().toLocaleTimeString("tr-TR"),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setAiDraft("");
    setEditingDraft("");
    setIsEditing(false);
  };

  const handleEditDraft = () => {
    setIsEditing(true);
    setEditingDraft(aiDraft);
  };

  const handleSaveEdit = () => {
    setAiDraft(editingDraft);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditingDraft(aiDraft);
    setIsEditing(false);
  };

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
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <MessageBubble role={m.role} text={m.text} time={m.time} />
          </div>
        ))}

        {isStreaming && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-aura-text-secondary">
              AI taslak oluşturuluyor...
            </p>
          </div>
        )}

        {aiDraft && !isStreaming && (
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-800">
                  ✦ AI Taslak Yanıtı (Düzenlemede)
                </p>
                <textarea
                  value={editingDraft}
                  onChange={(e) => setEditingDraft(e.target.value)}
                  className="w-full rounded-xl border border-aura-purple px-3 py-2 text-sm outline-none ring-aura-purple/30 transition focus:ring-2"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-full bg-aura-purple px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-aura-pink"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-full border border-aura-text-secondary bg-white px-4 py-1.5 text-xs font-semibold text-aura-text-secondary transition hover:border-aura-purple hover:text-aura-purple"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <AiDraftBanner
                text={aiDraft}
                onSend={handleSendDraft}
                onEdit={handleEditDraft}
              />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-aura-pink-light/50 bg-white p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Yanıt yaz..."
            disabled={isStreaming}
            className="flex-1 rounded-full border border-aura-pink-light/70 bg-aura-page px-4 py-2.5 text-sm text-aura-text-primary outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isStreaming || !input.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-aura-pink px-4 py-2 text-sm font-semibold text-white shadow-aura transition hover:bg-aura-purple disabled:opacity-50"
          >
            Gönder
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
