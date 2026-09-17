import { MOOD_PRESETS } from "./constants";
import { parseToOklch } from "./color-utils";
import { CORE_TOKENS } from "./core-tokens";
import { fixContrastFailures } from "./contrast";
import { mapSemanticTokens } from "./semantic";
import {
  generateColorScale,
  generateNeutralScale,
  generateStatusScale,
  selectAccentHue,
  selectSecondaryHue,
} from "./scales";
import {
  ENGINE_VERSION,
  type ColorSystemResult,
  type GenerateInput,
} from "./types";

export function generateColorSystem(input: GenerateInput): ColorSystemResult {
  const source = parseToOklch(input.hex);
  const mood = MOOD_PRESETS[input.mood];
  const chroma = source.c * mood.chromaMultiplier;

  const primary = generateColorScale({
    hue: source.h,
    chroma,
    sourceColor: source,
    sourceHex: input.hex,
  });

  const secondaryHue = selectSecondaryHue(source.h, input.secondaryMode);
  const secondary = generateColorScale({
    hue: secondaryHue,
    chroma: chroma * 0.75,
  });

  const accent = generateColorScale({
    hue: selectAccentHue(source.h),
    chroma: chroma * 0.85,
  });

  const primitives = {
    primary: primary.scale,
    secondary: secondary.scale,
    accent: accent.scale,
    neutral: generateNeutralScale({
      hue: source.h,
      style: input.neutralStyle,
      moodChroma: mood.neutralChroma,
    }),
    success: generateStatusScale("success", source.c),
    warning: generateStatusScale("warning", source.c),
    danger: generateStatusScale("danger", source.c),
    info: generateStatusScale("info", source.c),
  };

  const lightMapped = mapSemanticTokens({
    primitives,
    mood: input.mood,
    mode: "light",
    target: input.accessibilityTarget,
  });
  const darkMapped = mapSemanticTokens({
    primitives,
    mood: input.mood,
    mode: "dark",
    target: input.accessibilityTarget,
  });

  const light = fixContrastFailures(lightMapped, input.accessibilityTarget);
  const dark = fixContrastFailures(darkMapped, input.accessibilityTarget);

  return {
    source: primary.scale[primary.anchorStep],
    primitive: primitives,
    semantic: {
      light: light.theme,
      dark: dark.theme,
    },
    accessibility: {
      light: light.report,
      dark: dark.report,
    },
    meta: {
      engineVersion: ENGINE_VERSION,
      anchorStep: primary.anchorStep,
      sourceHex: primary.scale[primary.anchorStep],
      coreTokenCount: CORE_TOKENS.length,
    },
  };
}
