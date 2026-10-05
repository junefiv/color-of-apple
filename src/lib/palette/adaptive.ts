import { converter, formatHex } from "culori";
import { clamp, contrastRatio, hueDistance, parseToOklch, rotateHue, toHex } from "@/lib/color-engine/color-utils";
import type { ColorScale, NeutralStep, OklchColor, PrimaryStep, PrimitiveScales, StatusName, ThemeMode } from "@/lib/color-engine/types";
import type { PaletteConceptId } from "./types";
import { getOnColor } from "./on-color";

export type HueZone = "Red" | "Orange" | "Yellow" | "Green" | "Cyan" | "Blue" | "Purple" | "Magenta";
export type PrimaryAnalysis = {
  color: OklchColor; brightness: "Dark" | "Mid" | "Light";
  saturation: "Muted" | "Normal" | "Vivid"; temperature: "Warm" | "Neutral" | "Cool";
  hueZone: HueZone; strength: number; hueFactor: number;
};
export type BrandCharacter = { vividness: number; brightness: number; temperature: number; contrast: number; chromaLevel: number; neutralBias: number };
export type ScoreParts = { harmony: number; roleSeparation: number; chromaBalance: number; lightness: number; gamut: number };
export type AccentScoreParts = { strategyHue: number; hueSeparation: number; roleContrast: number; chromaFit: number; lightnessFit: number; brandFit: number; gamut: number };
export type Candidate = { color: OklchColor; hex: string; score: number; scores: ScoreParts; requestedChroma: number; requestedHue?: number; accentScores?: AccentScoreParts; headroom?: number; preScore?: number };
export type PairBalance = { hueDistribution: number; visualHierarchy: number; chromaHierarchy: number; lightnessDistribution: number; roleDistinctness: number };
export type PairEvaluation = { secondary: string; accent: string; secondaryPreScore: number; accentScore: number; threeColorBalance: number; score: number; balance: PairBalance; headroom: number };
export type BrandPalette = { analysis: PrimaryAnalysis; character: BrandCharacter; secondary: Candidate; accent: Candidate; secondaryCandidates: Candidate[]; accentCandidates: Candidate[]; pairs: PairEvaluation[]; selectedPair: PairEvaluation };
export type ActionTokens = { default: string; hover: string; pressed: string; on: string; onHover: string; onPressed: string; disabled: string; disabledText: string; selected: string; selectedBorder: string; selectedText: string; selectedIcon: string; focus: string };
export type StatusTokens = ActionTokens & { surface: string; surfaceStrong: string; border: string; text: string; icon: string };
export type UiColorSystem = {
  analysis: PrimaryAnalysis; character: BrandCharacter;
  primitives: PrimitiveScales; anchors: Record<"primary" | "secondary" | "accent", PrimaryStep>;
  actions: Record<"primary" | "secondary" | "accent", ActionTokens>;
  statuses: Record<StatusName, StatusTokens>;
  categorical: { background: string; foreground: string }[];
  diagnostics: { secondary: Candidate[]; accent: Candidate[]; pairs: PairEvaluation[]; selectedPair: PairEvaluation; secondaryShortlistSize: number; accentCandidatesPerSecondary: number; evaluatedPairCount: number };
};
export const SCALE_STEPS: PrimaryStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
export const SCALE_LIGHTNESS = [0.98, 0.95, 0.90, 0.84, 0.74, 0.64, 0.52, 0.42, 0.32, 0.23, 0.16];
const rgb = converter("rgb");
export const colorAt = (l: number, c: number, h: number): OklchColor => ({ mode: "oklch", l: clamp(l, 0, 1), c: Math.max(0, c), h: rotateHue(h, 0) });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const gaussian = (value: number, target: number, sigma: number) => Math.exp(-((value - target) ** 2) / (2 * sigma ** 2));

