"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getFirebaseApp } from "@/lib/firebase/client";

export type ProductEvent =
  | "color_picked"
  | "generate"
  | "palette_changed"
  | "token_edited"
  | "export_opened"
  | "export_format_selected"
  | "export_downloaded"
  | "project_saved"
  | "project_library_opened"
  | "project_opened"
  | "palette_shared"
  | "user_login"
  | "limit_reached";

/**
 * Privacy-light product analytics. Values must describe UI actions only; never
 * pass email addresses, user ids, project names, or full share payloads here.
 */
export async function trackProductEvent(
  name: ProductEvent,
  parameters: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined") return;
  try {
    if (!(await isSupported())) return;
    logEvent(getAnalytics(getFirebaseApp()), name, parameters);
  } catch {
    // Analytics must never interrupt the color workflow.
  }
}
