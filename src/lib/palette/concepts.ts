import type { PaletteConcept, PaletteConceptId } from "./types";
export const DEFAULT_PALETTE_ID: PaletteConceptId = "soft-harmony";
export const PALETTE_CONCEPTS: PaletteConcept[] = [
  { id: "soft-harmony", name: "Soft Harmony", group: "soft-natural", tags: ["calm"], impression: { ko: "채도를 낮춘 부드러운 조화", en: "A softly damped color harmony" } },
  { id: "near-harmony", name: "Near Harmony", group: "harmony", tags: ["calm"], impression: { ko: "자연스러운 인접색과 선명한 포인트", en: "Natural neighboring colors with a clear accent" } },
  { id: "tonal", name: "Tonal", group: "harmony", tags: ["calm"], impression: { ko: "같은 색 계열의 명도와 채도 위계", en: "Hierarchy through lightness and chroma" } },
  { id: "analog", name: "Analog", group: "harmony", tags: ["calm", "vivid"], impression: { ko: "넓어진 인접색의 흐름", en: "A wider flow of neighboring hues" } },
  { id: "split-contrast", name: "Split Contrast", group: "expressive", tags: ["contrast"], impression: { ko: "보조색을 피해 배치한 분할 대비", en: "A split accent that avoids the secondary hue" } },
  { id: "triadic", name: "Triadic", group: "expressive", tags: ["vivid"], impression: { ko: "강도를 조절한 세 색의 균형", en: "Three hues with a controlled hierarchy" } },
  { id: "neutralized", name: "Neutralized", group: "professional", tags: ["calm"], impression: { ko: "브랜드를 머금은 뉴트럴과 강조색", en: "Brand tinted neutrals with a contrasting accent" } },
];
export const PALETTE_CONCEPT_MAP = Object.fromEntries(PALETTE_CONCEPTS.map(c => [c.id, c])) as Record<PaletteConceptId, PaletteConcept>;
const LEGACY: Record<string, PaletteConceptId> = {
  balance: "near-harmony", neighbor: "near-harmony", "generic-gradient": "near-harmony",
  monochrome: "tonal", cube: "tonal", shades: "tonal",
  "analogous-flow": "analog", "fresh-air": "analog", "skip-shade": "analog",
  complement: "split-contrast", "split-complement": "split-contrast", collective: "split-contrast", squash: "split-contrast", "skip-gradient": "split-contrast",
  triad: "triadic", square: "triadic", playful: "triadic", dotting: "triadic", "twisted-spot": "triadic", threedom: "triadic", "vivid-pop": "triadic", "random-shades": "triadic", highlight: "split-contrast",
  "soft-pastel": "soft-harmony", dusty: "soft-harmony", natural: "soft-harmony", matching: "soft-harmony", friend: "soft-harmony", earthy: "soft-harmony", dust: "soft-harmony", discreet: "soft-harmony", "muted-calm": "soft-harmony",
  clean: "neutralized", "minimal-gray": "neutralized", "warm-neutral": "neutralized", "cool-neutral": "neutralized", classy: "neutralized", editorial: "neutralized", pin: "neutralized", spot: "neutralized", switch: "neutralized", "small-switch": "neutralized", "grey-friends": "neutralized",
};
export function isPaletteConceptId(id: string): id is PaletteConceptId { return Object.hasOwn(PALETTE_CONCEPT_MAP, id); }
export function resolvePaletteId(id?: string | null): PaletteConceptId { return id && isPaletteConceptId(id) ? id : id && Object.hasOwn(LEGACY, id) ? LEGACY[id] : DEFAULT_PALETTE_ID; }
export function getPaletteConcept(id?: string | null) { return PALETTE_CONCEPT_MAP[resolvePaletteId(id)]; }
export function conceptsInGroup(group?: PaletteConcept["group"] | "all") { return !group || group === "all" ? PALETTE_CONCEPTS : PALETTE_CONCEPTS.filter(c => c.group === group); }
