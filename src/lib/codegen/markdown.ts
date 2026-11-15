import { kindNames, pageOf, type LayoutDocument, type LayoutNode, type LayoutStyle } from "@/lib/page-layout";

// A build brief an AI coding tool can follow on its own: tokens, page frame, every layer in order
// with its layout and component settings, and the responsive rules. Images appear as file references.

const COMPONENT_KEYS = ["header", "hero", "cards", "cta", "footer", "floating", "block"] as const;
const px = (v: number) => `${v}px`;
const insets = (v: number[]) => v.every(x => x === v[0]) ? px(v[0]) : v.map(px).join(" ");

function layoutLine(s: Partial<LayoutStyle>): string {
  const parts: string[] = [];
  if (s.direction) parts.push(s.direction === "grid" ? `grid ${s.columns ?? ""}열` : s.direction === "row" ? "가로 배치" : "세로 배치");
  if (s.swipe) parts.push("가로 스와이프 줄(스크롤 스냅, 항목 폭 80%)");
  if (s.reverse) parts.push("순서 뒤집기");
  if (s.screen) parts.push("최소 높이 = 화면 높이(100vh)");
  if (s.gap !== undefined) parts.push(`간격 ${px(s.gap)}`);
  if (s.padding) parts.push(`안쪽 여백 ${insets(s.padding)}`);
  if (s.margin && s.margin.some(Boolean)) parts.push(`바깥 여백 ${insets(s.margin)}`);
  if (s.height) parts.push(`최소 높이 ${px(s.height)}`);
  if (s.sizing === "fixed" && s.width) parts.push(`고정 폭 ${px(s.width)}`);
  if (s.align && s.align !== "stretch") parts.push(`교차축 ${s.align}`);
  if (s.justify && s.justify !== "start") parts.push(`주축 ${s.justify}`);
  if (s.hidden) parts.push("숨김");
  return parts.join(" · ") || "PC와 같음";
}

function settingsOf(node: LayoutNode): unknown {
  for (const key of COMPONENT_KEYS) if ((node as Record<string, unknown>)[key] !== undefined) return (node as Record<string, unknown>)[key];
  return undefined;
}

function describe(nodes: LayoutNode[], depth: number, out: string[], counter: { n: number }) {
  for (const node of nodes) {
    counter.n++;
    const hashes = "#".repeat(Math.min(6, 3 + depth));
    const kind = kindNames[node.kind] ?? node.kind;
    out.push(`${hashes} ${counter.n}. ${node.name === kind ? kind : `${node.name} — ${kind}`} (\`${node.kind}\`)`, "");
    out.push(`- PC: ${layoutLine(node.desktop)}`);
    out.push(`- 모바일: ${Object.keys(node.mobile).length ? layoutLine(node.mobile) + " (나머지는 PC 값을 이어받되 가로 배치는 세로로 쌓기)" : "PC 값을 이어받고 가로 배치는 세로로 쌓기"}`);
    if (node.bleed) out.push("- 컨테이너 폭을 무시하고 화면 끝까지 채운다");
    const settings = settingsOf(node);
    if (settings !== undefined) out.push("", "설정 (문구·옵션 그대로 사용):", "", "```json", JSON.stringify(settings, null, 2), "```");
    out.push("");
    if (node.children.length) describe(node.children, depth + 1, out, counter);
  }
}

function tokenGroups(tokens: Record<string, string>) {
  // Numbered steps (--color-primary-500, --color-neutral-0-on) go in the full list; roles lead.
  const step = /-\d+(-on)?$/;
  const semantic = Object.entries(tokens).filter(([k]) => !step.test(k));
  const scales = Object.entries(tokens).filter(([k]) => step.test(k));
  return { semantic, scales };
}

