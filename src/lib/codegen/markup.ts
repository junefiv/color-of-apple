// String-level tools for the export markup. The input is browser `outerHTML` output (double-quoted,
// entity-escaped attributes), so a small tokenizer is enough and the server needs no DOM.

export type Token =
  | { type: "open"; name: string; attrs: [string, string][]; selfClosing: boolean }
  | { type: "close"; name: string }
  | { type: "text"; value: string };

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|[^<]+/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*"([^"]*)")?/g;

export function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  for (const m of html.matchAll(TAG)) {
    if (m[0].startsWith("<!--")) continue;
    if (m[2] === undefined) { tokens.push({ type: "text", value: m[0] }); continue; }
    const name = m[2];
    if (m[1]) { tokens.push({ type: "close", name }); continue; }
    const attrs: [string, string][] = [...(m[3] ?? "").matchAll(ATTR)].map(a => [a[1], a[2] ?? ""]);
    tokens.push({ type: "open", name, attrs, selfClosing: !!m[4] || VOID.has(name.toLowerCase()) });
  }
  return tokens;
}

// Builder-only attributes that mean nothing outside the editor.
const DROP_ATTRS = new Set(["data-id", "data-parent", "data-edit", "data-image-drop", "data-drop", "data-removing", "data-image-over", "data-coa-section", "contenteditable", "draggable", "spellcheck"]);

// The builder's own class prefix becomes a neutral page prefix so exported code carries no editor names.
export const renameClasses = (value: string) => value.replace(/(^|\s)lb-/g, "$1pg-");
// Custom properties the builder sets (--lb-scale, --lb-gutter...) are renamed the same way.
const renameVars = (text: string) => text.replace(/--lb-/g, "--pg-");
// Class names and keyframe names (`animation: lb-pop`) share the prefix, so both move together.
export const renameCss = (css: string) => renameVars(css.replace(/(?<![\w-])lb-(?=[\w-])/g, "pg-").replace(/\.layout-builder(?![\w-])/g, ".pg-root"));

export function serialize(tokens: Token[]): string {
  return tokens.map(t => t.type === "text" ? t.value : t.type === "close" ? `</${t.name}>`
    : `<${t.name}${t.attrs.map(([k, v]) => ` ${k}="${v}"`).join("")}>`).join("");
}

export function cleanMarkup(html: string): string {
  return serialize(tokenize(html).map(t => t.type !== "open" ? t : { ...t, attrs: t.attrs.filter(([k]) => !DROP_ATTRS.has(k)).map(([k, v]) => [k, k === "class" ? renameClasses(v) : k === "style" ? renameVars(v) : v] as [string, string]) }));
}

// Pulls every element marked data-coa-section="Name" out into its own fragment and leaves
// a `{{section:Name}}` marker in the page markup.
export function splitSections(html: string): { page: string; sections: { name: string; html: string }[] } {
  const tokens = tokenize(html);
  const sections: { name: string; html: string }[] = [];
  const page: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const name = t.type === "open" ? t.attrs.find(([k]) => k === "data-coa-section")?.[1] : undefined;
    if (t.type !== "open" || !name || t.selfClosing) { page.push(t); continue; }
    let depth = 0, j = i;
    for (; j < tokens.length; j++) {
      const u = tokens[j];
      if (u.type === "open" && !u.selfClosing) depth++;
      else if (u.type === "close") { depth--; if (depth === 0) break; }
    }
    sections.push({ name, html: serialize(tokens.slice(i, j + 1)) });
    page.push({ type: "text", value: `{{section:${name}}}` });
    i = j;
  }
  return { page: serialize(page), sections };
}

const ATTR_NAMES: Record<string, string> = { class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength", minlength: "minLength",
  colspan: "colSpan", rowspan: "rowSpan", autocomplete: "autoComplete", autofocus: "autoFocus", crossorigin: "crossOrigin", enterkeyhint: "enterKeyHint",
  inputmode: "inputMode", srcset: "srcSet", "xlink:href": "xlinkHref", "xml:space": "xmlSpace", value: "defaultValue", checked: "defaultChecked" };
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const jsString = (s: string) => JSON.stringify(s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));

function styleObject(css: string): string {
  const pairs = css.split(";").map(p => p.trim()).filter(Boolean).map(p => {
    const i = p.indexOf(":"); if (i < 0) return "";
    const key = p.slice(0, i).trim(), value = p.slice(i + 1).trim();
    return `${key.startsWith("--") ? JSON.stringify(key) : camel(key)}: ${jsString(value)}`;
  }).filter(Boolean);
  return `{{ ${pairs.join(", ")} }}`;
}

function jsxAttr(name: string, value: string, tag: string): string | null {
  if (name === "selected") return null;
  if (name === "style") return value.trim() ? `style=${styleObject(value)}` : null;
  if ((name === "value" || name === "checked") && !["input", "textarea", "select"].includes(tag)) return `${name}=${jsString(value)}`;
  const key = ATTR_NAMES[name] ?? (name.startsWith("data-") || name.startsWith("aria-") ? name : name.includes("-") || name.includes(":") ? camel(name.replace(":", "-")) : name);
  if (value === "" && ["disabled", "hidden", "open", "required", "multiple", "defaultChecked", "readOnly", "autoFocus", "inert"].includes(key)) return key;
  return `${key}=${jsString(value)}`;
}

// JSX for a markup fragment, indented from `depth`. Whitespace-only text between tags is dropped,
// matching React's own output, and edge spaces next to tags are kept as {" "}.
export function toJsx(html: string, depth = 0): string {
  const lines: string[] = [];
  let level = depth;
  const pad = () => "  ".repeat(level);
  const tokens = tokenize(html);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === "text") {
      // Neighbouring section markers arrive as one text run, so split them out first.
      for (const part of t.value.split(/(\{\{section:[\w$]+\}\})/)) {
        const marker = part.match(/^\{\{section:([\w$]+)\}\}$/);
        if (marker) { lines.push(`${pad()}<${marker[1]} />`); continue; }
        if (!part.trim()) continue;
        const body = part.replace(/[{}]/g, c => `{"${c}"}`).replace(/\s+/g, " ");
        lines.push(pad() + (body.startsWith(" ") ? '{" "}' : "") + body.trim() + (body.endsWith(" ") && body.trim() ? '{" "}' : ""));
      }
    } else if (t.type === "close") { level--; lines.push(`${pad()}</${t.name}>`); }
    else {
      const attrs = t.attrs.map(([k, v]) => jsxAttr(k, v, t.name.toLowerCase())).filter(Boolean);
      const head = `<${t.name}${attrs.length ? " " + attrs.join(" ") : ""}`;
      if (t.selfClosing) lines.push(`${pad()}${head} />`);
      // An element with nothing inside closes itself.
      else if (tokens[i + 1]?.type === "close") { lines.push(`${pad()}${head} />`); i++; }
      else { lines.push(`${pad()}${head}>`); level++; }
    }
  }
  return lines.join("\n");
}
