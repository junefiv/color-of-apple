export const BREAKPOINTS = {
  compact: 440,
  mobile: 720,
  desktopWorkbench: 1200,
} as const;

export const MEDIA_QUERIES = {
  compact: `(max-width: ${BREAKPOINTS.compact}px)`,
  mobile: `(max-width: ${BREAKPOINTS.mobile}px)`,
  desktopWorkbench: `(min-width: ${BREAKPOINTS.desktopWorkbench}px)`,
} as const;
