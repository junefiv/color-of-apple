import { chk, icon, img, list, rng, seg, sel, t, type BlockSpec, type Config } from "./block-schema";
import { aligns, head, headDefaults, P, style, type Insets4 } from "./block-helpers";

// Second batch from the full gdweb crawl (WEB and MOBILE sections): shop and booking patterns, social
// proof, and the app screens that recur in the mobile winners. Every visible word is a field.
const repeat = <T,>(n: number, f: (i: number) => T) => Array.from({ length: n }, (_, i) => f(i));
const pick = <T,>(arr: readonly T[], i: number) => arr[i % arr.length];

export const moreBlockPadding: Record<string, [Insets4, Insets4]> = {
  gallery: [[96, 64, 96, 64], [56, 20, 56, 20]], logos: [[64, 64, 64, 64], [40, 20, 40, 20]], reviews: [[96, 64, 96, 64], [56, 20, 56, 20]], newsletter: [[80, 64, 80, 64], [48, 20, 48, 20]],
  promo: [[24, 64, 24, 64], [16, 20, 16, 20]], productlist: [[80, 64, 80, 64], [40, 16, 40, 16]], cart: [[64, 64, 80, 64], [24, 16, 40, 16]], booking: [[80, 64, 80, 64], [32, 20, 40, 20]],
  feed: [[80, 64, 80, 64], [48, 16, 48, 16]], iconmenu: [[48, 64, 48, 64], [24, 16, 24, 16]], banners: [[24, 64, 24, 64], [12, 16, 12, 16]], ranking: [[80, 64, 80, 64], [32, 16, 32, 16]],
  onboarding: [[64, 64, 64, 64], [40, 24, 40, 24]], auth: [[80, 64, 80, 64], [40, 24, 40, 24]], mypage: [[48, 64, 48, 64], [20, 16, 24, 16]], notices: [[48, 64, 48, 64], [16, 16, 24, 16]],
  chat: [[32, 64, 32, 64], [16, 16, 16, 16]], orderstatus: [[64, 64, 64, 64], [24, 16, 32, 16]], coupons: [[64, 64, 64, 64], [24, 16, 32, 16]], team: [[96, 64, 96, 64], [56, 20, 56, 20]],
  compare: [[96, 64, 96, 64], [56, 20, 56, 20]], ticker: [[14, 64, 14, 64], [12, 16, 12, 16]], stats: [[96, 64, 96, 64], [56, 20, 56, 20]], pricing: [[96, 64, 96, 64], [56, 20, 56, 20]],
};

const gallery: BlockSpec = { kind: "gallery", name: "갤러리", group: "본문 섹션", note: "사진 모음 · 크게 보기", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "사진", fields: [list("items", "사진", [img("image", "사진"), t("caption", "설명", 80)], i => ({ image: "", caption: `작품 ${i + 1}` }), { max: 24, add: "사진 추가", title: "caption" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["grid", "격자"], ["masonry", "벽돌"], ["wide", "큰 사진 + 작은 사진"]]), rng("columns", "열 수", 2, 6, 1, "열"), rng("gap", "간격", 0, 40, 2), seg("ratio", "비율", [["1:1", "정사각"], ["4:3", "4:3"], ["3:4", "세로"]]), chk("captions", "설명 보이기"), chk("lightbox", "크게 보기 미리보기")] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("GALLERY", "갤러리"), items: repeat(8, i => ({ image: "", caption: `작품 ${i + 1}` })), layout: "masonry", columns: 4, gap: 12, ratio: "1:1", captions: false, lightbox: false, radius: 12 }),
  presets: [P("grid", "정사각 격자", "같은 크기 4열", { layout: "grid", columns: 4, ratio: "1:1" }), P("masonry", "벽돌 배치", "높이가 다른 사진들", { layout: "masonry", columns: 4 }), P("wide", "큰 사진 강조", "첫 사진 크게", { layout: "wide", columns: 4 }),
    P("lightbox", "크게 보기", "누르면 크게 · 설명", { layout: "grid", columns: 3, captions: true, lightbox: true, surface: "inverse" })],
};

const logos: BlockSpec = { kind: "logos", name: "파트너 로고", group: "본문 섹션", note: "고객사 · 협력사 로고 격자", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "로고", fields: [list("items", "로고", [t("name", "이름", 30), img("image", "로고 이미지", 400)], i => ({ name: pick(["SAMSUNG", "HYUNDAI", "LG", "NAVER", "KAKAO", "CJ", "LOTTE", "SK"], i), image: "" }), { max: 24, add: "로고 추가", title: "name" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 3, 8, 1, "열"), seg("tile", "칸", [["plain", "그냥"], ["box", "박스"], ["line", "구분선"]]), chk("mono", "흑백으로"), rng("size", "로고 크기", 16, 64, 2)] },
    style()],
  defaults: () => ({ ...headDefaults("PARTNERS", "함께하는 파트너", ""), items: repeat(8, i => ({ name: pick(["SAMSUNG", "HYUNDAI", "LG", "NAVER", "KAKAO", "CJ", "LOTTE", "SK"], i), image: "" })), columns: 4, tile: "box", mono: true, size: 28 }),
  presets: [P("box", "박스 격자", "로고마다 칸", { tile: "box", columns: 4 }), P("plain", "가벼운 줄", "칸 없이 6열", { tile: "plain", columns: 6 }), P("line", "구분선 표", "가는 선으로 나눔", { tile: "line", columns: 4 })],
};

