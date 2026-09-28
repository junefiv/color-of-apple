import { chooseOnColor, mixOklab, shiftLightness } from "./color-utils";
import type { SemanticTokens } from "./types";

type BrandRoot = "primary" | "secondary" | "accent";

/**
 * Expands a brand colour edit into the state tokens that are expected to move
 * with it. The returned values are overrides, so generated tokens remain the
 * source of truth when the user resets their changes.
 */
export function deriveBrandTokenOverrides(
  tokens: SemanticTokens,
  path: string,
  value: string,
): Record<string, string> {
  if (!/^(primary|secondary|accent)\.default$/.test(path)) {
    return { [path]: value };
  }

  const root = path.split(".")[0] as BrandRoot;
  const canvas = tokens.background.canvas;
  const hover = shiftLightness(value, -0.05);
  const pressed = shiftLightness(value, -0.1);
  const selected = mixOklab(canvas, value, 0.18);
  const subtle = mixOklab(canvas, value, 0.12);
  const onKey = root === "primary" ? "onPrimary" : root === "secondary" ? "onSecondary" : "onAccent";

  const patch: Record<string, string> = {
    [`${root}.default`]: value,
    [`${root}.hover`]: hover,
    [`${root}.pressed`]: pressed,
    [`${root}.selected`]: selected,
    [`${root}.subtle`]: subtle,
    [`${root}.border`]: value,
    [`${root}.text`]: value,
    [`${root}.${onKey}`]: chooseOnColor(value),
  };

  if (root === "primary") {
    Object.assign(patch, {
      "interaction.primaryHover": hover,
      "interaction.primaryPressed": pressed,
      "interaction.primarySelected": selected,
      "interaction.focusRing": value,
      "interaction.selection": mixOklab(canvas, value, 0.22),
      "border.focus": value,
      "text.brand": value,
      "text.link": value,
    });
  } else if (root === "secondary") {
    Object.assign(patch, {
      "interaction.secondaryHover": hover,
      "interaction.secondaryPressed": pressed,
    });
  }

  return patch;
}
