import type { LayoutDocument } from "@/lib/page-layout";
import { layoutMarkdown } from "./markdown";
import { cleanMarkup, renameCss, splitSections, toJsx } from "./markup";
import { createZip, type ZipEntry } from "./zip";

// Server-side code generation for Pro exports. The browser sends what it rendered (markup per
// device, the CSS that markup uses, the palette tokens, images once each); everything that turns
// it into a deliverable lives here, so it never ships in the client bundle.

export type ExportFormat = "react" | "html" | "markdown";
export type ExportPayload = {
  format: ExportFormat; platform: "web" | "app"; title: string;
  tokens: Record<string, string>; font: string; css: string;
  desktop?: string; mobile: string; images: string[]; doc: LayoutDocument;
};
export type ExportFile = { filename: string; contentType: string; body: Uint8Array | string };

const IMAGE_REF = /coa-image:(\d+)/g;
const MIME_EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" };

function imageFiles(images: string[]) {
  return images.map((src, i) => {
    const m = src.match(/^data:([^;]+);base64,(.*)$/);
    const ext = (m && MIME_EXT[m[1]]) || "png";
    return { name: `image-${i + 1}.${ext}`, data: m ? new Uint8Array(Buffer.from(m[2], "base64")) : new Uint8Array() };
  });
}
const withImages = (text: string, names: string[], base: string) => text.replace(IMAGE_REF, (_, i: string) => names[Number(i)] ? `${base}${names[Number(i)]}` : "");

export function tokensCss(tokens: Record<string, string>, font: string): string {
  return [":root {", ...Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`), `  --font-ui: ${font};`, "}", ""].join("\n");
}

// Shell rules: undo the builder frame's box, hide editor outlines and switch PC/mobile at 768px.
function shellCss(both: boolean): string {
  return [
    "html, body { margin: 0; background: var(--color-background-default, var(--color-surface-default, #fff)); }",
    "body { font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }",
    // Comes after page.css so it outranks the builder shell rules carried over under .pg-root.
    ".coa-page.pg-root { display: block; height: auto; min-height: 0; background: none; border: 0; font: inherit; color: var(--color-text-primary); container-type: inline-size; }",
    ".coa-page .pg-viewport { width: 100% !important; height: auto !important; overflow: visible !important; transform: none !important; }",
    ".coa-page .pg-layout-node { outline: none !important; }",
    ...(both ? [".coa-page.coa-mobile { display: none; }", "@media (max-width: 767px) {", "  .coa-page.coa-desktop { display: none; }", "  .coa-page.coa-mobile { display: block; }", "}"] : []),
    "",
  ].join("\n");
}

const SCOPE = "coa-page matchu-preview pg-root";

function readme(kind: "react" | "html", title: string, imageCount: number): string {
  const run = kind === "react"
    ? ["```bash", "npm install", "npm run dev", "```", "", "- `src/App.jsx`: 페이지 전체. PC와 모바일 화면을 같이 렌더하고 767px 이하에서 모바일을 보여 줘요.", "- `src/sections/`: 레이어마다 컴포넌트 하나. `device` prop으로 PC/모바일 마크업을 고릅니다.", "- `src/styles/tokens.css`: 팔레트 컬러 토큰. 이 파일만 바꾸면 전체 색이 바뀝니다.", "- `src/styles/page.css`: 이 페이지가 쓰는 스타일.", "- `public/images/`: 올린 이미지."]
    : ["`index.html`을 브라우저로 열면 됩니다.", "", "- `css/tokens.css`: 팔레트 컬러 토큰. 이 파일만 바꾸면 전체 색이 바뀝니다.", "- `css/page.css`: 이 페이지가 쓰는 스타일.", "- `images/`: 올린 이미지."];
  return [`# ${title}`, "", "Color of Apple 빌더에서 내보낸 코드예요.", "", "## 실행", "", ...run, "",
    "## 알아 둘 것", "", "- 메뉴 열기, 드롭다운, 슬라이더 넘김 같은 동작은 기본 상태로만 들어 있어요. 필요한 곳에 직접 연결해 주세요.",
    "- 웹폰트 파일은 들어 있지 않아 시스템 글꼴로 보여요. 원하는 폰트는 `--font-ui`에 지정하세요.",
    `- 이미지 ${imageCount}개가 포함돼 있어요.`, ""].join("\n");
}

