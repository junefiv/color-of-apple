import { mountFold } from "./fold-motion";
import { mountGlass } from "./glass-motion";
import { mountReveal } from "./reveal-motion";
import { revealCount, revealDirection, revealFit, revealImage, revealIndex, revealSpan, revealStep } from "./reveal";
import { mountSlime, playSlime } from "./slime-motion";
import type { CSSProperties } from "react";
import type { LibraryItemId } from "./catalog";
import { defaultOptions, type ComponentOptions } from "./settings";

export function variantColors(variant: string, theme: CSSProperties = {}) {
  const palette = theme as Record<string, string>;
  const safe = (value: string | undefined, fallback: string) => value && !/[;{}<>]|var\(/.test(value) ? value : fallback;
  const family = variant.split("-")[0];
  const fill = safe(palette["--color-" + variant], safe(palette["--color-" + family + "-default"], "#64748b"));
  const ink = safe(palette["--color-" + variant + "-on"], safe(palette["--color-" + family + "-on"], "#ffffff"));
  return { fill, ink };
}
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function scopeHash(value: unknown) {
  let hash = 2166136261;
  for (const c of JSON.stringify(value)) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}

function slimeFrames(name: string, forward: boolean) {
  const steps = 24;
  const frames = ["@keyframes " + name + " {"];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const glide = t * t * (3 - 2 * t);
    const x = forward ? glide : 1 - glide;
    const flow = 4 * t * (1 - t);
    const sx = (1 + 0.22 * flow).toFixed(3);
    const sy = (1 - 0.08 * flow).toFixed(3);
    const trail = (50 - 10 * flow).toFixed(2);
    const lead = (50 + 4 * flow).toFixed(2);
    const left = forward ? trail : lead;
    const right = forward ? lead : trail;
    frames.push(
      "  " + Math.round(t * 100) + "% { transform: translateX(calc(var(--slime-travel) * " + x.toFixed(4) + ")) scale(" + sx + ", " + sy + "); border-radius: " + left + "% " + right + "% " + right + "% " + left + "% / 50%; animation-timing-function: linear; }",
    );
  }
  frames.push("}");
  return frames;
}

function slimeSources(options: ComponentOptions, ko: boolean, theme: CSSProperties) {
  const settings = { ...defaultOptions("slime-toggle"), ...options };
  const { fill } = variantColors(String(settings.variant), theme);
  const font = settings.size === "small" ? 14 : settings.size === "large" ? 22 : 18;
  const duration = /^[1-9]00ms$/.test(String(settings.duration)) ? String(settings.duration) : "500ms";
  const scope = "coa-slime-" + scopeHash({ variant: settings.variant, size: settings.size, duration, fill });
  const selector = "." + scope;
  const off = "#c6c6cc";
  const css = [
    "/* Color of Apple UI Kit — Slime Toggle */",
    ...slimeFrames("coa-slime-on", true),
    ...slimeFrames("coa-slime-off", false),
    selector + " {",
    "  --slime-thumb: 1.72em; --slime-pad: 0.2em; --slime-travel: 1.62em; --slime-ms: " + duration + ";",
    "  position: relative; box-sizing: border-box; display: inline-flex;",
    "  width: calc(var(--slime-thumb) + var(--slime-travel) + var(--slime-pad) * 2);",
    "  height: calc(var(--slime-thumb) + var(--slime-pad) * 2);",
    "  padding: 0; border: 0; border-radius: 999px; cursor: pointer; touch-action: manipulation;",
    "  font-size: " + font + "px; background: " + off + "; transition: background-color var(--slime-ms) cubic-bezier(0.4, 0, 0.2, 1);",
    "}",
    selector + "[aria-checked='true'] { background: " + fill + "; }",
    selector + " > span {",
    "  position: absolute; top: var(--slime-pad); left: var(--slime-pad);",
    "  width: var(--slime-thumb); height: var(--slime-thumb); transform-origin: center;",
    "  border-radius: 50%; background: #ffffff; transform: translateX(0);",
    "  box-shadow: inset 0 -0.12em 0.22em rgba(22, 22, 25, 0.08), 0 0.14em 0.32em rgba(22, 22, 25, 0.16);",
    "}",
    selector + "[aria-checked='true'] > span { transform: translateX(var(--slime-travel)); }",
    selector + ":focus-visible { outline: 2px solid " + fill + "; outline-offset: 4px; }",
    "@media (prefers-reduced-motion: reduce) { " + selector + " { transition: none; } }",
  ].join("\n");
  const label = ko ? "슬라임 토글" : "Slime toggle";
  const html = '<button type="button" role="switch" aria-checked="' + (settings.on ? "true" : "false") + '" aria-label="' + escapeHtml(label) + '" class="' + scope + '"><span></span></button>';
  const js = "const playSlime = " + playSlime.toString() + ";\nconst mountSlime = " + mountSlime.toString() + ";\ndocument.querySelectorAll('" + selector + "').forEach(button => {\n  if (button.dataset.slimeReady) return;\n  button.dataset.slimeReady = 'true';\n  mountSlime(button);\n});";
  return { scope, html, css, js, settings };
}

