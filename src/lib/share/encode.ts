import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { DEFAULT_INPUT, ENGINE_VERSION, type GenerateInput } from "@/lib/color-engine";
import { DEFAULT_PALETTE_ID, resolvePaletteId } from "@/lib/space-palettes";
import { readProjectSource, type ProjectSource } from "@/lib/community/source";
import type { PlatformView, PreviewTab } from "@/lib/store";

const KEYS: Array<keyof GenerateInput> = [
  "hex",
  "mood",
  "neutralStyle",
  "secondaryMode",
  "modes",
  "accessibilityTarget",
  "includeAccent",
  "previewTarget",
];

export type SharePayload = {
  input: GenerateInput;
  selectedPaletteId: string;
  overrides: Record<string, string>;
  tokenSnapshot: Record<string, string>;
  platform: PlatformView;
  previewTab: PreviewTab;
  projectTitle?: string;
  engineVersion: string;
  source?: ProjectSource;
};

export function encodeShare(data: Pick<SharePayload, "input" | "selectedPaletteId" | "overrides"> & Partial<Omit<SharePayload, "input" | "selectedPaletteId" | "overrides">>) {
  return compressToEncodedURIComponent(JSON.stringify({
    ...data,
    engineVersion: data.engineVersion ?? ENGINE_VERSION,
  }));
}

function restoreInput(parsed: Partial<GenerateInput>): GenerateInput | null {
  if (!parsed.hex || typeof parsed.hex !== "string") return null;
  return {
    ...DEFAULT_INPUT,
    ...Object.fromEntries(
      KEYS.filter((key) => parsed[key] !== undefined).map((key) => [key, parsed[key]]),
    ),
  } as GenerateInput;
}

function restoreOverrides(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 256)
      .filter(([path, color]) =>
        /^[a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+$/.test(path)
        && typeof color === "string"
        && /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(color),
      )
      .map(([path, color]) => [path, (color as string).toUpperCase()]),
  );
}

const restoreSnapshot = restoreOverrides;

export function decodeShare(payload: string): SharePayload | null {
  try {
    const raw = decompressFromEncodedURIComponent(payload);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SharePayload> & Partial<GenerateInput>;

    // Legacy links stored GenerateInput at the root. Keep them working.
    const input = restoreInput(parsed.input ?? parsed);
    if (!input) return null;

    return {
      input,
      selectedPaletteId: resolvePaletteId(parsed.selectedPaletteId ?? DEFAULT_PALETTE_ID),
      overrides: restoreOverrides(parsed.overrides),
      tokenSnapshot: restoreSnapshot(parsed.tokenSnapshot),
      platform: parsed.platform === "app" ? "app" : "web",
      previewTab: parsed.previewTab === "components" ? "components" : "overview",
      projectTitle: typeof parsed.projectTitle === "string" ? parsed.projectTitle.trim().slice(0, 60) : undefined,
      engineVersion: typeof parsed.engineVersion === "string" ? parsed.engineVersion : ENGINE_VERSION,
      source: readProjectSource(parsed.source) ?? undefined,
    };
  } catch {
    return null;
  }
}
