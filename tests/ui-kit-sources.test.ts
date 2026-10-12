// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { JSDOM, VirtualConsole } from "jsdom";
import ts from "typescript";
import { LIBRARY_ITEMS } from "@/components/preview/library/catalog";
import { defaultOptions } from "@/components/preview/library/settings";
import { componentSources, generateComponentCode, generateHtmlCode } from "@/components/preview/library/code";
import { DEFAULT_REVEAL_IMAGE } from "@/components/preview/library/reveal";

afterEach(() => vi.unstubAllGlobals());
function copiedReact(code: string) {
  const compiled = ts.transpileModule(code, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const compiledModule = { exports: {} as { default: React.ComponentType } };
  new Function("require", "module", "exports", compiled.outputText)((id: string) => {
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return jsxRuntime;
    throw new Error(`Unexpected dependency: ${id}`);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports.default;
}
function htmlPage(html: string) {
  const errors: Error[] = [];
  const console = new VirtualConsole(); console.on("jsdomError", error => errors.push(error));
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: console, beforeParse(window) {
    window.matchMedia = () => ({ matches: false }) as MediaQueryList;
    window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
    window.HTMLDialogElement.prototype.close = function() { this.open = false; };
  } });
  return { dom, errors };
}


describe("standalone fold sources", () => {
  it("executes copied HTML and replays the peel", () => {
    const {dom, errors} = htmlPage(generateHtmlCode('fold-button',defaultOptions('fold-button'),true));
    try {
      const button = dom.window.document.querySelector('button')!;
      button.click(); expect(button.classList.contains('is-peeling')).toBe(true);
      button.click(); expect(button.classList.contains('is-peeling')).toBe(true);
      expect(button.style.getPropertyValue('--fold-front')).toContain('polygon(');
      expect(errors).toEqual([]);
    } finally { dom.window.close(); }
  });
  it("mounts copied React with React alone", () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true); vi.stubGlobal('matchMedia',()=>({matches:false}));
    const Component = copiedReact(generateComponentCode('fold-button',defaultOptions('fold-button'),true));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
      React.act(()=>root.render(React.createElement(React.StrictMode,null,React.createElement(Component))));
      const button=host.querySelector('button')!;
      React.act(()=>button.click()); expect(button.classList.contains('is-peeling')).toBe(true);
      expect(button.style.getPropertyValue('--fold-back')).toContain('polygon(');
    } finally { React.act(()=>root.unmount()); host.remove(); }
  });
  it("exports only selected values and isolates configurations", () => {
    const source=componentSources('fold-button',{...defaultOptions('fold-button'),variant:'secondary-700',size:'large'},true,{'--color-secondary-700':'#123456'} as React.CSSProperties);
    expect(source.css).toContain('background: #123456'); expect(source.css).toContain('23px');
    expect(source.css).not.toMatch(/--lk-|--color-|cushion|ink-bloom/);
    expect(source.css).toContain('clip-path: var(--fold-front');
    expect(source.css).toContain('clip-path: var(--fold-back');
    expect(source.js).toContain('distance - y');
    expect(source.css).not.toContain('@keyframes');
    expect(source.scope).not.toBe(componentSources('fold-button',defaultOptions('fold-button'),true).scope);
    expect(LIBRARY_ITEMS).toHaveLength(4);
  });
  it("escapes labels and emits no JS for disabled buttons", () => {
    const label='</button><script>alert("x")</script>$'+'{unsafe}'+String.fromCharCode(96);
    const options={...defaultOptions('fold-button'),label,disabled:true};
    const {dom,errors}=htmlPage(generateHtmlCode('fold-button',options,true));
    try { expect(dom.window.document.querySelector('b')!.textContent).toBe(label); expect(errors).toEqual([]); }
    finally { dom.window.close(); }
    expect(()=>copiedReact(generateComponentCode('fold-button',options,true))).not.toThrow();
    expect(componentSources('fold-button',options,true).js).toBe('');
  });
  it("stores the reveal image once and slices it into cells", () => {
    const html = generateHtmlCode("image-reveal", defaultOptions("image-reveal"), true);
    expect(html.match(/<span data-cell/g)).toHaveLength(24);
    expect(html.split(DEFAULT_REVEAL_IMAGE).length - 1).toBe(2);
    expect(html).toContain('data-fit="fill"');
    expect(html).toContain("Reveal New Arrival");
    const react = generateComponentCode("image-reveal", { ...defaultOptions("image-reveal"), fit: "cover", columns: 2, rows: 2, label: "Rain" }, true);
    expect(react.split(DEFAULT_REVEAL_IMAGE).length - 1).toBe(1);
    expect(react).toContain('data-fit="cover"');
    expect(react.match(/data-cell/g)?.length).toBeGreaterThan(4);
    const Component = copiedReact(react);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    try {
      React.act(() => root.render(React.createElement(Component)));
      expect(host.querySelectorAll("[data-cell]")).toHaveLength(4);
      expect(host.querySelector("p")!.textContent).toBe("Rain");
      expect(host.querySelector("[data-fit]")!.getAttribute("data-fit")).toBe("cover");
    } finally {
      React.act(() => root.unmount());
      host.remove();
    }
  });
});
