import type { ColorSystemResult, GenerateInput } from "@/lib/color-engine";

export function exportJson(result: ColorSystemResult, input: GenerateInput) {
  return `${JSON.stringify(
    {
      input,
      ...result,
    },
    null,
    2,
  )}\n`;
}
