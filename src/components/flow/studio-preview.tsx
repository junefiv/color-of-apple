"use client";

import { ThemeScope } from "@/components/preview/theme-scope";
import { WorkWeb } from "@/components/preview/kinds/work";
import { WireframePreview } from "@/components/preview/wireframe-preview";
import type { ColorSystemResult } from "@/lib/color-engine";
import type { MatchStage } from "@/lib/match-reveal";

export function StudioPreview({
  result,
  stage,
  hasMatched,
  extraVars,
}: {
  result: ColorSystemResult | null;
  stage: MatchStage;
  hasMatched: boolean;
  extraVars?: Record<string, string>;
}) {
  const colored =
    result &&
    (hasMatched ||
      stage === "palette" ||
      stage === "bg" ||
      stage === "components" ||
      stage === "status" ||
      stage === "tokens" ||
      stage === "done");

  return (
    <div
      className="match-transition overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--surface)]"
      data-stage={hasMatched ? "done" : stage}
      data-testid="studio-preview"
    >
      {colored ? (
        <ThemeScope
          result={result}
          mode="light"
          extraVars={extraVars}
          className="min-h-[420px] p-3 md:p-4"
        >
          <WorkWeb />
        </ThemeScope>
      ) : (
        <WireframePreview />
      )}
    </div>
  );
}
