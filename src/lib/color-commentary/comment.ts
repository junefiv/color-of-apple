import { contrastRatio, hueDistance, oklchPerceptualDistance, parseToOklch } from "@/lib/color-engine/color-utils";
import { COMMENT_PHRASES, type CommentPhraseId } from "./phrases";

export type CommentaryColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  onPrimary: string;
  backgroundSubtle?: string;
  surfaceRaised?: string;
  surfaceOverlay?: string;
  textSecondary?: string;
  textDisabled?: string;
  focusRing?: string;
  primaryHover?: string;
  primaryPressed?: string;
  primarySelected?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  successText?: string;
  successSurface?: string;
  warningText?: string;
  warningSurface?: string;
  dangerText?: string;
  dangerSurface?: string;
  infoText?: string;
  infoSurface?: string;
};

type Swatch = { hex: string; l: number; c: number; h: number };
type Bucket = "readability" | "change" | "role" | "atmosphere";
type Locale = "ko" | "en";

type Remark = {
  id: CommentPhraseId;
  bucket: Bucket;
  family: string;
  score: number;
  tags: string[];
  conflicts: CommentPhraseId[];
};

const BUCKETS: Bucket[] = ["readability", "change", "role", "atmosphere"];
const HUE_READY = 0.55;
const TINY_DISTANCE = 0.055;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readSwatch(hex: string | undefined): Swatch | null {
  if (!hex) return null;
  try {
    const color = parseToOklch(hex);
    return { hex, l: color.l, c: color.c, h: color.h };
  } catch {
    return null;
  }
}

function hueWeight(swatch: Swatch) {
  return clamp((swatch.c - 0.02) / 0.08, 0, 1);
}

function hueReady(swatch: Swatch) {
  return hueWeight(swatch) >= HUE_READY;
}

function temperature(swatch: Swatch, minimumChroma = 0.028): "warm" | "cool" | null {
  if (swatch.c < minimumChroma) return null;
  if (swatch.h >= 330 || swatch.h <= 75) return "warm";
  if (swatch.h >= 165 && swatch.h <= 275) return "cool";
  return null;
}

function warmthValue(swatch: Swatch) {
  const side = temperature(swatch);
  if (side === "warm") return 1;
  if (side === "cool") return -1;
  return 0;
}

function presence(swatch: Swatch, background: Swatch) {
  return swatch.c * 2.2 + Math.abs(swatch.l - background.l) * 1.05;
}