export function inSrgb(color: OklchColor) {
  const value = rgb(color);
  return !!value && [value.r, value.g, value.b].every(n => typeof n === "number" && Number.isFinite(n) && n >= -1e-7 && n <= 1 + 1e-7);
}
/** Fit by chroma only. Lightness and hue retain their intended relationships. */
export function fitCandidate(color: OklchColor): OklchColor {
  if (inSrgb(color)) return { ...color };
  let low = 0, high = color.c;
  for (let i = 0; i < 24; i++) {
    const c = (low + high) / 2;
    if (inSrgb({ ...color, c })) low = c; else high = c;
  }
  return { ...color, c: low };
}
function temperature(h: number, c: number) { return c < 0.005 ? 0 : Math.cos((h - 65) * Math.PI / 180); }
function strengthOf(color: OklchColor) { return clamp(color.c * (color.l < 0.35 ? 0.75 : color.l > 0.7 ? 0.8 : 1) / 0.28, 0, 1); }

export function analyzePrimary(color: OklchColor): PrimaryAnalysis {
  const h = color.h;
  const hueZone: HueZone = h < 35 || h >= 355 ? "Red" : h < 75 ? "Orange" : h < 110 ? "Yellow" : h < 175 ? "Green" : h < 230 ? "Cyan" : h < 285 ? "Blue" : h < 325 ? "Purple" : "Magenta";
  const factors: Record<HueZone, number> = { Red: 0.95, Orange: 0.78, Yellow: 0.68, Green: 0.9, Cyan: 1.25, Blue: 1.25, Purple: 1.08, Magenta: 0.95 };
  const t = temperature(h, color.c);
  return { color, brightness: color.l < 0.4 ? "Dark" : color.l > 0.72 ? "Light" : "Mid", saturation: color.c < 0.08 ? "Muted" : color.c > 0.18 ? "Vivid" : "Normal", temperature: Math.abs(t) < 0.2 ? "Neutral" : t > 0 ? "Warm" : "Cool", hueZone, strength: strengthOf(color), hueFactor: factors[hueZone] };
}

function secondarySpec(a: PrimaryAnalysis, strategy: PaletteConceptId, mode: ThemeMode) {
  const p = a.color, s = a.strength;
  let angle = 40 * a.hueFactor * (1 + 0.15 * s);
  let ratio = 0.9 - 0.45 * s;
  let l = p.l <= 0.65 ? Math.min(0.78, p.l + 0.15) : Math.max(0.52, p.l - 0.15);
  let gap = 0.15;
  if (strategy === "soft-harmony") { angle = 30 * a.hueFactor; ratio = p.c < 0.08 ? 0.9 : 0.55 - 0.2 * s; l = Math.min(0.94, p.l + 0.15); }
  if (strategy === "tonal") { angle = 4; ratio = 0.6 - 0.35 * s; gap = 0.18; l = p.l <= 0.65 ? Math.min(0.9, p.l + gap) : Math.max(0.25, p.l - gap); }
  if (strategy === "analog") { angle = 80 * a.hueFactor * (1 - 0.25 * s); ratio *= 0.85; }
  if (strategy === "split-contrast") angle = 40 * a.hueFactor;
  if (strategy === "triadic") { angle = 120; ratio = 0.6 - 0.3 * s; }
  if (strategy === "neutralized") { angle = 8; ratio = 0.3 - 0.15 * s; l = mode === "light" ? 0.82 : 0.32; gap = Math.abs(l - p.l); }
  return { angle, ratio, l, gap };
}

