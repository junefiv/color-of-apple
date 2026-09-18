"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PhoneFrame } from "../phone-frame";
import { PreviewFit } from "../preview-fit";

export type Tone = "success" | "warning" | "danger" | "info";

export type WebOverlay =
  | { type: "none" }
  | { type: "modal"; title: string; body: string; confirm: string; danger?: boolean; onConfirm?: () => void }
  | { type: "drawer"; title: string; body: ReactNode }
  | { type: "toast"; message: string; tone?: Tone }
  | { type: "tooltip"; message: string };

export type AppOverlay =
  | { type: "none" }
  | { type: "sheet"; title: string; body: ReactNode }
  | { type: "dialog"; title: string; body: string; confirm: string; danger?: boolean; onConfirm?: () => void }
  | { type: "toast"; message: string; tone?: Tone }
  | { type: "snackbar"; message: string }
  | { type: "action"; items: Array<{ label: string; danger?: boolean; onClick: () => void }> };

const TONE_BG: Record<Tone, string> = {
  success: "var(--color-success-surface)",
  warning: "var(--color-warning-surface)",
  danger: "var(--color-danger-surface)",
  info: "var(--color-info-surface)",
};

const TONE_FG: Record<Tone, string> = {
  success: "var(--color-success-text)",
  warning: "var(--color-warning-text)",
  danger: "var(--color-danger-text)",
  info: "var(--color-info-text)",
};

export function useTimedOverlay<T extends { type: string }>(idle: T) {
  const [overlay, setOverlay] = useState<T>(idle);
  const timer = useRef<number>(0);

  function show(next: T, ms?: number) {
    window.clearTimeout(timer.current);
    setOverlay(next);
    if (ms) {
      timer.current = window.setTimeout(() => setOverlay(idle), ms);
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { overlay, setOverlay, show };
}

export function IntroViewport({ children }: { children: ReactNode }) {
  return <div className="preview-viewport pv-preview">{children}</div>;
}

export function IntroHeader({
  brand,
  links,
  searchPlaceholder,
  cta,
  onCta,
  onNotify,
  notifyOpen,
  notifyPanel,
  onHelp,
  profileOpen,
  onProfile,
  profilePanel,
}: {
  brand: string;
  links: string[];
  searchPlaceholder: string;
  cta: string;
  onCta: () => void;
  onNotify: () => void;
  notifyOpen?: boolean;
  notifyPanel?: ReactNode;
  onHelp: () => void;
  profileOpen?: boolean;
  onProfile: () => void;
  profilePanel?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] px-5 py-3">
      <p className="text-sm font-semibold">{brand}</p>
      <nav className="hidden items-center gap-3 text-sm text-[var(--color-text-secondary)] md:flex">
        {links.map((link) => (
          <span key={link}>{link}</span>
        ))}
      </nav>
      <input className="pv-input max-w-64 flex-1" placeholder={searchPlaceholder} />
      <div className="relative">
        <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" onClick={onNotify}>
          🔔
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--color-accent-default)]" />
        </button>
        {notifyOpen ? notifyPanel : null}
      </div>
      <button type="button" className="grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" onClick={onHelp} title="도움말">
        ?
      </button>
      <div className="relative">
        <button type="button" className="grid size-8 place-items-center rounded-full bg-[var(--color-secondary-default)] text-xs text-[var(--color-secondary-on)]" onClick={onProfile}>
          YU
        </button>
        {profileOpen ? profilePanel : null}
      </div>
      <button className="pv-btn pv-btn-primary" type="button" onClick={onCta}>
        {cta}
      </button>
    </header>
  );
}

