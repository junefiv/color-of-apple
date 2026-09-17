import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { DEFAULT_INPUT, type GenerateInput } from "@/lib/color-engine";

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

export function encodeShare(input: GenerateInput) {
  return compressToEncodedURIComponent(JSON.stringify(input));
}

export function decodeShare(payload: string): GenerateInput | null {
  try {
    const raw = decompressFromEncodedURIComponent(payload);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GenerateInput>;
    if (!parsed.hex || typeof parsed.hex !== "string") return null;
    return {
      ...DEFAULT_INPUT,
      ...Object.fromEntries(
        KEYS.filter((key) => parsed[key] !== undefined).map((key) => [
          key,
          parsed[key],
        ]),
      ),
    } as GenerateInput;
  } catch {
    return null;
  }
}
