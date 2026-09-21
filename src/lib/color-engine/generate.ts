import { deriveSelectedPaletteTokens, paletteRoles } from "@/lib/space-palettes";
import { MOOD_PRESETS } from "./constants";
import { parseToOklch, preserveSourceHex } from "./color-utils";
import { CORE_TOKENS } from "./core-tokens";
import { fixContrastFailures } from "./contrast";
import { mapSemanticTokens } from "./semantic";
import {
  generateColorScale,
  generateNeutralScale,
  generateStatusScale,
} from "./scales";
import {
  ENGINE_VERSION,
  type ColorSystemResult,
  type GenerateInput,
} from "./types";

export function generateColorSystem(
  input: GenerateInput,
  paletteId?: string,
): ColorSystemResult {
  const source = parseToOklch(input.hex);
  const sourceHex = preserveSourceHex(input.hex, source);
  const mood = MOOD_PRESETS[input.mood];
  const chroma = source.c * mood.chromaMultiplier;
  const roles = paletteRoles(input.hex, paletteId);

  const primary = generateColorScale({
    hue: source.h,
    chroma,
    sourceColor: source,
    sourceHex,
  });
  primary.scale[500] = sourceHex;

  const secondary = generateColorScale({
    hue: roles.secondary.color.h,
    chroma: Math.max(0.02, roles.secondary.color.c * mood.chromaMultiplier),
    sourceColor: roles.secondary.color,
    sourceHex: roles.secondary.hex,
  });

  const accent = generateColorScale({
    hue: roles.accent.color.h,
    chroma: Math.max(0.03, roles.accent.color.c * mood.chromaMultiplier),
    sourceColor: roles.accent.color,
    sourceHex: roles.accent.hex,
  });

  const primitives = {
    primary: primary.scale,
    secondary: secondary.scale,
    accent: accent.scale,
    neutral: generateNeutralScale({
      hue: parseToOklch(roles.background).h,
      style: input.neutralStyle,
      moodChroma: Math.max(mood.neutralChroma, parseToOklch(roles.background).c),
    }),
    success: generateStatusScale("success", parseToOklch("#20B26B").c),
    warning: generateStatusScale("warning", parseToOklch("#F59E0B").c),
    danger: generateStatusScale("danger", parseToOklch("#E5484D").c),
    info: generateStatusScale("info", parseToOklch("#3182F6").c),
  };

  const lightMapped = mapSemanticTokens({
    primitives,
    mood: input.mood,
    mode: "light",
    target: input.accessibilityTarget,
    sourceHex,
    palette: roles,
  });
  const darkMapped = mapSemanticTokens({
    primitives,
    mood: input.mood,
    mode: "dark",
    target: input.accessibilityTarget,
    sourceHex,
    palette: roles,
  });

  const light = fixContrastFailures(lightMapped, input.accessibilityTarget);
  const dark = fixContrastFailures(darkMapped, input.accessibilityTarget);

  return {
    source: primary.scale[500],
    primitive: primitives,
    derived: deriveSelectedPaletteTokens(input.hex, paletteId),
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
      anchorStep: 500,
      sourceHex: primary.scale[500],
      coreTokenCount: CORE_TOKENS.length,
    },
  };
}
