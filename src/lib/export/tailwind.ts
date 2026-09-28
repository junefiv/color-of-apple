import { flattenObject, semanticNeutralAliases, type ColorSystemResult } from "@/lib/color-engine";

function nest(entries: Array<{ path: string; value: string }>) {
  const tree: Record<string, unknown> = {};
  for (const entry of entries) {
    const parts = entry.path.split(".");
    let current = tree;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = entry.value;
      } else {
        current[part] = current[part] ?? {};
        current = current[part] as Record<string, unknown>;
      }
    });
  }
  return tree;
}

export function exportTailwind(result: ColorSystemResult) {
  const config = {
    theme: {
      extend: {
        colors: {
          light: nest(flattenObject(result.semantic.light)),
          dark: nest(flattenObject(result.semantic.dark)),
          primitive: nest(flattenObject(result.primitive)),
        },
      },
    },
  };

  return `/** MATCHU Tailwind v3 theme extension */\n${aliasComment(result)}module.exports = ${JSON.stringify(config, null, 2)}\n`;
}

function aliasComment(result: ColorSystemResult) {
  const entries = (["light", "dark"] as const).flatMap((mode) =>
    Object.entries(semanticNeutralAliases(result.semantic[mode], result.primitive.neutral))
      .map(([path, alias]) => ` * ${mode}.${path}: ${alias}`),
  );
  return entries.length ? `/** Neutral aliases\n${entries.join("\n")}\n */\n` : "";
}