const reviewItem = (i: number): Config => ({ name: pick(["김민지", "이준호", "박서연", "최도윤"], i), meta: pick(["30대 · 직장인", "20대 · 대학생", "40대 · 자영업", "30대 · 프리랜서"], i), text: "기대 이상이었어요. 상담부터 마무리까지 꼼꼼하게 챙겨 주셔서 믿음이 갔습니다.", rating: 5 - (i % 2), image: "" });
const reviews: BlockSpec = { kind: "reviews", name: "후기 · 리뷰", group: "본문 섹션", note: "별점 · 고객 후기 카드", place: "flow",
  sections: [head("섹션 제목"),
    { part: "summary", title: "요약", fields: [chk("summary", "평균 별점 요약"), t("score", "평균 점수", 10), t("count", "후기 수 표시", 30)] },
    { part: "items", title: "후기", fields: [list("items", "후기", [t("name", "이름", 30), t("meta", "부가 정보", 40), t("text", "내용", 400, { multiline: true }), rng("rating", "별점", 1, 5, 1, "점"), img("image", "사진", 600)], reviewItem, { max: 12, add: "후기 추가", title: "name" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["grid", "카드 격자"], ["slider", "옆으로 넘김"], ["quote", "큰 인용 한 개"]]), rng("columns", "열 수", 1, 4, 1, "열"), chk("avatar", "프로필 사진"), chk("stars", "별점 보이기")] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("REVIEW", "고객이 남긴 이야기", ""), summary: true, score: "4.9", count: "후기 1,284개", items: repeat(4, reviewItem), layout: "grid", columns: 3, avatar: true, stars: true, radius: 18 }),
  presets: [P("grid", "카드 격자", "3열 후기 카드", { layout: "grid", columns: 3 }), P("slider", "슬라이드", "옆으로 넘기는 후기", { layout: "slider", columns: 3 }), P("quote", "큰 인용", "한 사람 후기를 크게", { layout: "quote", surface: "subtle" }),
    P("dark", "다크 리뷰", "다크 배경 · 별점 요약", { layout: "grid", surface: "inverse", summary: true })],
};

const newsletter: BlockSpec = { kind: "newsletter", name: "뉴스레터 구독", group: "본문 섹션", note: "이메일 입력 · 구독 버튼", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("eyebrow", "작은 머리말", 40, { placeholder: "비우면 숨김" }), t("title", "제목", 80), t("desc", "설명", 200, { multiline: true, placeholder: "비우면 숨김" }), t("placeholder", "입력 안내", 40), t("button", "버튼", 20), t("note", "아래 안내", 120, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["inline", "한 줄"], ["center", "가운데"], ["card", "카드"]])] },
    style()],
  defaults: () => ({ eyebrow: "NEWSLETTER", title: "새 소식을 메일로 받아보세요", desc: "한 달에 두 번, 꼭 필요한 소식만 보내 드려요.", placeholder: "이메일 주소", button: "구독하기", note: "언제든 구독을 해지할 수 있어요.", layout: "inline", surface: "subtle", accent: "primary" }),
  presets: [P("inline", "한 줄", "왼쪽 글 · 오른쪽 입력", { layout: "inline" }), P("center", "가운데", "가운데 정렬 입력", { layout: "center", surface: "surface" }), P("card", "카드", "브랜드 컬러 카드", { layout: "card", surface: "primary" })],
};

const promo: BlockSpec = { kind: "promo", name: "이벤트 배너", group: "본문 섹션", note: "기간 한정 · 남은 시간", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("badge", "배지", 16, { placeholder: "비우면 숨김" }), t("title", "제목", 80), t("desc", "설명", 160, { placeholder: "비우면 숨김" }), t("cta", "버튼", 20, { placeholder: "비우면 숨김" }), img("image", "이미지")] },
    { part: "count", title: "남은 시간", fields: [chk("countdown", "카운트다운"), t("countLabel", "카운트다운 문구", 30), t("countValues", "숫자 (쉼표)", 40), t("countUnits", "단위 (쉼표)", 40)] },
    { part: "layout", title: "모양", fields: [seg("layout", "모양", [["strip", "한 줄 띠"], ["card", "이미지 카드"], ["split", "글 + 이미지"]]), chk("close", "닫기 버튼")] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ badge: "EVENT", title: "가을 맞이 최대 40% 할인", desc: "11월 30일까지 · 회원 전용", cta: "혜택 보기", image: "", countdown: true, countLabel: "종료까지", countValues: "03, 14, 27, 50", countUnits: "일, 시간, 분, 초", layout: "strip", close: false, surface: "primary", accent: "primary", radius: 20 }),
  presets: [P("strip", "한 줄 띠", "얇은 이벤트 띠 · 카운트다운", { layout: "strip", countdown: true, surface: "primary" }), P("card", "이미지 카드", "사진 위 이벤트 문구", { layout: "card", countdown: false, surface: "inverse" }),
    P("split", "글 + 이미지", "왼쪽 글 · 오른쪽 사진", { layout: "split", countdown: true, surface: "subtle" })],
};

const productItem = (i: number): Config => ({ name: pick(["데일리 니트 가디건", "울 블렌드 코트", "와이드 데님 팬츠", "레더 숄더백", "캐시미어 머플러", "러닝 스니커즈"], i), brand: pick(["BRAND", "STUDIO", "LABEL"], i), price: pick(["59,000원", "189,000원", "79,000원", "129,000원", "49,000원", "99,000원"], i), sale: pick(["", "30%", "", "15%"], i), badge: pick(["NEW", "", "BEST", ""], i), image: "", rating: "★ 4.8 (128)" });
const productlist: BlockSpec = { kind: "productlist", name: "상품 목록", group: "쇼핑 · 예약", note: "가격 · 할인 · 찜 · 정렬", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "상품", fields: [list("items", "상품", [t("name", "상품명", 60), t("brand", "브랜드", 30), t("price", "가격", 20), t("sale", "할인율", 10), t("badge", "배지", 12), t("rating", "평점 표시", 30), img("image", "상품 사진", 1000)], productItem, { max: 24, add: "상품 추가", title: "name" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "PC 열 수", 2, 6, 1, "열"), seg("mobileColumns", "모바일 열 수", [["2", "2열"], ["1", "1열"]]), sel("ratio", "사진 비율", [["3:4", "3:4 세로"], ["1:1", "1:1"], ["4:5", "4:5"]]), chk("wish", "찜 하트"), chk("cart", "장바구니 버튼"), t("cartText", "장바구니 문구", 20), chk("toolbar", "정렬 · 필터 줄"), t("sortText", "정렬 이름 (쉼표)", 80), t("filterText", "필터 문구", 20)] },
    style(rng("radius", "사진 모서리", 0, 24))],
  defaults: () => ({ ...headDefaults("NEW ARRIVALS", "이번 주 신상품", ""), more: "전체 보기", items: repeat(8, productItem), columns: 4, mobileColumns: "2", ratio: "3:4", wish: true, cart: false, cartText: "담기", toolbar: true, sortText: "추천순, 신상품순, 낮은 가격순, 높은 가격순", filterText: "필터", radius: 8 }),
  presets: [P("shop", "쇼핑 그리드", "4열 · 찜 · 정렬 줄", { columns: 4, toolbar: true, wish: true }), P("minimal", "미니멀", "정렬 줄 없이 3열", { columns: 3, toolbar: false, ratio: "4:5" }), P("cart", "담기 버튼", "카드마다 장바구니", { columns: 4, cart: true, ratio: "1:1" })],
};

