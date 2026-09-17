"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/brand/site-header";
import { ColorField } from "@/components/flow/color-field";
import { MatchButton } from "@/components/flow/match-button";
import { PlatformChoice } from "@/components/flow/platform-choice";
import { StudioPreview } from "@/components/flow/studio-preview";
import { useCopy } from "@/hooks/use-copy";
import { useOptionalColorSystem } from "@/hooks/use-optional-color-system";
import { parseToOklch } from "@/lib/color-engine";
import { FALLBACK_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";
import {
  DEFAULT_PALETTE_ID,
  extractSpacePalettes,
  palettePreviewVars,
} from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";

export function InputStep() {
  const copy = useCopy();
  const router = useRouter();
  const input = useMatchuStore((state) => state.input);
  const setInput = useMatchuStore((state) => state.setInput);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const resetMatch = useMatchuStore((state) => state.resetMatch);
  const selectedPaletteId = useMatchuStore((state) => state.selectedPaletteId);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const palettesRevealed = useMatchuStore((state) => state.palettesRevealed);
  const setPalettesRevealed = useMatchuStore((state) => state.setPalettesRevealed);
  const [error, setError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const hex = isHexColor(input.hex) ? normalizeHex(input.hex) : FALLBACK_HEX;
  const result = useOptionalColorSystem({ ...input, hex });
  const palettes = useMemo(() => extractSpacePalettes(hex), [hex]);
  const selected = palettes.find((palette) => palette.id === selectedPaletteId) ?? palettes[0];
  const hasTarget = input.previewTarget === "web" || input.previewTarget === "app";
  const canMatch = hasTarget;

  function extract() {
    try {
      parseToOklch(hex);
      setInput({ hex });
      setError(null);
      setSelectedPaletteId(DEFAULT_PALETTE_ID);
      setPalettesRevealed(true);
    } catch {
      setError(copy.input.invalid);
    }
  }

  function apply() {
    try {
      parseToOklch(hex);
      setInput({ hex });
      setPlatform(input.previewTarget === "app" ? "app" : "web");
      setError(null);
      setPressed(true);
      resetMatch();
      setSkipLoader(false);
      router.push("/result");
      window.setTimeout(() => setPressed(false), 1600);
    } catch {
      setError(copy.input.invalid);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <h1 className="h1-title">{copy.nav.generate}</h1>
          <p className="lead mt-3">{copy.input.subtitle}</p>
          <div className="input-step mt-8">
            <section>
              <p className="input-step-kicker">{copy.input.step1}</p>
              <h2 className="input-step-title">{copy.input.step1Title}</h2>
              <div className="mt-4">
                <ColorField
                  value={input.hex}
                  onChange={(nextHex) => {
                    setInput({ hex: nextHex });
                    setError(null);
                  }}
                  error={error}
                  hideLabel
                />
              </div>
            </section>
            <section>
              <p className="input-step-kicker">{copy.input.step2}</p>
              <h2 className="input-step-title">{copy.input.step2Title}</h2>
              <p className="caption input-step-hint">{copy.input.step2Hint}</p>
              <div className="mt-4">
                <PlatformChoice
                  hex={hex}
                  value={input.previewTarget}
                  options={[
                    { id: "web", label: copy.input.targets.web },
                    { id: "app", label: copy.input.targets.app },
                  ]}
                  onChange={(target) => setInput({ previewTarget: target })}
                />
              </div>
            </section>
            <MatchButton
              hex={hex}
              label={palettesRevealed ? copy.input.applyPalette : copy.input.cta}
              pressed={pressed}
              disabled={pressed || !canMatch}
              onClick={palettesRevealed ? apply : extract}
            />
          </div>
        </div>
        <div className="space-y-4">
          {palettesRevealed && selected ? (
            <>
              <div className="space-palette-strip" aria-hidden>
                {selected.colors.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </div>
              <StudioPreview
                result={result}
                stage="done"
                hasMatched
                extraVars={palettePreviewVars(selected.colors)}
              />
              <section>
                <p className="ui-label mb-3 text-[var(--text-secondary)]">{copy.input.palettesTitle}</p>
                <div className="space-y-2">
                  {palettes.map((palette) => (
                    <button
                      key={palette.id}
                      type="button"
                      className="space-palette"
                      data-active={palette.id === selected.id ? "true" : "false"}
                      onClick={() => setSelectedPaletteId(palette.id)}
                    >
                      <span className="space-palette-name">{palette.name}</span>
                      <span className="space-palette-swatches">
                        {palette.colors.map((color) => (
                          <span key={`${palette.id}-${color}`} style={{ background: color }} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <StudioPreview result={result} stage="idle" hasMatched={false} />
          )}
        </div>
      </main>
    </div>
  );
}
