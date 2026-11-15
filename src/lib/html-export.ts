// Turns the builder's rendered artboards into one standalone HTML file: the PC and mobile renders
// side by side in the markup, switched by a media query, with only the CSS those elements use and
// the live palette tokens as custom properties. Interactions (menus, sliders) export in their resting state.

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

export function buildHtmlDocument({ title, vars, css, font, desktop, mobile }: { title: string; vars: string; css: string; font: string; desktop?: string; mobile: string }): string {
  const escape = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const both = desktop !== undefined;
  const wrap = ["coa-page", ...SCOPE_CLASSES].join(" ");
  // Two classes so the switch outranks the shell reset above.
  const swap = both ? ".coa-page.coa-mobile{display:none}\n@media (max-width: 767px){.coa-page.coa-desktop{display:none}.coa-page.coa-mobile{display:block}}" : "";
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
:root{${vars};--font-ui:${font}}
html,body{margin:0;background:var(--color-background-default,var(--color-surface-default,#fff))}
body{font-family:var(--font-ui);-webkit-font-smoothing:antialiased}
${css}
/* Undo the builder shell's own box so only its scoped rules carry over. */
.coa-page.layout-builder{display:block;height:auto;min-height:0;background:none;border:0;color:var(--color-text-primary);font:inherit;container-type:inline-size}
.coa-page .lb-layout-node{outline:none!important}
${swap}
</style>
</head>
<body>
${both ? `<div class="${wrap} coa-desktop">${desktop}</div>\n` : ""}<div class="${wrap} coa-mobile">${mobile}</div>
</body>
</html>
`;
}
