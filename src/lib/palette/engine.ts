import { contrastRatio, parseToOklch, preserveSourceHex } from "@/lib/color-engine/color-utils";
import type { PrimitiveScales, StatusName } from "@/lib/color-engine/types";
import { actionTokens, colorAt, ensureReadable, generateBrandPalette, neutralScale, primitiveScale, statusTokens } from "./adaptive";
import { generateCategoricalPalette } from "./categorical";
import { PALETTE_CONCEPTS, resolvePaletteId } from "./concepts";
import type { GeneratedPalette, PaletteTokens, ThemeMode } from "./types";
import { toHex } from "@/lib/color-engine/color-utils";

export function generatePalette(primaryHex: string, conceptId?: string, mode: ThemeMode = "light"): GeneratedPalette {
  const id = resolvePaletteId(conceptId);
  const source = parseToOklch(primaryHex), primary = preserveSourceHex(primaryHex, source);
  const brand = generateBrandPalette(parseToOklch(primary), id, mode);
  const neutral = neutralScale(brand.character), light = mode === "light";
  const background = neutral[light ? 50 : 950];
  const subtleBackground = neutral[light ? 100 : 900];
  const surface = neutral[light ? 50 : 900];
  const raisedSurface = neutral[light ? 0 : 800];
  const overlaySurface = neutral[light ? 0 : 800];
  const surfaces = [background, subtleBackground, surface, raisedSurface, overlaySurface];
  const primaryScale = primitiveScale(primary), secondaryScale = primitiveScale(brand.secondary.hex), accentScale = primitiveScale(brand.accent.hex);
  const actions = {
    primary: actionTokens(primary, brand.character, neutral, surfaces, mode),
    secondary: actionTokens(brand.secondary.hex, brand.character, neutral, surfaces, mode),
    accent: actionTokens(brand.accent.hex, brand.character, neutral, surfaces, mode),
  };
  const statuses = Object.fromEntries((["success", "warning", "danger", "info"] as StatusName[]).map(role => [role, statusTokens(role, brand, neutral, surfaces, mode)])) as Record<StatusName, ReturnType<typeof statusTokens>>;
  const primitives: PrimitiveScales = { primary: primaryScale.scale, secondary: secondaryScale.scale, accent: accentScale.scale, neutral,
    success: primitiveScale(statuses.success.default).scale, warning: primitiveScale(statuses.warning.default).scale, danger: primitiveScale(statuses.danger.default).scale, info: primitiveScale(statuses.info.default).scale };
  const textPrimary = ensureReadable(neutral[light ? 900 : 50], surfaces);
  const textSecondary = ensureReadable(neutral[light ? 700 : 200], surfaces);
  const textTertiary = ensureReadable(neutral[light ? 600 : 300], surfaces);
  const link = ensureReadable(primary, surfaces);
  const neutralHue = parseToOklch(neutral[500]).h;
  const disabledSurface = toHex(colorAt(light ? 0.95 : 0.27, 0.002, neutralHue));
  const disabledBorder = toHex(colorAt(light ? 0.84 : 0.38, 0.002, neutralHue));
  const disabledText = toHex(colorAt(light ? 0.64 : 0.52, 0.002, neutralHue));
  for (const action of [...Object.values(actions), ...Object.values(statuses)]) { action.disabled = disabledSurface; action.disabledText = disabledText; }
  const categorical = generateCategoricalPalette(primary, brand.character, 8, mode);
  const tokens: PaletteTokens = {
    system: { analysis: brand.analysis, character: brand.character, primitives, anchors: { primary: primaryScale.anchorStep, secondary: secondaryScale.anchorStep, accent: accentScale.anchorStep }, actions, statuses, categorical,
      diagnostics: { secondary: brand.secondaryCandidates, accent: brand.accentCandidates, pairs: brand.pairs, selectedPair: brand.selectedPair,
        secondaryShortlistSize: brand.pairs.length, accentCandidatesPerSecondary: brand.accentCandidates.length, evaluatedPairCount: brand.pairs.length * brand.accentCandidates.length } },
    core: { primary, secondary: brand.secondary.hex, accent: brand.accent.hex, surface, onPrimary: actions.primary.on, onSecondary: actions.secondary.on, onAccent: actions.accent.on, primarySubtle: actions.primary.selected },
    backgroundAndSurface: { background, subtleBackground, raisedSurface, overlaySurface },
    text: { primary: textPrimary, secondary: textSecondary, tertiary: textTertiary, disabled: disabledText, inverse: neutral[light ? 50 : 900], link },
    border: { subtle: neutral[light ? 200 : 800], default: ensureReadable(neutral[light ? 300 : 700], surfaces, 3), strong: ensureReadable(neutral[500], surfaces, 4.5), focus: actions.primary.focus },
    status: { success: statuses.success.default, successSurface: statuses.success.surface, warning: statuses.warning.default, warningSurface: statuses.warning.surface, danger: statuses.danger.default, dangerSurface: statuses.danger.surface, info: statuses.info.default, infoSurface: statuses.info.surface, onSuccess: statuses.success.on, onWarning: statuses.warning.on, onDanger: statuses.danger.on, onInfo: statuses.info.on },
    interaction: { primaryHover: actions.primary.hover, primaryPressed: actions.primary.pressed, primarySelected: actions.primary.selected, secondaryHover: actions.secondary.hover, secondaryPressed: actions.secondary.pressed,
      neutralHover: neutral[light ? 100 : 800], neutralPressed: neutral[light ? 200 : 700], focusRing: actions.primary.focus, disabledSurface, disabledBorder },
  };
  const accessible = [textPrimary, textSecondary, textTertiary, link].every(ink => surfaces.every(bg => contrastRatio(ink, bg) >= 4.5)) &&
    Object.values(actions).every(action => contrastRatio(action.on, action.default) >= 4.5 && contrastRatio(action.onHover, action.hover) >= 4.5 && contrastRatio(action.onPressed, action.pressed) >= 4.5 && surfaces.every(bg => contrastRatio(action.focus, bg) >= 3)) &&
    Object.values(statuses).every(status => contrastRatio(status.text, status.surface) >= 4.5 && contrastRatio(status.icon, status.surface) >= 3);
  return { id, tokens, accessible, corrected: link !== primary || actions.primary.focus !== primary };
}
export function generatePaletteTokens(primaryHex: string, conceptId?: string, mode: ThemeMode = "light") { return generatePalette(primaryHex, conceptId, mode).tokens; }
export function listGeneratedPalettes(primaryHex: string, mode: ThemeMode = "light") { return PALETTE_CONCEPTS.map(concept => generatePalette(primaryHex, concept.id, mode)); }
