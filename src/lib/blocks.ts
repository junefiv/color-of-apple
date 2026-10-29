import { accent, chk, icon, img, list, rng, seg, sel, surface, t, type BlockSpec, type Config, type SchemaSection } from "./block-schema";

// The remaining common components from the survey (docs/component-patterns.md, "사이트별 보유 빈도"):
// body sections, sub-page and information blocks, layers that float over the page, and app patterns.
// Field keys here are what the preview frames read and mark with data-edit / data-image-drop.

const head = (title: string, note?: string): SchemaSection => ({ part: "heading", title, note, fields: [t("eyebrow", "작은 머리말", 40, { placeholder: "비우면 숨김" }), t("title", "제목", 80), t("desc", "설명", 200, { multiline: true, placeholder: "비우면 숨김" }), t("more", "더보기 링크", 24, { placeholder: "비우면 숨김" })] });
const style = (...fields: SchemaSection["fields"]): SchemaSection => ({ part: "style", title: "색상과 모양", fields: [surface(), accent(), ...fields] });
const headDefaults = (eyebrow: string, title: string, desc = "섹션을 한 문장으로 소개해 주세요.") => ({ eyebrow, title, desc, more: "", surface: "surface", accent: "primary" });
const aligns = [["start", "왼쪽"], ["center", "가운데"]] as const;
const P = (key: string, name: string, note: string, config: Config) => ({ key, name, note, config });

export type Insets4 = [number, number, number, number];
// Starting padding of in-flow blocks on PC and phones (the layer's own Padding fields after that).
export const blockPadding: Record<string, [Insets4, Insets4]> = {
  split: [[96, 64, 96, 64], [56, 20, 56, 20]], marquee: [[40, 0, 40, 0], [28, 0, 28, 0]], subhero: [[0, 0, 0, 0], [0, 0, 0, 0]], tabs: [[96, 64, 96, 64], [56, 20, 56, 20]],
  video: [[96, 64, 96, 64], [56, 20, 56, 20]], form: [[96, 64, 96, 64], [56, 20, 56, 20]], faq: [[96, 64, 96, 64], [56, 20, 56, 20]], steps: [[96, 64, 96, 64], [56, 20, 56, 20]],
  board: [[80, 64, 80, 64], [40, 20, 40, 20]], post: [[64, 64, 80, 64], [32, 20, 48, 20]], location: [[96, 64, 96, 64], [56, 20, 56, 20]], about: [[96, 64, 96, 64], [56, 20, 56, 20]],
  product: [[64, 64, 96, 64], [24, 20, 48, 20]], table: [[80, 64, 80, 64], [40, 20, 40, 20]], appbar: [[12, 20, 12, 20], [10, 16, 10, 16]], search: [[16, 64, 16, 64], [12, 16, 12, 16]],
  empty: [[96, 64, 96, 64], [64, 20, 64, 20]], appbanner: [[12, 24, 12, 24], [10, 16, 10, 16]],
};

const splitRow = (i: number): Config => ({ eyebrow: `0${i + 1}`, title: ["기술로 만드는 차이", "끝까지 책임지는 서비스", "함께 성장하는 파트너"][i % 3], body: "한두 문장으로 이 내용을 설명해 주세요. 무엇이 다른지, 왜 중요한지.", cta: "자세히 보기", image: "" });
const split: BlockSpec = { kind: "split", name: "이미지 + 글 분할", group: "본문 섹션", note: "사진과 글을 나란히 · 지그재그", place: "flow",
  sections: [
    { part: "rows", title: "행", note: "행마다 사진과 글이 한 쌍이에요. 사진에 이미지를 끌어다 놓아도 돼요.", fields: [list("rows", "행", [t("eyebrow", "작은 머리말", 40), t("title", "제목", 80), t("body", "설명", 300, { multiline: true }), t("cta", "링크 문구", 24), img("image", "이미지")],
      splitRow, { max: 6, add: "행 추가" })] },
    { part: "layout", title: "배치", fields: [seg("side", "사진 위치", [["left", "왼쪽"], ["right", "오른쪽"]]), chk("alternate", "행마다 좌우 번갈아"), seg("ratio", "사진 : 글", [["1:1", "반반"], ["3:2", "사진 크게"], ["2:3", "글 크게"]]),
      sel("mediaRatio", "사진 비율", [["4:3", "4:3"], ["1:1", "1:1"], ["3:4", "3:4 세로"], ["16:9", "16:9"]]), seg("align", "글 세로 정렬", [["center", "가운데"], ["start", "위"]]), rng("gap", "행 사이 간격", 0, 200, 8), chk("mobileMediaFirst", "모바일에서 사진을 위로")] },
    style(rng("radius", "사진 모서리", 0, 40), chk("boxed", "행을 카드 박스로")),
  ],
  defaults: () => ({ rows: [0, 1, 2].map(splitRow), side: "left", alternate: true, ratio: "1:1", mediaRatio: "4:3", align: "center", gap: 120, mobileMediaFirst: true, surface: "surface", accent: "primary", radius: 20, boxed: false }),
  presets: [P("zigzag", "지그재그", "행마다 사진 좌우 번갈아", { alternate: true, ratio: "1:1", boxed: false }), P("left", "왼쪽 사진", "사진 왼쪽 고정 · 글 오른쪽", { side: "left", alternate: false, ratio: "1:1" }),
    P("bigphoto", "큰 사진", "사진 3 : 글 2 · 세로 사진", { ratio: "3:2", mediaRatio: "3:4", alternate: true }), P("boxed", "카드 박스", "행마다 둥근 박스", { boxed: true, surface: "subtle", gap: 32, ratio: "1:1" }),
    P("dark", "다크 지그재그", "다크 배경 · 사진 크게", { surface: "inverse", ratio: "3:2", alternate: true })],
};

