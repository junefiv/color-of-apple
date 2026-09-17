"use client";

import { PRIMARY_STEPS, type ColorSystemResult } from "@/lib/color-engine";

export function PaletteStrip({
  result,
  visible,
}: {
  result: ColorSystemResult | null;
  visible: boolean;
}) {
  if (!result) return null;

  return (
    <div className="palette-strip" data-visible={visible} data-testid="palette-strip">
      {PRIMARY_STEPS.map((step) => (
        <span key={step} style={{ background: result.primitive.primary[step] }} title={`primary-${step}`} />
      ))}
    </div>
  );
}
