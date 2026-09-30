import {
  flattenObject,
  setToken,
  validateTheme,
  type ColorSystemResult,
} from "@/lib/color-engine";

export type ColorHistoryEntry = {
  token: string;
  before: string;
  after: string;
  changedAt: string;
};

export function createTokenSnapshot(
  result: ColorSystemResult,
  overrides: Record<string, string> = {},
) {
  return Object.fromEntries(
    flattenObject(result.semantic.light).map(({ path, value }) => [
      path,
      (overrides[path] ?? value).toUpperCase(),
    ]),
  );
}

export function applyTokenSnapshot(
  result: ColorSystemResult,
  snapshot?: Record<string, string>,
) {
  if (!snapshot || Object.keys(snapshot).length === 0) return result;
  const next = structuredClone(result);
  for (const [path, value] of Object.entries(snapshot)) {
    try {
      setToken(next.semantic.light, path, value);
    } catch {
      // Ignore tokens removed by a future schema. Known tokens remain frozen.
    }
  }
  next.accessibility.light = validateTheme(next.semantic.light, next.accessibility.light.target);
  return next;
}

export function diffTokenSnapshots(
  before: Record<string, string>,
  after: Record<string, string>,
  changedAt = new Date().toISOString(),
): ColorHistoryEntry[] {
  return Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter((token) => before[token] && after[token] && before[token].toUpperCase() !== after[token].toUpperCase())
    .map((token) => ({
      token,
      before: before[token].toUpperCase(),
      after: after[token].toUpperCase(),
      changedAt,
    }));
}
