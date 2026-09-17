"use client";

import type { Copy } from "@/lib/copy";

function withBrandAccent(text: string, color?: string | null) {
  if (!color || !text.includes("MATCHU")) {
    return text;
  }
  const parts = text.split("MATCHU");
  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? (
        <span style={{ color }} className="match-transition">
          MATCHU
        </span>
      ) : null}
    </span>
  ));
}

export function StudioHeadline({
  copy,
  picked,
  matched,
  accent,
}: {
  copy: Copy;
  picked: boolean;
  matched: boolean;
  accent?: string | null;
}) {
  if (matched) {
    return (
      <div>
        <h1 data-testid="hero-title" className="hero-title">
          {copy.hero.doneTitle}
        </h1>
        <p className="lead mt-5">{copy.hero.doneBody}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 data-testid="hero-title" className="hero-title">
        {copy.hero.taglineA}
        <br />
        <span className="hero-title-sub">{withBrandAccent(copy.hero.taglineB, picked ? accent : null)}</span>
      </h1>
      <p className="lead mt-5">{picked ? copy.hero.taglineReady : copy.hero.support}</p>
    </div>
  );
}
