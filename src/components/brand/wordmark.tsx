"use client";

import Link from "next/link";
import { LogoApple } from "@/components/brand/logo-apple";
import { isHexColor, normalizeHex, resolvePickedHex } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

export function Wordmark({ href = "/" }: { href?: string }) {
  const resetSession = useMatchuStore((state) => state.resetSession);
  const inputHex = useMatchuStore((state) => state.input.hex);
  const matchedHex = useMatchuStore((state) => state.matchedHex);
  const hasMatched = useMatchuStore((state) => state.hasMatched);
  const hydrated = useMatchuStore((state) => state.hydrated);

  const appleHex =
    hydrated && hasMatched && matchedHex && isHexColor(matchedHex)
      ? normalizeHex(matchedHex)
      : resolvePickedHex(inputHex);

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
