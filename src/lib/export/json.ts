import { semanticNeutralAliases, type ColorSystemResult, type GenerateInput } from "@/lib/color-engine";

export function exportJson(result: ColorSystemResult, input: GenerateInput) {
  return `${JSON.stringify(
    {
      input,
      ...result,
      _comments: {
        neutralAliases: {
          light: semanticNeutralAliases(result.semantic.light, result.primitive.neutral),
          dark: semanticNeutralAliases(result.semantic.dark, result.primitive.neutral),
        },
      },
    },
    null,
    2,
  )}\n`;
}