function glassSources(options: ComponentOptions, theme: CSSProperties) {
  const settings = { ...defaultOptions("glass-drop"), ...options };
  const { fill } = variantColors(String(settings.variant), theme);
  const font = settings.size === "small" ? 52 : settings.size === "large" ? 96 : 72;
  const scope = "coa-glass-" + scopeHash({ variant: settings.variant, size: settings.size, fill });
  const selector = "." + scope;
  const css = [
    "/* Color of Apple UI Kit — Glass Drop Hover */",
    selector + " {",
    "  --glass-size: 1.62em;",
    "  position: relative; display: grid; place-items: center; width: max-content; max-width: 100%;",
    "  box-sizing: border-box; margin: 0; border: 0; background: transparent; padding: 0.9em 0.4em;",
    "  font-family: inherit; font-size: " + font + "px; font-weight: 800; line-height: 0.9; letter-spacing: -0.045em;",
    "  color: #ffffff; cursor: none; user-select: none;",
    "}",
    ".lk-component-scope " + selector + " { cursor: none; }",
    selector + " > b {",
    "  position: relative; z-index: 1; font: inherit; letter-spacing: inherit; white-space: nowrap;",
    "  transition: color 340ms ease, text-shadow 340ms ease, transform 180ms ease, filter 180ms ease;",
    "}",
    selector + ".is-pressed > b { transform: scale(0.94); filter: brightness(1.25); }",
    selector + ".is-absorbing > b { text-shadow: 0 0 0.05em rgba(255, 255, 255, 0.95), 0 0 0.22em " + fill + ", 0 0 0.9em " + fill + "; }",
    selector + ".is-hot b {",
    "  color: transparent;",
    "  -webkit-text-stroke: 0.035em rgba(255, 255, 255, 0.94);",
    "  text-shadow: 0 0 0.08em rgba(255, 255, 255, 0.9), 0 0 0.28em " + fill + ", 0 0 0.72em " + fill + ";",
    "}",
    selector + " [data-drop] {",
    "  position: absolute; left: 0; top: 0; z-index: 2; width: var(--glass-size); height: var(--glass-size);",
    "  opacity: 0; overflow: hidden; pointer-events: none; border-radius: 50%;",
    "  border: 1px solid rgba(255, 255, 255, 0.62);",
    "  background: radial-gradient(125% 120% at 28% 22%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.14) 34%, transparent 56%), radial-gradient(90% 90% at 72% 80%, color-mix(in srgb, " + fill + " 48%, transparent), transparent 62%);",
    "  box-shadow: inset 0.35em 0.4em 0.7em rgba(255, 255, 255, 0.48), inset -0.55em -0.7em 1em color-mix(in srgb, " + fill + " 42%, transparent), 0 0.45em 1.2em rgba(0, 0, 0, 0.28);",
    "  backdrop-filter: blur(8px) saturate(1.7) contrast(1.08);",
    "  -webkit-backdrop-filter: blur(8px) saturate(1.7) contrast(1.08);",
    "}",
    selector + " [data-drop]::before {",
    "  content: ''; position: absolute; z-index: 3; left: 14%; right: 26%; top: 8%; height: 28%;",
    "  border-radius: 50%; background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0)); pointer-events: none;",
    "}",
    selector + " [data-drop]::after {",
    "  content: ''; position: absolute; z-index: 3; left: 28%; right: 18%; bottom: 12%; height: 14%;",
    "  border-radius: 50%; background: rgba(255, 255, 255, 0.32); filter: blur(2px); pointer-events: none;",
    "}",
    selector + " [data-lens] {",
    "  position: absolute; left: 0; top: 0; z-index: 1; display: grid; place-items: center; pointer-events: none;",
    "}",
    selector + " [data-lens] b { font: inherit; letter-spacing: inherit; white-space: nowrap; }",
    "@media (prefers-reduced-motion: reduce) { " + selector + " > b { transition: none; } }",
  ].join("\n");
  const label = escapeHtml(String(settings.label));
  const html = '<button type="button" class="' + scope + '" data-glass><b>' + label + '</b><span data-drop aria-hidden="true"><span data-lens><b>' + label + '</b></span></span></button>';
  const js = "const mountGlass = " + mountGlass.toString() + ";\ndocument.querySelectorAll('" + selector + "').forEach(root => {\n  if (root.dataset.glassReady) return;\n  root.dataset.glassReady = 'true';\n  mountGlass(root);\n});";
  return { scope, html, css, js, settings };
}

