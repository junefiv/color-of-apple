"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ColorApple } from "@/components/flow/color-apple";
import { MatchButton } from "@/components/flow/match-button";
import { uiToast } from "@/components/ui/toast";
import { useCopy } from "@/hooks/use-copy";
import { parseToOklch } from "@/lib/color-engine";
import { APPLE_HEX } from "@/lib/picked-color";
import { DEFAULT_PALETTE_ID } from "@/lib/space-palettes";
import { consumeQuota, isPlanRequiredError, quotaErrorMessage } from "@/lib/firebase/data";
import { useMatchuStore } from "@/lib/store";

export function Hero() {
  const copy = useCopy();
  const { user, signIn } = useAuth();
  const router = useRouter();
  const locale = useMatchuStore((state) => state.locale);
  const setInput = useMatchuStore((state) => state.setInput);
  const setSkipLoader = useMatchuStore((state) => state.setSkipLoader);
  const setPlatform = useMatchuStore((state) => state.setPlatform);
  const resetMatch = useMatchuStore((state) => state.resetMatch);
  const setSelectedPaletteId = useMatchuStore((state) => state.setSelectedPaletteId);
  const [error, setError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [hex, setHex] = useState(APPLE_HEX);

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

  async function generate() {
    try {
      parseToOklch(hex);
    } catch {
      setError(copy.input.invalid);
      return;
    }

    try {
      setPressed(true);
      const currentUser = user ?? await signIn();
      await consumeQuota(currentUser.uid, "generation");
      setInput({ hex, previewTarget: "both" });
      setPlatform("web");
      setError(null);
      resetMatch();
      setSelectedPaletteId(DEFAULT_PALETTE_ID);
      setSkipLoader(false);
      router.push("/result");
      window.setTimeout(() => setPressed(false), 1600);
    } catch (error) {
      setPressed(false);
      if (isPlanRequiredError(error)) {
        uiToast.info(
          locale === "ko" ? "무료 생성 한도를 모두 사용했어요. Pro 플랜은 곧 제공됩니다." : "You reached the free generation limit. Pro is coming soon.",
          locale,
        );
        router.push("/coming-soon");
        return;
      }
      uiToast.error(quotaErrorMessage(error, locale), locale);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-xl flex-col items-center justify-center px-5 py-10">
      <ColorApple
        hex={hex}
        onChange={(nextHex) => {
          setHex(nextHex);
          setError(null);
        }}
      />
      <div className="hero-generate mt-8 flex w-full max-w-xs flex-col items-center">
        <MatchButton hex={hex} label={copy.hero.generate} pressed={pressed} disabled={pressed} onClick={generate} />
        {error ? <p className="caption mt-3 text-[#E5484D]">{error}</p> : null}
      </div>
    </section>
  );
}