const cart: BlockSpec = { kind: "cart", name: "장바구니 · 주문 요약", group: "쇼핑 · 예약", note: "수량 · 합계 · 결제 버튼", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("title", "제목", 40), t("selectText", "전체 선택 문구", 30), t("deleteText", "선택 삭제 문구", 20)] },
    { part: "items", title: "상품", fields: [list("items", "상품", [t("name", "상품명", 60), t("option", "옵션", 60), t("price", "가격", 20), rng("qty", "수량", 1, 99, 1, "개"), img("image", "사진", 600)], i => ({ name: pick(["데일리 니트 가디건", "와이드 데님 팬츠", "레더 숄더백"], i), option: pick(["아이보리 / M", "블루 / 28", "블랙 / FREE"], i), price: pick(["59,000원", "79,000원", "129,000원"], i), qty: 1, image: "" }), { max: 10, min: 0, add: "상품 추가", title: "name" })] },
    { part: "summary", title: "합계", fields: [list("lines", "금액 줄", [t("label", "이름", 30), t("value", "금액", 30)], i => ({ label: pick(["상품 금액", "할인", "배송비"], i), value: pick(["267,000원", "-26,700원", "무료"], i) }), { max: 6, add: "줄 추가", title: "label" }), t("totalLabel", "합계 이름", 20), t("total", "합계 금액", 30), t("button", "결제 버튼", 30)] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["side", "목록 + 오른쪽 요약"], ["stack", "목록 아래 요약"]]), chk("sticky", "모바일 하단 결제 바")] },
    style(rng("radius", "모서리", 0, 24))],
  defaults: () => ({ title: "장바구니", selectText: "전체 선택 (3/3)", deleteText: "선택 삭제", items: repeat(3, i => ({ name: pick(["데일리 니트 가디건", "와이드 데님 팬츠", "레더 숄더백"], i), option: pick(["아이보리 / M", "블루 / 28", "블랙 / FREE"], i), price: pick(["59,000원", "79,000원", "129,000원"], i), qty: 1, image: "" })),
    lines: [{ label: "상품 금액", value: "267,000원" }, { label: "할인", value: "-26,700원" }, { label: "배송비", value: "무료" }], totalLabel: "결제 예정 금액", total: "240,300원", button: "240,300원 결제하기", layout: "side", sticky: true, radius: 12 }),
  presets: [P("side", "오른쪽 요약", "PC 목록 + 고정 요약", { layout: "side" }), P("stack", "아래 요약", "앱처럼 아래 결제 바", { layout: "stack", sticky: true })],
};

const buybar: BlockSpec = { kind: "buybar", name: "하단 구매 바", group: "쇼핑 · 예약", note: "찜 · 장바구니 · 구매하기", place: "overlay",
  sections: [{ part: "copy", title: "문구", fields: [t("price", "가격 표시", 30, { placeholder: "비우면 숨김" }), t("primary", "주 버튼", 20), t("secondary", "보조 버튼", 20, { placeholder: "비우면 숨김" }), chk("wish", "찜 버튼"), t("wishCount", "찜 수", 10)] },
    style()],
  defaults: () => ({ price: "59,000원", primary: "구매하기", secondary: "장바구니", wish: true, wishCount: "1.2만", surface: "surface", accent: "primary" }),
  presets: [P("buy", "구매 바", "찜 · 장바구니 · 구매", { secondary: "장바구니", wish: true }), P("book", "예약 바", "가격 + 예약하기", { primary: "예약하기", secondary: "", wish: false, price: "1박 189,000원~" })],
};

