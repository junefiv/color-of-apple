"use client";

import { useEffect, useRef, useState } from "react";
import { LogoApple } from "@/components/brand/logo-apple";
import { ColorPickerPopover } from "@/components/flow/color-picker-popover";
import { useAppleHop } from "@/hooks/use-apple-hop";
import { useMatchuStore } from "@/lib/store";

export function PrimaryApplePicker({ hex, locale, savedProject = false, onGenerate }: { hex: string; locale: "ko" | "en"; savedProject?: boolean; onGenerate: (hex: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(hex);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { hopping } = useAppleHop(!open);
  const setPrimaryDraftHex = useMatchuStore((state) => state.setPrimaryDraftHex);

  useEffect(() => {
    if (!open) return;
    return () => setPrimaryDraftHex(null);
  }, [open, setPrimaryDraftHex]);

  function close() {
    setOpen(false);
    anchorRef.current?.focus();
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="studio-apple token-primary-apple"
        data-hop={hopping ? "true" : "false"}
        aria-label={savedProject ? (locale === "ko" ? "이 Primary로 새 팔레트 만들기" : "Create a new palette from this Primary") : (locale === "ko" ? "새 Primary 컬러 선택" : "Choose a new Primary color")}
        aria-haspopup={savedProject ? undefined : "dialog"}
        aria-expanded={savedProject ? undefined : open}
        onClick={() => {
          if (savedProject) {
            onGenerate(hex);
            return;
          }
          setDraft(hex);
          setOpen((value) => !value);
        }}
      >
        <LogoApple hex={open ? draft : hex} />
      </button>
      {open && !savedProject ? (
        <ColorPickerPopover
          anchorRef={anchorRef}
          color={draft}
          title={locale === "ko" ? "새 Primary 컬러" : "New Primary color"}
          actionLabel="Generate Color Palette"
          onChange={(next) => {
            setDraft(next);
            setPrimaryDraftHex(next);
          }}
          onAction={(next) => {
            onGenerate(next);
            close();
          }}
          onDismiss={close}
        />
      ) : null}
    </>
  );
}
