import { describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT,
  deriveBrandTokenOverrides,
  generateColorSystem,
  neutralAliasForValue,
} from "@/lib/color-engine";

describe("brand token overrides", () => {
  const result = generateColorSystem(DEFAULT_INPUT);

  it("cascades a primary edit through states, on-color, text, and border", () => {
    const patch = deriveBrandTokenOverrides(result.semantic.light, "primary.default", "#336699");

    expect(patch["primary.default"]).toBe("#336699");
    expect(patch["primary.hover"]).toBeTruthy();
    expect(patch["primary.pressed"]).toBeTruthy();
    expect(patch["primary.selected"]).toBeTruthy();
    expect(patch["primary.subtle"]).toBeTruthy();
    expect(patch["primary.border"]).toBe("#336699");
    expect(patch["primary.text"]).toBe("#336699");
    expect(patch["primary.onPrimary"]).toBeTruthy();
    expect(patch["interaction.primaryHover"]).toBe(patch["primary.hover"]);
    expect(patch["border.focus"]).toBe("#336699");
  });

  it("adds the full state set for secondary and accent", () => {
    for (const root of ["secondary", "accent"] as const) {
      const patch = deriveBrandTokenOverrides(result.semantic.light, `${root}.default`, "#557755");
      for (const state of ["hover", "pressed", "selected", "subtle", "border", "text"] as const) {
        expect(patch[`${root}.${state}`]).toBeTruthy();
      }
      expect(patch[`${root}.${root === "secondary" ? "onSecondary" : "onAccent"}`]).toBeTruthy();
    }
  });
});

describe("neutral aliases", () => {
  const result = generateColorSystem(DEFAULT_INPUT);

  it("recognizes eligible 100–900 steps, including camel-case state names", () => {
    expect(neutralAliasForValue("primary.text", result.primitive.neutral[300], result.primitive.neutral)).toBe("Neutral 300");
    expect(neutralAliasForValue("interaction.neutralHover", result.primitive.neutral[850], result.primitive.neutral)).toBe("Neutral 850");
    expect(neutralAliasForValue("primary.text", result.primitive.neutral[50], result.primitive.neutral)).toBeNull();
  });
});
