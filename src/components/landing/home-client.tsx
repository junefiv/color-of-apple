"use client";

import { SiteHeader } from "@/components/brand/site-header";
import { Hero } from "@/components/landing/hero";

export default function HomeClient() {
  return (
    <div className="graph-paper-page flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}
