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
  const steps: PrimaryStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const defaultFill = scale[baseStep];
  const on = pickOnNeutral(defaultFill, neutral);
  const lightOn = isLightOnInk(on, neutral);
  const baseIndex = steps.indexOf(baseStep);
  const hoverIndex = Math.max(0, Math.min(steps.length - 1, baseIndex + (lightOn ? 1 : -1)));
  const pressedIndex = Math.max(0, Math.min(steps.length - 1, baseIndex + (lightOn ? 2 : -2)));
  const hover = scale[steps[hoverIndex]];
  const pressed = scale[steps[pressedIndex]];

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
