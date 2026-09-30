"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import { Dice5 } from "lucide-react";
import { ColorApple } from "@/components/flow/color-apple";
import { MatchButton } from "@/components/flow/match-button";
import { useCopy } from "@/hooks/use-copy";
import { parseToOklch } from "@/lib/color-engine";
import { APPLE_HEX } from "@/lib/picked-color";
import { DEFAULT_PALETTE_ID, paletteRoles } from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";
import { trackProductEvent } from "@/lib/analytics";

const RANDOM_COLORS = [
  "#6C5CE7", "#0984E3", "#00A8A8", "#2EAD67", "#F0A202", "#FF7A59",
  "#EF476F", "#D946EF", "#7C3AED", "#2563EB", "#0F766E", "#C2410C",
];

export function Hero() {
  const copy = useCopy();
  const router = useRouter();
  const setInput = useMatchuStore((state) => state.setInput);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const resetMatch = useMatchuStore((state) => state.resetMatch);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const [error, setError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [hex, setHex] = useState(APPLE_HEX);
  const preview = useMemo(() => paletteRoles(hex, DEFAULT_PALETTE_ID), [hex]);
  const previewStyle = {
    "--hero-primary": preview.primary,
    "--hero-primary-on": preview.onPrimary,
    "--hero-secondary": preview.secondary.hex,
    "--hero-secondary-on": preview.onSecondary,
    "--hero-accent": preview.accent.hex,
    "--hero-accent-on": preview.onAccent,
    "--hero-surface": preview.surface,
    "--hero-surface-raised": preview.surfaceRaised,
    "--hero-surface-sunken": preview.surfaceSunken,
    "--hero-text": preview.text,
    "--hero-text-secondary": preview.textSecondary,
    "--hero-border": preview.borderDefault,
  } as CSSProperties;

  useLayoutEffect(() => {
    function resetApple() {
      setHex(APPLE_HEX);
      setError(null);
      setPressed(false);
    }

    // Reset before painting, including when a cached route is reactivated.
    resetApple();
    window.addEventListener("pageshow", resetApple);
    return () => window.removeEventListener("pageshow", resetApple);
  }, []);

  function generate() {
    try {
      parseToOklch(hex);
    } catch {
      setError(copy.input.invalid);
      return;
    }

    setPressed(true);
    setInput({ hex, previewTarget: "both" });
    setPlatform("web");
    setError(null);
    resetMatch();
    setSelectedPaletteId(DEFAULT_PALETTE_ID);
    setSkipLoader(false);
    void trackProductEvent("generate", { source: "hero" });
    router.push("/result");
    window.setTimeout(() => setPressed(false), 1600);
  }

  function randomizeColor() {
    const candidates = RANDOM_COLORS.filter((color) => color !== hex.toUpperCase());
    const next = candidates[Math.floor(Math.random() * candidates.length)] ?? APPLE_HEX;
    setHex(next);
    setError(null);
    void trackProductEvent("color_picked", { source: "random" });
  }

  return (
    <section className="landing-hero" style={previewStyle}>
      <div className="landing-preview-layer" aria-hidden>
        <div className="landing-palette-preview landing-demo-card">
          <p>LIVE PALETTE</p>
          <div className="landing-palette-strip">
            <span data-color="primary" /><span data-color="secondary" /><span data-color="accent" />
          </div>
          <div className="landing-palette-labels"><span>PRIMARY</span><span>SECONDARY</span><span>ACCENT</span></div>
        </div>

        <div className="landing-card-preview landing-demo-card">
          <div className="landing-card-preview-top"><span /><span /><span /></div>
          <div className="landing-card-preview-body">
            <i />
            <div><strong>Color system</strong><span>Ready for your UI</span></div>
          </div>
          <span className="landing-mini-button">Primary action</span>
        </div>

        <div className="landing-input-preview landing-demo-card">
          <label>EMAIL</label>
          <div><span>hello@color.apple</span><i /></div>
        </div>

        <div className="landing-platform-preview landing-demo-card">
          <p>ONE COLOR, EVERYWHERE</p>
          <div><span>WEB</span><span>APP</span><span>UI KIT</span></div>
        </div>
      </div>

      <div className="landing-hero-center">
        <ColorApple
          hex={hex}
          onChange={(nextHex) => {
            setHex(nextHex);
            setError(null);
          }}
        />
        <div className="hero-generate">
          <div className="landing-hero-actions">
            <button type="button" className="hero-random-button" onClick={randomizeColor}>
              <Dice5 aria-hidden />
              <span>Random</span>
            </button>
            <MatchButton hex={hex} label={copy.hero.generate} pressed={pressed} disabled={pressed} onClick={generate} />
          </div>
          {error ? <p className="caption mt-3 text-[#E5484D]">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