export function generateBrandPalette(primary: OklchColor, strategy: PaletteConceptId, mode: ThemeMode = "light"): BrandPalette {
  const analysis = analyzePrimary(primary), spec = secondarySpec(analysis, strategy, mode);
  const secondaryCandidates: Candidate[] = [];
  const offsets = strategy === "triadic" ? [105, 115, 120, 125, 130, 135] : [-1, 1].flatMap(sign => [0.8, 1, 1.2].map(k => sign * spec.angle * k));
  for (const offset of offsets) for (let variant = 0; variant < 5; variant++) {
    const requested = colorAt(spec.l + (variant - 2) * 0.012, Math.max(strategy === "neutralized" ? 0.005 : 0, primary.c * spec.ratio * (0.9 + variant * 0.05)), primary.h + offset);
    const color = parseToOklch(formatHex(fitCandidate(requested))!);
    const scores: ScoreParts = {
      harmony: Math.min(primary.c, color.c) < 0.005 ? 1 : gaussian(hueDistance(primary.h, color.h), Math.abs(spec.angle), Math.max(4, spec.angle * 0.25)),
      roleSeparation: clamp((strengthOf(primary) - strengthOf(color) + 0.18) / 0.35, 0, 1) * clamp(Math.abs(primary.l - color.l) / (strategy === "tonal" ? 0.15 : 0.08), 0, 1),
      chromaBalance: gaussian(color.c, primary.c * spec.ratio, Math.max(0.008, primary.c * 0.25)),
      lightness: gaussian(Math.abs(primary.l - color.l), spec.gap, 0.09),
      gamut: requested.c > 1e-6 ? clamp(color.c / requested.c, 0, 1) : 1,
    };
    if (strategy === "tonal" && Math.abs(primary.l - color.l) < 0.15) continue;
    secondaryCandidates.push(makeCandidate(color, requested.c, scores));
  }
  const headroomWeight: Record<PaletteConceptId, number> = { "near-harmony": 0.12, "soft-harmony": 0.07, tonal: 0.12, analog: 0.12, "split-contrast": 0.07, triadic: 0.02, neutralized: 0.02 };
  for (const candidate of secondaryCandidates) {
    candidate.headroom = accentHeadroom(primary, candidate.color);
    candidate.preScore = lerp(candidate.score, candidate.headroom, headroomWeight[strategy]);
  }
  const shortlist = [...secondaryCandidates].sort((a, b) => b.preScore! - a.preScore!).slice(0, SECONDARY_SHORTLIST_SIZE);
  const pairs: PairEvaluation[] = [];
  let winner: { secondary: Candidate; accent: Candidate; candidates: Candidate[]; pair: PairEvaluation } | undefined;
  for (const secondary of shortlist) {
    const candidates = generateAccentCandidates(primary, secondary.color, strategy, analysis.strength);
    let bestPair: PairEvaluation | undefined;
    for (const accent of candidates) {
      const pair = evaluatePalettePair(primary, secondary, accent, strategy);
      if (!bestPair || pair.score > bestPair.score) bestPair = pair;
      if (!winner || pair.score > winner.pair.score) winner = { secondary, accent, candidates, pair };
    }
    pairs.push(bestPair!);
  }
  const { secondary, accent, candidates: accentCandidates, pair: selectedPair } = winner!;
  const colors = [primary, secondary.color, accent.color], weights = [0.5, 0.2, 0.3];
  const average = (fn: (c: OklchColor) => number) => colors.reduce((sum, c, i) => sum + fn(c) * weights[i], 0);
  const t = average(c => temperature(c.h, c.c));
  const character: BrandCharacter = {
    vividness: average(strengthOf), brightness: average(c => c.l), temperature: t,
    chromaLevel: clamp(average(c => c.c) / 0.28, 0, 1),
    contrast: clamp((Math.abs(primary.l - secondary.color.l) + Math.abs(primary.l - accent.color.l)) * 0.7 + analysis.strength * 0.5, 0, 1),
    neutralBias: t,
  };
  return { analysis, character, secondary, accent, secondaryCandidates, accentCandidates, pairs, selectedPair };
}
function makeCandidate(color: OklchColor, requestedChroma: number, scores: ScoreParts): Candidate {
  return { color, hex: toHex(color), requestedChroma, scores, score: scores.harmony * 0.30 + scores.roleSeparation * 0.25 + scores.chromaBalance * 0.20 + scores.lightness * 0.15 + scores.gamut * 0.10 };
}

export const ACCENT_HUE_STEP = 6;
export const SECONDARY_SHORTLIST_SIZE = 8;
const smoothstep = (low: number, high: number, value: number) => {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
};
const occupancy = (color: OklchColor) => smoothstep(0.005, 0.12, color.c);
const deltaColor = (a: OklchColor, b: OklchColor) => Math.sqrt((a.l - b.l) ** 2 + a.c ** 2 + b.c ** 2 - 2 * a.c * b.c * Math.cos(hueDistance(a.h, b.h) * Math.PI / 180));