function revealSources(options: ComponentOptions, theme: CSSProperties) {
  const settings = { ...defaultOptions("image-reveal"), ...options };
  const columns = revealCount(settings.columns, 6);
  const rows = revealCount(settings.rows, 4);
  const fit = revealFit(settings.fit);
  const direction = revealDirection(settings.direction);
  const image = revealImage(settings.image);
  const { fill } = variantColors(String(settings.variant), theme);
  const count = columns * rows;
  const span = revealSpan(direction, columns, rows);
  const step = revealStep(span);
  const scope = "coa-reveal-" + scopeHash({ component: "image-reveal" });
  const selector = "." + scope;
  const cssUrl = "url('" + image.replace(/'/g, "%27") + "')";
  const cells = Array.from({ length: count }, (_, index) => {
    const x = index % columns;
    const y = Math.floor(index / columns);
    const order = revealIndex(direction, x, y, columns, rows);
    return '<span data-cell style="--i:' + order + ';--x:' + x + ';--y:' + y + '"></span>';
  }).join("");
  const css = [
    "/* Color of Apple UI Kit — Image Reveal */",
    selector + " {",
    "  --fit-x: 0; --fit-y: 0; --fit-w: 1; --fit-h: 1;",
    "  position: relative; isolation: isolate; display: grid; place-items: center; box-sizing: border-box;",
    "  width: 100%; max-width: 36rem; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 1.1rem;",
    "  background: #12160e; color: var(--reveal-ink, #e4f56b); cursor: pointer; user-select: none; container-type: inline-size;",
    "  font-family: inherit;",
    "}",
    selector + ":focus-visible { outline: 2px solid var(--reveal-ink, #e4f56b); outline-offset: 4px; }",
    selector + " > p {",
    "  position: relative; z-index: 0; margin: 0; max-width: 92%; overflow-wrap: anywhere;",
    "  font-size: clamp(1.7rem, 14cqi, 4.6rem); font-weight: 800; line-height: 0.88;",
    "  letter-spacing: -0.045em; text-align: center; text-wrap: balance;",
    "}",
    selector + " [data-tiles] {",
    "  position: absolute; inset: 0; z-index: 1; display: grid; pointer-events: none;",
    "  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));",
    "  grid-template-rows: repeat(var(--rows), minmax(0, 1fr));",
    "  perspective: 800px; transform-style: preserve-3d;",
    "}",
    selector + " [data-cell] {",
    "  position: relative; overflow: hidden; background: #1c2116; transform-origin: center top;",
    "  transition: transform 520ms cubic-bezier(0.4, 0.05, 0.2, 1), opacity 420ms ease;",
    "  transition-delay: calc(var(--i) * var(--reveal-step));",
    "  backface-visibility: hidden;",
    "}",
    selector + ":hover [data-cell], " + selector + ":focus-within [data-cell] {",
    "  transform: rotateX(-76deg) scale(0.96); opacity: 0;",
    "  transition-delay: calc(var(--i) * var(--reveal-step));",
    "}",
    selector + " [data-cell]::before {",
    "  content: ''; position: absolute; pointer-events: none;",
    "  left: calc((var(--fit-x) * var(--cols) - var(--x)) * 100%);",
    "  top: calc((var(--fit-y) * var(--rows) - var(--y)) * 100%);",
    "  width: calc(var(--fit-w) * var(--cols) * 100%);",
    "  height: calc(var(--fit-h) * var(--rows) * 100%);",
    "  background-image: var(--reveal-image); background-repeat: no-repeat; background-size: 100% 100%;",
    "}",
    selector + ":not([data-ready]) [data-cell]::before { visibility: hidden; }",
    "@media (prefers-reduced-motion: reduce) { " + selector + " [data-cell] { transition: none; } }",
  ].join("\n");
  const html = '<div class="' + scope + '" tabindex="0" data-fit="' + fit + '" data-image="' + escapeHtml(image) + '" style="--cols:' + columns + ';--rows:' + rows + ';--n:' + span + ';--reveal-step:' + step + 'ms;--reveal-ink:' + fill + ';--reveal-image:' + cssUrl + '"><p>' + escapeHtml(String(settings.label)) + '</p><div data-tiles aria-hidden="true">' + cells + '</div></div>';
  const js = "const mountReveal = " + mountReveal.toString() + ";\ndocument.querySelectorAll('" + selector + "').forEach(root => {\n  if (root.dataset.revealReady) return;\n  root.dataset.revealReady = 'true';\n  mountReveal(root);\n});";
  return { scope, html, css, js, settings: { ...settings, columns, rows, fit, direction, image, color: fill } };
}

