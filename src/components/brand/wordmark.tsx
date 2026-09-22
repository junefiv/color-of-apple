"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoApple } from "@/components/brand/logo-apple";
import { useCopy } from "@/hooks/use-copy";
import { isHexColor, normalizeHex, resolvePickedHex } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

export function Wordmark({
  href = "/",
  remake = false,
}: {
  href?: string;
  remake?: boolean;
}) {
  const copy = useCopy();
  const router = useRouter();
  const resetSession = useMatchuStore((state) => state.resetSession);
  const inputHex = useMatchuStore((state) => state.input.hex);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);
  const [hopping, setHopping] = useState(false);
  const [tip, setTip] = useState(false);

  const appleHex =
    hydrated && hasMatched && matchedHex && isHexColor(matchedHex)
      ? normalizeHex(matchedHex)
      : resolvePickedHex(inputHex);

  useEffect(() => {
    if (!remake) return;

    let cancelled = false;
    const timers: number[] = [];

    function hop(nextDelay: number) {
      if (cancelled) return;
      setHopping(true);
      setTip(true);
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setHopping(false);
        }, 1900),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setTip(false);
          timers.push(window.setTimeout(() => hop(8000 + Math.random() * 7000), nextDelay));
        }, 3600),
      );
    }

    timers.push(window.setTimeout(() => hop(8000 + Math.random() * 7000), 2200));

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [remake]);

  function goRemake() {
    resetSession();
    router.push("/");
  }

  if (remake) {
    return (
      <div className="studio-wordmark">
        <button
          type="button"
          className="studio-apple"
          data-hop={hopping ? "true" : "false"}
          data-tip={tip ? "true" : "false"}
          aria-label={copy.result.remake}
          onClick={goRemake}
        >
          <LogoApple hex={appleHex} />
          {tip ? (
            <span className="studio-apple-tip" role="note">
              {copy.result.remakeAppleTip}
            </span>
          ) : null}
        </button>
        <span className="logo text-[var(--text-primary)]">MATCHU</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="logo inline-flex items-center gap-2 text-[var(--text-primary)]"
      onClick={() => resetSession()}
    >
      <LogoApple hex={appleHex} />
      <span>MATCHU</span>
    </Link>
  );
}