export function circularMeanHue(h1: number, h2: number, w1 = 0.6, w2 = 0.4) {
  const x = Math.cos(h1 * Math.PI / 180) * w1 + Math.cos(h2 * Math.PI / 180) * w2;
  const y = Math.sin(h1 * Math.PI / 180) * w1 + Math.sin(h2 * Math.PI / 180) * w2;
  return Math.hypot(x, y) < 1e-9 ? rotateHue(h1, 0) : rotateHue(Math.atan2(y, x) * 180 / Math.PI, 0);
}
export function occupiedHueCluster(p: OklchColor, s: OklchColor) {
  const influence = clamp(s.c / Math.max(p.c, 0.005), 0, 1);
  // Near-gray hue is undefined perceptually; fade its vote to zero.
  const wp = smoothstep(0.001, 0.03, p.c);
  const ws = (0.2 + 0.8 * influence) * smoothstep(0.001, 0.03, s.c);
  return wp + ws < 1e-9 ? 260 : circularMeanHue(p.h, s.h, wp, ws);
}
export function accentHeadroom(p: OklchColor, s: OklchColor, minDistance = 60) {
  let free = 0;
  for (let h = 0; h < 360; h += ACCENT_HUE_STEP) {
    const pFree = hueDistance(h, p.h) > minDistance ? 1 : 1 - occupancy(p);
    const sFree = hueDistance(h, s.h) > minDistance ? 1 : 1 - occupancy(s);
    free += pFree * sFree;
  }
  return free / (360 / ACCENT_HUE_STEP);
}
export function accentTargets(p: OklchColor, s: OklchColor, strategy: PaletteConceptId, strength = strengthOf(p)) {
  // A provisional character derived ONLY from P/S avoids circular dependencies.
  const vividness = strengthOf(p) * 0.7 + strengthOf(s) * 0.3;
  const brandL = p.l * 0.6 + s.l * 0.4;
  const modifiers: Record<PaletteConceptId, number> = { "near-harmony": 0.95, "soft-harmony": 0.65, tonal: 0.70, analog: 0.85, "split-contrast": 1, triadic: 0.80, neutralized: 1.10 };
  return { cluster: occupiedHueCluster(p, s), vividness, l: brandL < 0.5 ? 0.65 : brandL > 0.75 ? 0.55 : 0.62,
    c: lerp(0.045, 0.24, vividness) * lerp(1.15, 0.78, strength) * modifiers[strategy], strength };
}
function strategyHueScore(h: number, p: OklchColor, s: OklchColor, strategy: PaletteConceptId, target: ReturnType<typeof accentTargets>) {
  const opposite = rotateHue(target.cluster, 180);
  if (strategy === "soft-harmony") return gaussian(hueDistance(h, opposite), 0, 48);
  if (strategy === "tonal") {
    const d = hueDistance(h, p.h);
    const band = smoothstep(65, 80, d) * (1 - smoothstep(150, 165, d));
    return band * (0.85 + 0.15 * (1 - clamp((d - 80) / 70, 0, 1)));
  }
  if (strategy === "analog") {
    const nearest = Math.min(hueDistance(h, p.h), hueDistance(h, s.h));
    return 0.45 * gaussian(hueDistance(h, opposite), 0, 28) + 0.55 * clamp(nearest / 150, 0, 1);
  }
  if (strategy === "split-contrast") {
    const split = lerp(20, 40, 1 - target.strength), complement = rotateHue(p.h, 180);
    const a = rotateHue(complement, -split), b = rotateHue(complement, split);
    const preferred = hueDistance(a, s.h) >= hueDistance(b, s.h) ? a : b;
    const other = preferred === a ? b : a;
    return Math.max(gaussian(hueDistance(h, preferred), 0, 15), gaussian(hueDistance(h, other), 0, 15) * lerp(1, 0.6, occupancy(s)));
  }
  if (strategy === "triadic") {
    const a = rotateHue(p.h, 120), b = rotateHue(p.h, -120);
    const unused = hueDistance(s.h, a) < hueDistance(s.h, b) ? b : a;
    return gaussian(hueDistance(h, unused), 0, 16);
  }
  return gaussian(hueDistance(h, opposite), 0, strategy === "neutralized" ? 35 : 22);
}