export function componentSources(id: LibraryItemId, options: ComponentOptions, ko: boolean, theme: CSSProperties = {}) {
  if (id === "image-reveal") return revealSources(options, theme);
  if (id === "glass-drop") return glassSources(options, theme);
  if (id === "slime-toggle") return slimeSources(options, ko, theme);
  const settings = { ...defaultOptions(id), ...options };
  const { fill, ink } = variantColors(String(settings.variant), theme);
  const font = settings.size === "small" ? 16 : settings.size === "large" ? 23 : 19.2;
  const scope = "coa-fold-" + scopeHash([settings, fill, ink]);
  const selector = "." + scope;
  const css = [
    "/* Color of Apple UI Kit — Sticker Peeling Button */",
    selector + " {",
    "  position: relative; isolation: isolate; display: inline-block; box-sizing: border-box;",
    "  font-family: inherit; font-size: " + font + "px; line-height: 1.2; font-weight: 700;",
    "  padding: 0; background: transparent; color: " + ink + ";",
    "  border: none; border-radius: 0.5em; cursor: pointer; touch-action: manipulation;",
    "  filter: drop-shadow(0.3em 0.4em 0.3em rgba(0,0,0,0.3));",
    settings.block ? "  width: 100%;" : "  max-width: 100%;",
    "  overflow-wrap: anywhere;",
    "}",
    selector + " > b {",
    "  display: block; padding: 0.7em 1.4em; border-radius: inherit; background: " + fill + ";",
    "  font-weight: inherit; clip-path: var(--fold-front, inset(0));",
    "}",
    selector + "::before {",
    "  content: ''; position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;",
    "  width: var(--fold-sheet-size, 0px); height: var(--fold-sheet-size, 0px);",
    "  clip-path: var(--fold-back, polygon(0 0,0 0,0 0));",
    "  background: linear-gradient(135deg, color-mix(in srgb, " + fill + ", #000 35%) var(--fold-line, 0px), color-mix(in srgb, " + fill + ", #fff 28%) calc(var(--fold-line, 0px) + 0.15em), " + fill + " calc(var(--fold-line, 0px) + 0.5em));",
    "}",
    selector + ":focus-visible { outline: 2px solid " + ink + "; outline-offset: 5px; }",
    selector + ":disabled { opacity: 0.45; cursor: not-allowed; }",
  ].join("\n");
  const html = '<button type="button" class="' + scope + '"' + (settings.disabled ? ' disabled' : '') + '><b>' + escapeHtml(String(settings.label)) + '</b></button>';
  const js = settings.disabled ? "" : "const mountFold = " + mountFold.toString() + ";\ndocument.querySelectorAll('." + scope + "').forEach(button => {\n  if (button.dataset.peelReady) return;\n  button.dataset.peelReady = 'true';\n  mountFold(button);\n});";
  return { scope, html, css, js, settings };
}
export function generateHtmlCode(id: LibraryItemId, options: ComponentOptions, ko: boolean, theme: CSSProperties = {}) {
  const { html, css, js } = componentSources(id, options, ko, theme);
  return '<style>\n' + css + '\n</style>\n\n' + html + (js ? '\n\n<script>\n(() => {\n' + js + '\n})();\n</script>' : '');
}
export function generateComponentCode(id: LibraryItemId, options: ComponentOptions, ko: boolean, theme: CSSProperties = {}) {
  const { scope, css, settings } = componentSources(id, options, ko, theme);
  const literal = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c');
  if (id === "glass-drop") {
    return [
      '"use client";',
      'import { useEffect, useRef } from "react";',
      'export default function GlassDropHover() {',
      '  const rootRef = useRef(null);',
      '  useEffect(() => { if (rootRef.current) return mountGlass(rootRef.current); }, []);',
      '  return (<>',
      '    <style>{styles}</style>',
      '    <button type="button" ref={rootRef} className=' + literal(scope) + ' data-glass>',
      '      <b>{' + literal(String(settings.label)) + '}</b>',
      '      <span data-drop aria-hidden="true"><span data-lens><b>{' + literal(String(settings.label)) + '}</b></span></span>',
      '    </button>',
      '  </>);',
      '}',
      'const styles = ' + literal(css) + ';',
      'const mountGlass = ' + mountGlass.toString() + ';',
    ].join('\n');
  }
  if (id === "image-reveal") {
    const columns = Number(settings.columns);
    const rows = Number(settings.rows);
    const count = columns * rows;
    const direction = revealDirection(settings.direction);
    const span = revealSpan(direction, columns, rows);
    const cells = Array.from({ length: count }, (_, index) => {
      const x = index % columns;
      const y = Math.floor(index / columns);
      return '        <span data-cell style={{ "--i": ' + revealIndex(direction, x, y, columns, rows) + ', "--x": ' + x + ', "--y": ' + y + ' }} />';
    }).join("\n");
    return [
      '"use client";',
      'import { useLayoutEffect, useRef } from "react";',
      'const image = ' + literal(String(settings.image)) + ';',
      'export default function ImageReveal() {',
      '  const rootRef = useRef(null);',
      '  useLayoutEffect(() => { if (rootRef.current) return mountReveal(rootRef.current); }, []);',
      '  return (<>',
      '    <style>{styles}</style>',
      '    <div ref={rootRef} tabIndex={0} className=' + literal(scope) + ' data-fit=' + literal(String(settings.fit)) + ' data-image={image} style={{ "--cols": ' + columns + ', "--rows": ' + rows + ', "--n": ' + span + ', "--reveal-step": ' + literal(revealStep(span) + "ms") + ', "--reveal-ink": ' + literal(String(settings.color)) + ', "--reveal-image": "url(\'" + image + "\')" }}>',
      '      <p>{' + literal(String(settings.label)) + '}</p>',
      '      <div data-tiles aria-hidden="true">',
      cells,
      '      </div>',
      '    </div>',
      '  </>);',
      '}',
      'const styles = ' + literal(css) + ';',
      'const mountReveal = ' + mountReveal.toString() + ';',
    ].join("\n");
  }
  if (id === "slime-toggle") {
    const label = ko ? "슬라임 토글" : "Slime toggle";
    return [
      '"use client";',
      'import { useEffect, useRef } from "react";',
      'export default function SlimeToggle() {',
      '  const buttonRef = useRef(null);',
      '  useEffect(() => { if (buttonRef.current) mountSlime(buttonRef.current); }, []);',
      '  return (<>',
      '    <style>{styles}</style>',
      '    <button type="button" role="switch" aria-checked={' + Boolean(settings.on) + '} aria-label=' + literal(label) + ' ref={buttonRef} className=' + literal(scope) + '>',
      '      <span></span>',
      '    </button>',
      '  </>);',
      '}',
      'const styles = ' + literal(css) + ';',
      'const playSlime = ' + playSlime.toString() + ';',
      'const mountSlime = ' + mountSlime.toString() + ';',
    ].join('\n');
  }
  return [
    '"use client";',
    'import { useEffect, useRef } from "react";',
    'export default function FoldButton() {',
    '  const buttonRef = useRef(null);',
    '  useEffect(() => mountFold(buttonRef.current), []);',
    '  return (<>',
    '    <style>{styles}</style>',
    '    <button type="button" ref={buttonRef} className=' + literal(scope) + ' disabled={' + Boolean(settings.disabled) + '}>',
    '      <b>{' + literal(String(settings.label)) + '}</b>',
    '    </button>',
    '  </>);',
    '}',
    'const styles = ' + literal(css) + ';',
    'const mountFold = ' + mountFold.toString() + ';',
  ].join('\n');
}
