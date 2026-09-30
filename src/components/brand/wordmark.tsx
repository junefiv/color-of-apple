"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoApple } from "@/components/brand/logo-apple";
import { useAppleHop } from "@/hooks/use-apple-hop";
import { useCopy } from "@/hooks/use-copy";
import { isHexColor, normalizeHex, resolvePickedHex } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

export function Wordmark({
  href = "/",
  remake = false,
  onRemake,
}: {
  href?: string;
  remake?: boolean;
  onRemake?: () => void;
}) {
  const copy = useCopy();
  const router = useRouter();
  const resetSession = useMatchuStore((state) => state.resetSession);
  const inputHex = useMatchuStore((state) => state.input.hex);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);
  const { hopping, tip } = useAppleHop(remake);

  const appleHex =
    hydrated && hasMatched && matchedHex && isHexColor(matchedHex)
      ? normalizeHex(matchedHex)
      : resolvePickedHex(inputHex);

  function goRemake() {
    if (onRemake) {
      onRemake();
      return;
    }
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
        <span className="logo text-[var(--text-primary)]">Color of Apple</span>
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
      <span>Color of Apple</span>
    </Link>
  );
}