function spread(values: number[]) {
  return Math.max(...values) - Math.min(...values);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pairDistance(a: Swatch, b: Swatch) {
  if (!hueReady(a) || !hueReady(b)) return null;
  return hueDistance(a.h, b.h);
}

function hueSpan(hues: number[]) {
  const sorted = [...hues].sort((left, right) => left - right);
  let maxGap = 0;
  for (let index = 0; index < sorted.length; index += 1) {
    const next = sorted[(index + 1) % sorted.length];
    const gap = index === sorted.length - 1 ? sorted[0] + 360 - sorted[index] : next - sorted[index];
    maxGap = Math.max(maxGap, gap);
  }
  return 360 - maxGap;
}

function remark(
  id: CommentPhraseId,
  bucket: Bucket,
  family: string,
  score: number,
  tags: string[] = [],
  conflicts: CommentPhraseId[] = [],
): Remark {
  return { id, bucket, family, score, tags, conflicts };
}

function best(candidates: Array<Remark | null>) {
  return candidates.filter((item): item is Remark => Boolean(item)).sort((left, right) => right.score - left.score)[0] ?? null;
}

function conflictsWith(item: Remark, chosen: Remark[]) {
  return chosen.some((other) => item.conflicts.includes(other.id) || other.conflicts.includes(item.id));
}

function pickRemarks(remarks: Remark[]) {
  const ranked = [...remarks].sort((left, right) => right.score - left.score);
  const chosen: Remark[] = [];
  const used = new Set<string>();

  for (const bucket of BUCKETS) {
    const next = ranked.find((item) => item.bucket === bucket && !used.has(item.family) && !conflictsWith(item, chosen));
    if (!next) continue;
    chosen.push(next);
    used.add(next.family);
    if (chosen.length === 2) return chosen;
  }

  if (chosen.length < 2) {
    const extra = ranked.find((item) => !used.has(item.family) && !conflictsWith(item, chosen) && item.score >= 40);
    if (extra) chosen.push(extra);
  }

  return chosen;
}

function lightnessRemark(primary: Swatch, secondary: Swatch, accent: Swatch) {
  const lights = [primary.l, secondary.l, accent.l];
  const gap = spread(lights);
  const mean = average(lights);
  const brighterThan = (lead: Swatch, others: Swatch[]) => lead.l >= 0.74 && others.every((other) => other.l <= 0.66) && lead.l - Math.max(...others.map((other) => other.l)) >= 0.1;
  const darkerThan = (lead: Swatch, others: Swatch[]) => lead.l <= 0.4 && others.every((other) => other.l >= 0.47) && Math.min(...others.map((other) => other.l)) - lead.l >= 0.1;

  if (gap <= 0.06) return remark("lightEqual", "atmosphere", "light", 68, ["light"]);
  if (brighterThan(primary, [secondary, accent])) return remark("lightPrimaryBright", "atmosphere", "light", 76, ["light", "primary"]);
  if (darkerThan(primary, [secondary, accent])) return remark("lightPrimaryDark", "atmosphere", "light", 76, ["light", "primary"]);
  if (brighterThan(accent, [primary, secondary])) return remark("lightAccentBright", "atmosphere", "light", 74, ["light", "accent"]);
  if (darkerThan(accent, [primary, secondary])) return remark("lightAccentDark", "atmosphere", "light", 74, ["light", "accent"]);
  if (lights.some((value) => value >= 0.74) && lights.some((value) => value <= 0.4)) {
    return remark("lightMixed", "atmosphere", "light", 70, ["light"]);
  }
  if (lights.every((value) => value >= 0.7)) return remark("lightBright", "atmosphere", "light", 58, ["light"]);
  if (lights.every((value) => value <= 0.46)) return remark("lightDark", "atmosphere", "light", 58, ["light"]);
  if (mean >= 0.4 && mean <= 0.74 && gap < 0.22) return remark("lightMid", "atmosphere", "light", 46, ["light"]);
  return null;
}

function chromaRemark(primary: Swatch, secondary: Swatch, accent: Swatch) {
  const colors = [primary, secondary, accent];
  const chromas = colors.map((color) => color.c);
  const meanL = average(colors.map((color) => color.l));
  const meanC = average(chromas);
  const gray = chromas.every((value) => value < 0.022);
  const low = chromas.every((value) => value < 0.058);
  const high = chromas.every((value) => value >= 0.1);
  const mid = chromas.every((value) => value >= 0.058 && value < 0.1);
  const onlyStrong = (lead: Swatch, others: Swatch[]) => lead.c >= 0.09 && others.every((other) => other.c <= lead.c * 0.62 && other.c <= lead.c - 0.035);

  if (gray) return remark("chromaGray", "atmosphere", "chroma", 88, ["chroma"], ["tempWeak"]);
  if (meanL >= 0.72 && meanC < 0.06 && meanC >= 0.02) return remark("chromaPaleBright", "atmosphere", "chroma", 84, ["chroma", "light"]);
  if (meanL <= 0.42 && low && !gray) return remark("chromaPaleDark", "atmosphere", "chroma", 84, ["chroma", "light"]);
  if (meanL >= 0.68 && high) return remark("chromaVividBright", "atmosphere", "chroma", 86, ["chroma", "light"]);
  if (meanL <= 0.46 && high) return remark("chromaVividDark", "atmosphere", "chroma", 86, ["chroma", "light"]);
  if (onlyStrong(primary, [secondary, accent])) return remark("chromaPrimary", "atmosphere", "chroma", 78, ["chroma", "primary"], ["rolePrimaryLeads"]);
  if (onlyStrong(secondary, [primary, accent])) return remark("chromaSecondary", "atmosphere", "chroma", 78, ["chroma", "secondary"], ["roleSecondaryLouder"]);
  if (onlyStrong(accent, [primary, secondary])) return remark("chromaAccent", "atmosphere", "chroma", 78, ["chroma", "accent"], ["roleAccentLoud"]);
  if (primary.c >= 0.09 && secondary.c >= 0.09 && accent.c < 0.055) {
    return remark("chromaPrimarySecondary", "atmosphere", "chroma", 74, ["chroma", "primary", "secondary"]);
  }
  if (primary.c >= 0.09 && accent.c >= 0.09 && secondary.c < 0.055) {
    return remark("chromaPrimaryAccent", "atmosphere", "chroma", 74, ["chroma", "primary", "accent"]);
  }
  if (primary.c < 0.05 && secondary.c >= 0.09 && accent.c >= 0.09) {
    return remark("chromaPrimaryWeak", "atmosphere", "chroma", 80, ["chroma", "primary"], ["roleSecondaryLouder", "roleAccentLoud"]);
  }
  if (low) return remark("chromaLow", "atmosphere", "chroma", 64, ["chroma"]);
  if (mid) return remark("chromaMid", "atmosphere", "chroma", 56, ["chroma"]);
  if (high) return remark("chromaHigh", "atmosphere", "chroma", 72, ["chroma"]);
  return null;
}

function hueRemark(primary: Swatch, secondary: Swatch, accent: Swatch, flat: boolean) {
  const ready = [primary, secondary, accent].filter(hueReady);
  const primarySecondary = pairDistance(primary, secondary);
  const primaryAccent = pairDistance(primary, accent);
  const secondaryAccent = pairDistance(secondary, accent);
  const distances = [primarySecondary, primaryAccent, secondaryAccent].filter((value): value is number => value !== null);
  const candidates: Remark[] = [];

  if (!flat && ready.length === 3 && distances.length === 3) {
    const maxDistance = Math.max(...distances);
    const minDistance = Math.min(...distances);
    const scale = 0.7 + 0.3 * Math.min(hueWeight(primary), hueWeight(secondary), hueWeight(accent));
    const span = hueSpan(ready.map((color) => color.h));
    if (maxDistance <= 12 && spread([primary.l, secondary.l, accent.l]) < 0.05 && spread([primary.c, secondary.c, accent.c]) < 0.02) {
      candidates.push(remark("hueIdentical", "atmosphere", "hue", 70 * scale, ["hue"], ["roleFlat", "lightEqual"]));
    } else if (maxDistance <= 20) {
      candidates.push(remark("hueSame", "atmosphere", "hue", 68 * scale, ["hue"]));
    } else if (maxDistance <= 48) {
      candidates.push(remark("hueAdjacent", "atmosphere", "hue", 64 * scale, ["hue"]));
    }
    if (distances.every((value) => value >= 95 && value <= 145)) {
      candidates.push(remark("hueTriad", "atmosphere", "hue", 86 * scale, ["hue"]));
    }
    if (span >= 150 && maxDistance >= 80) {
      candidates.push(remark("hueSpread", "atmosphere", "hue", 66 * scale, ["hue"]));
    }
    if (minDistance <= 28 && distances.filter((value) => value >= 55).length >= 2) {
      candidates.push(remark("huePairSplit", "atmosphere", "hue", 76 * scale, ["hue"]));
    }
  }

  if (primarySecondary !== null && primarySecondary >= 150) {
    candidates.push(remark("hueComplement", "atmosphere", "hue", 90, ["hue", "primary", "secondary"]));
  }
  if (primaryAccent !== null && primaryAccent >= 150) {
    candidates.push(remark("hueComplement", "atmosphere", "hue", 92, ["hue", "primary", "accent"]));
  }
  if (secondaryAccent !== null && secondaryAccent >= 150) {
    candidates.push(remark("hueComplement", "atmosphere", "hue", 84, ["hue", "secondary", "accent"]));
  }
  if (primarySecondary !== null && primarySecondary <= 32 && (primaryAccent === null || primaryAccent > 40)) {
    candidates.push(remark("huePrimarySecondary", "atmosphere", "hue", 60, ["hue", "primary", "secondary"]));
  }
  if (primaryAccent !== null && primaryAccent <= 32 && (primarySecondary === null || primarySecondary > 40)) {
    candidates.push(remark("huePrimaryAccent", "atmosphere", "hue", 60, ["hue", "primary", "accent"]));
  }
  if (secondaryAccent !== null && secondaryAccent <= 32 && (primarySecondary === null || primarySecondary > 40)) {
    candidates.push(remark("hueSecondaryAccent", "atmosphere", "hue", 58, ["hue", "secondary", "accent"]));
  }
  if (primaryAccent !== null && secondaryAccent !== null && primaryAccent >= 70 && secondaryAccent >= 70) {
    candidates.push(remark("hueAccentFar", "atmosphere", "hue", 72, ["hue", "accent"]));
  }
  if (primarySecondary !== null && secondaryAccent !== null && primarySecondary >= 70 && secondaryAccent >= 70) {
    candidates.push(remark("hueSecondaryFar", "atmosphere", "hue", 70, ["hue", "secondary"]));
  }

  return best(candidates);
}

function temperatureRemark(primary: Swatch, secondary: Swatch, accent: Swatch, background: Swatch) {
  const temps = [primary, secondary, accent].map((color) => temperature(color));
  const warm = temps.filter((value) => value === "warm").length;
  const cool = temps.filter((value) => value === "cool").length;
  const centers = (side: "warm" | "cool") => temps[0] === side && temps[1] === side && temps[2] === (side === "warm" ? "cool" : "warm");

  if ([primary, secondary, accent].every((color) => color.c < 0.025)) {
    return remark("tempWeak", "atmosphere", "temperature", 82, ["temperature"], ["chromaGray"]);
  }
  if (centers("warm")) return remark("tempWarmCoolAccent", "atmosphere", "temperature", 84, ["temperature", "accent"]);
  if (centers("cool")) return remark("tempCoolWarmAccent", "atmosphere", "temperature", 84, ["temperature", "accent"]);

  const neutral = temperature(background, 0.008);
  const brand = temperature(primary);
  if (background.c >= 0.008 && background.c < 0.045 && brand && neutral && brand !== neutral) {
    if (brand === "warm" && neutral === "cool") return remark("tempBrandWarmNeutralCool", "atmosphere", "temperature", 76, ["temperature", "primary", "surface"]);
    if (brand === "cool" && neutral === "warm") return remark("tempBrandCoolNeutralWarm", "atmosphere", "temperature", 76, ["temperature", "primary", "surface"]);
  }
  if (warm >= 2 && cool === 0) return remark("tempWarm", "atmosphere", "temperature", 60, ["temperature"]);
  if (cool >= 2 && warm === 0) return remark("tempCool", "atmosphere", "temperature", 60, ["temperature"]);
  if (warm > 0 && cool > 0) return remark("tempMixed", "atmosphere", "temperature", 62, ["temperature"]);
  return null;
}

function axesFlat(primary: Swatch, secondary: Swatch, accent: Swatch) {
  const lightGap = spread([primary.l, secondary.l, accent.l]);
  const chromaGap = spread([primary.c, secondary.c, accent.c]);
  const ready = [primary, secondary, accent].every(hueReady);
  const hueGap = ready ? Math.max(hueDistance(primary.h, secondary.h), hueDistance(primary.h, accent.h), hueDistance(secondary.h, accent.h)) : 0;
  const colorless = [primary, secondary, accent].every((color) => color.c < 0.03);
  return lightGap < 0.055 && chromaGap < 0.02 && (colorless || (ready && hueGap < 16));
}

function roleRemark(primary: Swatch, secondary: Swatch, accent: Swatch, background: Swatch) {
  const lead = presence(primary, background);
  const support = presence(secondary, background);
  const point = presence(accent, background);
  const values = [lead, support, point];
  const primarySecondary = pairDistance(primary, secondary);
  const primaryAccent = pairDistance(primary, accent);
  const secondaryAccent = pairDistance(secondary, accent);
  const hueClose = [primarySecondary, primaryAccent, secondaryAccent].every((value) => value !== null && value < 24);
  const lightGap = spread([primary.l, secondary.l, accent.l]);
  const chromaGap = spread([primary.c, secondary.c, accent.c]);

  if (axesFlat(primary, secondary, accent)) {
    return remark("roleFlat", "role", "role", 90, ["role"], ["hueIdentical", "hueSame", "hueAdjacent", "lightEqual"]);
  }
  if (hueClose && lightGap >= 0.16) return remark("roleHueLightSplit", "role", "role", 86, ["role", "light"]);
  if (lightGap < 0.07 && chromaGap >= 0.06 && Math.max(primary.c, secondary.c, accent.c) >= 0.08) {
    return remark("roleChromaSplit", "role", "role", 84, ["role", "chroma"]);
  }
  if (support > lead * 1.45) return remark("roleSecondaryLouder", "role", "role", 88, ["role", "secondary"], ["chromaSecondary"]);
  if (point > lead * 1.45 && point > support * 1.45) return remark("roleAccentLoud", "role", "role", 86, ["role", "accent"], ["chromaAccent"]);
  if (lead >= support * 1.45 && support <= lead * 0.68 && lead >= point * 0.85) {
    return remark("rolePrimaryLeads", "role", "role", 80, ["role", "primary", "secondary"], ["chromaPrimary"]);
  }
  if (point < 0.14 && lead > 0.28 && point < lead * 0.45) return remark("roleAccentFaint", "role", "role", 70, ["role", "accent"]);
  if (point >= 0.2 && point < lead * 0.92 && primaryAccent !== null && primaryAccent > 28) {
    return remark("roleAccentPoint", "role", "role", 66, ["role", "accent"]);
  }
  if (Math.abs(lead - support) / Math.max(lead, support, 0.05) < 0.18) {
    return remark("rolePrimarySecondaryEven", "role", "role", 62, ["role", "primary", "secondary"]);
  }
  if (spread(values) < 0.1) return remark("roleEven", "role", "role", 64, ["role"]);
  return null;
}

function surfaceRemark(background: Swatch, surface: Swatch, primary: Swatch, layers: Array<Swatch | null>) {
  const delta = surface.l - background.l;
  const uniqueLayers: Swatch[] = [];
  for (const layer of layers) {
    if (!layer) continue;
    if (uniqueLayers.some((item) => Math.abs(item.l - layer.l) < 0.012 && item.hex.toLowerCase() === layer.hex.toLowerCase())) continue;
    uniqueLayers.push(layer);
  }
  const lights = uniqueLayers.map((layer) => layer.l);
  const layerRange = lights.length ? spread(lights) : 0;
  const deltas = lights.slice(1).map((value, index) => value - lights[index]);
  const meaningful = deltas.filter((value) => Math.abs(value) >= 0.025);
  const signs = meaningful.map((value) => Math.sign(value));
  const reversals = signs.slice(1).filter((sign, index) => sign !== signs[index]).length;
  const ordered = meaningful.length >= 2 && reversals === 0 && Math.min(...meaningful.map(Math.abs)) >= 0.03 && layerRange >= 0.08;
  const scrambled = meaningful.length >= 2 && reversals > 0 && layerRange >= 0.1;
  const backgroundHue = hueDistance(background.h, primary.h);

  if (background.c >= 0.06) return remark("surfaceSaturated", "atmosphere", "surface", 80, ["surface"]);
  if (scrambled) return remark("surfaceScrambled", "atmosphere", "surface", 72, ["surface"]);
  if (background.l <= 0.32) return remark("surfaceDark", "atmosphere", "surface", 64, ["surface"]);
  if (background.c >= 0.012 && background.c < 0.05 && primary.c >= 0.05 && backgroundHue <= 36) {
    return remark("surfaceTinted", "atmosphere", "surface", 70, ["surface", "primary"]);
  }
  if (ordered) return remark("surfaceLayers", "atmosphere", "surface", 60, ["surface"]);
  if (Math.abs(delta) < 0.028 && Math.abs(surface.c - background.c) < 0.02) {
    return remark("surfaceSame", "atmosphere", "surface", 52, ["surface"]);
  }
  if (delta >= 0.045) return remark("surfaceLighter", "atmosphere", "surface", 58, ["surface"]);
  if (delta <= -0.045) return remark("surfaceDarker", "atmosphere", "surface", 58, ["surface"]);
  if (Math.abs(delta) >= 0.06) return remark("surfaceSeparated", "atmosphere", "surface", 48, ["surface"]);
  if (background.l >= 0.9 && background.c < 0.02) return remark("surfacePlain", "atmosphere", "surface", 36, ["surface"]);
  return null;
}

function readabilityRemark(samples: Record<string, Swatch | null>, primary: Swatch, background: Swatch, surface: Swatch, text: Swatch, onPrimary: Swatch) {
  const candidates: Remark[] = [];
  const body = contrastRatio(text.hex, background.hex);
  if (body < 4.5) candidates.push(remark("textWeak", "readability", "contrast", 100, ["text"]));
  else if (body >= 7) candidates.push(remark("textClear", "atmosphere", "contrast", 24, ["text"]));

  const button = contrastRatio(onPrimary.hex, primary.hex);
  if (button < 4.5) candidates.push(remark("buttonWeak", "readability", "contrast", 98, ["primary", "text"]));
  else if (button >= 4.5) candidates.push(remark("buttonClear", "atmosphere", "contrast", 22, ["primary"]));

  const textSecondary = samples.textSecondary;
  if (textSecondary) {
    const meta = contrastRatio(textSecondary.hex, background.hex);
    if (meta > body + 0.35) candidates.push(remark("metaLouder", "readability", "meta", 90, ["text"]));
    else if (body - meta >= 1.4 && meta >= 3) candidates.push(remark("metaQuieter", "atmosphere", "meta", 34, ["text"]));
  }

  const focus = samples.focusRing;
  if (focus) {
    const focusContrast = Math.min(contrastRatio(focus.hex, background.hex), contrastRatio(focus.hex, surface.hex));
    if (focusContrast < 3) candidates.push(remark("focusWeak", "readability", "focus", 88, ["text"]));
    else candidates.push(remark("focusClear", "atmosphere", "focus", 24, ["text"]));
  }

  const selected = samples.primarySelected;
  if (selected) {
    const distance = oklchPerceptualDistance(
      { mode: "oklch", l: primary.l, c: primary.c, h: primary.h },
      { mode: "oklch", l: selected.l, c: selected.c, h: selected.h },
    );
    if (distance < 0.14) candidates.push(remark("selectedClose", "readability", "selected", 82, ["primary"]));
    else if (distance >= 0.35) candidates.push(remark("selectedClear", "atmosphere", "selected", 28, ["primary"]));
  }

  const disabled = samples.textDisabled;
  if (disabled) {
    const distance = oklchPerceptualDistance(
      { mode: "oklch", l: text.l, c: text.c, h: text.h },
      { mode: "oklch", l: disabled.l, c: disabled.c, h: disabled.h },
    );
    const disabledContrast = contrastRatio(disabled.hex, surface.hex);
    const bodyOnSurface = contrastRatio(text.hex, surface.hex);
    if (distance < 0.2 || (disabledContrast >= 4.5 && disabledContrast + 0.6 >= bodyOnSurface)) {
      candidates.push(remark("disabledClose", "readability", "disabled", 86, ["text"]));
    }
  }

  const hoverShift = [samples.primaryHover, samples.primaryPressed]
    .filter((item): item is Swatch => Boolean(item))
    .map((item) => Math.abs(item.l - primary.l));
  const hover = hoverShift.length ? Math.max(...hoverShift) : 0;
  if (hover > 0 && hover <= 0.02) candidates.push(remark("hoverSoft", "atmosphere", "hover", 32, ["primary"]));
  else if (hover >= 0.09) candidates.push(remark("hoverStrong", "atmosphere", "hover", 44, ["primary"]));

  const statuses = [samples.success, samples.warning, samples.danger, samples.info].filter((item): item is Swatch => Boolean(item));
  const danger = samples.danger;
  if (danger && hueReady(primary) && hueReady(danger) && hueDistance(primary.h, danger.h) < 14 && Math.abs(primary.l - danger.l) < 0.16) {
    candidates.push(remark("statusDangerLikePrimary", "readability", "status", 93, ["primary", "status"]));
  }
  const success = samples.success;
  if (success && danger && hueReady(success) && hueReady(danger) && hueDistance(success.h, danger.h) < 22 && Math.abs(success.l - danger.l) < 0.18) {
    candidates.push(remark("statusSuccessLikeDanger", "readability", "status", 91, ["status"]));
  }

  const statusText = [
    [samples.successText, samples.successSurface],
    [samples.warningText, samples.warningSurface],
    [samples.dangerText, samples.dangerSurface],
    [samples.infoText, samples.infoSurface],
  ] as Array<[Swatch | null, Swatch | null]>;
  if (statusText.some(([ink, ground]) => ink && ground && contrastRatio(ink.hex, ground.hex) < 4.5)) {
    candidates.push(remark("statusTextWeak", "readability", "status-text", 96, ["status", "text"]));
  }

  if (statuses.length >= 3) {
    const statusChroma = average(statuses.map((item) => item.c));
    if (statusChroma > primary.c * 1.45 && statusChroma - primary.c > 0.04) {
      candidates.push(remark("statusStrong", "atmosphere", "status-mood", 58, ["status"]));
    } else if (primary.c > 0.04 && statusChroma < primary.c * 0.72) {
      candidates.push(remark("statusQuiet", "atmosphere", "status-mood", 42, ["status"]));
    } else if (Math.abs(statusChroma - primary.c) <= 0.03) {
      candidates.push(remark("statusMatched", "atmosphere", "status-mood", 50, ["status"]));
    }
    const chromatic = statuses.filter(hueReady);
    if (chromatic.length >= 3) {
      let separated = true;
      for (let left = 0; left < chromatic.length; left += 1) {
        for (let right = left + 1; right < chromatic.length; right += 1) {
          if (hueDistance(chromatic[left].h, chromatic[right].h) < 28) separated = false;
        }
      }
      if (separated) candidates.push(remark("statusDistinct", "atmosphere", "status-mood", 36, ["status"], ["statusDangerLikePrimary", "statusSuccessLikeDanger"]));
    }
  }

  const problem = candidates.filter((item) => item.bucket === "readability").sort((left, right) => right.score - left.score)[0] ?? null;
  const notes = candidates.filter((item) => item.bucket !== "readability");
  return [problem, ...notes].filter((item): item is Remark => Boolean(item));
}

function overallLightness(primary: Swatch, secondary: Swatch, accent: Swatch, background: Swatch, surface: Swatch) {
  return (primary.l + secondary.l + accent.l + background.l * 0.5 + surface.l * 0.5) / 4;
}

function accentSeparation(accent: Swatch, primary: Swatch, secondary: Swatch) {
  const accentColor = { mode: "oklch" as const, l: accent.l, c: accent.c, h: accent.h };
  return Math.min(
    oklchPerceptualDistance(accentColor, { mode: "oklch", l: primary.l, c: primary.c, h: primary.h }),
    oklchPerceptualDistance(accentColor, { mode: "oklch", l: secondary.l, c: secondary.c, h: secondary.h }),
  );
}

function isTiny(current: Swatch[], previous: Swatch[]) {
  const count = Math.min(current.length, previous.length);
  let maxDistance = 0;
  for (let index = 0; index < count; index += 1) {
    maxDistance = Math.max(maxDistance, oklchPerceptualDistance(
      { mode: "oklch", l: current[index].l, c: current[index].c, h: current[index].h },
      { mode: "oklch", l: previous[index].l, c: previous[index].c, h: previous[index].h },
    ));
  }
  return maxDistance < TINY_DISTANCE;
}

function changeRemark(current: Swatch[], previous: Swatch[], labels: string[]) {
  const shifts = labels.map((label, index) => ({
    label,
    distance: oklchPerceptualDistance(
      { mode: "oklch", l: current[index].l, c: current[index].c, h: current[index].h },
      { mode: "oklch", l: previous[index].l, c: previous[index].c, h: previous[index].h },
    ),
  })).sort((left, right) => right.distance - left.distance);
  const focused = shifts[0] && shifts[0].distance >= 0.1 && shifts[0].distance >= shifts[1].distance * 1.35 ? shifts[0].label : null;
  return focused;
}

function deltaRemarks(
  current: { primary: Swatch; secondary: Swatch; accent: Swatch; background: Swatch; surface: Swatch; text: Swatch },
  previous: { primary: Swatch; secondary: Swatch; accent: Swatch; background: Swatch; surface: Swatch; text: Swatch },
) {
  const lightDelta = overallLightness(current.primary, current.secondary, current.accent, current.background, current.surface)
    - overallLightness(previous.primary, previous.secondary, previous.accent, previous.background, previous.surface);
  const chromaDelta = average([current.primary.c, current.secondary.c, current.accent.c]) - average([previous.primary.c, previous.secondary.c, previous.accent.c]);
  const warmthDelta = average([current.primary, current.secondary, current.accent].map(warmthValue))
    - average([previous.primary, previous.secondary, previous.accent].map(warmthValue));
  const accentDelta = accentSeparation(current.accent, current.primary, current.secondary)
    - accentSeparation(previous.accent, previous.primary, previous.secondary);
  const beforeSupport = presence(previous.secondary, previous.background) / Math.max(presence(previous.primary, previous.background), 0.05);
  const afterSupport = presence(current.secondary, current.background) / Math.max(presence(current.primary, current.background), 0.05);
  const textDelta = contrastRatio(current.text.hex, current.background.hex) - contrastRatio(previous.text.hex, previous.background.hex);

  const options: Remark[] = [];
  if (lightDelta >= 0.05) options.push(remark("changeBrighter", "change", "change", 60 + Math.abs(lightDelta) / 0.12 * 20, ["light"]));
  if (lightDelta <= -0.05) options.push(remark("changeDarker", "change", "change", 60 + Math.abs(lightDelta) / 0.12 * 20, ["light"]));
  if (chromaDelta <= -0.02) options.push(remark("changeCalmer", "change", "change", 60 + Math.abs(chromaDelta) / 0.05 * 20, ["chroma"]));
  if (chromaDelta >= 0.02) options.push(remark("changeVivid", "change", "change", 60 + Math.abs(chromaDelta) / 0.05 * 20, ["chroma"]));
  if (warmthDelta >= 0.55) options.push(remark("changeWarmer", "change", "change", 60 + Math.abs(warmthDelta) * 18, ["temperature"]));
  if (warmthDelta <= -0.55) options.push(remark("changeCooler", "change", "change", 60 + Math.abs(warmthDelta) * 18, ["temperature"]));
  if (accentDelta >= 0.12) options.push(remark("changeAccentClearer", "change", "change", 64 + accentDelta / 0.25 * 20, ["accent"]));
  if (accentDelta <= -0.12) options.push(remark("changeAccentCloser", "change", "change", 64 + Math.abs(accentDelta) / 0.25 * 20, ["accent"]));
  if (beforeSupport - afterSupport >= 0.28 && presence(current.secondary, current.background) < presence(previous.secondary, previous.background) - 0.04) {
    options.push(remark("changeSecondaryQuieter", "change", "change", 70, ["secondary"]));
  }
  if (textDelta >= 0.8) options.push(remark("changeTextBetter", "change", "change", 74 + textDelta * 4, ["text"]));
  if (textDelta <= -0.8) options.push(remark("changeTextWorse", "change", "change", 76 + Math.abs(textDelta) * 4, ["text"]));
  return best(options);
}

function samplePalette(colors: CommentaryColors) {
  const primary = readSwatch(colors.primary);
  const secondary = readSwatch(colors.secondary);
  const accent = readSwatch(colors.accent);
  const background = readSwatch(colors.background);
  const surface = readSwatch(colors.surface);
  const text = readSwatch(colors.text);
  const onPrimary = readSwatch(colors.onPrimary);
  if (!primary || !secondary || !accent || !background || !surface || !text || !onPrimary) return null;
  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text,
    onPrimary,
    extras: {
      backgroundSubtle: readSwatch(colors.backgroundSubtle),
      surfaceRaised: readSwatch(colors.surfaceRaised),
      surfaceOverlay: readSwatch(colors.surfaceOverlay),
      textSecondary: readSwatch(colors.textSecondary),
      textDisabled: readSwatch(colors.textDisabled),
      focusRing: readSwatch(colors.focusRing),
      primaryHover: readSwatch(colors.primaryHover),
      primaryPressed: readSwatch(colors.primaryPressed),
      primarySelected: readSwatch(colors.primarySelected),
      success: readSwatch(colors.success),
      warning: readSwatch(colors.warning),
      danger: readSwatch(colors.danger),
      info: readSwatch(colors.info),
      successText: readSwatch(colors.successText),
      successSurface: readSwatch(colors.successSurface),
      warningText: readSwatch(colors.warningText),
      warningSurface: readSwatch(colors.warningSurface),
      dangerText: readSwatch(colors.dangerText),
      dangerSurface: readSwatch(colors.dangerSurface),
      infoText: readSwatch(colors.infoText),
      infoSurface: readSwatch(colors.infoSurface),
    },
  };
}

