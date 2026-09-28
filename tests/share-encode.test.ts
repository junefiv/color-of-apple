import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "@/lib/color-engine";
import { decodeShare, encodeShare } from "@/lib/share/encode";

describe("share payload", () => {
  it("round-trips the generator input, selected palette, and token overrides", () => {
    const encoded = encodeShare({
      input: DEFAULT_INPUT,
      selectedPaletteId: "analogous-flow",
      overrides: {
        "primary.default": "#336699",
        "primary.onPrimary": "#FFFFFF",
      },
    });

    const decoded = decodeShare(encoded);
    expect(decoded?.input).toEqual(DEFAULT_INPUT);
    expect(decoded?.selectedPaletteId).toBe("analogous-flow");
    expect(decoded?.overrides).toEqual({
      "primary.default": "#336699",
      "primary.onPrimary": "#FFFFFF",
    });
  });

  it("keeps legacy input-only links working", () => {
    const encoded = compressToEncodedURIComponent(JSON.stringify(DEFAULT_INPUT));
    const decoded = decodeShare(encoded);

    expect(decoded?.input).toEqual(DEFAULT_INPUT);
    expect(decoded?.overrides).toEqual({});
  });

  it("drops malformed override entries", () => {
    const encoded = compressToEncodedURIComponent(JSON.stringify({
      input: DEFAULT_INPUT,
      selectedPaletteId: "balance",
      overrides: {
        "primary.default": "#123456",
        "bad path": "red",
      },
    }));

    expect(decodeShare(encoded)?.overrides).toEqual({ "primary.default": "#123456" });
  });
});
