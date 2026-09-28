import { flattenObject } from "./flatten";
import type { ColorScale, NeutralStep, SemanticTokens } from "./types";

const ALIASABLE_NAMES = new Set(["hover", "pressed", "selected", "subtle", "border", "text"]);

export function neutralAliasForValue(
  path: string,
  value: string,
  neutral: ColorScale<NeutralStep>,
) {
  const name = path.split(".").at(-1)?.toLowerCase();
  if (!name || ![...ALIASABLE_NAMES].some((candidate) => name === candidate || name.endsWith(candidate))) return null;

  const normalized = value.toLowerCase();
  const match = Object.entries(neutral).find(([step, hex]) => {
    const numericStep = Number(step);
    return numericStep >= 100 && numericStep <= 900 && hex.toLowerCase() === normalized;
  });
  return match ? `Neutral ${match[0]}` : null;
}

export function semanticNeutralAliases(
  tokens: SemanticTokens,
  neutral: ColorScale<NeutralStep>,
) {
  return Object.fromEntries(
    flattenObject(tokens).flatMap(({ path, value }) => {
      const alias = neutralAliasForValue(path, value, neutral);
      return alias ? [[path, alias]] : [];
    }),
  );
}