/** Full wheel search: 60 hues x 3 lightnesses x 3 chromas per Secondary. */
export function generateAccentCandidates(p: OklchColor, secondary: OklchColor, strategy: PaletteConceptId, strength = strengthOf(p)): Candidate[] {
  const target = accentTargets(p, secondary, strategy, strength);
  const candidates: Candidate[] = [];
  const weights: AccentScoreParts = strategy === "soft-harmony"
    ? { strategyHue: 0.20, hueSeparation: 0.15, roleContrast: 0.08, chromaFit: 0.25, lightnessFit: 0.05, brandFit: 0.20, gamut: 0.07 }
    : strategy === "triadic"
      ? { strategyHue: 0.40, hueSeparation: 0.15, roleContrast: 0.12, chromaFit: 0.10, lightnessFit: 0.07, brandFit: 0.09, gamut: 0.07 }
      : strategy === "neutralized"
        ? { strategyHue: 0.25, hueSeparation: 0.15, roleContrast: 0.15, chromaFit: 0.08, lightnessFit: 0.07, brandFit: 0.20, gamut: 0.10 }
        : { strategyHue: 0.30, hueSeparation: 0.20, roleContrast: 0.15, chromaFit: 0.12, lightnessFit: 0.08, brandFit: 0.08, gamut: 0.07 };
  for (let h = 0; h < 360; h += ACCENT_HUE_STEP) for (const dl of [-0.04, 0, 0.04]) for (const ratio of [0.8, 1, 1.15]) {
    const requested = colorAt(target.l + dl, target.c * ratio, h), color = fitCandidate(requested);
    // Score quantized displayed colors so a rounding artifact cannot win on paper.
    const hex = formatHex(color)!;
    const displayed = parseToOklch(hex);
    const dP = hueDistance(displayed.h, p.h), dS = hueDistance(displayed.h, secondary.h);
    const pDistance = lerp(180, dP, occupancy(p));
    const sDistance = lerp(180, dS, occupancy(secondary));
    const separation = smoothstep(30, 110, Math.min(pDistance, sDistance));
    const roleContrast = (smoothstep(0.05, 0.25, deltaColor(displayed, p)) + smoothstep(0.05, 0.20, deltaColor(displayed, secondary))) / 2;
    const softPenalty = strategy === "soft-harmony" && displayed.c > target.c ? Math.exp(-8 * (displayed.c / target.c - 1)) : 1;
    const brandFit = strategy === "neutralized" ? clamp(displayed.c / (target.c * 1.15), 0, 1)
      : gaussian(strengthOf(displayed), strengthOf(colorAt(target.l, target.c, h)), 0.2) * softPenalty;
    const accentScores: AccentScoreParts = {
      strategyHue: strategyHueScore(displayed.h, p, secondary, strategy, target), hueSeparation: separation, roleContrast,
      chromaFit: gaussian(displayed.c, target.c, Math.max(0.01, target.c * 0.25)) * softPenalty,
      lightnessFit: gaussian(displayed.l, target.l, 0.055), brandFit,
      gamut: clamp(color.c / Math.max(requested.c, 1e-6), 0, 1),
    };
    let score = (Object.keys(weights) as (keyof AccentScoreParts)[]).reduce((sum, key) => sum + weights[key] * accentScores[key], 0);
    // Strongly reject occupied chromatic hues; gray roles do not occupy an arc.
    score *= lerp(0.05, 1, smoothstep(20, 50, Math.min(pDistance, sDistance)));
    candidates.push({ color: displayed, hex, requestedChroma: requested.c, requestedHue: h, score, accentScores,
      scores: { harmony: accentScores.strategyHue, roleSeparation: separation, chromaBalance: accentScores.chromaFit, lightness: accentScores.lightnessFit, gamut: accentScores.gamut } });
  }
  return candidates;
}

