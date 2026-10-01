"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Check, Dice5, Heart } from "lucide-react";
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
const DICE_THROW_MS = 780;

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
  const [diceThrow, setDiceThrow] = useState(0);
  const [randomColorMotion, setRandomColorMotion] = useState(false);
  const randomTimer = useRef<number | null>(null);
  const pendingColor = useRef<string | null>(null);
  function cancelRandom() {
    if (randomTimer.current !== null) window.clearTimeout(randomTimer.current);
    randomTimer.current = null;
    pendingColor.current = null;
  }
  function landDice() {
    const next = pendingColor.current;
    if (!next) return;
    cancelRandom();
    setRandomColorMotion(true);
    setHex(next);
    setError(null);
    void trackProductEvent("color_picked", { source: "random" });
  }
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
      cancelRandom();
      setRandomColorMotion(false);
      setHex(APPLE_HEX);
      setError(null);
      setPressed(false);
    }

    // Reset before painting, including when a cached route is reactivated.
    resetApple();
    window.addEventListener("pageshow", resetApple);
    return () => {
      cancelRandom();
      window.removeEventListener("pageshow", resetApple);
    };
  }, []);

  function generate() {
    cancelRandom();
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
    cancelRandom();
    setDiceThrow((value) => value + 1);
    const candidates = RANDOM_COLORS.filter((color) => color !== hex.toUpperCase());
    const next = candidates[Math.floor(Math.random() * candidates.length)] ?? APPLE_HEX;
    pendingColor.current = next;
    // Also handles reduced motion and environments without animation events.
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    randomTimer.current = window.setTimeout(landDice, reducedMotion ? 0 : DICE_THROW_MS);
  }

  return (
    <section className="landing-hero" data-color-motion={randomColorMotion ? "random" : undefined} style={previewStyle}>
      <div className="landing-hero-stage">
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

        <div className="landing-extra-previews">
          <div className="landing-note-preview">
            <span className="landing-note-tape" />
            <p>from one apple</p>
            <span>a little color,<br />so many possibilities.</span>
          </div>

          <div className="landing-controls-preview landing-demo-card">
            <p>MAKE IT YOURS</p>
            <div className="landing-toggle-row"><span>Color mode</span><i className="landing-toggle"><span /></i></div>
            <div className="landing-slider-label"><span>Intensity</span><span>64%</span></div>
            <div className="landing-slider"><span /><i /></div>
          </div>

          <div className="landing-selection-preview landing-demo-card">
            <p>THE LITTLE DETAILS</p>
            <div className="landing-choice"><i className="landing-checkbox is-selected"><Check /></i><span>Keep it colorful</span></div>
            <div className="landing-choice"><i className="landing-checkbox" /><span>A little more neutral</span></div>
            <div className="landing-radio-options"><span><i className="landing-radio is-selected" />Light</span><span><i className="landing-radio" />Dark</span></div>
          </div>

          <div className="landing-product-preview landing-demo-card">
            <div className="landing-product-image">
              {/* Same sneaker photo used by the UI Kit product showcase. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/preview/products/5C28A349-62E7-40F3-9CBB-7C9CBDBF892E.webp" alt="" />
              <span className="landing-product-badge">NEW</span><Heart className="landing-product-heart" />
            </div>
            <div className="landing-product-info"><span>EVERYDAY FAVORITES</span><strong>A little spring in your step</strong><div><b>$629.55</b><s>$699.50</s></div></div>
            <span className="landing-mini-button">Add to bag</span>
          </div>
        </div>
      </div>

      <div className="landing-hero-center">
        <ColorApple
          hex={hex}
          onChange={(nextHex) => {
            cancelRandom();
            setRandomColorMotion(false);
            setHex(nextHex);
            setError(null);
          }}
        />
        <div className="hero-generate">
          <div className="landing-hero-actions">
            <MatchButton hex={hex} label={copy.hero.generate} pressed={pressed} disabled={pressed} onClick={generate} />
            <button type="button" className="hero-random-button" onClick={randomizeColor}>
              <span key={diceThrow} className={`hero-dice${diceThrow ? " is-thrown" : ""}`} style={{ "--dice-throw-ms": `${DICE_THROW_MS}ms` } as CSSProperties} onAnimationEnd={landDice}><Dice5 aria-hidden /></span>
              <span>Random</span>
            </button>
          </div>
          {error ? <p className="caption mt-3 text-[#E5484D]">{error}</p> : null}
        </div>
      </div>
      </div>
    </section>
  );
}
