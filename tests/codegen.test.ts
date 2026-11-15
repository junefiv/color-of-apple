import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { generateExport, type ExportPayload } from "../src/lib/codegen/generate";
import { cleanMarkup, splitSections, toJsx } from "../src/lib/codegen/markup";
import { parseExportPayload } from "../src/lib/codegen/payload";
import { crc32, createZip } from "../src/lib/codegen/zip";
import { appendToZip, dataUrlBytes } from "../src/lib/zip-append";
import { newLayoutNode } from "../src/lib/page-layout";

// Reads entry names and contents back out of a ZIP built by createZip.
function unzip(zip: Uint8Array) {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const files = new Map<string, string>();
  let at = 0;
  while (view.getUint32(at, true) === 0x04034b50) {
    const method = view.getUint16(at + 8, true), size = view.getUint32(at + 18, true), nameLength = view.getUint16(at + 26, true);
    const name = new TextDecoder().decode(zip.subarray(at + 30, at + 30 + nameLength));
    const packed = zip.subarray(at + 30 + nameLength, at + 30 + nameLength + size);
    const data = method === 0 ? packed : inflateRawSync(packed);
    files.set(name, new TextDecoder().decode(data));
    at += 30 + nameLength + size;
  }
  return files;
}

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
function payload(format: ExportPayload["format"]): ExportPayload {
  const hero = newLayoutNode("hero");
  return {
    format, platform: "web", title: "웹 페이지", font: "system-ui", css: ".lb-layout-node{display:flex}.layout-builder *{box-sizing:border-box}",
    tokens: { "--color-primary-default": "#2f5bea", "--color-primary-500": "#2f5bea" }, images: ["image/png"],
    desktop: `<div class="lb-viewport" data-device="desktop"><div class="lb-layout-node lb-kind-hero" data-id="${hero.id}" data-coa-section="Hero" data-edit="x"><img src="coa-image:0" alt=""><h1 style="font-size: 40px; --hr-gap: 8px">브랜드 {첫} 화면</h1></div></div>`,
    mobile: `<div class="lb-viewport" data-device="mobile"><div class="lb-layout-node lb-kind-hero" data-coa-section="Hero"><h1>모바일</h1></div></div>`,
    doc: { version: 1, menu: "overlay", nodes: [hero] },
  };
}

describe("code export", () => {
  it("appends stored files to a finished ZIP and keeps a valid central directory", () => {
    const zip = appendToZip(createZip([{ path: "a.txt", data: "a" }]), [{ path: "b.bin", data: new Uint8Array([9, 8, 7]) }]);
    expect([...unzip(zip).keys()]).toEqual(["a.txt", "b.bin"]);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    const end = zip.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(2);
    const central = view.getUint32(end + 16, true);
    expect(view.getUint32(central, true)).toBe(0x02014b50);
    expect(central + view.getUint32(end + 12, true)).toBe(end);
  });
  it("writes a ZIP whose entries inflate back to their contents", () => {
    const files = unzip(createZip([{ path: "a/b.txt", data: "안녕" }, { path: "c.bin", data: new Uint8Array([1, 2, 3]) }]));
    expect(files.get("a/b.txt")).toBe("안녕");
    expect(files.has("c.bin")).toBe(true);
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
  it("turns markup into JSX with React attribute names, style objects and escaped braces", () => {
    const jsx = toJsx('<label class="a" for="x"><input value="1" disabled=""><span style="color: red; --x-y: 2px">{a}</span><svg stroke-width="2"></svg></label>');
    expect(jsx).toContain('<label className="a" htmlFor="x">');
    expect(jsx).toContain('<input defaultValue="1" disabled />');
    expect(jsx).toContain('style={{ color: "red", "--x-y": "2px" }}');
    expect(jsx).toContain('{"{"}a{"}"}');
    expect(jsx).toContain('strokeWidth="2"');
  });
  it("drops builder attributes, renames builder classes and splits marked sections", () => {
    expect(cleanMarkup('<div class="lb-layout-node hd" data-edit="t" data-id="1">x</div>')).toBe('<div class="pg-layout-node hd">x</div>');
    const { page, sections } = splitSections('<main><section data-coa-section="Hero"><div><br></div></section><p>end</p></main>');
    expect(page).toBe("<main>{{section:Hero}}<p>end</p></main>");
    expect(sections[0].html).toBe('<section data-coa-section="Hero"><div><br></div></section>');
  });
  it("builds a runnable React project with one component per section, leaving image files to the browser", () => {
    const out = generateExport(payload("react"));
    const root = "color-of-apple-web/";
    expect(out.images).toEqual([`${root}public/images/image-1.png`]);
    expect(unzip(out.body as Uint8Array).has(`${root}public/images/image-1.png`)).toBe(false);
    // The browser adds the image it holds at the path the server named.
    const files = unzip(appendToZip(out.body as Uint8Array, [{ path: out.images[0], data: dataUrlBytes(pixel) }]));
    expect([...files.keys()]).toEqual(expect.arrayContaining([`${root}package.json`, `${root}src/App.jsx`, `${root}src/sections/Hero.jsx`, `${root}src/styles/tokens.css`, `${root}public/images/image-1.png`]));
    expect(files.get(`${root}public/images/image-1.png`)).toBe(new TextDecoder().decode(dataUrlBytes(pixel)));
    expect(files.get(`${root}src/App.jsx`)).toContain('<Hero device="pc" />');
    expect(files.get(`${root}src/App.jsx`)).toContain('<Hero device="mobile" />');
    const hero = files.get(`${root}src/sections/Hero.jsx`)!;
    expect(hero).toContain('if (device === "mobile")');
    expect(hero).toContain('src="/images/image-1.png"');
    expect(hero).not.toMatch(/lb-|data-edit|data-coa-section/);
    expect(files.get(`${root}src/styles/page.css`)).toContain(".pg-root *{box-sizing:border-box}");
    expect(files.get(`${root}src/styles/tokens.css`)).toContain("--color-primary-default: #2f5bea;");
  });
  it("builds an HTML folder and an AI brief that names the tokens and layers", () => {
    const htmlOut = generateExport(payload("html"));
    expect(htmlOut.images).toEqual(["color-of-apple-web/images/image-1.png"]);
    const html = unzip(htmlOut.body as Uint8Array);
    expect(html.get("color-of-apple-web/index.html")).toContain('<link rel="stylesheet" href="css/tokens.css">');
    expect(html.get("color-of-apple-web/index.html")).toContain('src="images/image-1.png"');
    const brief = generateExport(payload("markdown")).body as string;
    expect(brief).toContain("`--color-primary-default`");
    expect(brief).toContain("히어로");
    expect(brief).toContain("images/image-1.png");
  });
  it("rejects malformed or oversized requests before generating", () => {
    const ok = payload("react");
    expect(parseExportPayload(ok)).not.toBeNull();
    expect(parseExportPayload({ ...ok, format: "vue" })).toBeNull();
    expect(parseExportPayload({ ...ok, tokens: { "--x": "red;}body{display:none" } })).toBeNull();
    expect(parseExportPayload({ ...ok, images: ["javascript:alert(1)"] })).toBeNull();
    expect(parseExportPayload({ ...ok, images: ["constructor"] })).toBeNull();
    // Image data never goes to the server, so a data URL in its place is refused too.
    expect(parseExportPayload({ ...ok, images: [pixel] })).toBeNull();
    expect(parseExportPayload({ ...ok, platform: "app" })).toBeNull();
    expect(parseExportPayload({ ...ok, doc: { version: 2 } })).toBeNull();
  });
});