export function evaluatePalettePair(p: OklchColor, secondary: Candidate, accent: Candidate, strategy: PaletteConceptId): PairEvaluation {
  const s = secondary.color, a = accent.color;
  const aScores = accent.accentScores!;
  const dPS = hueDistance(p.h, s.h), dPA = hueDistance(p.h, a.h), dSA = hueDistance(s.h, a.h);
  const hueDistribution = strategy === "triadic"
    ? (gaussian(dPS, 120, 25) + gaussian(dPA, 120, 25) + gaussian(dSA, 120, 25)) / 3
    : secondary.scores.harmony * 0.35 + aScores.strategyHue * 0.35 + aScores.hueSeparation * 0.30;
  const secondaryHierarchy = 1 - clamp((strengthOf(s) - strengthOf(p)) / 0.2, 0, 1);
  const balance: PairBalance = {
    hueDistribution,
    visualHierarchy: secondaryHierarchy * 0.6 + aScores.brandFit * 0.4,
    chromaHierarchy: secondary.scores.chromaBalance * 0.5 + aScores.chromaFit * 0.5,
    lightnessDistribution: secondary.scores.lightness * 0.5 + (smoothstep(0.025, 0.12, Math.abs(p.l - a.l)) + smoothstep(0.025, 0.12, Math.abs(s.l - a.l))) * 0.25,
    roleDistinctness: (smoothstep(0.06, 0.18, deltaColor(p, s)) + smoothstep(0.06, 0.22, deltaColor(p, a)) + smoothstep(0.06, 0.22, deltaColor(s, a))) / 3,
  };
  const threeColorBalance = Object.values(balance).reduce((sum, score) => sum + score, 0) / 5;
  const secondaryPreScore = secondary.preScore ?? secondary.score;
  return { secondary: secondary.hex, accent: accent.hex, secondaryPreScore, accentScore: accent.score, threeColorBalance,
    score: secondaryPreScore * 0.35 + accent.score * 0.35 + threeColorBalance * 0.30, balance, headroom: secondary.headroom ?? accentHeadroom(p, s) };
}

export function primitiveScale(source: string) {
  const base = parseToOklch(source);
  const index = SCALE_LIGHTNESS.reduce((best, l, i) => Math.abs(l - base.l) < Math.abs(SCALE_LIGHTNESS[best] - base.l) ? i : best, 0);
  const scale = {} as ColorScale<PrimaryStep>;
  for (let i = 0; i < SCALE_STEPS.length; i++) {
    const l = SCALE_LIGHTNESS[i];
    // Smooth chroma envelope peaks around 500/600 without pinning the base there.
    const envelope = Math.pow(Math.max(0, Math.sin(Math.PI * l)), 1.4);
    const baseEnvelope = Math.max(0.12, Math.pow(Math.sin(Math.PI * base.l), 1.4));
    scale[SCALE_STEPS[i]] = i === index ? source.toLowerCase() : toHex(fitCandidate(colorAt(l, Math.min(base.c * envelope / baseEnvelope, base.c * 1.15), base.h)));
  }
  return { scale, anchorStep: SCALE_STEPS[index] };
}
export function neutralScale(character: BrandCharacter): ColorScale<NeutralStep> {
  const hue = character.temperature >= 0 ? 75 : 255;
  const c = lerp(0.005, 0.025, Math.abs(character.neutralBias)) * lerp(0.7, 1, character.vividness);
  const scale = {} as ColorScale<NeutralStep>;
  SCALE_STEPS.forEach((step, i) => { scale[step] = toHex(fitCandidate(colorAt(SCALE_LIGHTNESS[i], c * Math.sin(Math.PI * SCALE_LIGHTNESS[i]), hue))); });
  scale[0] = "#ffffff"; scale[1000] = "#000000";
  scale[850] = toHex(fitCandidate(colorAt(0.275, c * 0.6, hue)));
  return scale;
}

