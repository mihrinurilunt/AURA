"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-aura-page text-aura-text-primary">
      <Sidebar />
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-4">{children}</main>
      </div>
    </div>
  );
}
