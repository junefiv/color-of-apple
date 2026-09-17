"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ColorField } from "@/components/flow/color-field";
import { MatchButton } from "@/components/flow/match-button";
import { PlatformChoice } from "@/components/flow/platform-choice";
import { StudioHeadline } from "@/components/flow/headline";
import { PaletteStrip } from "@/components/flow/palette-strip";
import { StudioPreview } from "@/components/flow/studio-preview";
import { useCopy } from "@/hooks/use-copy";
import { useOptionalColorSystem } from "@/hooks/use-optional-color-system";
import { parseToOklch } from "@/lib/color-engine";
import { FALLBACK_HEX, isHexColor, normalizeHex } from "@/lib/picked-color";
import { DEFAULT_PALETTE_ID } from "@/lib/space-palettes";
import { useMatchuStore } from "@/lib/store";

export function Hero({
  frozen = false,
  reveal = false,
}: {
  frozen?: boolean;
  reveal?: boolean;
}) {
  const copy = useCopy();
  const router = useRouter();
  const input = useMatchuStore((state) => state.input);
  const setInput = useMatchuStore((state) => state.setInput);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const resetMatch = useMatchuStore((state) => state.resetMatch);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const matchStage = useMatchuStore((state) => state.matchStage);
  const [error, setError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const hex = isHexColor(input.hex) ? normalizeHex(input.hex) : FALLBACK_HEX;
  const result = useOptionalColorSystem({ ...input, hex });
  const picked = isHexColor(input.hex);
  const hasTarget = input.previewTarget === "web" || input.previewTarget === "app";
  const showColor = frozen ? reveal : hasMatched;

  function match() {
    if (frozen || !hasTarget) return;
    try {
      parseToOklch(hex);
      setInput({ hex });
      setPlatform(input.previewTarget === "app" ? "app" : "web");
      setError(null);
      setPressed(true);
      resetMatch();
      setSelectedPaletteId(DEFAULT_PALETTE_ID);
      setSkipLoader(false);
      router.push("/result");
      window.setTimeout(() => setPressed(false), 1600);
    } catch {
      setError(copy.input.invalid);
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-8 md:px-8 md:py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <div>
        <StudioHeadline
          copy={copy}
          picked={picked && !showColor}
          matched={!frozen && hasMatched}
          accent={hex}
        />
        <div className="input-step mt-8 max-w-lg">
          <section>
            <p className="input-step-kicker">{copy.input.step1}</p>
            <h2 className="input-step-title">{copy.input.step1Title}</h2>
            <div className="mt-4">
              <ColorField
                value={input.hex}
                onChange={(nextHex) => {
                  if (frozen) return;
                  setInput({ hex: nextHex });
                  setError(null);
                }}
                error={frozen ? null : error}
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
                onChange={(target) => {
                  if (frozen) return;
                  setInput({ previewTarget: target });
                }}
              />
            </div>
          </section>
          <MatchButton
            hex={hex}
            label={copy.hero.match}
            pressed={pressed}
            disabled={frozen || pressed || !hasTarget}
            onClick={match}
          />
        </div>
      </div>
      <div className="space-y-4">
        <PaletteStrip
          result={result}
          visible={
            showColor ||
            matchStage === "palette" ||
            matchStage === "bg" ||
            matchStage === "components" ||
            matchStage === "status" ||
            matchStage === "tokens" ||
            matchStage === "done"
          }
        />
        <StudioPreview result={result} stage={matchStage} hasMatched={showColor} />
      </div>
    </section>
  );
}
