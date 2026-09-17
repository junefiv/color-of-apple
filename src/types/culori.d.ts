declare module "culori" {
  export type CuloriColor = {
    mode: string;
    alpha?: number;
    l?: number;
    c?: number;
    h?: number;
    r?: number;
    g?: number;
    b?: number;
    [key: string]: unknown;
  };

  export function parse(color: string): CuloriColor | undefined;
  export function converter(
    mode: string,
  ): (color: string | CuloriColor) => CuloriColor | undefined;
  export function formatHex(color: string | CuloriColor): string | undefined;
  export function formatHex8(color: string | CuloriColor): string | undefined;
  export function clampChroma(
    color: string | CuloriColor,
    mode?: string,
  ): CuloriColor;
  export function interpolate(
    colors: Array<string | CuloriColor>,
    mode?: string,
  ): (t: number) => CuloriColor;
  export function wcagContrast(
    a: string | CuloriColor,
    b: string | CuloriColor,
  ): number;
  export function wcagLuminance(color: string | CuloriColor): number;
  export function inGamut(
    mode?: string,
  ): (color: string | CuloriColor) => boolean;
}
