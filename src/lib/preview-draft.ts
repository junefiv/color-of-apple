import { decodeShare, encodeShare, type SharePayload } from "@/lib/share/encode";

export const PREVIEW_DRAFT_KEY = "matchu:preview-session";
function previewSource() {
  const query = new URLSearchParams(window.location.search).toString();
  return window.location.pathname + (query ? `?${query}` : "");
}

export function readPreviewDraft(): { payload: string; projectId: string | null; source: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PREVIEW_DRAFT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value.source !== previewSource() || typeof value.payload !== "string" || !decodeShare(value.payload)) return null;
    return { payload: value.payload, projectId: typeof value.projectId === "string" ? value.projectId : null, source: value.source };
  } catch { return null; }
}

export function writePreviewDraft(value: SharePayload, projectId: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PREVIEW_DRAFT_KEY, JSON.stringify({ payload: encodeShare(value), projectId, source: previewSource() }));
  } catch { /* Storage restrictions must not interrupt color editing. */ }
}

export function clearPreviewDraft() {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(PREVIEW_DRAFT_KEY); } catch { /* Storage can be unavailable. */ }
}
