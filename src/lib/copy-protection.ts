"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

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

export function attachCopyLock(node: HTMLElement) {
  const touchesLock = (selection: Selection | null) => Boolean(selection && selection.rangeCount > 0 && selection.containsNode(node, true));
  const blockClipboard = (event: globalThis.ClipboardEvent) => {
    if (!event.composedPath().includes(node) && !touchesLock(document.getSelection())) return;
    event.preventDefault();
    event.stopPropagation();
  };
  const blockKeys = (event: globalThis.KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || !BLOCKED_SHORTCUT_KEYS.has(event.key.toLowerCase())) return;
    const selection = document.getSelection();
    const inside = event.target instanceof Node && node.contains(event.target);
    if (!inside && !touchesLock(selection)) return;
    event.preventDefault();
    event.stopPropagation();
    selection?.removeAllRanges();
  };
  const blockSelection = () => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !touchesLock(selection)) return;
    selection.removeAllRanges();
  };
  const blockGesture = (event: Event) => {
    event.preventDefault();
  };
  node.addEventListener("dragstart", blockGesture);
  node.addEventListener("selectstart", blockGesture);
  node.addEventListener("contextmenu", blockGesture);
  document.addEventListener("copy", blockClipboard, true);
  document.addEventListener("cut", blockClipboard, true);
  document.addEventListener("keydown", blockKeys, true);
  document.addEventListener("selectionchange", blockSelection);
  return () => {
    node.removeEventListener("dragstart", blockGesture);
    node.removeEventListener("selectstart", blockGesture);
    node.removeEventListener("contextmenu", blockGesture);
    document.removeEventListener("copy", blockClipboard, true);
    document.removeEventListener("cut", blockClipboard, true);
    document.removeEventListener("keydown", blockKeys, true);
    document.removeEventListener("selectionchange", blockSelection);
  };
}

export function useCopyLock<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;
    return attachCopyLock(node);
  }, [active]);
  return ref;
}