const booking: BlockSpec = { kind: "booking", name: "예약 · 캘린더", group: "쇼핑 · 예약", note: "날짜 · 시간 · 인원 선택", place: "flow",
  sections: [head("섹션 제목"),
    { part: "calendar", title: "달력", fields: [t("month", "달 표시", 30), rng("startDay", "1일의 요일", 0, 6, 1, ""), rng("days", "날짜 수", 28, 31, 1, "일"), rng("selected", "선택한 날", 1, 31, 1, "일"), t("weekdays", "요일 (쉼표)", 40)] },
    { part: "slots", title: "시간과 인원", fields: [t("slotsLabel", "시간 이름", 20), list("slots", "시간", [t("label", "시간", 20), chk("off", "마감")], i => ({ label: pick(["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"], i), off: i === 2 }), { max: 12, min: 0, add: "시간 추가", title: "label" }), t("peopleLabel", "인원 이름", 20), rng("people", "인원", 1, 20, 1, "명"), t("button", "예약 버튼", 30), t("note", "아래 안내", 120, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "배치", fields: [seg("layout", "모양", [["split", "달력 + 오른쪽 선택"], ["stack", "위아래"]])] },
    style(rng("radius", "모서리", 0, 24))],
  defaults: () => ({ ...headDefaults("RESERVATION", "방문 예약", "원하는 날짜와 시간을 골라 주세요."), month: "2026년 11월", startDay: 0, days: 30, selected: 14, weekdays: "일, 월, 화, 수, 목, 금, 토", slotsLabel: "시간 선택", slots: repeat(6, i => ({ label: pick(["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"], i), off: i === 2 })), peopleLabel: "인원", people: 2, button: "예약하기", note: "예약 변경은 하루 전까지 가능해요.", layout: "split", radius: 14 }),
  presets: [P("split", "달력 + 선택", "PC 좌우 배치", { layout: "split" }), P("stack", "위아래", "모바일처럼 쌓기", { layout: "stack", surface: "subtle" })],
};

const feed: BlockSpec = { kind: "feed", name: "SNS 피드", group: "본문 섹션", note: "인스타그램형 사진 격자", place: "flow",
  sections: [{ part: "copy", title: "계정", fields: [t("handle", "계정 이름", 40), t("title", "제목", 80), t("button", "팔로우 버튼", 20, { placeholder: "비우면 숨김" })] },
    { part: "items", title: "게시물", fields: [list("items", "게시물", [img("image", "사진"), t("likes", "좋아요 수", 12)], i => ({ image: "", likes: `${(i + 3) * 37}` }), { max: 18, add: "게시물 추가", title: "likes" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 3, 6, 1, "열"), rng("gap", "간격", 0, 24, 2), chk("overlay", "마우스 올리면 좋아요 수")] },
    style()],
  defaults: () => ({ handle: "@brand_official", title: "인스타그램에서 만나요", button: "팔로우", items: repeat(6, i => ({ image: "", likes: `${(i + 3) * 37}` })), columns: 6, gap: 4, overlay: true, surface: "surface", accent: "primary" }),
  presets: [P("row", "한 줄", "6장 한 줄", { columns: 6 }), P("grid", "격자", "3열 격자", { columns: 3, gap: 12 })],
};

const iconmenu: BlockSpec = { kind: "iconmenu", name: "아이콘 메뉴", group: "앱 패턴", note: "카테고리 · 바로가기 아이콘 격자", place: "flow",
  sections: [{ part: "items", title: "메뉴", fields: [list("items", "메뉴", [t("label", "이름", 16), icon(), img("image", "아이콘 이미지", 300), t("badge", "배지", 8)], i => ({ label: pick(["신상품", "베스트", "세일", "쿠폰", "이벤트", "출석체크", "선물하기", "고객센터", "매장찾기", "멤버십"], i), icon: pick(["sparkles", "star", "gift", "heart", "calendar", "book", "users", "phone", "map", "shield"] as const, i), image: "", badge: i === 2 ? "N" : "" }), { max: 20, add: "메뉴 추가", title: "label" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 3, 10, 1, "열"), seg("shape", "아이콘 칸", [["circle", "원"], ["rounded", "둥근 사각"], ["none", "없음"]]), rng("size", "아이콘 크기", 32, 88, 2), chk("scroll", "가로로 넘기기")] },
    style()],
  defaults: () => ({ items: repeat(10, i => ({ label: pick(["신상품", "베스트", "세일", "쿠폰", "이벤트", "출석체크", "선물하기", "고객센터", "매장찾기", "멤버십"], i), icon: pick(["sparkles", "star", "gift", "heart", "calendar", "book", "users", "phone", "map", "shield"] as const, i), image: "", badge: i === 2 ? "N" : "" })), columns: 5, shape: "rounded", size: 56, scroll: false, surface: "surface", accent: "primary" }),
  presets: [P("grid", "5열 격자", "앱 홈 카테고리", { columns: 5, shape: "rounded" }), P("circle", "원형 아이콘", "동그란 칸", { columns: 5, shape: "circle" }), P("scroll", "가로 스크롤", "한 줄로 넘김", { scroll: true, columns: 5 }), P("gov", "바로가기 카드", "관공서형 큰 바로가기", { columns: 4, shape: "none", size: 72, surface: "subtle" })],
};

const banners: BlockSpec = { kind: "banners", name: "배너 슬라이드", group: "앱 패턴", note: "이벤트 띠 배너 캐러셀", place: "flow",
  sections: [{ part: "items", title: "배너", fields: [list("items", "배너", [t("title", "제목", 60), t("sub", "작은 글", 60), t("badge", "배지", 12), img("image", "배경 이미지")], i => ({ title: pick(["첫 구매 20% 쿠폰", "주말 한정 무료배송", "신규 회원 웰컴 기프트", "앱 전용 특가"], i), sub: pick(["지금 받으러 가기", "금·토·일 3일간", "가입만 해도 증정", "오늘 자정까지"], i), badge: i === 0 ? "EVENT" : "", image: "" }), { max: 8, add: "배너 추가", title: "title" })] },
    { part: "layout", title: "모양", fields: [sel("ratio", "비율", [["3:1", "3:1 띠"], ["2:1", "2:1"], ["16:9", "16:9"], ["1:1", "1:1"]]), seg("indicator", "표시", [["fraction", "1 / 4"], ["dots", "점"], ["none", "없음"]]), chk("peek", "옆 배너 살짝 보이기"), seg("align", "글 정렬", aligns)] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ items: repeat(4, i => ({ title: pick(["첫 구매 20% 쿠폰", "주말 한정 무료배송", "신규 회원 웰컴 기프트", "앱 전용 특가"], i), sub: pick(["지금 받으러 가기", "금·토·일 3일간", "가입만 해도 증정", "오늘 자정까지"], i), badge: i === 0 ? "EVENT" : "", image: "" })), ratio: "3:1", indicator: "fraction", peek: true, align: "start", radius: 16, surface: "surface", accent: "primary" }),
  presets: [P("strip", "띠 배너", "3:1 · 1 / 4 표시", { ratio: "3:1", indicator: "fraction", peek: false }), P("peek", "카드 넘김", "옆 배너가 보이는 2:1", { ratio: "2:1", peek: true, indicator: "dots" }), P("square", "정사각 배너", "1:1 큰 카드", { ratio: "1:1", peek: true })],
};

const ranking: BlockSpec = { kind: "ranking", name: "랭킹 리스트", group: "앱 패턴", note: "순위 · 변동 · 썸네일", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "순위", fields: [list("items", "항목", [t("title", "제목", 60), t("meta", "부가 정보", 40), seg("move", "변동", [["up", "상승"], ["down", "하락"], ["same", "유지"], ["new", "NEW"]]), img("image", "썸네일", 400)], i => ({ title: pick(["데일리 니트 가디건", "울 블렌드 코트", "와이드 데님 팬츠", "레더 숄더백", "러닝 스니커즈"], i), meta: pick(["59,000원", "189,000원", "79,000원", "129,000원", "99,000원"], i), move: pick(["up", "same", "new", "down", "up"] as const, i), image: "" }), { max: 20, add: "항목 추가", title: "title" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "모양", [["list", "목록"], ["cards", "가로 카드"]]), chk("thumb", "썸네일"), chk("tabs", "기간 탭"), t("tabText", "탭 이름 (쉼표)", 60)] },
    style()],
  defaults: () => ({ ...headDefaults("RANKING", "실시간 인기", ""), items: repeat(5, i => ({ title: pick(["데일리 니트 가디건", "울 블렌드 코트", "와이드 데님 팬츠", "레더 숄더백", "러닝 스니커즈"], i), meta: pick(["59,000원", "189,000원", "79,000원", "129,000원", "99,000원"], i), move: pick(["up", "same", "new", "down", "up"] as const, i), image: "" })), variant: "list", thumb: true, tabs: true, tabText: "실시간, 일간, 주간, 월간" }),
  presets: [P("list", "순위 목록", "번호 · 썸네일 · 변동", { variant: "list" }), P("cards", "가로 카드", "옆으로 넘기는 순위 카드", { variant: "cards" })],
};

const onboarding: BlockSpec = { kind: "onboarding", name: "온보딩", group: "앱 패턴", note: "첫 실행 안내 슬라이드", place: "flow",
  sections: [{ part: "items", title: "장면", fields: [list("items", "장면", [t("title", "제목", 60), t("body", "설명", 160, { multiline: true }), img("image", "그림")], i => ({ title: pick(["필요한 것만 쏙", "가까운 매장에서 바로", "혜택은 놓치지 않게"], i), body: pick(["관심사에 맞춘 추천을 받아보세요.", "주문하고 30분 안에 픽업해요.", "알림을 켜면 쿠폰을 먼저 보내 드려요."], i), image: "" }), { max: 6, add: "장면 추가", title: "title" }), rng("current", "보여 줄 장면", 1, 6, 1, "번째")] },
    { part: "buttons", title: "버튼", fields: [t("primary", "다음 버튼", 20), t("last", "마지막 버튼", 20), t("skip", "건너뛰기", 12, { placeholder: "비우면 숨김" })] },
    style()],
  defaults: () => ({ items: repeat(3, i => ({ title: pick(["필요한 것만 쏙", "가까운 매장에서 바로", "혜택은 놓치지 않게"], i), body: pick(["관심사에 맞춘 추천을 받아보세요.", "주문하고 30분 안에 픽업해요.", "알림을 켜면 쿠폰을 먼저 보내 드려요."], i), image: "" })), current: 1, primary: "다음", last: "시작하기", skip: "건너뛰기", surface: "surface", accent: "primary" }),
  presets: [P("light", "밝은 온보딩", "그림 + 점 + 다음", { surface: "surface" }), P("brand", "브랜드 컬러", "Primary 배경", { surface: "primary" })],
};

const auth: BlockSpec = { kind: "auth", name: "로그인 · 회원가입", group: "앱 패턴", note: "아이디 · 비밀번호 · 간편 로그인", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("logo", "로고 글자", 20), img("image", "로고 이미지", 400), t("title", "제목", 60), t("desc", "설명", 120, { placeholder: "비우면 숨김" }), t("idLabel", "아이디 칸 안내", 30), t("pwLabel", "비밀번호 칸 안내", 30), t("button", "로그인 버튼", 20), t("keep", "자동 로그인 문구", 20, { placeholder: "비우면 숨김" }), t("links", "아래 링크 (쉼표)", 80)] },
    { part: "social", title: "간편 로그인", fields: [t("socialLabel", "간편 로그인 제목", 30, { placeholder: "비우면 숨김" }), list("social", "간편 로그인", [t("label", "이름", 30), seg("tone", "색", [["kakao", "카카오 노랑"], ["naver", "네이버 초록"], ["apple", "애플 검정"], ["google", "구글 흰색"]])], i => ({ label: pick(["카카오로 시작하기", "네이버로 시작하기", "Apple로 계속하기"], i), tone: pick(["kakao", "naver", "apple"] as const, i) }), { max: 5, min: 0, add: "간편 로그인 추가", title: "label" })] },
    { part: "layout", title: "모양", fields: [seg("mode", "화면", [["login", "로그인"], ["signup", "회원가입"]]), t("nameLabel", "이름 칸 안내 (가입)", 30), seg("layout", "배치", [["center", "가운데 카드"], ["split", "왼쪽 이미지 + 폼"]])] },
    style(rng("radius", "입력 칸 모서리", 0, 24))],
  defaults: () => ({ logo: "Brand", image: "", title: "다시 만나서 반가워요", desc: "", idLabel: "아이디 또는 이메일", pwLabel: "비밀번호", button: "로그인", keep: "자동 로그인", links: "아이디 찾기, 비밀번호 찾기, 회원가입", socialLabel: "간편 로그인",
    social: repeat(3, i => ({ label: pick(["카카오로 시작하기", "네이버로 시작하기", "Apple로 계속하기"], i), tone: pick(["kakao", "naver", "apple"] as const, i) })), mode: "login", nameLabel: "이름", layout: "center", radius: 12, surface: "surface", accent: "primary" }),
  presets: [P("login", "로그인", "아이디 · 비번 · 간편 로그인", { mode: "login", layout: "center" }), P("signup", "회원가입", "이름까지 받는 가입 폼", { mode: "signup", title: "가입하고 혜택 받기", button: "가입하기", layout: "center" }), P("split", "이미지 + 폼", "PC 좌우 배치", { layout: "split" })],
};