const marquee: BlockSpec = { kind: "marquee", name: "흐르는 띠", group: "본문 섹션", note: "로고 · 키워드가 계속 흐름", place: "flow",
  sections: [
    { part: "items", title: "흐르는 항목", fields: [list("items", "항목", [t("text", "글자", 40), img("image", "로고 이미지", 400)], i => ({ text: ["BRAND", "STUDIO", "PARTNER", "COMPANY", "LABS", "GROUP"][i % 6], image: "" }), { max: 16, add: "항목 추가" })] },
    { part: "layout", title: "흐름", fields: [seg("kind", "모양", [["logo", "로고"], ["text", "큰 글씨"]]), seg("rows", "줄 수", [["1", "한 줄"], ["2", "두 줄 반대로"]]), seg("direction", "방향", [["left", "왼쪽으로"], ["right", "오른쪽으로"]]),
      rng("speed", "한 바퀴 시간", 8, 80, 2, "초"), rng("size", "글자 · 로고 크기", 16, 160, 4), sel("separator", "구분 기호", [["dot", "●"], ["star", "✦"], ["slash", "/"], ["none", "없음"]]), chk("outline", "글씨 외곽선만"), chk("fade", "양 끝 흐리게")] },
    { ...head("제목 (선택)"), fields: head("").fields.slice(0, 2) },
    style(),
  ],
  defaults: () => ({ items: Array.from({ length: 8 }, (_, i) => ({ text: ["BRAND", "STUDIO", "PARTNER", "COMPANY", "LABS", "GROUP", "MEDIA", "WORKS"][i], image: "" })), kind: "logo", rows: "1", direction: "left", speed: 30, size: 28, separator: "none", outline: false, fade: true, eyebrow: "", title: "", surface: "surface", accent: "primary" }),
  presets: [P("logos", "클라이언트 로고", "로고가 한 줄로 흐름", { kind: "logo", rows: "1", size: 28, separator: "none", surface: "surface" }), P("keywords", "큰 키워드", "큰 글씨 · ✦ 구분", { kind: "text", size: 96, separator: "star", outline: false }),
    P("outline", "외곽선 글씨", "속이 빈 큰 글씨", { kind: "text", size: 120, separator: "dot", outline: true }), P("double", "두 줄 반대 방향", "위아래 줄이 엇갈려 흐름", { kind: "text", rows: "2", size: 56, separator: "slash" }),
    P("band", "브랜드 컬러 띠", "Primary 배경 띠", { kind: "text", size: 40, separator: "star", surface: "primary" })],
};

const subhero: BlockSpec = { kind: "subhero", name: "서브 페이지 상단", group: "정보 · 서브 페이지", note: "페이지 제목 · 경로 · 하위 탭", place: "flow",
  sections: [
    { part: "copy", title: "제목과 경로", fields: [t("title", "페이지 제목", 60), t("desc", "설명", 160, { multiline: true, placeholder: "비우면 숨김" }), t("path", "경로", 80, { placeholder: "홈 > 회사소개 > 연혁" }), chk("crumbs", "경로 보이기")] },
    { part: "tabs", title: "하위 메뉴 탭", fields: [chk("showTabs", "하위 탭 보이기"), list("tabs", "탭", [t("label", "이름", 20)], i => ({ label: ["인사말", "연혁", "비전", "오시는 길"][i % 4] }), { max: 8, add: "탭 추가" }), seg("tabStyle", "탭 모양", [["underline", "밑줄"], ["pill", "알약"], ["box", "칸 나눔"]])] },
    { part: "layout", title: "배경과 크기", fields: [seg("bg", "배경", [["image", "이미지"], ["color", "색"], ["plain", "없음"]]), img("image", "배경 이미지"), seg("align", "정렬", aligns), rng("height", "높이", 160, 640, 8)] },
    style(),
  ],
  defaults: () => ({ title: "회사소개", desc: "", path: "홈 > 회사소개 > 연혁", crumbs: true, showTabs: true, tabs: ["인사말", "연혁", "비전", "오시는 길"].map(label => ({ label })), tabStyle: "underline", bg: "image", image: "", align: "center", height: 360, surface: "inverse", accent: "primary" }),
  presets: [P("image", "이미지 배너", "사진 위 제목 · 아래 탭", { bg: "image", align: "center", height: 360, tabStyle: "underline", surface: "inverse" }), P("color", "브랜드 컬러", "Primary 배경 · 가운데 제목", { bg: "color", surface: "primary", align: "center", height: 300 }),
    P("plain", "글자만", "배경 없이 왼쪽 큰 제목", { bg: "plain", surface: "surface", align: "start", height: 240, tabStyle: "pill" }), P("boxtabs", "칸 나눔 탭", "아래 탭이 칸으로 꽉 참", { bg: "image", tabStyle: "box", height: 320, surface: "inverse" })],
};

const tabs: BlockSpec = { kind: "tabs", name: "탭", group: "본문 섹션", note: "탭을 눌러 내용 전환", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "탭", note: "미리보기에서 탭을 누르면 그 탭 내용이 보여요.", fields: [list("items", "탭", [t("label", "탭 이름", 20), t("title", "내용 제목", 60), t("body", "내용", 300, { multiline: true }), img("image", "이미지")],
      i => ({ label: ["전체", "제품", "서비스", "고객 사례", "기술"][i % 5], title: ["모든 것을 한눈에", "우리 제품", "서비스 안내", "고객 이야기", "핵심 기술"][i % 5], body: "탭마다 다른 내용을 보여 줄 수 있어요. 한두 문장으로 설명해 주세요.", image: "" }), { max: 8, add: "탭 추가" })] },
    { part: "layout", title: "모양", fields: [seg("tabStyle", "탭 모양", [["underline", "밑줄"], ["pill", "알약"], ["box", "칸"], ["vertical", "세로"]]), seg("panel", "내용", [["media", "사진 + 글"], ["text", "글만"], ["image", "사진만"]]),
      seg("tabAlign", "탭 정렬", [["start", "왼쪽"], ["center", "가운데"], ["stretch", "꽉 채움"]]), seg("mobile", "모바일 탭", [["scroll", "가로 스크롤"], ["accordion", "아코디언"]])] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("CATEGORY", "한눈에 둘러보기"), items: Array.from({ length: 4 }, (_, i) => ({ label: ["전체", "제품", "서비스", "고객 사례"][i], title: ["모든 것을 한눈에", "우리 제품", "서비스 안내", "고객 이야기"][i], body: "탭마다 다른 내용을 보여 줄 수 있어요. 한두 문장으로 설명해 주세요.", image: "" })), tabStyle: "underline", panel: "media", tabAlign: "start", mobile: "scroll", radius: 16 }),
  presets: [P("underline", "밑줄 탭", "제목 아래 가로 탭 · 사진 + 글", { tabStyle: "underline", panel: "media", tabAlign: "start" }), P("pill", "알약 탭", "가운데 정렬 둥근 버튼", { tabStyle: "pill", panel: "media", tabAlign: "center" }),
    P("box", "칸 나눔 탭", "탭이 칸으로 꽉 참", { tabStyle: "box", tabAlign: "stretch", panel: "text" }), P("vertical", "세로 탭", "왼쪽 목록 · 오른쪽 내용", { tabStyle: "vertical", panel: "media" }),
    P("gallery", "사진 탭", "탭마다 큰 사진", { tabStyle: "pill", panel: "image", tabAlign: "center" })],
};

