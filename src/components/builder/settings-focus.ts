"use client";

import { useEffect, type RefObject } from "react";

// What the user clicked on an artboard frame, e.g. the hero's primary button. `at` counts up on every
// click so clicking the same part again re-runs the jump.
export type EditFocus = { node: string; part: string; at: number };

// Scrolls the settings section that owns `part` into view, flashes it and focuses its own field.
// Sections carry data-part; inputs that edit one clicked part carry data-field with that part's name.
export function useSettingsFocus(root: RefObject<HTMLElement | null>, focus: EditFocus | undefined, sections: Record<string, string>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !focus) return;
    // Indexed parts such as "card:2" fall back to the section mapped for their prefix.
    const section = el.querySelector<HTMLElement>(`[data-part="${sections[focus.part] ?? sections[focus.part.split(":")[0]] ?? focus.part}"]`);
    if (!section) return;
    section.scrollIntoView({ block: "start", behavior: "smooth" });
    section.dataset.focus = "true";
    // A panel may open the clicked item first, so its field is looked up after that render.
    const frame = requestAnimationFrame(() => el.querySelector<HTMLElement>(`[data-field="${focus.part}"]`)?.focus({ preventScroll: true }));
    const timer = window.setTimeout(() => { delete section.dataset.focus; }, 1400);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); delete section.dataset.focus; };
    // `sections` is a static map per settings panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, root]);
}
