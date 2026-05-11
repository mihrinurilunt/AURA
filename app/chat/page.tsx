"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { getConversations } from "@/lib/api";
import type { Conversation } from "@/types";

export default function ChatPage() {
  const [list, setList] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getConversations();
      if (!cancelled) {
        setList(data);
        setActiveId((prev) => prev ?? data[0]?.id ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      list.filter((c) =>
        c.customerName.toLowerCase().includes(q.toLowerCase()),
      ),
    [list, q],
  );

  const active = filtered.find((c) => c.id === activeId) ?? filtered[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-card border border-white bg-white shadow-aura">
        <div className="border-b border-aura-pink-light/50 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aura-text-secondary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Müşteri ara..."
              className="w-full rounded-full border border-aura-pink-light/70 bg-aura-page py-2 pl-9 pr-3 text-sm outline-none transition focus:border-aura-purple focus:ring-2 focus:ring-aura-purple-light"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const selected = c.id === active?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-start gap-3 border-b border-aura-pink-light/30 px-4 py-3 text-left transition hover:bg-aura-page ${
                  selected ? "border-l-4 border-l-aura-pink bg-aura-pink-bg/40" : ""
                }`}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-aura-pink-light/60"
                  />
                  {c.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-aura-text-primary">
                    {c.customerName}
                  </p>
                  <p className="truncate text-xs text-aura-text-secondary">
                    {c.lastPreview}
                  </p>
                </div>
                <span className="text-[11px] text-aura-text-secondary">
                  {c.lastTime}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {active ? (
        <ChatWindow conversation={active} />
      ) : (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-card border border-dashed border-aura-pink-light bg-white text-sm text-aura-text-secondary">
          Sohbet seçin.
        </div>
      )}
    </div>
  );
}
