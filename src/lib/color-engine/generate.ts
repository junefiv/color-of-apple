import { applyGeneratedToSemantic, generatePalette } from "@/lib/palette";
import { paletteRoles } from "@/lib/space-palettes";
import { parseToOklch, preserveSourceHex } from "./color-utils";
import { CORE_TOKENS } from "./core-tokens";
import { fixContrastFailures } from "./contrast";
import { mapSemanticTokens } from "./semantic";
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
  const roles = paletteRoles(input.hex, paletteId);
  const lightTokens = generatePalette(input.hex, paletteId, "light").tokens;
  const darkTokens = generatePalette(input.hex, paletteId, "dark").tokens;
  const primitives = lightTokens.system.primitives;
  const lightMapped = applyGeneratedToSemantic(
    mapSemanticTokens({
      primitives,
      mood: input.mood,
      mode: "light",
      target: input.accessibilityTarget,
      sourceHex,
      palette: roles,
    }),
    lightTokens,
  );
  const darkMapped = applyGeneratedToSemantic(
    mapSemanticTokens({
      primitives,
      mood: input.mood,
      mode: "dark",
      target: input.accessibilityTarget,
      sourceHex,
      palette: roles,
    }),
    darkTokens,
  );

  const light = fixContrastFailures(lightMapped, input.accessibilityTarget);
  const dark = fixContrastFailures(darkMapped, input.accessibilityTarget);

  return {
    source: sourceHex,
    primitive: primitives,
    derived: {
      light: lightTokens,
      dark: darkTokens,
    },
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
      anchorStep: lightTokens.system.anchors.primary,
      sourceHex,
      coreTokenCount: CORE_TOKENS.length,
    },
  };
}
