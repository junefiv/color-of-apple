// Reads the builder's rendered artboards for a Pro export: strips editor chrome, keeps only the CSS
// the page uses and the live palette tokens. The deliverable itself is built on the server.

// Editing chrome drawn inside the artboard that has no place in a published page.
const CHROME = [".lb-node-label", ".lb-insert-before", ".lb-drop-line", ".lb-drop-placeholder", ".lb-page-add", ".lb-start", ".lb-resize", ".lb-resize-size",
  ".lb-pad-box", ".lb-margin-box", ".lb-margin-handle", ".lb-container-guide", ".lb-overlay-chips", ".lb-side-zone"];
const EDIT_ATTRS = ["contenteditable", "draggable", "data-drop", "data-removing", "data-image-over", "spellcheck"];

export function cleanArtboard(viewport: Element): HTMLElement {
  const clone = viewport.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(CHROME.join(",")).forEach(el => el.remove());
  for (const el of [clone, ...clone.querySelectorAll<HTMLElement>("*")]) {
    EDIT_ATTRS.forEach(attr => el.removeAttribute(attr));
    el.classList.remove("is-selected");
    if (el.getAttribute("tabindex") === "-1") el.removeAttribute("tabindex");
  }
  // Empty image slots carry "drag an image here" hints meant for the editor; the slot itself stays.
  const walker = clone.ownerDocument.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  const hints: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent?.includes("끌어다 놓")) hints.push(n as Text);
  for (const hint of hints) {
    const parent = hint.parentElement; hint.remove();
    // A hint wrapper left holding only its icon goes too.
    if (parent && parent !== clone && !parent.textContent?.trim() && [...parent.children].every(c => c.tagName.toLowerCase() === "svg")) parent.remove();
  }
  // The artboard is a fixed-size, scaled screen; the exported page flows at the reader's width.
  clone.style.transform = ""; clone.style.width = "100%"; clone.style.height = "auto"; clone.style.overflow = "visible";
  return clone;
}

// The exported page keeps the builder's two scope classes so rules written under them still apply.
export const SCOPE_CLASSES = ["matchu-preview", "layout-builder"];
export function usedClasses(roots: Element[]): Set<string> {
  const names = new Set<string>(SCOPE_CLASSES);
  for (const root of roots) for (const el of [root, ...root.querySelectorAll("*")]) el.classList.forEach(c => names.add(c));
  return names;
}

// A style rule is kept when every class it names appears in the export (so `.a .b` needs both),
// and rules that name no class at all (element resets, :root) are kept as they are.
export function selectorUses(selector: string, classes: Set<string>): boolean {
  return selector.split(",").some(part => {
    const found = [...part.replace(/:(not|is|where|has)\([^)]*\)/g, "").matchAll(/\.((?:\\.|[\w-])+)/g)].map(m => m[1].replace(/\\(.)/g, "$1"));
    return found.every(name => classes.has(name));
  });
}

export function collectCss(sheets: Iterable<CSSStyleSheet>, classes: Set<string>): string {
  const out: string[] = [];
  const walk = (rules: CSSRuleList): string[] => {
    const kept: string[] = [];
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) { if (selectorUses(rule.selectorText, classes)) kept.push(rule.cssText); }
      else if (rule instanceof CSSFontFaceRule) continue; // Font files live on the app's origin; the page falls back to system fonts.
      else if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) {
        const inner = walk((rule as CSSGroupingRule).cssRules);
        if (!inner.length) continue;
        const head = rule.cssText.slice(0, rule.cssText.indexOf("{")).trim();
        kept.push(`${head}{${inner.join("")}}`);
      } else kept.push(rule.cssText);
    }
    return kept;
  };
  for (const sheet of sheets) {
    try { out.push(...walk(sheet.cssRules)); } catch { /* Cross-origin sheets can't be read; they are not ours. */ }
  }
  return out.join("\n");
}

// Top-level layers become separate components in the React export; the name follows the kind.
export function sectionNames(nodes: { id: string; kind: string }[]): Map<string, string> {
  const seen = new Map<string, number>(), names = new Map<string, string>();
  for (const n of nodes) {
    const base = n.kind.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, "") || "Section";
    const count = (seen.get(base) ?? 0) + 1; seen.set(base, count);
    names.set(n.id, count === 1 ? base : `${base}${count}`);
  }
  return names;
}

const DATA_IMAGE = /data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+/g;

// Everything the server needs to build an export: markup per device with top-level layers marked,
// the CSS that markup uses, the palette tokens, and each image once (referenced as coa-image:N).
export function captureExport({ stage, platform, doc, title }: { stage: HTMLElement; platform: "web" | "app"; doc: { nodes: { id: string; kind: string }[] }; title: string }) {
  const read = (device: "desktop" | "mobile") => stage.querySelector(`.lb-viewport[data-device=${device}]`);
  const mobileView = read("mobile"), desktopView = platform === "web" ? read("desktop") : null;
  if (!mobileView) return null;
  const names = sectionNames(doc.nodes);
  const prepare = (view: Element) => {
    const el = cleanArtboard(view);
    el.querySelectorAll<HTMLElement>("[data-id]").forEach(node => { const name = names.get(node.dataset.id ?? ""); if (name) node.dataset.coaSection = name; });
    return el;
  };
  const mobileEl = prepare(mobileView), desktopEl = desktopView ? prepare(desktopView) : null;
  const theme = stage.closest<HTMLElement>(".matchu-preview");
  const tokens: Record<string, string> = {};
  if (theme) for (let i = 0; i < theme.style.length; i++) { const key = theme.style[i]; if (key.startsWith("--")) tokens[key] = theme.style.getPropertyValue(key).trim(); }
  const images: string[] = [];
  const ref = (text: string) => text.replace(DATA_IMAGE, src => { let i = images.indexOf(src); if (i < 0) { i = images.length; images.push(src); } return `coa-image:${i}`; });
  return {
    platform, title, tokens,
    font: `${getComputedStyle(mobileView).fontFamily}, system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`,
    css: ref(collectCss(Array.from(document.styleSheets), usedClasses(desktopEl ? [mobileEl, desktopEl] : [mobileEl]))),
    mobile: ref(mobileEl.outerHTML), desktop: desktopEl ? ref(desktopEl.outerHTML) : undefined,
    doc: JSON.parse(ref(JSON.stringify(doc))) as unknown, images,
  };
}