const mypage: BlockSpec = { kind: "mypage", name: "마이페이지 · 설정", group: "앱 패턴", note: "프로필 · 포인트 · 메뉴 목록", place: "flow",
  sections: [{ part: "profile", title: "프로필", fields: [img("avatar", "프로필 사진", 300), t("name", "이름", 30), t("grade", "등급 표시", 30), t("edit", "편집 링크", 20, { placeholder: "비우면 숨김" })] },
    { part: "stats", title: "숫자 칸", fields: [list("stats", "숫자", [t("label", "이름", 16), t("value", "값", 16)], i => ({ label: pick(["포인트", "쿠폰", "주문"], i), value: pick(["12,400P", "3장", "8건"], i) }), { max: 4, min: 0, add: "칸 추가", title: "label" })] },
    { part: "menu", title: "메뉴", fields: [list("menu", "메뉴", [t("label", "이름", 30), icon(), t("value", "오른쪽 표시", 20), chk("toggle", "토글 스위치"), chk("group", "위에 구분 띄우기")], i => ({ label: pick(["주문 내역", "찜한 상품", "리뷰 관리", "알림 설정", "고객센터", "로그아웃"], i), icon: pick(["book", "heart", "star", "calendar", "phone", ""] as const, i), value: i === 3 ? "" : "", toggle: i === 3, group: i === 3 || i === 5 }), { max: 16, add: "메뉴 추가", title: "label" })] },
    style()],
  defaults: () => ({ avatar: "", name: "김민지 님", grade: "GOLD 등급", edit: "프로필 수정", stats: repeat(3, i => ({ label: pick(["포인트", "쿠폰", "주문"], i), value: pick(["12,400P", "3장", "8건"], i) })),
    menu: repeat(6, i => ({ label: pick(["주문 내역", "찜한 상품", "리뷰 관리", "알림 설정", "고객센터", "로그아웃"], i), icon: pick(["book", "heart", "star", "calendar", "phone", ""] as const, i), value: "", toggle: i === 3, group: i === 3 || i === 5 })), surface: "surface", accent: "primary" }),
  presets: [P("light", "기본", "흰 배경 목록", { surface: "surface" }), P("brand", "브랜드 상단", "프로필 영역 강조", { surface: "subtle" })],
};

