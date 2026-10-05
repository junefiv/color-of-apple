import { describe, expect, it } from "vitest";
import { CORE_TOKENS } from "@/lib/color-engine/core-tokens";
import { dictionaries } from "@/lib/copy";

describe("token help coverage", () => {
  it.each(["ko", "en"] as const)("provides labels and full guides for every displayed token in %s", (locale) => {
    const { labels, guides } = dictionaries[locale].tokens;
    for (const token of CORE_TOKENS) {
      const label = (labels as Record<string, string>)[token.key];
      const guide = (guides as Record<string, { role: string; uses: string }>)[token.key];
      expect(label, `${locale}: ${token.path} label`).toBeTruthy();
      expect(guide?.role, `${locale}: ${token.path} explanation`).toBeTruthy();
      expect(guide?.uses, `${locale}: ${token.path} examples`).toBeTruthy();
    }
  });
});
