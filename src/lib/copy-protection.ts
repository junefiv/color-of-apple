import type { ClipboardEvent, KeyboardEvent } from "react";

const BLOCKED_SHORTCUT_KEYS = new Set(["a", "c", "x"]);

export function preventProtectedCopy(event: ClipboardEvent<HTMLElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function preventProtectedCopyShortcut(event: KeyboardEvent<HTMLElement>) {
  if (!(event.ctrlKey || event.metaKey)) return;
  if (!BLOCKED_SHORTCUT_KEYS.has(event.key.toLowerCase())) return;

  event.preventDefault();
  event.stopPropagation();
}