const notices: BlockSpec = { kind: "notices", name: "알림 목록", group: "앱 패턴", note: "읽음 표시 · 시간 · 탭", place: "flow",
  sections: [{ part: "copy", title: "탭", fields: [chk("tabs", "탭 보이기"), t("tabText", "탭 이름 (쉼표)", 60), t("readAll", "모두 읽음 문구", 20, { placeholder: "비우면 숨김" })] },
    { part: "items", title: "알림", fields: [list("items", "알림", [t("title", "제목", 60), t("body", "내용", 120), t("time", "시간", 20), icon(), chk("unread", "안 읽음")], i => ({ title: pick(["주문하신 상품이 출발했어요", "쿠폰이 도착했어요", "리뷰를 남기면 포인트 적립", "이벤트 당첨 안내"], i), body: pick(["오늘 도착 예정이에요.", "3일 안에 사용하세요.", "최대 1,000P를 드려요.", "당첨 정보를 확인해 주세요."], i), time: pick(["방금 전", "1시간 전", "어제", "3일 전"], i), icon: pick(["gift", "star", "heart", "sparkles"] as const, i), unread: i < 2 }), { max: 20, add: "알림 추가", title: "title" })] },
    style()],
  defaults: () => ({ tabs: true, tabText: "전체, 주문, 혜택, 소식", readAll: "모두 읽음", items: repeat(4, i => ({ title: pick(["주문하신 상품이 출발했어요", "쿠폰이 도착했어요", "리뷰를 남기면 포인트 적립", "이벤트 당첨 안내"], i), body: pick(["오늘 도착 예정이에요.", "3일 안에 사용하세요.", "최대 1,000P를 드려요.", "당첨 정보를 확인해 주세요."], i), time: pick(["방금 전", "1시간 전", "어제", "3일 전"], i), icon: pick(["gift", "star", "heart", "sparkles"] as const, i), unread: i < 2 })), surface: "surface", accent: "primary" }),
  presets: [P("list", "알림 목록", "아이콘 · 안 읽음 점", { tabs: true })],
};

const chat: BlockSpec = { kind: "chat", name: "채팅 화면", group: "앱 패턴", note: "말풍선 · 입력창", place: "flow",
  sections: [{ part: "copy", title: "상단", fields: [t("title", "상대 이름", 30), t("status", "상태 표시", 30, { placeholder: "비우면 숨김" }), t("date", "날짜 구분", 30, { placeholder: "비우면 숨김" })] },
    { part: "items", title: "대화", fields: [list("items", "말풍선", [t("text", "내용", 300, { multiline: true }), seg("from", "보낸 사람", [["them", "상대"], ["me", "나"]]), t("time", "시간", 12)], i => ({ text: pick(["안녕하세요! 무엇을 도와드릴까요?", "배송 언제 오나요?", "오늘 출발해서 내일 도착 예정이에요 😊", "감사합니다!"], i), from: i % 2 ? "me" : "them", time: `오후 2:${String(10 + i).padStart(2, "0")}` }), { max: 20, add: "말풍선 추가", title: "text" })] },
    { part: "input", title: "입력창", fields: [t("placeholder", "입력 안내", 40), list("quick", "빠른 답변", [t("label", "문구", 20)], i => ({ label: pick(["배송 조회", "교환 · 반품", "상담원 연결"], i) }), { max: 6, min: 0, add: "빠른 답변 추가", title: "label" })] },
    style()],
  defaults: () => ({ title: "Brand 고객센터", status: "보통 5분 안에 답해요", date: "2026년 10월 30일", items: repeat(4, i => ({ text: pick(["안녕하세요! 무엇을 도와드릴까요?", "배송 언제 오나요?", "오늘 출발해서 내일 도착 예정이에요 😊", "감사합니다!"], i), from: i % 2 ? "me" : "them", time: `오후 2:${String(10 + i).padStart(2, "0")}` })), placeholder: "메시지를 입력하세요", quick: repeat(3, i => ({ label: pick(["배송 조회", "교환 · 반품", "상담원 연결"], i) })), surface: "subtle", accent: "primary" }),
  presets: [P("support", "고객센터", "빠른 답변 버튼 포함", { surface: "subtle" }), P("plain", "기본 채팅", "흰 배경", { surface: "surface", quick: [] })],
};

