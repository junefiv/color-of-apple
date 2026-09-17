import {
  CHROMA_MULTIPLIER,
  FORBIDDEN_STATUS_RANGES,
  LIGHTNESS_STEPS,
  NEUTRAL_CHROMA,
  NEUTRAL_HUE,
  NEUTRAL_LIGHTNESS,
  NEUTRAL_STEPS,
  PRIMARY_STEPS,
  SEMANTIC_HUES,
} from "./constants";
import {
  clamp,
  findClosestStep,
  fitToSrgb,
  hueDistance,
  preserveSourceHex,
  rotateHue,
  toHex,
} from "./color-utils";
import type {
  ColorScale,
  NeutralStyle,
  OklchColor,
  PrimaryStep,
  SecondaryMode,
  StatusName,
} from "./types";

export function generateColorScale(options: {
  hue: number;
  chroma: number;
  sourceColor?: OklchColor;
  sourceHex?: string;
}): { scale: ColorScale<PrimaryStep>; anchorStep: PrimaryStep } {
  const anchorStep = options.sourceColor
    ? findClosestStep(options.sourceColor.l)
    : 500;

  const scale = {} as ColorScale<PrimaryStep>;

  for (const step of PRIMARY_STEPS) {
    if (options.sourceColor && options.sourceHex && step === anchorStep) {
      scale[step] = preserveSourceHex(options.sourceHex, options.sourceColor);
      continue;
    }

    scale[step] = toHex(
      fitToSrgb({
        mode: "oklch",
        l: LIGHTNESS_STEPS[step],
        c: Math.max(0, options.chroma * CHROMA_MULTIPLIER[step]),
        h: options.hue,
      }),
    );
  }

  return { scale, anchorStep };
}

export function generateNeutralScale(options: {
  hue: number;
  style: NeutralStyle;
  moodChroma: number;
}): ColorScale<number> {
  const hue =
    NEUTRAL_HUE[options.style] === "source"
      ? options.hue
      : (NEUTRAL_HUE[options.style] as number);
  const baseChroma =
    options.style === "pure"
      ? 0
      : clamp(Math.min(NEUTRAL_CHROMA[options.style], options.moodChroma), 0, 0.025);

  const scale = {} as ColorScale<number>;
  for (const step of NEUTRAL_STEPS) {
    const chroma = step === 0 || step === 1000 ? baseChroma * 0.35 : baseChroma;
    scale[step] = toHex(
      fitToSrgb({
        mode: "oklch",
        l: NEUTRAL_LIGHTNESS[step],
        c: chroma,
        h: hue,
      }),
    );
  }
  return scale;
}

function minStatusDistance(hue: number) {
  return Math.min(
    hueDistance(hue, SEMANTIC_HUES.danger),
    hueDistance(hue, SEMANTIC_HUES.warning),
    hueDistance(hue, SEMANTIC_HUES.success),
  );
}

export function isInsideRanges(hue: number, ranges: Array<[number, number]>) {
  return ranges.some(([start, end]) => hue >= start && hue <= end);
}

export function avoidSemanticHue(hue: number) {
  if (isInsideRanges(hue, FORBIDDEN_STATUS_RANGES)) {
    return rotateHue(hue, 35);
  }
  return hue;
}

export function selectSecondaryHue(primaryHue: number, mode: SecondaryMode) {
  if (mode === "monochrome") return primaryHue;
  if (mode === "split") return avoidSemanticHue(rotateHue(primaryHue, 60));
  if (mode === "complementary") return avoidSemanticHue(rotateHue(primaryHue, 180));

  const plus = avoidSemanticHue(rotateHue(primaryHue, 35));
  const minus = avoidSemanticHue(rotateHue(primaryHue, -35));
  return minStatusDistance(plus) >= minStatusDistance(minus) ? plus : minus;
}

export function selectAccentHue(primaryHue: number) {
  return avoidSemanticHue(rotateHue(primaryHue, 150));
}

export function generateStatusScale(
  type: StatusName,
  primaryChroma: number,
): ColorScale<PrimaryStep> {
  const chroma = clamp(primaryChroma * 0.85, 0.12, 0.2);
  return generateColorScale({
    hue: SEMANTIC_HUES[type],
    chroma,
  }).scale;
}
