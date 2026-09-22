import {
  flattenObject,
  primitivesToCssVars,
  semanticToCssVars,
  type ColorSystemResult,
} from "@/lib/color-engine";
import { paletteTokensToCssVariables } from "@/lib/palette-semantic-tokens";

function block(title: string, vars: Record<string, string>) {
  const lines = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`);
  return `  /* ${title} */\n${lines.join("\n")}`;
}

function groupedSemantic(vars: Record<string, string>) {
  const groups = new Map<string, Record<string, string>>();
  for (const [key, value] of Object.entries(vars)) {
    const group = key.replace("--color-", "").split("-")[0];
    const current = groups.get(group) ?? {};
    current[key] = value;
    groups.set(group, current);
  }
  return [...groups.entries()]
    .map(([group, items]) => block(group, items))
    .join("\n\n");
}

export function exportCss(result: ColorSystemResult) {
  const light = semanticToCssVars(result.semantic.light);
  const dark = semanticToCssVars(result.semantic.dark);
  const primitives = primitivesToCssVars(result.primitive);

  const derived = paletteTokensToCssVariables(result.derived.light);
  const derivedDark = paletteTokensToCssVariables(result.derived.dark);
  return `:root {\n${groupedSemantic(light)}\n\n${block("primitives", primitives)}\n\n${block("derived", derived)}\n}\n\n.dark {\n${groupedSemantic(dark)}\n\n${block("derived", derivedDark)}\n}\n`;
}

export function exportCssLightOnly(result: ColorSystemResult) {
  return `:root {\n${groupedSemantic(semanticToCssVars(result.semantic.light))}\n}\n`;
}

export function tokenCount(result: ColorSystemResult) {
  return flattenObject(result.semantic.light).length;
}
