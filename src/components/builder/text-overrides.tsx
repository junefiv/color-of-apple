"use client";

import { tx, type TextDef, type Texts } from "@/lib/component-texts";

// Inputs for a component's printed words (lib/component-texts.ts). Clearing a field hides that word.
export function TextOverrides({ defs, texts, onChange, field, only }: { defs: readonly TextDef[]; texts: Texts | undefined; onChange: (texts: Texts) => void; field?: string; only?: readonly string[] }) {
  return <>{defs.filter(([key]) => !only || only.includes(key)).map(([key, label], i) => <label key={key} className="lb-field">{label}
    <input data-field={i === 0 ? field : undefined} value={tx(texts, defs, key)} maxLength={160} placeholder="비우면 숨김" onChange={e => onChange({ ...texts, [key]: e.target.value })} /></label>)}</>;
}
