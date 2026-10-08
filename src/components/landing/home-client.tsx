"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/brand/site-header";
import { Hero } from "@/components/landing/hero";
import { SiteFooter } from "@/components/brand/site-footer";
import { useCopy } from "@/hooks/use-copy";

export default function HomeClient() {
  const copy = useCopy();
  return (
    <div className="home-screen graph-paper-page flex h-dvh flex-col overflow-hidden">
      <SiteHeader beforeAccount={<Link className="studio-gnb-action" href="/community">{copy.community.entry}</Link>} />
      <main className="min-h-0 flex-1">
        <Hero />
      </main>
      <SiteFooter variant="home" />
    </div>
  );
}
