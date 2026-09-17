import type { ColorSystemResult, GenerateInput } from "@/lib/color-engine";
import { exportCss } from "./css";
import { exportJson } from "./json";
import { exportReactNative } from "./react-native";
import { exportTailwind } from "./tailwind";

export type ExportFormat = "css" | "tailwind" | "react-native" | "json";

export function formatExport(
  format: ExportFormat,
  result: ColorSystemResult,
  input: GenerateInput,
) {
  switch (format) {
    case "css":
      return { filename: "matchu.css", language: "css", code: exportCss(result) };
    case "tailwind":
      return {
        filename: "matchu.tailwind.js",
        language: "javascript",
        code: exportTailwind(result),
      };
    case "react-native":
      return {
        filename: "matchu.theme.ts",
        language: "typescript",
        code: exportReactNative(result),
      };
    case "json":
      return {
        filename: "matchu.tokens.json",
        language: "json",
        code: exportJson(result, input),
      };
  }
}

export { exportCss };
