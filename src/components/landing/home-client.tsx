"use client";

import { SiteHeader } from "@/components/brand/site-header";
import { Hero } from "@/components/landing/hero";

export default function HomeClient() {
  return (
    <div className="home-screen graph-paper-page flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <main className="min-h-0 flex-1">
        <Hero />
      </main>
    </div>
  );
}