const video: BlockSpec = { kind: "video", name: "영상 섹션", group: "본문 섹션", note: "포스터 + 재생 버튼 · 배경 영상", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("eyebrow", "작은 머리말", 40, { placeholder: "비우면 숨김" }), t("title", "제목", 80), t("desc", "설명", 200, { multiline: true, placeholder: "비우면 숨김" }), t("cta", "버튼", 24, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["full", "화면 가득"], ["contained", "가운데 박스"], ["split", "글 + 영상"]]), img("poster", "포스터 이미지"), seg("play", "재생 버튼", [["circle", "원형"], ["pill", "알약"], ["none", "없음 · 자동재생"]]),
      seg("align", "글 정렬", aligns), rng("height", "영상 높이", 240, 900, 10), rng("radius", "모서리", 0, 40), chk("scrim", "글 아래 어둡게")] },
    style()],
  defaults: () => ({ eyebrow: "BRAND FILM", title: "우리가 일하는 방식", desc: "1분 영상으로 소개합니다.", cta: "", layout: "contained", poster: "", play: "circle", align: "center", height: 560, radius: 24, scrim: true, surface: "surface", accent: "primary" }),
  presets: [P("contained", "가운데 박스", "제목 아래 둥근 영상", { layout: "contained", play: "circle", align: "center" }), P("full", "화면 가득 배경", "영상 위 큰 글 · 자동재생", { layout: "full", play: "none", height: 720, radius: 0, scrim: true, surface: "inverse" }),
    P("split", "글 + 영상", "왼쪽 글 · 오른쪽 영상", { layout: "split", play: "pill", align: "start", height: 420 }), P("dark", "다크 시네마", "다크 배경 · 와이드", { layout: "contained", surface: "inverse", height: 640, radius: 8 })],
};

