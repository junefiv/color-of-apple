"use client";

import Link from "next/link";
import { isHexColor } from "@/lib/picked-color";
import { useMatchuStore } from "@/lib/store";

export function Wordmark({
  matchedColor,
  href = "/",
}: {
  matchedColor?: string | null;
  href?: string;
}) {
  const resetSession = useMatchuStore((state) => state.resetSession);
  const active = matchedColor && isHexColor(matchedColor);

  return (
    <Link
      href={href}
      className="logo inline-flex items-center gap-1.5 text-[var(--text-primary)]"
      onClick={() => resetSession()}
    >
      <span>MATCHU</span>
      <span
        aria-hidden
        className="logo-dot"
        style={{ background: active ? matchedColor : "var(--neutral-300)" }}
      />
    </Link>
  );
}
