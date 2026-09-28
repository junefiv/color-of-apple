import { flattenObject, type ColorSystemResult } from "@/lib/color-engine";

type DtcgColorToken = {
  $type: "color";
  $value: {
    colorSpace: "srgb";
    components: [number, number, number];
    alpha: number;
    hex: string;
  };
};

function colorToken(value: string): DtcgColorToken {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(value);
  if (!match) throw new Error(`Unsupported Figma color: ${value}`);

  const rgb = match[1];
  const channel = (offset: number) => Number.parseInt(rgb.slice(offset, offset + 2), 16) / 255;
  return {
    $type: "color",
    $value: {
      colorSpace: "srgb",
      components: [channel(0), channel(2), channel(4)],
      alpha: match[2] ? Number.parseInt(match[2], 16) / 255 : 1,
      hex: `#${rgb.toUpperCase()}`,
    },
  };
}

function nestLightTokens(result: ColorSystemResult) {
  const root: Record<string, unknown> = {};

  for (const { path, value } of flattenObject(result.semantic.light)) {
    const parts = path.split(".");
    let cursor = root;
    for (const part of parts.slice(0, -1)) {
      cursor[part] = cursor[part] ?? {};
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = colorToken(value);
  }

  return root;
}

/** Figma Variables import file using the DTCG color-token format. */
export function exportFigmaLight(result: ColorSystemResult) {
  return `${JSON.stringify(nestLightTokens(result), null, 2)}\n`;
}