function tracked(samples: NonNullable<ReturnType<typeof samplePalette>>) {
  return [samples.primary, samples.secondary, samples.accent, samples.background, samples.surface, samples.text, samples.onPrimary];
}

export function appleCommentLines(
  currentColors: CommentaryColors,
  previousColors?: CommentaryColors | null,
  options?: { reset?: boolean; locale?: Locale },
) {
  const locale = options?.locale ?? "ko";
  const current = samplePalette(currentColors);
  if (!current) return [];
  const previous = previousColors ? samplePalette(previousColors) : null;
  const currentTrack = tracked(current);
  const previousTrack = previous ? tracked(previous) : null;

  if (previous && previousTrack && !options?.reset && isTiny(currentTrack, previousTrack)) return [];

  const flat = axesFlat(current.primary, current.secondary, current.accent);
  const remarks = [
    lightnessRemark(current.primary, current.secondary, current.accent),
    chromaRemark(current.primary, current.secondary, current.accent),
    hueRemark(current.primary, current.secondary, current.accent, flat),
    temperatureRemark(current.primary, current.secondary, current.accent, current.background),
    roleRemark(current.primary, current.secondary, current.accent, current.background),
    surfaceRemark(current.background, current.surface, current.primary, [
      current.background,
      current.extras.backgroundSubtle,
      current.surface,
      current.extras.surfaceRaised,
      current.extras.surfaceOverlay,
    ]),
    ...readabilityRemark(current.extras, current.primary, current.background, current.surface, current.text, current.onPrimary),
  ].filter((item): item is Remark => Boolean(item));

  if (options?.reset) remarks.push(remark("changeReset", "change", "change", 100, []));
  else if (previous) {
    const changed = deltaRemarks(current, previous);
    if (changed) remarks.push(changed);
  }

  if (previous && previousTrack) {
    const focus = changeRemark(currentTrack, previousTrack, ["primary", "secondary", "accent", "background", "surface", "text", "primary"]);
    if (focus) {
      for (const item of remarks) {
        if (item.bucket !== "change" && item.tags.includes(focus)) item.score += 18;
      }
    }
  }

  return pickRemarks(remarks.filter((item): item is Remark => Boolean(item))).map((item) => COMMENT_PHRASES[item.id][locale]);
}
