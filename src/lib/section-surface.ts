// Token roles any builder frame can paint its background with. Surveyed sites alternate a few of
// these per section, so sharing them keeps the page rhythm tied to the live palette.
export type SectionSurface = "surface" | "subtle" | "primary" | "secondary" | "inverse" | "transparent";
export const sectionSurfaces: readonly SectionSurface[] = ["surface", "subtle", "primary", "secondary", "inverse", "transparent"];

// [background, text, muted text, hairline] for each role.
export const surfaceColors: Record<SectionSurface, readonly [string, string, string, string]> = {
  surface: ["var(--color-surface-default,#fff)", "var(--color-text-primary,#303039)", "var(--color-text-secondary,#6b6b78)", "var(--color-border-subtle,#e6e6ee)"],
  subtle: ["var(--color-bg-subtle,#f4f4f6)", "var(--color-text-primary,#303039)", "var(--color-text-secondary,#6b6b78)", "var(--color-border-subtle,#e6e6ee)"],
  primary: ["var(--color-primary-default,#303039)", "var(--color-primary-on,#fff)", "color-mix(in oklab,var(--color-primary-on,#fff) 72%,transparent)", "color-mix(in oklab,var(--color-primary-on,#fff) 18%,transparent)"],
  secondary: ["var(--color-secondary-default,#55556a)", "var(--color-secondary-on,#fff)", "color-mix(in oklab,var(--color-secondary-on,#fff) 72%,transparent)", "color-mix(in oklab,var(--color-secondary-on,#fff) 18%,transparent)"],
  inverse: ["var(--color-surface-inverse,#1d1d22)", "var(--color-text-inverse,#fff)", "color-mix(in oklab,var(--color-text-inverse,#fff) 66%,transparent)", "color-mix(in oklab,var(--color-text-inverse,#fff) 16%,transparent)"],
  transparent: ["transparent", "var(--color-text-inverse,#fff)", "color-mix(in oklab,var(--color-text-inverse,#fff) 78%,transparent)", "color-mix(in oklab,var(--color-text-inverse,#fff) 22%,transparent)"],
};

// An arbitrary accent only keeps its contrast on the light roles.
export const isLightSurface = (surface: SectionSurface) => surface === "surface" || surface === "subtle";

// CSS vars for a frame painted on `surface`, prefixed per component (e.g. --ft-bg). The button
// accent keeps the chosen role on light surfaces and inverts against the background on dark ones.
export function surfaceVars(prefix: string, surface: SectionSurface, accent: "primary" | "secondary" | "accent" = "primary"): Record<string, string> {
  const [bg, fg, muted, line] = surfaceColors[surface];
  const light = isLightSurface(surface);
  return { [`--${prefix}-bg`]: bg, [`--${prefix}-fg`]: fg, [`--${prefix}-muted`]: muted, [`--${prefix}-line`]: line,
    [`--${prefix}-accent`]: light ? `var(--color-${accent}-default)` : fg,
    [`--${prefix}-accent-on`]: light ? `var(--color-${accent}-on,#fff)` : surface === "transparent" ? "var(--color-text-primary,#303039)" : bg,
    [`--${prefix}-tint`]: light ? `color-mix(in oklab,var(--color-${accent}-default) 10%,transparent)` : `color-mix(in oklab,${fg} 10%,transparent)` };
}