export function layoutMarkdown({ doc, tokens, platform, title, images }: { doc: LayoutDocument; tokens: Record<string, string>; platform: "web" | "app"; title: string; images: string[] }): string {
  const page = pageOf(doc);
  const { semantic, scales } = tokenGroups(tokens);
  const out: string[] = [
    `# ${title} — 구현 브리프`,
    "",
    "> 이 문서를 AI 코딩 도구(Claude Code, Cursor 등)에 그대로 붙여 넣고 \"이 브리프대로 페이지를 만들어 줘\"라고 요청하세요.",
    "> Color of Apple 빌더에서 만든 레이아웃과 컬러 토큰을 담고 있습니다.",
    "",
    "## 만들 것",
    "",
    `- 대상: ${platform === "web" ? "반응형 웹 페이지 (PC 1440px 기준, 767px 이하 모바일)" : "모바일 앱 화면 (375 × 667 기준)"}`,
    "- 권장 스택: React + Vite, 스타일은 CSS 변수(아래 토큰)와 일반 CSS 또는 Tailwind. 다른 스택을 써도 되지만 토큰 이름은 그대로 유지하세요.",
    "- 색은 반드시 아래 토큰 변수(`var(--color-...)`)로만 지정하고 hex를 직접 쓰지 마세요. 팔레트를 바꿀 때 토큰만 교체하면 되도록요.",
    "- 아래 레이어 순서와 문구를 그대로 지키고, 설정 JSON의 옵션(배치, 표면 색, 모바일 방식 등)을 구현에 반영하세요.",
    "",
    "## 페이지 프레임",
    "",
    `- PC 폭 사용: ${page.mode === "full" ? "화면 가득" : page.mode === "contained" ? `가운데 컨테이너 ${page.maxWidth}px (배경은 화면 끝까지)` : `모바일 퍼스트 컬럼 ${page.maxWidth}px (배경: ${page.backdrop})`}`,
    "",
    "## 컬러 토큰",
    "",
    "역할별 토큰 (먼저 이것들로 화면을 칠하세요):",
    "",
    "| 토큰 | 값 |",
    "|---|---|",
    ...semantic.map(([k, v]) => `| \`${k}\` | \`${v}\` |`),
    "",
    "<details><summary>색 단계 토큰 전체</summary>",
    "",
    "```css",
    ":root {",
    ...scales.map(([k, v]) => `  ${k}: ${v};`),
    "}",
    "```",
    "",
    "</details>",
    "",
    "## 레이어 (위에서 아래 순서)",
    "",
  ];
  describe(doc.nodes, 0, out, { n: 0 });
  out.push(
    "## 반응형 규칙",
    "",
    "- 모바일에서 따로 적은 값만 바뀌고, 나머지는 PC 값을 이어받습니다. 가로 배치는 모바일에서 기본적으로 세로로 쌓습니다.",
    "- 헤더의 `mobileMenu`, 카드의 `mobileMode`, 푸터의 `mobileColumns` 같은 모바일 옵션은 그 방식대로 구현하세요 (예: `swipe`는 가로 스크롤 스냅, `accordion`은 접었다 펼치기).",
    "- 메뉴 열기, 드롭다운, 슬라이더 넘김, 탭 전환 같은 동작은 설정에 적힌 방식(hover/click 등)으로 직접 구현해야 합니다.",
    "",
    "## 이미지",
    "",
    images.length ? ["설정 JSON의 `images/...` 경로는 아래 파일을 가리킵니다. 원본 파일은 React·HTML 코드 내보내기 ZIP의 images 폴더에 있어요.", "", ...images.map(name => `- \`images/${name}\``)].join("\n") : "- 올린 이미지가 없습니다. 이미지 자리는 회색 플레이스홀더로 두세요.",
    "",
    "## 완료 확인",
    "",
    "- [ ] 1440px과 390px에서 레이어 순서·문구가 이 문서와 같다",
    "- [ ] 모든 색이 토큰 변수로 지정되어 있다",
    "- [ ] 390px에서 가로 스크롤이 생기지 않는다 (의도한 스와이프 줄 제외)",
    "- [ ] 버튼과 링크는 키보드로 이동할 수 있고 포커스가 보인다",
    "",
  );
  return out.join("\n");
}