const orderstatus: BlockSpec = { kind: "orderstatus", name: "주문 · 배송 단계", group: "쇼핑 · 예약", note: "진행 단계 · 상세 정보", place: "flow",
  sections: [{ part: "copy", title: "문구", fields: [t("title", "제목", 60), t("sub", "부가 정보", 60)] },
    { part: "steps", title: "단계", fields: [list("steps", "단계", [t("label", "이름", 20), t("time", "시간", 20)], i => ({ label: pick(["주문 접수", "상품 준비", "배송 중", "배송 완료"], i), time: pick(["10.28 14:02", "10.29 09:30", "10.30 08:12", ""], i) }), { max: 6, add: "단계 추가", title: "label" }), rng("current", "현재 단계", 1, 6, 1, "번째")] },
    { part: "info", title: "상세", fields: [list("info", "정보 줄", [t("label", "이름", 20), t("value", "값", 60)], i => ({ label: pick(["받는 분", "주소", "운송장"], i), value: pick(["김민지", "서울시 중구 세종대로 00", "CJ대한통운 1234-5678-9012"], i) }), { max: 8, min: 0, add: "줄 추가", title: "label" }), t("button", "버튼", 20, { placeholder: "비우면 숨김" })] },
    style()],
  defaults: () => ({ title: "배송 중이에요", sub: "주문번호 20261028-000123", steps: repeat(4, i => ({ label: pick(["주문 접수", "상품 준비", "배송 중", "배송 완료"], i), time: pick(["10.28 14:02", "10.29 09:30", "10.30 08:12", ""], i) })), current: 3,
    info: repeat(3, i => ({ label: pick(["받는 분", "주소", "운송장"], i), value: pick(["김민지", "서울시 중구 세종대로 00", "CJ대한통운 1234-5678-9012"], i) })), button: "배송 조회", surface: "surface", accent: "primary" }),
  presets: [P("delivery", "배송 단계", "4단계 진행 표시", {}), P("reservation", "예약 진행", "예약 접수부터 이용까지", { title: "예약이 확정됐어요", steps: ["예약 신청", "확정", "이용", "후기 작성"].map((label, i) => ({ label, time: i < 2 ? "10.28" : "" })), current: 2, button: "예약 상세" })],
};

const coupons: BlockSpec = { kind: "coupons", name: "쿠폰 · 혜택", group: "쇼핑 · 예약", note: "티켓 모양 · 받기 버튼", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "쿠폰", fields: [list("items", "쿠폰", [t("value", "혜택", 20), t("title", "이름", 40), t("cond", "조건", 60), t("button", "버튼", 12)], i => ({ value: pick(["20%", "5,000원", "무료배송", "10%"], i), title: pick(["첫 구매 할인", "주말 쿠폰", "배송비 무료", "앱 전용"], i), cond: pick(["3만원 이상 · 11.30까지", "5만원 이상", "전 상품", "앱 결제 시"], i), button: "받기" }), { max: 12, add: "쿠폰 추가", title: "title" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 1, 4, 1, "열"), seg("shape", "모양", [["ticket", "티켓"], ["card", "카드"]])] },
    style()],
  defaults: () => ({ ...headDefaults("BENEFIT", "지금 받을 수 있는 쿠폰", ""), items: repeat(4, i => ({ value: pick(["20%", "5,000원", "무료배송", "10%"], i), title: pick(["첫 구매 할인", "주말 쿠폰", "배송비 무료", "앱 전용"], i), cond: pick(["3만원 이상 · 11.30까지", "5만원 이상", "전 상품", "앱 결제 시"], i), button: "받기" })), columns: 2, shape: "ticket", surface: "subtle" }),
  presets: [P("ticket", "티켓", "절취선 티켓 2열", { shape: "ticket", columns: 2 }), P("card", "카드", "브랜드 카드 4열", { shape: "card", columns: 4, surface: "surface" })],
};

const team: BlockSpec = { kind: "team", name: "팀 · 인물 소개", group: "정보 · 서브 페이지", note: "사진 · 이름 · 직함", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "사람", fields: [list("items", "사람", [t("name", "이름", 30), t("role", "직함", 40), t("bio", "소개", 200, { multiline: true }), img("image", "사진", 800)], i => ({ name: pick(["김하늘", "이도현", "박지우", "최서준"], i), role: pick(["대표 원장", "수석 디자이너", "개발 리드", "고객 경험 매니저"], i), bio: "한두 줄 소개를 적어 주세요.", image: "" }), { max: 16, add: "사람 추가", title: "name" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 2, 5, 1, "열"), sel("ratio", "사진 비율", [["3:4", "3:4"], ["1:1", "1:1"], ["4:5", "4:5"]]), chk("bio", "소개 보이기"), seg("shape", "사진", [["rect", "사각"], ["circle", "원"]])] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("OUR TEAM", "함께하는 사람들", ""), items: repeat(4, i => ({ name: pick(["김하늘", "이도현", "박지우", "최서준"], i), role: pick(["대표 원장", "수석 디자이너", "개발 리드", "고객 경험 매니저"], i), bio: "한두 줄 소개를 적어 주세요.", image: "" })), columns: 4, ratio: "3:4", bio: false, shape: "rect", radius: 16 }),
  presets: [P("grid", "사진 격자", "세로 사진 4열", { columns: 4, shape: "rect" }), P("circle", "원형 프로필", "동그란 사진 + 소개", { columns: 4, shape: "circle", ratio: "1:1", bio: true }), P("doctor", "의료진 소개", "큰 사진 3열 + 소개", { columns: 3, bio: true, ratio: "4:5", eyebrow: "DOCTORS", title: "의료진 소개" })],
};

const compare: BlockSpec = { kind: "compare", name: "비포 · 애프터", group: "본문 섹션", note: "두 사진을 밀어서 비교", place: "flow",
  sections: [head("섹션 제목"),
    { part: "images", title: "사진", fields: [img("before", "전 사진"), img("after", "후 사진"), t("beforeLabel", "전 표시", 12), t("afterLabel", "후 표시", 12), rng("position", "나눔 위치", 10, 90, 1, "%")] },
    { part: "layout", title: "배치", fields: [sel("ratio", "비율", [["16:9", "16:9"], ["4:3", "4:3"], ["1:1", "1:1"]]), rng("width", "최대 폭", 400, 1200, 20)] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("BEFORE & AFTER", "달라진 모습을 비교해 보세요", ""), before: "", after: "", beforeLabel: "BEFORE", afterLabel: "AFTER", position: 50, ratio: "16:9", width: 960, radius: 20 }),
  presets: [P("wide", "와이드", "16:9 큰 비교", { ratio: "16:9" }), P("square", "정사각", "1:1 비교", { ratio: "1:1", width: 640 })],
};

