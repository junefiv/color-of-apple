"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck, ChevronDown, Plane, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import { PREVIEW_GENRES, useMatchuStore, type PreviewGenre } from "@/lib/store";

// Which sample service the web/app preview paints the palette on.
const GENRES: Record<PreviewGenre, { icon: LucideIcon; ko: string; en: string; koHint: string; enHint: string }> = {
  budget: { icon: Wallet, ko: "가계부", en: "Budget", koHint: "예산 · 지출 기록 · 차트", enHint: "Budgets, spending, charts" },
  shop: { icon: ShoppingBag, ko: "쇼핑몰", en: "Shop", koHint: "상품 · 장바구니 · 주문", enHint: "Products, cart, orders" },
  booking: { icon: CalendarCheck, ko: "예약", en: "Booking", koHint: "식당 · 날짜 · 시간 선택", enHint: "Restaurants, dates, time slots" },
  travel: { icon: Plane, ko: "여행", en: "Travel", koHint: "숙소 · 일정 · 지도", enHint: "Stays, trips, maps" },
};

export function GenrePicker() {
  const locale = useMatchuStore((state) => state.locale);
  const genre = useMatchuStore((state) => state.genre);
  const setGenre = useMatchuStore((state) => state.setGenre);
  const isKo = locale === "ko";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState({ top: 0, left: 0, width: 220 });
  const current = GENRES[genre];
  const Icon = current.icon;

  useLayoutEffect(() => {
    if (!open) return;
    function update() {
      const anchor = rootRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const width = Math.max(anchor.width, 220);
      // Opens upward when the trigger sits near the bottom (the floating dock).
      const upward = window.innerHeight - anchor.bottom < 260 && anchor.top > 260;
      setPlace({ top: upward ? anchor.top - 6 : anchor.bottom + 6, left: Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8)), width });
      menuRef.current?.setAttribute("data-upward", upward ? "true" : "false");
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    function onPointerDown(event: PointerEvent) {
      const path = event.composedPath();
      if (path.some((node) => node === rootRef.current || node === menuRef.current)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); rootRef.current?.querySelector("button")?.focus(); }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  function pick(next: PreviewGenre) {
    setGenre(next);
    setOpen(false);
    rootRef.current?.querySelector("button")?.focus();
  }

  // Arrow keys move between options like a radio group.
  function move(event: React.KeyboardEvent, index: number) {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const items = menuRef.current?.querySelectorAll<HTMLElement>("[role=radio]");
    items?.[(index + step + PREVIEW_GENRES.length) % PREVIEW_GENRES.length]?.focus();
  }

  const label = isKo ? "서비스 장르" : "Sample service";
  return (
    <section ref={rootRef} className="token-palette-styles genre-picker" aria-label={label}>
      <p className="token-palette-title">{label}</p>
      <button type="button" className="token-palette-trigger" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="genre-picker-icon" aria-hidden><Icon size={14} /></span>
        <span>{isKo ? current.ko : current.en}</span>
        <ChevronDown className="studio-palette-chevron" data-open={open ? "true" : "false"} size={16} aria-hidden />
      </button>
      {open ? createPortal(
        <div ref={menuRef} className="token-palette-options genre-picker-menu" role="radiogroup" aria-label={label}
          style={{ top: place.top, left: place.left, width: place.width }}>
          {PREVIEW_GENRES.map((id, index) => {
            const item = GENRES[id];
            const ItemIcon = item.icon;
            return (
              <button key={id} type="button" role="radio" aria-checked={genre === id} tabIndex={genre === id ? 0 : -1}
                className="genre-picker-option" onClick={() => pick(id)} onKeyDown={(event) => move(event, index)}>
                <span className="genre-picker-icon" aria-hidden><ItemIcon size={16} /></span>
                <span className="genre-picker-copy">
                  <strong>{isKo ? item.ko : item.en}</strong>
                  <small>{isKo ? item.koHint : item.enHint}</small>
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
