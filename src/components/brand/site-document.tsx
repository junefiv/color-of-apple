"use client";

import { useEffect } from "react";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { useMatchuStore } from "@/lib/store";

export function SiteDocument({ title, centered = false, children }: { title: string; centered?: boolean; children: React.ReactNode }) {
  const locale = useMatchuStore((state) => state.locale);

  useEffect(() => {
    document.title = `${title} | Color of Apple`;
  }, [title]);

  return (
    <div className="graph-paper-page flex min-h-dvh flex-col text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <article lang={locale} className="rounded-2xl border bg-card px-5 py-7 text-card-foreground sm:px-10 sm:py-10">
          <h1 className={`text-2xl font-semibold sm:text-3xl ${centered ? "text-center" : ""}`}>{title}</h1>
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