const ticker: BlockSpec = { kind: "ticker", name: "공지 한 줄", group: "본문 섹션", note: "공지 롤링 · 더보기", place: "flow",
  sections: [{ part: "copy", title: "내용", fields: [t("label", "왼쪽 이름", 16), list("items", "공지", [t("text", "공지", 80), t("date", "날짜", 20)], i => ({ text: pick(["추석 연휴 배송 일정 안내", "개인정보처리방침 개정 안내", "신규 매장 오픈 이벤트"], i), date: pick(["10.28", "10.21", "10.14"], i) }), { max: 10, add: "공지 추가", title: "text" }), t("more", "더보기", 12, { placeholder: "비우면 숨김" })] },
    { part: "layout", title: "모양", fields: [seg("variant", "모양", [["line", "한 줄"], ["box", "둥근 박스"]]), chk("arrows", "위아래 화살표")] },
    style()],
  defaults: () => ({ label: "공지", items: repeat(3, i => ({ text: pick(["추석 연휴 배송 일정 안내", "개인정보처리방침 개정 안내", "신규 매장 오픈 이벤트"], i), date: pick(["10.28", "10.21", "10.14"], i) })), more: "더보기", variant: "line", arrows: true, surface: "subtle", accent: "primary" }),
  presets: [P("line", "한 줄 띠", "공지 · 날짜 · 더보기", { variant: "line" }), P("box", "둥근 박스", "본문 안 둥근 공지", { variant: "box", surface: "surface" })],
};

const stats: BlockSpec = { kind: "stats", name: "숫자로 보는", group: "본문 섹션", note: "큰 숫자 · 단위 · 설명", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "숫자", fields: [list("items", "숫자", [t("value", "숫자", 16), t("unit", "단위", 10), t("label", "설명", 60), icon()], i => ({ value: pick(["30", "1,200", "98", "24"], i), unit: pick(["년", "+", "%", "h"], i), label: pick(["업력", "누적 고객사", "재계약률", "고객 응대"], i), icon: "" }), { max: 8, add: "숫자 추가", title: "label" })] },
    { part: "layout", title: "배치", fields: [rng("columns", "열 수", 2, 6, 1, "열"), seg("divider", "구분", [["line", "세로선"], ["card", "카드"], ["none", "없음"]]), seg("align", "정렬", aligns)] },
    style()],
  defaults: () => ({ ...headDefaults("IN NUMBERS", "숫자로 보는 우리", ""), items: repeat(4, i => ({ value: pick(["30", "1,200", "98", "24"], i), unit: pick(["년", "+", "%", "h"], i), label: pick(["업력", "누적 고객사", "재계약률", "고객 응대"], i), icon: "" })), columns: 4, divider: "line", align: "center", surface: "inverse" }),
  presets: [P("dark", "다크 숫자", "세로선 4칸", { surface: "inverse", divider: "line" }), P("cards", "카드 숫자", "밝은 카드 4칸", { surface: "subtle", divider: "card" }), P("plain", "가벼운 숫자", "구분 없이 왼쪽", { surface: "surface", divider: "none", align: "start" })],
};

const pricing: BlockSpec = { kind: "pricing", name: "요금제 카드", group: "쇼핑 · 예약", note: "플랜 카드 · 추천 강조", place: "flow",
  sections: [head("섹션 제목"),
    { part: "items", title: "플랜", fields: [list("items", "플랜", [t("name", "이름", 30), t("price", "가격", 20), t("period", "기간", 12), t("desc", "설명", 80), t("features", "포함 항목 (쉼표)", 300), t("button", "버튼", 20), chk("featured", "추천 강조"), t("badge", "배지", 12)], i => ({ name: pick(["베이직", "프로", "엔터프라이즈"], i), price: pick(["무료", "29,000원", "문의"], i), period: i === 1 ? "/월" : "", desc: pick(["처음 시작할 때", "팀이 커질 때", "맞춤이 필요할 때"], i), features: pick(["프로젝트 3개, 기본 템플릿, 메일 지원", "무제한 프로젝트, 팀원 10명, 채팅 지원, 고급 분석", "전담 매니저, SSO, 맞춤 계약, SLA"], i), button: pick(["무료로 시작", "프로 시작하기", "상담 신청"], i), featured: i === 1, badge: i === 1 ? "추천" : "" }), { max: 5, add: "플랜 추가", title: "name" })] },
    { part: "layout", title: "모양", fields: [chk("toggle", "월간 / 연간 전환"), t("toggleText", "전환 이름 (쉼표)", 30)] },
    style(rng("radius", "모서리", 0, 32))],
  defaults: () => ({ ...headDefaults("PRICING", "팀에 맞는 플랜을 고르세요", ""), items: repeat(3, i => ({ name: pick(["베이직", "프로", "엔터프라이즈"], i), price: pick(["무료", "29,000원", "문의"], i), period: i === 1 ? "/월" : "", desc: pick(["처음 시작할 때", "팀이 커질 때", "맞춤이 필요할 때"], i), features: pick(["프로젝트 3개, 기본 템플릿, 메일 지원", "무제한 프로젝트, 팀원 10명, 채팅 지원, 고급 분석", "전담 매니저, SSO, 맞춤 계약, SLA"], i), button: pick(["무료로 시작", "프로 시작하기", "상담 신청"], i), featured: i === 1, badge: i === 1 ? "추천" : "" })), toggle: true, toggleText: "월간, 연간 (2개월 무료)", radius: 20 }),
  presets: [P("cards", "플랜 카드", "가운데 추천 강조", {}), P("dark", "다크 플랜", "다크 배경", { surface: "inverse" })],
};

export const moreBlockSpecs: BlockSpec[] = [gallery, logos, reviews, newsletter, promo, stats, pricing, team, compare, ticker, feed, productlist, cart, buybar, booking, coupons, orderstatus, iconmenu, banners, ranking, onboarding, auth, mypage, notices, chat];
export const MORE_KINDS = ["gallery", "logos", "reviews", "newsletter", "promo", "stats", "pricing", "team", "compare", "ticker", "feed", "productlist", "cart", "buybar", "booking", "coupons", "orderstatus", "iconmenu", "banners", "ranking", "onboarding", "auth", "mypage", "notices", "chat"] as const;
