import { AAA_TEXT_MIN, CONTRAST_PAIRS } from "./constants";
import { contrastRatio, setChroma, shiftLightness } from "./color-utils";
import type {
  AccessibilityReport,
  AccessibilityTarget,
  ContrastPairResult,
  SemanticTokens,
} from "./types";

export function getToken(theme: SemanticTokens, path: string): string {
  const parts = path.split(".");
  let current: unknown = theme;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      throw new Error(`UNKNOWN_TOKEN:${path}`);
    }
  }
  if (typeof current !== "string") {
    throw new Error(`INVALID_TOKEN:${path}`);
  }
  return current;
}

export function setToken(theme: SemanticTokens, path: string, value: string) {
  const parts = path.split(".");
  let current: Record<string, unknown> = theme as unknown as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

function adjustUntilPass(
  foreground: string,
  background: string,
  minimum: number,
  preferForeground: boolean,
) {
  let fg = foreground;
  let bg = background;

  for (let i = 0; i < 48; i += 1) {
    if (contrastRatio(fg, bg) >= minimum) {
      return { foreground: fg, background: bg };
    }
    if (preferForeground) {
      const lighter = contrastRatio(shiftLightness(fg, 0.015), bg);
      const darker = contrastRatio(shiftLightness(fg, -0.015), bg);
      fg = shiftLightness(fg, lighter >= darker ? 0.015 : -0.015);
    } else {
      const lighter = contrastRatio(fg, shiftLightness(bg, 0.015));
      const darker = contrastRatio(fg, shiftLightness(bg, -0.015));
      bg = shiftLightness(bg, lighter >= darker ? 0.015 : -0.015);
    }
  }

  fg = setChroma(fg, Math.max(0, 0.04));
  return { foreground: fg, background: bg };
}

export function validateTheme(
  theme: SemanticTokens,
  target: AccessibilityTarget,
): AccessibilityReport {
  const pairs: ContrastPairResult[] = CONTRAST_PAIRS.map(([foreground, background, minimum]) => {
    const min = target === "AAA" && minimum === 4.5 ? AAA_TEXT_MIN : minimum;
    const ratio = contrastRatio(getToken(theme, foreground), getToken(theme, background));
    return {
      foreground,
      background,
      ratio,
      minimum: min,
      passed: ratio >= min,
      autoFixed: false,
    };
  });

  return {
    target,
    pairs,
    failCount: pairs.filter((pair) => !pair.passed).length,
  };
}

export function fixContrastFailures(
  theme: SemanticTokens,
  target: AccessibilityTarget,
): { theme: SemanticTokens; report: AccessibilityReport } {
  const next = structuredClone(theme);
  const report = validateTheme(next, target);

  for (const pair of report.pairs) {
    if (pair.passed) continue;
    const fg = getToken(next, pair.foreground);
    const bg = getToken(next, pair.background);
    const adjusted = adjustUntilPass(fg, bg, pair.minimum, true);
    let result = adjusted;
    if (contrastRatio(result.foreground, result.background) < pair.minimum) {
      result = adjustUntilPass(result.foreground, result.background, pair.minimum, false);
    }
    setToken(next, pair.foreground, result.foreground);
    if (result.background !== bg) {
      setToken(next, pair.background, result.background);
    }
    pair.ratio = contrastRatio(result.foreground, result.background);
    pair.passed = pair.ratio >= pair.minimum;
    pair.autoFixed = true;
  }

  report.failCount = report.pairs.filter((pair) => !pair.passed).length;
  return { theme: next, report };
}
