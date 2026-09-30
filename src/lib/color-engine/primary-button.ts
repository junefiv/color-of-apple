import { filledScaleStates } from "./on-ink";
import type { ColorScale, NeutralStep, PrimaryStep, ThemeMode } from "./types";

export function primaryButtonTokens(
  scale: ColorScale<PrimaryStep>,
  neutral: ColorScale<NeutralStep>,
  mode: ThemeMode,
) {
  if (mode === "light") {
    return filledScaleStates(scale, neutral, 600);
  }
  return filledScaleStates(scale, neutral, 400);
}