const popup: BlockSpec = { kind: "popup", name: "레이어 팝업", group: "위에 뜨는 것", note: "공지 · 오늘 하루 보지 않기", place: "overlay",
  sections: [{ part: "copy", title: "내용", fields: [t("title", "제목", 60), t("body", "내용", 300, { multiline: true }), img("image", "이미지"), t("cta", "버튼", 24, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("kind", "위치", [["center", "가운데"], ["corner", "오른쪽 아래"], ["full", "전체 화면"]]), seg("size", "크기", [["small", "작게"], ["medium", "보통"], ["large", "크게"]]),
      rng("pages", "공지 장 수", 1, 5, 1, "장"), seg("dismiss", "닫기", [["both", "오늘 하루 + 닫기"], ["close", "닫기만"]]), chk("dim", "뒤 배경 어둡게"), seg("mobile", "모바일", [["sheet", "아래에서 시트"], ["center", "가운데 그대로"]])] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ title: "공지사항", body: "11월 2일부터 본점 주소가 변경됩니다.\n자세한 내용을 확인해 주세요.", image: "", cta: "자세히 보기", kind: "center", size: "medium", pages: 1, dismiss: "both", dim: true, mobile: "sheet", surface: "surface", accent: "primary", radius: 16 }),
  presets: [P("notice", "공지 팝업", "가운데 · 오늘 하루 보지 않기", { kind: "center", size: "medium", pages: 1, dismiss: "both", dim: true }), P("slider", "여러 장 공지", "넘겨 보는 공지 3장", { kind: "center", size: "medium", pages: 3 }),
    P("corner", "구석 카드", "오른쪽 아래 작은 카드", { kind: "corner", size: "small", dim: false }), P("full", "전체 화면", "첫 진입 큰 공지", { kind: "full", size: "large", dim: true, surface: "inverse" })],
};

const formFields = [t("label", "이름", 30), sel("type", "입력 종류", [["text", "글자"], ["email", "이메일"], ["tel", "전화"], ["select", "고르기"], ["textarea", "긴 글"], ["chips", "여러 개 고르기"], ["date", "날짜"], ["file", "파일 첨부"]]), t("placeholder", "안내 문구", 60), t("options", "선택지 (쉼표)", 120), chk("required", "필수")];
const form: BlockSpec = { kind: "form", name: "문의 폼", group: "본문 섹션", note: "상담 신청 · 문의 · 구독", place: "flow",
  sections: [head("폼 제목"),
    { part: "fields", title: "입력 칸", fields: [list("fields", "입력 칸", formFields, i => ({ label: `항목 ${i + 1}`, type: "text", placeholder: "", options: "", required: false }), { max: 12, add: "입력 칸 추가", title: "label" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["stacked", "한 줄씩"], ["two", "두 칸씩"], ["split", "왼쪽 글 · 오른쪽 폼"]]), seg("fieldStyle", "입력 칸", [["outline", "테두리"], ["filled", "채움"], ["underline", "밑줄"]]),
      seg("consent", "개인정보 동의", [["expandable", "동의 + 내용 보기"], ["single", "동의만"], ["none", "없음"]]), t("submit", "제출 버튼", 24), seg("submitWidth", "버튼 폭", [["full", "꽉 채움"], ["auto", "글자만큼"]]), chk("card", "폼을 카드로 감싸기")] },
    style(rng("radius", "입력 칸 모서리", 0, 24))],
  defaults: () => ({ ...headDefaults("CONTACT", "프로젝트를 이야기해 주세요", "남겨 주시면 1영업일 안에 연락드릴게요."), fields: [
    { label: "관심 분야", type: "chips", placeholder: "", options: "브랜딩, 디자인, 개발, 기타", required: true }, { label: "이름", type: "text", placeholder: "홍길동", options: "", required: true },
    { label: "이메일", type: "email", placeholder: "hello@company.com", options: "", required: true }, { label: "연락처", type: "tel", placeholder: "010-0000-0000", options: "", required: false },
    { label: "예산", type: "select", placeholder: "선택해 주세요", options: "1천만 원 미만, 1천만–3천만 원, 3천만 원 이상", required: false }, { label: "문의 내용", type: "textarea", placeholder: "어떤 도움이 필요하신가요?", options: "", required: true }],
    layout: "split", fieldStyle: "outline", consent: "expandable", submit: "문의 보내기", submitWidth: "full", card: false, radius: 10 }),
  presets: [P("split", "왼쪽 글 · 오른쪽 폼", "에이전시형 장문 문의", { layout: "split", fieldStyle: "outline", card: false }), P("card", "가운데 카드", "짧은 상담 신청 카드", { layout: "stacked", card: true, surface: "subtle", fieldStyle: "filled" }),
    P("two", "두 칸 폼", "입력 칸 두 개씩 나란히", { layout: "two", fieldStyle: "outline" }), P("underline", "밑줄 미니멀", "밑줄 입력 · 글자만큼 버튼", { layout: "stacked", fieldStyle: "underline", submitWidth: "auto" }),
    P("dark", "다크 상담", "다크 배경 · 채움 입력", { layout: "split", surface: "inverse", fieldStyle: "filled" })],
};

const faq: BlockSpec = { kind: "faq", name: "자주 묻는 질문", group: "본문 섹션", note: "질문을 누르면 답이 펼쳐짐", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "질문과 답", fields: [list("items", "질문", [t("q", "질문", 120), t("a", "답", 500, { multiline: true })], i => ({ q: ["이용 요금은 어떻게 되나요?", "얼마나 걸리나요?", "수정은 몇 번까지 되나요?", "계약은 어떻게 진행하나요?", "환불 규정이 있나요?"][i % 5], a: "답변을 두세 문장으로 적어 주세요. 필요한 링크나 연락처도 함께 남기면 좋아요." }), { max: 12, add: "질문 추가", title: "q" })] },
    { part: "layout", title: "모양", fields: [seg("style", "모양", [["line", "줄 구분"], ["card", "카드"], ["numbered", "번호"]]), seg("layout", "배치", [["single", "한 줄"], ["split", "왼쪽 제목 · 오른쪽 목록"], ["two", "두 줄"]]),
      seg("icon", "펼침 표시", [["plus", "+ / −"], ["chevron", "화살표"]]), chk("firstOpen", "첫 질문 펼쳐 두기")] },
    style()],
  defaults: () => ({ ...headDefaults("FAQ", "자주 묻는 질문", "궁금한 점을 먼저 확인해 보세요."), items: [0, 1, 2, 3].map(i => ({ q: ["이용 요금은 어떻게 되나요?", "얼마나 걸리나요?", "수정은 몇 번까지 되나요?", "계약은 어떻게 진행하나요?"][i], a: "답변을 두세 문장으로 적어 주세요. 필요한 링크나 연락처도 함께 남기면 좋아요." })), style: "line", layout: "split", icon: "plus", firstOpen: true }),
  presets: [P("split", "왼쪽 제목", "제목 왼쪽 · 질문 목록 오른쪽", { layout: "split", style: "line" }), P("cards", "카드 아코디언", "질문마다 둥근 카드", { layout: "single", style: "card", surface: "subtle" }),
    P("numbered", "번호 목록", "Q1, Q2 번호", { layout: "single", style: "numbered", icon: "chevron" }), P("two", "두 줄", "질문을 두 줄로 나눔", { layout: "two", style: "line" })],
};

const steps: BlockSpec = { kind: "steps", name: "진행 단계 · 연혁", group: "본문 섹션", note: "STEP 1→4 · 연도별 타임라인", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "단계", fields: [list("items", "단계", [t("label", "단계 표시", 20), t("title", "제목", 60), t("body", "설명", 200, { multiline: true }), icon()],
      i => ({ label: `STEP 0${i + 1}`, title: ["상담", "기획", "디자인 · 개발", "오픈 · 운영"][i % 4], body: "이 단계에서 하는 일을 한두 문장으로.", icon: (["phone", "book", "sparkles", "star"] as const)[i % 4] }), { max: 10, add: "단계 추가", title: "title" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "모양", [["row", "가로 단계"], ["timeline", "세로 타임라인"], ["cards", "번호 카드"], ["years", "연혁 (연도)"]]), chk("connector", "단계 사이 연결선"), chk("icons", "아이콘 보이기")] },
    style()],
  defaults: () => ({ ...headDefaults("PROCESS", "이렇게 진행돼요"), items: [0, 1, 2, 3].map(i => ({ label: `STEP 0${i + 1}`, title: ["상담", "기획", "디자인 · 개발", "오픈 · 운영"][i], body: "이 단계에서 하는 일을 한두 문장으로.", icon: (["phone", "book", "sparkles", "star"] as const)[i] })), variant: "row", connector: true, icons: true }),
  presets: [P("row", "가로 단계", "STEP 1→4 화살표 연결", { variant: "row", connector: true, icons: true }), P("cards", "번호 카드", "큰 번호 카드 4장", { variant: "cards", connector: false, surface: "subtle" }),
    P("timeline", "세로 타임라인", "선을 따라 내려가는 단계", { variant: "timeline", connector: true }),
    P("years", "연혁", "연도별 이력 타임라인", { variant: "years", connector: true, icons: false, eyebrow: "HISTORY", title: "걸어온 길", items: ["2026", "2024", "2021", "2018"].map((label, i) => ({ label, title: ["새로운 도약", "해외 진출", "브랜드 리뉴얼", "회사 설립"][i], body: "그 해의 주요 이력을 적어 주세요.", icon: "" })) })],
};

