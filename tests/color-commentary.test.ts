import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, generateColorSystem } from "@/lib/color-engine";
import { appleCommentLines, colorsFromTheme, COMMENT_PHRASES } from "@/lib/color-commentary";
import type { CommentaryColors } from "@/lib/color-commentary";

const phrases = new Set<string>(Object.values(COMMENT_PHRASES).map((phrase) => phrase.ko));

function palette(overrides: Partial<CommentaryColors> = {}): CommentaryColors {
  return {
    primary: "#3d6fd8",
    secondary: "#7aa2e3",
    accent: "#9bb6e8",
    background: "#f7f7f6",
    surface: "#ffffff",
    text: "#1c1c1c",
    onPrimary: "#ffffff",
    ...overrides,
  };
}

function korean(colors: CommentaryColors, previous?: CommentaryColors | null, reset = false) {
  return appleCommentLines(colors, previous, { reset, locale: "ko" });
}

describe("apple color commentary", () => {
  it("keeps every apple line the copy asked for", () => {
    expect(phrases.size).toBe(Object.keys(COMMENT_PHRASES).length);
    expect(phrases.has("저를 클릭해서 새로운 Primary 컬러로 바꿔보세요!")).toBe(false);
  });

  it("speaks in at most two sentences", () => {
    const lines = korean(palette());
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every((line) => phrases.has(line))).toBe(true);
  });

  it("lets brightness show through when the three colors are almost gray", () => {
    const lines = korean(palette({
      primary: "#f3f3f3",
      secondary: "#8a8a8a",
      accent: "#2b2b2b",
      onPrimary: "#222222",
    }));
    expect(lines).toContain(COMMENT_PHRASES.chromaGray.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.hueComplement.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.hueTriad.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.hueSpread.ko);
  });

  it("does not treat an arbitrary gray hue as a color relationship", () => {
    const lines = korean(palette({
      primary: "#9a9a9a",
      secondary: "#8e8e8e",
      accent: "#848484",
    }));
    expect(lines).not.toContain(COMMENT_PHRASES.hueComplement.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.hueTriad.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.hueSpread.ko);
  });

  it("puts a measured contrast problem ahead of the mood", () => {
    const lines = korean(palette({
      primary: "#e23b2f",
      secondary: "#f0a090",
      accent: "#1f8a86",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#d5d5d5",
      onPrimary: "#ffffff",
    }));
    expect(lines[0]).toBe(COMMENT_PHRASES.textWeak.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.textClear.ko);
  });

  it("warns when the button label and fill are too close", () => {
    const lines = korean(palette({
      primary: "#8d8d8d",
      onPrimary: "#7f7f7f",
      text: "#1a1a1a",
    }));
    expect(lines[0]).toBe(COMMENT_PHRASES.buttonWeak.ko);
  });

  it("ignores a tiny edit and keeps the current sentence", () => {
    const current = palette({ primary: "#3d6fd8" });
    const nudged = palette({ primary: "#3e70d9" });
    expect(korean(nudged, current)).toEqual([]);
  });

  it("notices the palette got brighter", () => {
    const before = palette({
      primary: "#243044",
      secondary: "#2c3a4a",
      accent: "#3a4654",
      background: "#101418",
      surface: "#1a2028",
      text: "#f4f4f4",
      onPrimary: "#ffffff",
    });
    const after = palette({
      primary: "#d7e4f5",
      secondary: "#c5d7ee",
      accent: "#e7f0fa",
      background: "#f7f7f6",
      surface: "#ffffff",
      text: "#1c1c1c",
      onPrimary: "#1c1c1c",
    });
    const lines = korean(after, before);
    expect(lines).toContain(COMMENT_PHRASES.changeBrighter.ko);
    expect(lines[0]).toBe(COMMENT_PHRASES.changeBrighter.ko);
  });

  it("says the combination came back after undo or reset", () => {
    const before = palette({ primary: "#e23b2f", secondary: "#f0a090", accent: "#1f8a86" });
    const after = palette({ primary: "#243044", secondary: "#2c3a4a", accent: "#3a4654" });
    const lines = korean(after, before, true);
    expect(lines).toContain(COMMENT_PHRASES.changeReset.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.changeDarker.ko);
  });

  it("comments on a generated palette without leaving the phrase list", () => {
    const theme = generateColorSystem(DEFAULT_INPUT).semantic.light;
    const lines = korean(colorsFromTheme(theme));
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.every((line) => phrases.has(line))).toBe(true);
    expect(lines).toContain(COMMENT_PHRASES.rolePrimaryLeads.ko);
    expect(lines).toContain(COMMENT_PHRASES.hueComplement.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.textWeak.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.buttonWeak.ko);
  });

  it("mentions easier reading only for the text and ground that changed", () => {
    const before = palette({ text: "#c8c8c8", background: "#ffffff", surface: "#ffffff" });
    const after = palette({ text: "#1a1a1a", background: "#ffffff", surface: "#ffffff" });
    const lines = korean(after, before);
    expect(lines[0]).toBe(COMMENT_PHRASES.changeTextBetter.ko);
    expect(lines).not.toContain(COMMENT_PHRASES.textWeak.ko);
  });

  it("notices when danger and the lead color are almost the same", () => {
    const lines = korean(palette({
      primary: "#7f1d1d",
      secondary: "#e7b4b4",
      accent: "#2f6f8f",
      danger: "#8a2224",
      onPrimary: "#ffffff",
    }));
    expect(lines[0]).toBe(COMMENT_PHRASES.statusDangerLikePrimary.ko);
  });

  it("reads a warm lead with a cool accent as that relationship", () => {
    const theme = generateColorSystem({ ...DEFAULT_INPUT, hex: "#1B3A4B" }).semantic.light;
    const lines = korean(colorsFromTheme(theme));
    expect(lines).toContain(COMMENT_PHRASES.tempCoolWarmAccent.ko);
  });
});
