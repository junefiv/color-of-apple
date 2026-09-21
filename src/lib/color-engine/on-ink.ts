import { contrastRatio } from "./color-utils";
import type { ColorScale, NeutralStep, PrimaryStep } from "./types";

const TRANSPARENT = "transparent";

export function pickOnNeutral(
  background: string,
  neutral: ColorScale<NeutralStep>,
): string {
  const n0 = neutral[0];
  const n1000 = neutral[1000];
  return contrastRatio(background, n0) >= contrastRatio(background, n1000) ? n0 : n1000;
}

export function isLightOnInk(on: string, neutral: ColorScale<NeutralStep>) {
  return on === neutral[0];
}

export function filledScaleStates(
  scale: ColorScale<PrimaryStep>,
  neutral: ColorScale<NeutralStep>,
  baseStep: PrimaryStep = 500,
) {
  const defaultFill = scale[baseStep];
  const on = pickOnNeutral(defaultFill, neutral);
  const lightOn = isLightOnInk(on, neutral);
  const hover = lightOn ? scale[600] : scale[400];
  const pressed = lightOn ? scale[700] : scale[300];

  return {
    default: defaultFill,
    hover,
    pressed,
    on,
  };
}

export function filledSecondaryScaleStates(
  scale: ColorScale<PrimaryStep>,
  neutral: ColorScale<NeutralStep>,
) {
  return filledScaleStates(scale, neutral, 500);
}

export { TRANSPARENT };