const intro: BlockSpec = { kind: "intro", name: "인트로 · 로딩", group: "위에 뜨는 것", note: "첫 진입 로고 · 진행률", place: "overlay",
  sections: [{ part: "copy", title: "내용", fields: [t("logo", "로고 이름", 40), img("image", "로고 이미지", 600), t("tagline", "한 줄 문구", 60, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("style", "모양", [["logo", "로고만"], ["progress", "진행률"], ["count", "숫자 0→100"], ["curtain", "커튼"]])] },
    style()],
  defaults: () => ({ logo: "Brand", image: "", tagline: "A universe of makers", style: "progress", surface: "inverse", accent: "primary" }),
  presets: [P("logo", "로고 페이드", "가운데 로고가 서서히", { style: "logo", surface: "inverse" }), P("progress", "진행 바", "로고 아래 진행률 바", { style: "progress", surface: "surface" }),
    P("count", "큰 숫자", "0%→100% 카운트", { style: "count", surface: "primary" }), P("curtain", "커튼", "위로 걷히는 색 커튼", { style: "curtain", surface: "primary" })],
};

const consent: BlockSpec = { kind: "consent", name: "쿠키 · 방문 분석 동의", group: "위에 뜨는 것", note: "허용 · 거부 · 설정", place: "overlay",
  sections: [{ part: "copy", title: "내용", fields: [t("title", "제목", 60), t("body", "내용", 300, { multiline: true }), t("accept", "허용 버튼", 20), t("decline", "거부 버튼", 20, { placeholder: "비우면 숨김" }), t("settings", "설정 링크", 20, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("kind", "위치", [["corner", "구석 카드"], ["bar", "아래 띠"], ["modal", "가운데"]]), seg("side", "구석", [["right", "오른쪽"], ["left", "왼쪽"]])] },
    style()],
  defaults: () => ({ title: "더 나은 경험을 위한 쿠키", body: "방문 분석을 허용하면 서비스를 개선하는 데 도움이 돼요.", accept: "모두 허용", decline: "필수만", settings: "설정", kind: "corner", side: "right", surface: "surface", accent: "primary" }),
  presets: [P("corner", "구석 카드", "오른쪽 아래 작은 카드", { kind: "corner" }), P("bar", "아래 띠", "화면 아래 가로 띠", { kind: "bar", surface: "inverse" }), P("modal", "가운데 창", "선택 전까지 가운데", { kind: "modal" })],
};

const progress: BlockSpec = { kind: "progress", name: "스크롤 진행 표시", group: "위에 뜨는 것", note: "상단 진행 바 · 섹션 점 내비", place: "overlay",
  sections: [{ part: "layout", title: "모양", fields: [seg("kind", "모양", [["bar", "상단 진행 바"], ["dots", "섹션 점"], ["fraction", "숫자 01 / 05"]]), seg("side", "위치", [["right", "오른쪽"], ["left", "왼쪽"]]), rng("count", "섹션 수", 3, 8, 1, "개"), rng("value", "미리보기 진행", 0, 100, 5, "%")] },
    style()],
  defaults: () => ({ kind: "bar", side: "right", count: 5, value: 40, surface: "surface", accent: "primary" }),
  presets: [P("bar", "상단 진행 바", "읽은 만큼 차오르는 선", { kind: "bar" }), P("dots", "섹션 점", "오른쪽 세로 점 내비", { kind: "dots" }), P("fraction", "숫자 표시", "왼쪽 01 / 05", { kind: "fraction", side: "left" })],
};

const board: BlockSpec = { kind: "board", name: "게시판 목록", group: "정보 · 서브 페이지", note: "검색 · 분류 · 페이지 번호", place: "flow",
  sections: [head("게시판 제목"),
    { part: "items", title: "글 목록", fields: [list("items", "글", [t("title", "제목", 100), t("tag", "분류", 20), t("date", "날짜", 20), img("image", "썸네일", 800)], i => ({ title: `${["새 서비스 오픈 안내", "추석 연휴 고객센터 운영", "개인정보처리방침 개정", "신제품 출시 이벤트", "홈페이지 리뉴얼"][i % 5]}`, tag: i % 2 ? "이벤트" : "공지", date: `2026.10.${String(28 - i * 3).padStart(2, "0")}`, image: "" }), { max: 12, add: "글 추가", title: "title" })] },
    { part: "layout", title: "모양", fields: [seg("style", "모양", [["table", "표"], ["list", "목록"], ["gallery", "썸네일"]]), t("categories", "분류 탭 (쉼표)", 120, { placeholder: "비우면 숨김" }), chk("search", "검색창"), chk("pagination", "페이지 번호"), chk("number", "번호 열"), chk("views", "조회수 열")] },
    style()],
  defaults: () => ({ ...headDefaults("NOTICE", "공지사항", ""), items: Array.from({ length: 6 }, (_, i) => ({ title: ["새 서비스 오픈 안내", "추석 연휴 고객센터 운영", "개인정보처리방침 개정", "신제품 출시 이벤트", "홈페이지 리뉴얼", "채용 공고"][i], tag: i % 2 ? "이벤트" : "공지", date: `2026.10.${String(28 - i * 3).padStart(2, "0")}`, image: "" })),
    style: "table", categories: "전체, 공지, 이벤트, 보도자료", search: true, pagination: true, number: true, views: true }),
  presets: [P("table", "표 게시판", "번호 · 제목 · 날짜 · 조회", { style: "table", number: true, views: true }), P("list", "목록형", "분류 칩 · 큰 제목 줄", { style: "list", number: false, views: false }),
    P("gallery", "썸네일 게시판", "사진 카드 3열", { style: "gallery", number: false, views: false })],
};

const post: BlockSpec = { kind: "post", name: "게시글 상세", group: "정보 · 서브 페이지", note: "제목 · 본문 · 첨부 · 이전/다음", place: "flow",
  sections: [{ part: "copy", title: "글", fields: [t("tag", "분류", 20), t("title", "제목", 120), t("date", "날짜", 20), t("author", "작성자", 30, { placeholder: "비우면 숨김" }), t("body", "본문", 2000, { multiline: true }), img("image", "본문 이미지")] },
    { part: "files", title: "첨부와 이동", fields: [list("files", "첨부 파일", [t("name", "파일 이름", 60)], i => ({ name: `첨부파일_${i + 1}.pdf` }), { max: 6, min: 0, add: "파일 추가" }), chk("nav", "이전 · 다음 글"), t("back", "목록 버튼", 20)] },
    style(rng("width", "본문 최대 폭", 560, 1200, 20))],
  defaults: () => ({ tag: "공지", title: "홈페이지가 새롭게 바뀌었습니다", date: "2026.10.30", author: "관리자", body: "안녕하세요. 더 편하게 둘러보실 수 있도록 홈페이지를 새로 단장했습니다.\n\n바뀐 점과 이용 방법을 아래에서 확인해 주세요.", image: "", files: [{ name: "리뉴얼_안내.pdf" }], nav: true, back: "목록", surface: "surface", accent: "primary", width: 880 }),
  presets: [P("notice", "공지 글", "제목 줄 · 본문 · 첨부", { width: 880 }), P("wide", "매거진", "넓은 본문 · 큰 이미지", { width: 1200 })],
};

const location: BlockSpec = { kind: "location", name: "오시는 길", group: "정보 · 서브 페이지", note: "지도 · 주소 · 교통 안내", place: "flow",
  sections: [head("섹션 제목"),
    { part: "info", title: "주소와 안내", fields: [t("address", "주소", 120), t("phone", "전화", 40), t("hours", "운영 시간", 60), t("transit", "교통 안내", 300, { multiline: true }), list("branches", "지점 탭", [t("name", "지점 이름", 20)], i => ({ name: ["본사", "강남점", "부산점"][i % 3] }), { max: 6, min: 0, add: "지점 추가" })] },
    { part: "layout", title: "모양", fields: [seg("layout", "배치", [["left", "지도 왼쪽"], ["top", "지도 위"], ["right", "지도 오른쪽"]]), seg("map", "지도 색", [["light", "밝게"], ["dark", "어둡게"], ["brand", "브랜드"]]), rng("mapHeight", "지도 높이", 240, 640, 10)] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("LOCATION", "오시는 길", ""), address: "서울특별시 중구 세종대로 00, 10층", phone: "02-000-0000", hours: "평일 10:00 – 19:00", transit: "지하철 1·2호선 시청역 3번 출구 도보 3분\n버스 101, 402 시청앞 하차", branches: [], layout: "left", map: "light", mapHeight: 420, radius: 20 }),
  presets: [P("left", "지도 왼쪽", "지도 + 오른쪽 안내", { layout: "left" }), P("top", "지도 위", "넓은 지도 · 아래 안내 3칸", { layout: "top", mapHeight: 380 }),
    P("branches", "지점 탭", "지점 탭으로 바꿔 보기", { layout: "left", branches: ["본사", "강남점", "부산점"].map(name => ({ name })) }), P("dark", "다크 지도", "어두운 지도 · 다크 배경", { map: "dark", surface: "inverse" })],
};

const about: BlockSpec = { kind: "about", name: "회사 소개 블록", group: "정보 · 서브 페이지", note: "인사말 · 조직도 · 인증서 · 핵심 가치", place: "flow",
  sections: [head("섹션 제목"),
    { part: "greeting", title: "인사말", show: c => c.variant === "greeting", fields: [t("body", "인사말", 1200, { multiline: true }), img("image", "대표 사진"), t("signName", "이름", 30), t("signRole", "직함", 30)] },
    { part: "items", title: "항목", show: c => c.variant !== "greeting", fields: [list("items", "항목", [t("title", "이름", 40), t("text", "설명", 160, { multiline: true }), img("image", "이미지", 800), icon()], i => ({ title: ["대표이사", "경영지원", "디자인", "개발", "마케팅"][i % 5], text: "한 줄 설명", image: "", icon: (["users", "building", "sparkles", "shield", "heart"] as const)[i % 5] }), { max: 12, add: "항목 추가", title: "title" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "종류", [["greeting", "인사말"], ["org", "조직도"], ["certs", "인증 · 수상"], ["values", "핵심 가치"]])] },
    style()],
  defaults: () => ({ ...headDefaults("GREETING", "대표 인사말", ""), body: "안녕하십니까.\n저희는 고객의 일상을 더 낫게 만드는 일을 합니다. 작은 차이를 끝까지 고민하는 회사가 되겠습니다.\n\n감사합니다.", image: "", signName: "홍길동", signRole: "대표이사",
    items: [0, 1, 2, 3, 4].map(i => ({ title: ["대표이사", "경영지원", "디자인", "개발", "마케팅"][i], text: "한 줄 설명", image: "", icon: (["users", "building", "sparkles", "shield", "heart"] as const)[i] })), variant: "greeting" }),
  presets: [P("greeting", "대표 인사말", "사진 + 인사말 + 서명", { variant: "greeting" }), P("org", "조직도", "대표 아래 부서 트리", { variant: "org", eyebrow: "ORGANIZATION", title: "조직도" }),
    P("certs", "인증 · 수상", "인증서 이미지 갤러리", { variant: "certs", eyebrow: "CERTIFICATION", title: "인증 및 수상", surface: "subtle" }), P("values", "핵심 가치", "아이콘 + 가치 설명", { variant: "values", eyebrow: "CORE VALUES", title: "우리가 지키는 가치" })],
};

const product: BlockSpec = { kind: "product", name: "제품 · 포트폴리오 상세", group: "정보 · 서브 페이지", note: "이미지 갤러리 + 스펙 표", place: "flow",
  sections: [{ part: "copy", title: "제품 정보", fields: [t("category", "분류", 30), t("title", "이름", 80), t("desc", "설명", 400, { multiline: true }), t("price", "가격", 30, { placeholder: "비우면 숨김" }), t("primary", "주 버튼", 24, { placeholder: "비우면 숨김" }), t("secondary", "보조 버튼", 24, { placeholder: "비우면 숨김" })] },
    { part: "images", title: "이미지", fields: [list("images", "이미지", [img("image", "이미지", 1600)], () => ({ image: "" }), { max: 6, add: "이미지 추가" }), seg("thumbs", "썸네일", [["bottom", "아래"], ["side", "옆"], ["none", "없음"]])] },
    { part: "specs", title: "스펙", fields: [list("specs", "스펙", [t("label", "항목", 30), t("value", "값", 80)], i => ({ label: ["크기", "무게", "소재", "색상", "보증"][i % 5], value: ["120 × 80 × 40 mm", "1.2 kg", "알루미늄", "블랙 · 실버", "2년"][i % 5] }), { max: 12, min: 0, add: "스펙 추가", title: "label" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "배치", [["left", "갤러리 왼쪽"], ["top", "갤러리 위"]])] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ category: "PRODUCT", title: "제품 이름", desc: "제품을 두세 문장으로 소개해 주세요. 무엇이 좋은지, 누구에게 맞는지.", price: "", primary: "구매 문의", secondary: "카탈로그 받기", images: [0, 1, 2, 3].map(() => ({ image: "" })), thumbs: "bottom",
    specs: [0, 1, 2, 3].map(i => ({ label: ["크기", "무게", "소재", "색상"][i], value: ["120 × 80 × 40 mm", "1.2 kg", "알루미늄", "블랙 · 실버"][i] })), layout: "left", surface: "surface", accent: "primary", radius: 16 }),
  presets: [P("left", "갤러리 왼쪽", "사진 왼쪽 · 정보와 스펙 오른쪽", { layout: "left", thumbs: "bottom" }), P("side", "세로 썸네일", "썸네일 옆 줄", { layout: "left", thumbs: "side" }),
    P("top", "갤러리 위", "넓은 사진 · 아래 스펙 표", { layout: "top", thumbs: "none" })],
};

const table: BlockSpec = { kind: "table", name: "표", group: "정보 · 서브 페이지", note: "가격 · 스펙 · 비교 표", place: "flow",
  sections: [head("표 제목"),
    { part: "data", title: "표 내용", note: "칸은 쉼표로 나눠요.", fields: [t("columns", "머리글 (쉼표)", 200), list("rows", "줄", [t("cells", "칸 (쉼표)", 300)], i => ({ cells: [`항목 ${i + 1}, 기본, 포함, 포함`][0] }), { max: 16, add: "줄 추가", title: "cells" })] },
    { part: "layout", title: "모양", fields: [seg("style", "모양", [["line", "줄"], ["striped", "줄무늬"], ["boxed", "칸"], ["compare", "비교 강조"]]), rng("highlight", "강조할 열", 0, 6, 1, "번째"), seg("mobile", "모바일", [["scroll", "가로 스크롤"], ["cards", "카드로"]])] },
    style()],
  defaults: () => ({ ...headDefaults("PRICING", "요금 비교", ""), columns: "구분, 베이직, 프로, 엔터프라이즈", rows: ["월 요금, 무료, 29,000원, 문의", "프로젝트 수, 3개, 무제한, 무제한", "팀원, 1명, 10명, 무제한", "기술 지원, 메일, 메일 · 채팅, 전담 매니저"].map(cells => ({ cells })), style: "compare", highlight: 2, mobile: "scroll" }),
  presets: [P("compare", "요금 비교", "가운데 열 강조", { style: "compare", highlight: 2 }), P("line", "스펙 표", "가는 줄 표", { style: "line", highlight: 0 }), P("striped", "줄무늬", "한 줄씩 배경", { style: "striped", highlight: 0 }), P("cards", "모바일 카드", "폰에서 줄마다 카드", { style: "boxed", mobile: "cards" })],
};

const appbar: BlockSpec = { kind: "appbar", name: "상단 앱 바", group: "앱 패턴", note: "뒤로가기 · 제목 · 아이콘", place: "flow",
  sections: [{ part: "copy", title: "내용", fields: [t("title", "제목", 40), seg("left", "왼쪽", [["back", "뒤로"], ["menu", "메뉴"], ["logo", "로고"], ["none", "없음"]]), seg("actions", "오른쪽", [["search", "검색"], ["bell", "알림"], ["both", "둘 다"], ["none", "없음"]])] },
    { part: "layout", title: "모양", fields: [seg("variant", "모양", [["plain", "기본"], ["center", "제목 가운데"], ["large", "큰 제목"]]), chk("divider", "아래 구분선")] },
    style()],
  defaults: () => ({ title: "알림", left: "back", actions: "both", variant: "center", divider: true, surface: "surface", accent: "primary" }),
  presets: [P("center", "가운데 제목", "뒤로 · 제목 · 아이콘", { variant: "center", left: "back" }), P("large", "큰 제목", "iOS 스타일 큰 제목", { variant: "large", left: "none", divider: false }), P("brand", "브랜드 바", "로고 · Primary 배경", { variant: "plain", left: "logo", surface: "primary", divider: false })],
};

const sheet: BlockSpec = { kind: "sheet", name: "바텀시트", group: "앱 패턴", note: "아래에서 올라오는 패널", place: "overlay",
  sections: [{ part: "copy", title: "내용", fields: [t("title", "제목", 60), t("body", "설명", 200, { multiline: true, placeholder: "비우면 숨김" }), list("items", "목록", [t("label", "이름", 30), icon()], i => ({ label: ["공유하기", "링크 복사", "저장하기", "신고하기"][i % 4], icon: (["users", "book", "heart", "shield"] as const)[i % 4] }), { max: 8, min: 0, add: "항목 추가", title: "label" }), t("cta", "버튼", 24, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("kind", "종류", [["actions", "동작 목록"], ["content", "내용 + 버튼"]]), chk("handle", "손잡이"), chk("dim", "뒤 배경 어둡게")] },
    style(rng("radius", "위 모서리", 0, 32))],
  defaults: () => ({ title: "더보기", body: "", items: [0, 1, 2, 3].map(i => ({ label: ["공유하기", "링크 복사", "저장하기", "신고하기"][i], icon: (["users", "book", "heart", "shield"] as const)[i] })), cta: "", kind: "actions", handle: true, dim: true, surface: "surface", accent: "primary", radius: 24 }),
  presets: [P("actions", "동작 목록", "아이콘 + 동작 줄", { kind: "actions" }), P("content", "확인 시트", "설명 + 큰 버튼", { kind: "content", title: "알림을 켤까요?", body: "새 소식과 혜택을 가장 먼저 알려 드릴게요.", cta: "알림 켜기", items: [] })],
};

const search: BlockSpec = { kind: "search", name: "검색바 + 칩 필터", group: "앱 패턴", note: "검색창 · 가로 칩", place: "flow",
  sections: [{ part: "copy", title: "내용", fields: [t("placeholder", "검색 안내", 60), list("chips", "칩", [t("label", "이름", 20)], i => ({ label: ["전체", "인기", "신상품", "할인", "브랜드", "카테고리"][i % 6] }), { max: 12, min: 0, add: "칩 추가" }), t("recent", "최근 검색 (쉼표)", 120, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "검색창", [["pill", "알약"], ["box", "사각"], ["underline", "밑줄"]]), chk("filter", "필터 버튼"), seg("chipStyle", "칩", [["solid", "채움"], ["outline", "테두리"]])] },
    style()],
  defaults: () => ({ placeholder: "무엇을 찾으세요?", chips: ["전체", "인기", "신상품", "할인", "브랜드"].map(label => ({ label })), recent: "", variant: "pill", filter: true, chipStyle: "solid", surface: "surface", accent: "primary" }),
  presets: [P("pill", "알약 검색", "둥근 검색창 · 채운 칩", { variant: "pill", chipStyle: "solid" }), P("box", "사각 검색", "사각 검색창 · 테두리 칩", { variant: "box", chipStyle: "outline" }), P("recent", "최근 검색", "최근 검색어 줄 포함", { recent: "원피스, 운동화, 가방" })],
};

const toast: BlockSpec = { kind: "toast", name: "토스트 알림", group: "앱 패턴", note: "잠깐 떴다 사라지는 알림", place: "overlay",
  sections: [{ part: "copy", title: "내용", fields: [t("text", "문구", 80), t("action", "버튼", 20, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("tone", "종류", [["neutral", "기본"], ["success", "완료"], ["warn", "주의"], ["error", "오류"]]), seg("position", "위치", [["bottom", "아래"], ["top", "위"]]), seg("kind", "모양", [["toast", "알약"], ["snackbar", "가로 띠"]])] },
    style()],
  defaults: () => ({ text: "장바구니에 담았어요", action: "보기", tone: "success", position: "bottom", kind: "toast", surface: "inverse", accent: "primary" }),
  presets: [P("toast", "알약 토스트", "아래 가운데 작은 알림", { kind: "toast", position: "bottom" }), P("snackbar", "스낵바", "버튼이 있는 가로 띠", { kind: "snackbar", action: "실행 취소", text: "항목을 삭제했어요", tone: "neutral" }), P("top", "위 알림", "화면 위에서 내려옴", { kind: "toast", position: "top", tone: "warn", text: "네트워크 연결을 확인해 주세요", action: "" })],
};

const empty: BlockSpec = { kind: "empty", name: "빈 화면 안내", group: "앱 패턴", note: "결과 없음 · 처음 화면", place: "flow",
  sections: [{ part: "copy", title: "내용", fields: [icon(), img("image", "일러스트", 800), t("title", "제목", 60), t("body", "설명", 200, { multiline: true }), t("cta", "버튼", 24, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("size", "크기", [["compact", "작게"], ["full", "화면 가득"]])] },
    style()],
  defaults: () => ({ icon: "book", image: "", title: "아직 내역이 없어요", body: "첫 주문을 하면 여기에 보여요.", cta: "둘러보러 가기", size: "full", surface: "surface", accent: "primary" }),
  presets: [P("full", "화면 가득", "아이콘 + 안내 + 버튼", { size: "full" }), P("compact", "작은 안내", "목록 안에 들어가는 크기", { size: "compact", cta: "" })],
};

const appbanner: BlockSpec = { kind: "appbanner", name: "앱 다운로드 배너", group: "앱 패턴", note: "앱으로 보기 · 설치 유도", place: "flow",
  sections: [{ part: "copy", title: "내용", fields: [img("image", "앱 아이콘", 400), t("title", "앱 이름", 40), t("text", "설명", 80), t("cta", "버튼", 20), t("rating", "평점", 20, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "모양", [["strip", "위 띠"], ["card", "카드"]]), chk("dismiss", "닫기 버튼")] },
    style()],
  defaults: () => ({ image: "", title: "Brand 앱", text: "앱에서 더 빠르고 편하게", cta: "앱으로 보기", rating: "★ 4.8", variant: "strip", dismiss: true, surface: "subtle", accent: "primary" }),
  presets: [P("strip", "위 띠", "페이지 맨 위 얇은 띠", { variant: "strip", surface: "subtle" }), P("card", "카드", "본문 사이 둥근 카드", { variant: "card", surface: "inverse" })],
};

export const BLOCK_KINDS = ["split", "tabs", "marquee", "video", "form", "faq", "steps", "subhero", "board", "post", "location", "about", "product", "table", "popup", "intro", "consent", "progress", "appbar", "search", "sheet", "toast", "empty", "appbanner"] as const;
export type BlockKindName = (typeof BLOCK_KINDS)[number];
export const blockSpecs: BlockSpec[] = [split, tabs, marquee, video, form, faq, steps, subhero, board, post, location, about, product, table, popup, intro, consent, progress, appbar, search, sheet, toast, empty, appbanner];
export const isOverlayBlock = (kind: string) => specOf(kind)?.place === "overlay";
export const specOf = (kind: string): BlockSpec | undefined => blockSpecs.find(s => s.kind === kind);
