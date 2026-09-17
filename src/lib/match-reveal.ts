export type MatchStage =
  | "idle"
  | "press"
  | "glow"
  | "palette"
  | "bg"
  | "components"
  | "status"
  | "tokens"
  | "done";

export const MATCH_TIMELINE: Array<[number, MatchStage]> = [
  [0, "press"],
  [80, "glow"],
  [180, "palette"],
  [300, "bg"],
  [450, "components"],
  [600, "status"],
  [800, "tokens"],
  [1000, "done"],
];

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const LOAD_STEP_MS = 520;
export const LOAD_HOLD_MS = 780;

export function runMatchLogs(
  stepCount: number,
  onStep: (visibleCount: number) => void,
  onDone?: () => void,
) {
  if (prefersReducedMotion()) {
    onStep(stepCount);
    const timeout = window.setTimeout(() => onDone?.(), 280);
    return () => window.clearTimeout(timeout);
  }

  const timers = Array.from({ length: stepCount }, (_, index) =>
    window.setTimeout(() => onStep(index + 1), index * LOAD_STEP_MS),
  );
  timers.push(
    window.setTimeout(() => onDone?.(), Math.max(0, stepCount - 1) * LOAD_STEP_MS + LOAD_HOLD_MS),
  );

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}

export function runMatchReveal(
  onStage: (stage: MatchStage) => void,
  onDone?: () => void,
) {
  if (prefersReducedMotion()) {
    onStage("done");
    const timeout = window.setTimeout(() => onDone?.(), 150);
    return () => window.clearTimeout(timeout);
  }

  const timers = MATCH_TIMELINE.map(([ms, stage]) =>
    window.setTimeout(() => {
      onStage(stage);
      if (stage === "done") onDone?.();
    }, ms),
  );

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}