function htmlBundle(p: ExportPayload, slug: string): ExportFile {
  const files = imageFiles(p.images);
  const names = files.map(f => f.name);
  const both = p.desktop !== undefined;
  const body = (html: string) => withImages(cleanMarkup(html), names, "images/");
  const index = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title.replace(/[<>&"]/g, "")}</title>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/page.css">
</head>
<body>
${both ? `<div class="${SCOPE} coa-desktop">${body(p.desktop!)}</div>\n` : ""}<div class="${SCOPE} coa-mobile">${body(p.mobile)}</div>
</body>
</html>
`;
  const entries: ZipEntry[] = [
    { path: `${slug}/index.html`, data: index },
    { path: `${slug}/css/tokens.css`, data: tokensCss(p.tokens, p.font) },
    { path: `${slug}/css/page.css`, data: withImages(renameCss(p.css), names, "../images/") + "\n\n" + shellCss(both) },
    { path: `${slug}/README.md`, data: readme("html", p.title, files.length) },
    ...files.map(f => ({ path: `${slug}/images/${f.name}`, data: f.data })),
  ];
  return { filename: `${slug}-html.zip`, contentType: "application/zip", body: createZip(entries) };
}

function reactBundle(p: ExportPayload, slug: string): ExportFile {
  const files = imageFiles(p.images);
  const names = files.map(f => f.name);
  const both = p.desktop !== undefined;
  const devices = (both ? [["pc", p.desktop!], ["mobile", p.mobile]] : [["mobile", p.mobile]]) as [string, string][];
  // Each device page splits into its section components; a section's markup per device is kept.
  const perSection = new Map<string, Record<string, string>>();
  // Section names become identifiers and file names, so anything unexpected is renamed.
  const safe = new Map<string, string>();
  const nameOf = (raw: string) => {
    if (!safe.has(raw)) safe.set(raw, /^[A-Z][A-Za-z0-9]{0,40}$/.test(raw) && ![...safe.values()].includes(raw) ? raw : `Section${safe.size + 1}`);
    return safe.get(raw)!;
  };
  const pages = devices.map(([device, html]) => {
    const { page, sections } = splitSections(withImages(html, names, "/images/"));
    for (const s of sections) { const name = nameOf(s.name); perSection.set(name, { ...perSection.get(name), [device]: cleanMarkup(s.html) }); }
    return [device, cleanMarkup(page).replace(/\{\{section:([^}]+)\}\}/g, (_, n: string) => `{{section:${nameOf(n)}}}`)] as const;
  });
  const sectionFiles: ZipEntry[] = [...perSection].map(([name, variants]) => {
    const branches = Object.entries(variants);
    const render = (html: string) => `(\n${toJsx(html, 3)}\n    )`;
    const bodyJsx = branches.length === 1 ? `  return ${render(branches[0][1])};` :
      `  if (device === "mobile") {\n    return ${render(variants.mobile ?? branches[0][1])};\n  }\n  return ${render(variants.pc ?? branches[0][1])};`;
    return { path: `${slug}/src/sections/${name}.jsx`, data: `// ${name} — Color of Apple 빌더에서 내보낸 섹션\nexport default function ${name}({ device = "pc" }) {\n${bodyJsx}\n}\n` };
  });
  const imports = [...perSection.keys()].map(n => `import ${n} from "./sections/${n}.jsx";`).join("\n");
  const pageJsx = pages.map(([device, html]) => {
    const inner = toJsx(html, 3).replace(/<([A-Z][\w$]*) \/>/g, `<$1 device="${device}" />`);
    return `    <div className="${SCOPE} ${device === "pc" ? "coa-desktop" : "coa-mobile"}">\n${inner}\n    </div>`;
  }).join("\n");
  const app = `${imports}\n\nexport default function App() {\n  return (\n    <>\n${pageJsx}\n    </>\n  );\n}\n`;
  const pkg = { name: slug, private: true, version: "0.1.0", type: "module", scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: { react: "^19.2.0", "react-dom": "^19.2.0" }, devDependencies: { "@vitejs/plugin-react": "^5.0.0", vite: "^7.0.0" } };
  const entries: ZipEntry[] = [
    { path: `${slug}/package.json`, data: JSON.stringify(pkg, null, 2) + "\n" },
    { path: `${slug}/vite.config.js`, data: `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()] });\n` },
    { path: `${slug}/index.html`, data: `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${p.title.replace(/[<>&"]/g, "")}</title>\n</head>\n<body>\n<div id="root"></div>\n<script type="module" src="/src/main.jsx"></script>\n</body>\n</html>\n` },
    { path: `${slug}/src/main.jsx`, data: `import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport "./styles/tokens.css";\nimport "./styles/page.css";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);\n` },
    { path: `${slug}/src/App.jsx`, data: app },
    ...sectionFiles,
    { path: `${slug}/src/styles/tokens.css`, data: tokensCss(p.tokens, p.font) },
    { path: `${slug}/src/styles/page.css`, data: withImages(renameCss(p.css), names, "/images/") + "\n\n" + shellCss(both) },
    { path: `${slug}/README.md`, data: readme("react", p.title, files.length) },
    { path: `${slug}/.gitignore`, data: "node_modules\ndist\n" },
    ...files.map(f => ({ path: `${slug}/public/images/${f.name}`, data: f.data })),
  ];
  return { filename: `${slug}-react.zip`, contentType: "application/zip", body: createZip(entries) };
}

export function generateExport(p: ExportPayload): ExportFile {
  const slug = `color-of-apple-${p.platform}`;
  if (p.format === "markdown") {
    const names = imageFiles(p.images).map(f => f.name);
    // The brief names images by file so it lines up with the ZIP exports.
    const doc = JSON.parse(withImages(JSON.stringify(p.doc), names, "images/")) as LayoutDocument;
    return { filename: `${slug}-brief.md`, contentType: "text/markdown; charset=utf-8", body: layoutMarkdown({ doc, tokens: p.tokens, platform: p.platform, title: p.title, images: names }) };
  }
  return p.format === "react" ? reactBundle(p, slug) : htmlBundle(p, slug);
}