export function IntroHero({
  kicker,
  title,
  body,
  primary,
  onPrimary,
  secondary,
  onSecondary,
}: {
  kicker: string;
  title: string;
  body: string;
  primary: string;
  onPrimary: () => void;
  secondary?: string;
  onSecondary?: () => void;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs tracking-[0.16em] text-[var(--color-text-tertiary)]">{kicker}</p>
      <h2 className="max-w-xl text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-xl text-sm text-[var(--color-text-secondary)]">{body}</p>
      <div className="flex flex-wrap gap-2">
        <button className="pv-btn pv-btn-primary" type="button" onClick={onPrimary}>
          {primary}
        </button>
        {secondary ? (
          <button className="pv-btn pv-btn-outline" type="button" onClick={onSecondary}>
            {secondary}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function Menu({ items, onClose }: { items: Array<{ label: string; danger?: boolean; onClick: () => void }>; onClose?: () => void }) {
  return (
    <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-1 shadow-[0_12px_28px_var(--color-shadow-default)]">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="block w-full rounded-md px-2 py-1.5 text-left text-sm"
          style={item.danger ? { color: "var(--color-danger-text)" } : undefined}
          onClick={() => {
            item.onClick();
            onClose?.();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function WebOverlays({
  overlay,
  onClose,
}: {
  overlay: WebOverlay;
  onClose: () => void;
}) {
  if (overlay.type === "none") return null;

  if (overlay.type === "toast") {
    return (
      <div
        className="absolute bottom-5 right-5 z-40 max-w-sm rounded-xl px-4 py-3 text-sm"
        style={{
          background: overlay.tone ? TONE_BG[overlay.tone] : "var(--color-surface-inverse)",
          color: overlay.tone ? TONE_FG[overlay.tone] : "var(--color-text-inverse)",
        }}
      >
        {overlay.message}
      </div>
    );
  }

  if (overlay.type === "tooltip") {
    return (
      <div className="absolute right-8 top-16 z-40 rounded-md bg-[var(--color-surface-inverse)] px-2 py-1 text-[11px] text-[var(--color-text-inverse)]">
        {overlay.message}
      </div>
    );
  }

  if (overlay.type === "drawer") {
    return (
      <div className="absolute inset-0 z-30 flex justify-end" style={{ background: "var(--color-overlay-scrim)" }} onClick={onClose}>
        <div className="h-full w-80 bg-[var(--color-surface-overlay)] p-5" onClick={(event) => event.stopPropagation()}>
          <h3 className="font-semibold">{overlay.title}</h3>
          <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{overlay.body}</div>
          <button className="pv-btn pv-btn-outline mt-4 w-full" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }} onClick={onClose}>
      <div className="pv-card w-full max-w-md p-5" style={{ background: "var(--color-surface-overlay)" }} onClick={(event) => event.stopPropagation()}>
        <h3 className="text-base font-semibold">{overlay.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{overlay.body}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="pv-btn pv-btn-outline" type="button" onClick={onClose}>
            취소
          </button>
          <button
            className={overlay.danger ? "pv-btn pv-btn-danger" : "pv-btn pv-btn-primary"}
            type="button"
            onClick={() => {
              overlay.onConfirm?.();
              onClose();
            }}
          >
            {overlay.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

export function IntroPhone({
  children,
  nav,
  overlay,
}: {
  children: ReactNode;
  nav?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <IntroViewport>
      <div className="preview-phones preview-phones-single">
        <PreviewFit width={390} height={844}>
          <PhoneFrame>
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="phone-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
              {nav}
              {overlay}
            </div>
          </PhoneFrame>
        </PreviewFit>
      </div>
    </IntroViewport>
  );
}

export function AppBar({
  title,
  subtitle,
  onNotify,
}: {
  title: string;
  subtitle?: string;
  onNotify: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-5 pt-2">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p> : null}
      </div>
      <button type="button" className="relative grid size-8 place-items-center rounded-full border border-[var(--color-border-default)]" onClick={onNotify}>
        🔔
        <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--color-accent-default)]" />
      </button>
    </div>
  );
}

export function BottomNav({
  items,
  active,
  onItem,
}: {
  items: string[];
  active: string;
  onItem: (item: string) => void;
}) {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-default)] text-center text-[11px]">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="relative py-3"
          style={{ color: item === active ? "var(--color-primary-text)" : "var(--color-text-tertiary)" }}
          onClick={() => onItem(item)}
        >
          {item === "+" ? (
            <span className="mx-auto grid size-8 place-items-center rounded-full bg-[var(--color-primary-default)] text-sm text-[var(--color-primary-on)]">
              +
            </span>
          ) : (
            item
          )}
        </button>
      ))}
    </nav>
  );
}

export function AppOverlays({
  overlay,
  onClose,
}: {
  overlay: AppOverlay;
  onClose: () => void;
}) {
  if (overlay.type === "none") return null;

  if (overlay.type === "toast" || overlay.type === "snackbar") {
    return (
      <div
        className="absolute bottom-16 left-4 right-4 z-30 rounded-xl px-3 py-3 text-sm"
        style={{
          background: overlay.type === "toast" && overlay.tone ? TONE_BG[overlay.tone] : "var(--color-surface-inverse)",
          color: overlay.type === "toast" && overlay.tone ? TONE_FG[overlay.tone] : "var(--color-text-inverse)",
        }}
      >
        {overlay.message}
      </div>
    );
  }

  if (overlay.type === "action") {
    return (
      <div className="absolute inset-0 z-30 flex items-end" style={{ background: "var(--color-overlay-scrim)" }} onClick={onClose}>
        <div className="w-full space-y-2 p-3" onClick={(event) => event.stopPropagation()}>
          <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-overlay)]">
            {overlay.items.map((item) => (
              <button
                key={item.label}
                type="button"
                className="block w-full border-b border-[var(--color-border-subtle)] px-3 py-3 text-sm last:border-b-0"
                style={item.danger ? { color: "var(--color-danger-text)" } : undefined}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button className="pv-btn w-full bg-[var(--color-surface-overlay)]" type="button" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    );
  }

  if (overlay.type === "sheet") {
    return (
      <div className="absolute inset-0 z-30 flex items-end" style={{ background: "var(--color-overlay-scrim)" }} onClick={onClose}>
        <div className="w-full rounded-t-3xl bg-[var(--color-surface-overlay)] p-5" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[var(--color-border-default)]" />
          <h3 className="font-semibold">{overlay.title}</h3>
          <div className="mt-3">{overlay.body}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-6" style={{ background: "var(--color-overlay-scrim)" }} onClick={onClose}>
      <div className="w-full rounded-2xl bg-[var(--color-surface-overlay)] p-4" onClick={(event) => event.stopPropagation()}>
        <h3 className="font-semibold">{overlay.title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{overlay.body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="pv-btn pv-btn-outline" type="button" onClick={onClose}>
            취소
          </button>
          <button
            className={overlay.danger ? "pv-btn pv-btn-danger" : "pv-btn pv-btn-primary"}
            type="button"
            onClick={() => {
              overlay.onConfirm?.();
              onClose();
            }}
          >
            {overlay.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
