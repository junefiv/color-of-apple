import { accent, rng, sel, surface, t, type Config, type SchemaSection } from "./block-schema";

// Shared pieces of the block specs (blocks.ts, blocks-more.ts).
export const head = (title: string, note?: string): SchemaSection => ({ part: "heading", title, note, fields: [t("eyebrow", "작은 머리말", 40, { placeholder: "비우면 숨김" }), t("title", "제목", 80), t("desc", "설명", 200, { multiline: true, placeholder: "비우면 숨김" }), t("more", "더보기 링크", 24, { placeholder: "비우면 숨김" })] });
// Every block's color section also carries the button look, so any button can be restyled.
export const style = (...fields: SchemaSection["fields"]): SchemaSection => ({ part: "style", title: "색상과 모양", fields: [surface(), accent(), ...fields,
  sel("btnTone", "버튼 색", [["auto", "자동 (배경에 맞춤)"], ["primary", "Primary"], ["secondary", "Secondary"], ["accent", "Accent"], ["light", "흰색"], ["dark", "다크"], ["outline", "테두리만"]]), rng("btnRadius", "버튼 모서리", 0, 40)] });
export const styleDefaults: Config = { btnTone: "auto", btnRadius: 40 };
export const headDefaults = (eyebrow: string, title: string, desc = "섹션을 한 문장으로 소개해 주세요.") => ({ eyebrow, title, desc, more: "", surface: "surface", accent: "primary" });
export const aligns = [["start", "왼쪽"], ["center", "가운데"]] as const;
export const P = (key: string, name: string, note: string, config: Config) => ({ key, name, note, config });
export type Insets4 = [number, number, number, number];