/** Test the rendered hex, including quantization, and preserve hue while correcting L. */
export function ensureReadable(seed: string, against: string[], minimum = 4.5) {
  const passes = (hex: string) => against.every(bg => contrastRatio(hex, bg) >= minimum);
  if (passes(seed)) return seed;
  const color = parseToOklch(seed);
  const options: Array<{ hex: string; delta: number }> = [];
  for (const direction of [-1, 1]) for (let i = 1; i <= 100; i++) {
    const next = fitCandidate(colorAt(color.l + direction * i * 0.01, color.c, color.h));
    const hex = toHex(next);
    if (passes(hex)) { options.push({ hex, delta: Math.abs(next.l - color.l) }); break; }
  }
  return options.sort((a, b) => a.delta - b.delta)[0]?.hex ?? (["#000000", "#ffffff"].find(passes) || seed);
}
export function onColor(hex: string) { return getOnColor(hex); }
export function actionTokens(base: string, character: BrandCharacter, neutral: ColorScale<NeutralStep>, surfaces: string[], mode: ThemeMode): ActionTokens {
  const c = parseToOklch(base), direction = c.l < 0.35 ? 1 : -1;
  const hover = toHex(fitCandidate(colorAt(c.l + direction * lerp(0.025, 0.06, character.contrast), c.c * 1.02, c.h)));
  const pressed = toHex(fitCandidate(colorAt(c.l + direction * lerp(0.05, 0.11, character.contrast), c.c * 0.97, c.h)));
  const selected = toHex(fitCandidate(colorAt(mode === "light" ? lerp(0.97, 0.92, character.contrast) : lerp(0.24, 0.30, character.contrast), c.c * lerp(0.10, 0.25, character.vividness), c.h)));
  const selectedText = ensureReadable(toHex(colorAt(mode === "light" ? 0.38 : 0.87, c.c * 0.65, c.h)), [selected]);
  const selectedBorder = ensureReadable(toHex(colorAt(mode === "light" ? 0.62 : 0.70, c.c * 0.8, c.h)), [selected], 3);
  return { default: base, hover, pressed, on: onColor(base), onHover: onColor(hover), onPressed: onColor(pressed), selected, selectedBorder, selectedText, selectedIcon: selectedText,
    focus: ensureReadable(base, surfaces, 3), disabled: neutral[mode === "light" ? 100 : 800], disabledText: neutral[500] };
}
export const STATUS_HUES: Record<StatusName, number[]> = { success: [138, 144, 150, 155], warning: [75, 82, 88, 95], danger: [20, 23, 27, 30], info: [230, 240, 250, 260] };
export function statusTokens(role: StatusName, brand: BrandPalette, neutral: ColorScale<NeutralStep>, surfaces: string[], mode: ThemeMode): StatusTokens {
  const baseC = { success: 0.14, warning: 0.13, danger: 0.16, info: 0.14 }[role];
  const l = clamp(0.62 + (brand.character.brightness - 0.6) * 0.15, 0.50, 0.75);
  const c = baseC * lerp(0.65, 1.05, brand.character.vividness);
  const hue = STATUS_HUES[role].reduce((best, h) => {
    const score = (hue: number) => Math.min(...[brand.analysis.color.h, brand.secondary.color.h, brand.accent.color.h].map(other => hueDistance(hue, other))) + 20 * fitCandidate(colorAt(l, c, hue)).c / c;
    return score(h) > score(best) ? h : best;
  });
  const base = toHex(fitCandidate(colorAt(l, c, hue)));
  const surface = toHex(fitCandidate(colorAt(mode === "light" ? 0.95 : 0.25, c * 0.16, hue)));
  const surfaceStrong = toHex(fitCandidate(colorAt(mode === "light" ? 0.90 : 0.32, c * 0.25, hue)));
  const border = toHex(fitCandidate(colorAt(mode === "light" ? 0.78 : 0.58, c * 0.5, hue)));
  const text = ensureReadable(toHex(colorAt(mode === "light" ? 0.40 : 0.88, c * 0.75, hue)), [surface, surfaceStrong]);
  return { ...actionTokens(base, brand.character, neutral, surfaces, mode), surface, surfaceStrong, border, text, icon: text };
}

