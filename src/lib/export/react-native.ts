import { flattenObject, type ColorSystemResult } from "@/lib/color-engine";

function camel(path: string) {
  return path
    .split(".")
    .map((part, index) =>
      index === 0 ? part : part[0].toUpperCase() + part.slice(1),
    )
    .join("");
}

function flattenMode(tokens: unknown) {
  return Object.fromEntries(
    flattenObject(tokens).map((entry) => [camel(entry.path), entry.value]),
  );
}

export function exportReactNative(result: ColorSystemResult) {
  const theme = {
    light: flattenMode(result.semantic.light),
    dark: flattenMode(result.semantic.dark),
  };

  return `export const theme = ${JSON.stringify(theme, null, 2)} as const;\n`;
}
