"use client";

import { useCopy } from "@/hooks/use-copy";

export function FeatureGrid() {
  const copy = useCopy();
  const items = [
    [copy.features.roleTitle, copy.features.roleBody],
    [copy.features.screenTitle, copy.features.screenBody],
    [copy.features.readTitle, copy.features.readBody],
    [copy.features.codeTitle, copy.features.codeBody],
  ];

  return (
    <section className="border-t border-[var(--border-default)] px-5 py-16 md:px-8">
      <h2 className="section-title whitespace-pre-line">{copy.features.title}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map(([title, body]) => (
          <article
            key={title}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-5"
          >
            <h3 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-tight">
              {title}
            </h3>
            <p className="body mt-2">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
